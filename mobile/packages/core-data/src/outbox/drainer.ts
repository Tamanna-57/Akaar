import { claimNext, markPermanentFailure, markRetryableFailure, markSynced, type QueueDeps } from "./queue.ts";
import type { OutboxStore } from "./store.ts";
import type { LocalMutation } from "./types.ts";

/**
 * What the network layer reports back for one mutation.
 *
 * The retryable/permanent split matters: a 5xx or a dropped connection is
 * worth eight attempts over a day; a business-rule rejection is not worth
 * one more. An ambiguous timeout is `retryable` - the idempotency key makes
 * that safe.
 */
export type MutationResult =
  | { kind: "success" }
  | { kind: "retryable"; message: string }
  | { kind: "permanent"; message: string };

export interface MutationTransport {
  /**
   * Implementations MUST send `mutation.idempotencyKey` as the
   * `Idempotency-Key` header (or its RPC argument equivalent) and MUST NOT
   * generate their own.
   */
  send(mutation: LocalMutation): Promise<MutationResult>;
}

export interface DrainSummary {
  sent: number;
  retryScheduled: number;
  permanentlyFailed: number;
  /** Still unsynced after this pass - waiting on backoff, or blocked behind a failure. */
  remaining: number;
}

/**
 * Drain the outbox once. This is the body that the background scheduler
 * invokes - WorkManager's job on the Kotlin side, a headless task here.
 *
 * It stops at the first mutation it cannot claim rather than spinning:
 * anything left is either backing off or blocked behind an unresolved
 * failure, and in both cases the right move is to end the pass and let the
 * scheduler wake us again.
 */
export async function drainOutbox(
  store: OutboxStore,
  transport: MutationTransport,
  deps: QueueDeps,
  options: { maxPerPass?: number } = {},
): Promise<DrainSummary> {
  const maxPerPass = options.maxPerPass ?? 50;
  const summary: DrainSummary = { sent: 0, retryScheduled: 0, permanentlyFailed: 0, remaining: 0 };

  for (let i = 0; i < maxPerPass; i++) {
    const mutation = await claimNext(store, deps);
    if (mutation == null) break;

    let result: MutationResult;
    try {
      result = await transport.send(mutation);
    } catch (error) {
      // A thrown transport is a transport bug or a hard network error, not a
      // server verdict: treat it as retryable rather than losing the intent.
      result = { kind: "retryable", message: error instanceof Error ? error.message : String(error) };
    }

    switch (result.kind) {
      case "success":
        await markSynced(store, mutation.id);
        summary.sent++;
        break;
      case "retryable": {
        const next = await markRetryableFailure(store, mutation.id, result.message, deps);
        if (next?.state === "FAILED_PERMANENT") summary.permanentlyFailed++;
        else summary.retryScheduled++;
        break;
      }
      case "permanent":
        await markPermanentFailure(store, mutation.id, result.message);
        summary.permanentlyFailed++;
        break;
    }
  }

  summary.remaining = (await store.unsynced()).length;
  return summary;
}
