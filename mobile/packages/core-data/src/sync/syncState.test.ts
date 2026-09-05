import assert from "node:assert/strict";
import { test } from "node:test";
import { EntityType, type LocalMutation, MutationState, Operation } from "../outbox/types.ts";
import { labelFor, SyncState, syncStateFor } from "./syncState.ts";

function mutation(overrides: Partial<LocalMutation> = {}): LocalMutation {
  return {
    id: "m1",
    entityType: EntityType.Product,
    entityId: "p1",
    operation: Operation.Update,
    payload: {},
    idempotencyKey: "k1",
    attempts: 0,
    nextAttemptAt: 0,
    state: MutationState.Pending,
    createdAt: 0,
    ...overrides,
  };
}

test("queued, uploading and synced follow the mutation states", () => {
  assert.equal(syncStateFor([mutation()]), SyncState.Queued);
  assert.equal(syncStateFor([mutation({ state: MutationState.InFlight })]), SyncState.Uploading);
  assert.equal(syncStateFor([mutation({ state: MutationState.Synced })]), SyncState.Synced);
});

test("a rejected mutation needs the artisan; an exhausted one just needs a retry", () => {
  const rejected = mutation({ state: MutationState.FailedPermanent, failureKind: "rejected" });
  const exhausted = mutation({ state: MutationState.FailedPermanent, failureKind: "exhausted" });

  assert.equal(syncStateFor([rejected]), SyncState.NeedsAttention);
  assert.equal(syncStateFor([exhausted]), SyncState.Failed);

  // Both are actionable, and both say what the next step is.
  assert.equal(labelFor(SyncState.NeedsAttention).actionable, true);
  assert.equal(labelFor(SyncState.Failed).text, "Couldn't upload - tap to retry");
});

test("a draft that has never left the phone reads as saved locally, not as an error", () => {
  assert.equal(syncStateFor([], { hasNeverSynced: true }), SyncState.LocalOnly);
  assert.equal(labelFor(SyncState.LocalOnly).text, "Saved on your phone");
});

test("processing tells her she can leave the screen", () => {
  assert.equal(syncStateFor([], { serverProcessing: true }), SyncState.Processing);
  assert.match(labelFor(SyncState.Processing).text, /leave this screen/);
});
