import { type BackoffPolicy, defaultBackoff, delayForAttempt, hasAttemptsLeft } from "./backoff.ts";
import type { OutboxStore } from "./store.ts";
import { type EnqueueInput, type LocalMutation, MutationState } from "./types.ts";

/**
 * The outbox queue, per docs/04-architecture/offline-strategy.md.
 *
 * Everything here is deterministic given its dependencies: the clock, the
 * id generator and the RNG are all injected, so the whole queue - including
 * backoff scheduling and permanent failure - is testable without waiting
 * for real time to pass.
 */
export interface QueueDeps {
  now: () => number;
  newId: () => string;
  backoff?: BackoffPolicy;
  random?: () => number;
}

function entityKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

/**
 * Enqueue a mutation. The idempotency key is minted here, once, and is
 * carried unchanged through every retry for the life of this mutation.
 */
export async function enqueue(
  store: OutboxStore,
  input: EnqueueInput,
  deps: QueueDeps,
): Promise<LocalMutation> {
  const now = deps.now();
  const mutation: LocalMutation = {
    id: deps.newId(),
    entityType: input.entityType,
    entityId: input.entityId,
    operation: input.operation,
    rpcName: input.rpcName,
    payload: input.payload,
    idempotencyKey: deps.newId(),
    attempts: 0,
    nextAttemptAt: now,
    state: MutationState.Pending,
    createdAt: now,
  };
  await store.insert(mutation);
  return mutation;
}

/**
 * Claim the next mutation to send, marking it IN_FLIGHT, or null if nothing
 * is currently eligible.
 *
 * Selection honours per-entity FIFO: only the oldest unsynced mutation for
 * an entity is ever a candidate. If that head is IN_FLIGHT (already being
 * sent) or FAILED_PERMANENT (waiting on the user), the whole entity is
 * blocked and its later mutations wait their turn. Different entities are
 * independent of each other, which is what the doc means by "cross-entity
 * ordering is not preserved".
 */
export async function claimNext(store: OutboxStore, deps: QueueDeps): Promise<LocalMutation | null> {
  const now = deps.now();
  const unsynced = await store.unsynced();

  const heads = new Map<string, LocalMutation>();
  for (const mutation of unsynced) {
    const key = entityKey(mutation.entityType, mutation.entityId);
    if (!heads.has(key)) heads.set(key, mutation);
  }

  for (const head of heads.values()) {
    if (head.state !== MutationState.Pending) continue; // in flight, or blocked on a permanent failure
    if (head.nextAttemptAt > now) continue; // still backing off
    const claimed: LocalMutation = { ...head, state: MutationState.InFlight };
    await store.update(claimed);
    return claimed;
  }
  return null;
}

/** The server accepted it. */
export async function markSynced(store: OutboxStore, id: string): Promise<void> {
  const mutation = await store.byId(id);
  if (mutation == null) return;
  await store.update({ ...mutation, state: MutationState.Synced, lastError: undefined });
}

/**
 * A retryable failure - no connection, a timeout, a 5xx. Schedules the next
 * attempt, or gives up permanently once the policy's attempts are spent.
 *
 * An ambiguous timeout lands here too, and that is safe precisely because
 * the idempotency key is not regenerated: if the request did reach the
 * server, the replay is a no-op rather than a duplicate.
 */
export async function markRetryableFailure(
  store: OutboxStore,
  id: string,
  error: string,
  deps: QueueDeps,
): Promise<LocalMutation | null> {
  const mutation = await store.byId(id);
  if (mutation == null) return null;

  const policy = deps.backoff ?? defaultBackoff;
  const attempts = mutation.attempts + 1;

  const next: LocalMutation = hasAttemptsLeft(policy, attempts)
    ? {
        ...mutation,
        attempts,
        lastError: error,
        state: MutationState.Pending,
        nextAttemptAt: deps.now() + delayForAttempt(policy, attempts, deps.random),
      }
    : {
        ...mutation,
        attempts,
        lastError: error,
        state: MutationState.FailedPermanent,
        failureKind: "exhausted",
      };

  await store.update(next);
  return next;
}

/**
 * The server rejected it on a business rule. Retrying an unchanged payload
 * cannot help, so this fails immediately rather than burning eight attempts
 * on a request that will never be accepted.
 */
export async function markPermanentFailure(
  store: OutboxStore,
  id: string,
  error: string,
): Promise<LocalMutation | null> {
  const mutation = await store.byId(id);
  if (mutation == null) return null;
  const next: LocalMutation = {
    ...mutation,
    attempts: mutation.attempts + 1,
    lastError: error,
    state: MutationState.FailedPermanent,
    failureKind: "rejected",
  };
  await store.update(next);
  return next;
}

/**
 * "Couldn't upload - tap to retry". Resets the attempt budget but KEEPS the
 * original idempotency key, so a user hammering retry cannot create
 * duplicates either.
 */
export async function retryNow(
  store: OutboxStore,
  id: string,
  deps: QueueDeps,
): Promise<LocalMutation | null> {
  const mutation = await store.byId(id);
  if (mutation == null) return null;
  const next: LocalMutation = {
    ...mutation,
    attempts: 0,
    state: MutationState.Pending,
    nextAttemptAt: deps.now(),
    failureKind: undefined,
  };
  await store.update(next);
  return next;
}

/** How many mutations are still waiting. Drives per-item badges, never a global spinner. */
export async function pendingCount(store: OutboxStore): Promise<number> {
  return (await store.unsynced()).length;
}
