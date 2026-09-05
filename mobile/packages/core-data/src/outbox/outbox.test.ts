import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultBackoff, delayForAttempt } from "./backoff.ts";
import { drainOutbox, type MutationResult, type MutationTransport } from "./drainer.ts";
import {
  claimNext,
  enqueue,
  markPermanentFailure,
  markRetryableFailure,
  markSynced,
  type QueueDeps,
  retryNow,
} from "./queue.ts";
import { InMemoryOutboxStore } from "./store.ts";
import { EntityType, type LocalMutation, MutationState, Operation } from "./types.ts";

/** Deterministic dependencies: a clock we advance by hand, ids we can predict. */
function makeDeps(startAt = 1_000): QueueDeps & { advance: (ms: number) => void; setNow: (t: number) => void } {
  let clock = startAt;
  let counter = 0;
  return {
    now: () => clock,
    newId: () => `id-${++counter}`,
    random: () => 0.5,
    advance: (ms: number) => {
      clock += ms;
    },
    setNow: (t: number) => {
      clock = t;
    },
  };
}

function input(entityId: string, operation: Operation = Operation.Update) {
  return { entityType: EntityType.Product, entityId, operation, payload: { title: "kurta" } };
}

test("enqueue mints an idempotency key and starts PENDING and due now", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();

  const mutation = await enqueue(store, input("p1"), deps);

  assert.equal(mutation.state, MutationState.Pending);
  assert.equal(mutation.attempts, 0);
  assert.equal(mutation.nextAttemptAt, deps.now());
  assert.ok(mutation.idempotencyKey.length > 0);
  assert.notEqual(mutation.idempotencyKey, mutation.id);
});

test("the idempotency key survives every retry, including a user-initiated one", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();
  const original = await enqueue(store, input("p1"), deps);

  await claimNext(store, deps);
  await markRetryableFailure(store, original.id, "timeout", deps);
  const afterRetry = await store.byId(original.id);
  assert.equal(afterRetry?.idempotencyKey, original.idempotencyKey);

  // Burn the whole attempt budget.
  for (let i = 0; i < defaultBackoff.maxAttempts; i++) {
    await markRetryableFailure(store, original.id, "timeout", deps);
  }
  const exhausted = await store.byId(original.id);
  assert.equal(exhausted?.state, MutationState.FailedPermanent);
  assert.equal(exhausted?.failureKind, "exhausted");

  await retryNow(store, original.id, deps);
  const afterUserRetry = await store.byId(original.id);
  assert.equal(afterUserRetry?.state, MutationState.Pending);
  assert.equal(afterUserRetry?.attempts, 0);
  // The point of the whole exercise: still the same key, so a replay of a
  // request that actually landed cannot duplicate the product.
  assert.equal(afterUserRetry?.idempotencyKey, original.idempotencyKey);
});

test("claimNext respects per-entity FIFO", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();

  const first = await enqueue(store, input("p1"), deps);
  deps.advance(10);
  await enqueue(store, input("p1"), deps); // same entity, must wait for `first`
  deps.advance(10);
  const otherEntity = await enqueue(store, input("p2"), deps);

  const claimed = await claimNext(store, deps);
  assert.equal(claimed?.id, first.id);

  // p1 is in flight, so the next claim skips to a different entity.
  const second = await claimNext(store, deps);
  assert.equal(second?.id, otherEntity.id);

  // Nothing else is claimable while both heads are in flight.
  assert.equal(await claimNext(store, deps), null);
});

test("a permanent failure blocks that entity's later mutations, not other entities", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();

  const create = await enqueue(store, input("p1", Operation.Create), deps);
  deps.advance(10);
  await enqueue(store, input("p1"), deps); // update behind the create
  deps.advance(10);
  const unrelated = await enqueue(store, input("p2"), deps);

  await claimNext(store, deps);
  await markPermanentFailure(store, create.id, "below floor");

  // The update must NOT be sent: its create never landed.
  const next = await claimNext(store, deps);
  assert.equal(next?.id, unrelated.id);
  assert.equal(await claimNext(store, deps), null);

  // Once the human resolves it, the queue moves again.
  await retryNow(store, create.id, deps);
  const resumed = await claimNext(store, deps);
  assert.equal(resumed?.id, create.id);
});

test("a backing-off mutation is not claimed until its delay has passed", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();
  const mutation = await enqueue(store, input("p1"), deps);

  await claimNext(store, deps);
  const scheduled = await markRetryableFailure(store, mutation.id, "offline", deps);
  assert.equal(scheduled?.state, MutationState.Pending);
  assert.ok(scheduled != null && scheduled.nextAttemptAt > deps.now());

  assert.equal(await claimNext(store, deps), null);

  deps.setNow(scheduled!.nextAttemptAt);
  const claimed = await claimNext(store, deps);
  assert.equal(claimed?.id, mutation.id);
  assert.equal(claimed?.attempts, 1);
});

test("backoff grows exponentially and stays capped", () => {
  const policy = { ...defaultBackoff, jitter: "none" as const };
  assert.equal(delayForAttempt(policy, 1), 30_000);
  assert.equal(delayForAttempt(policy, 2), 60_000);
  assert.equal(delayForAttempt(policy, 3), 120_000);
  assert.equal(delayForAttempt(policy, 20), policy.maxDelayMs);
  // Equal jitter never returns less than half the delay - a retry that fires
  // immediately after a failed upload is the wrong thing on a metered link.
  const jittered = delayForAttempt(defaultBackoff, 3, () => 0);
  assert.equal(jittered, 60_000);
});

test("drainOutbox sends what it can and reports what is left", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();
  await enqueue(store, input("p1"), deps);
  deps.advance(1);
  await enqueue(store, input("p2"), deps);
  deps.advance(1);
  await enqueue(store, input("p3"), deps);

  const seenKeys: string[] = [];
  const transport: MutationTransport = {
    async send(mutation: LocalMutation): Promise<MutationResult> {
      seenKeys.push(mutation.idempotencyKey);
      if (mutation.entityId === "p2") return { kind: "retryable", message: "502" };
      if (mutation.entityId === "p3") return { kind: "permanent", message: "quantity below MOQ" };
      return { kind: "success" };
    },
  };

  const summary = await drainOutbox(store, transport, deps);

  assert.equal(summary.sent, 1);
  assert.equal(summary.retryScheduled, 1);
  assert.equal(summary.permanentlyFailed, 1);
  assert.equal(summary.remaining, 2);
  assert.equal(new Set(seenKeys).size, 3, "every mutation is sent with its own key");
});

test("a transport that throws is retried, never dropped", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();
  const mutation = await enqueue(store, input("p1"), deps);

  const transport: MutationTransport = {
    async send() {
      throw new Error("socket hang up");
    },
  };

  const summary = await drainOutbox(store, transport, deps);
  assert.equal(summary.retryScheduled, 1);

  const stored = await store.byId(mutation.id);
  assert.equal(stored?.state, MutationState.Pending);
  assert.equal(stored?.lastError, "socket hang up");
});

test("markSynced settles a mutation and unblocks its entity", async () => {
  const store = new InMemoryOutboxStore();
  const deps = makeDeps();
  const first = await enqueue(store, input("p1"), deps);
  deps.advance(1);
  const second = await enqueue(store, input("p1"), deps);

  await claimNext(store, deps);
  await markSynced(store, first.id);

  const next = await claimNext(store, deps);
  assert.equal(next?.id, second.id);
});
