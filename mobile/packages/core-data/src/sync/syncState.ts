import { type LocalMutation, MutationState } from "../outbox/types.ts";

/**
 * Per-item sync state, from docs/04-architecture/offline-strategy.md:
 * "A global 'syncing…' banner tells the artisan nothing actionable."
 *
 * So this is derived per entity, never for the app as a whole, and every
 * state carries the words shown next to that one item.
 */
export const SyncState = {
  LocalOnly: "LOCAL_ONLY",
  Queued: "QUEUED",
  Uploading: "UPLOADING",
  Processing: "PROCESSING",
  NeedsAttention: "NEEDS_ATTENTION",
  Synced: "SYNCED",
  Failed: "FAILED",
} as const;
export type SyncState = (typeof SyncState)[keyof typeof SyncState];

export interface SyncLabel {
  state: SyncState;
  /** English copy; the Hindi string lands with the localisation pass. */
  text: string;
  /** True where the user can do something about it right now. */
  actionable: boolean;
}

export const syncLabels: Record<SyncState, SyncLabel> = {
  LOCAL_ONLY: { state: SyncState.LocalOnly, text: "Saved on your phone", actionable: false },
  QUEUED: { state: SyncState.Queued, text: "Will upload when you have signal", actionable: false },
  UPLOADING: { state: SyncState.Uploading, text: "Uploading", actionable: false },
  // Says explicitly that she can leave: holding a low-literacy user hostage
  // to a spinner is how a session gets abandoned.
  PROCESSING: { state: SyncState.Processing, text: "AI is working - you can leave this screen", actionable: false },
  NEEDS_ATTENTION: { state: SyncState.NeedsAttention, text: "Something needs your input", actionable: true },
  SYNCED: { state: SyncState.Synced, text: "Saved", actionable: false },
  FAILED: { state: SyncState.Failed, text: "Couldn't upload - tap to retry", actionable: true },
};

/**
 * Derive one entity's sync state from its mutations.
 *
 * `serverProcessing` is passed in rather than inferred: PROCESSING means the
 * server accepted the upload and an AI pipeline is still running on it,
 * which the outbox alone cannot know.
 */
export function syncStateFor(
  mutations: LocalMutation[],
  options: { hasNeverSynced?: boolean; serverProcessing?: boolean } = {},
): SyncState {
  const unsynced = mutations.filter((m) => m.state !== MutationState.Synced);

  // Distinguish "the server said no, you must decide" from "the upload kept
  // breaking, tap to retry" - different words, different next step.
  const failed = unsynced.find((m) => m.state === MutationState.FailedPermanent);
  if (failed != null) {
    return failed.failureKind === "rejected" ? SyncState.NeedsAttention : SyncState.Failed;
  }
  if (unsynced.some((m) => m.state === MutationState.InFlight)) return SyncState.Uploading;
  if (unsynced.length > 0) return SyncState.Queued;
  if (options.serverProcessing) return SyncState.Processing;
  if (options.hasNeverSynced) return SyncState.LocalOnly;
  return SyncState.Synced;
}

export function labelFor(state: SyncState): SyncLabel {
  return syncLabels[state];
}
