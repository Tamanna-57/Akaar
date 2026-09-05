/**
 * The offline outbox, specified in docs/04-architecture/offline-strategy.md.
 *
 * Mutations queue locally as *intents*, not as raw HTTP retries. That
 * distinction is the whole design: an intent can be replayed days later
 * against a server that has moved on, and the idempotency key is what makes
 * that replay safe.
 */

/** Mirrors the `state` column in the doc's LocalMutation sketch. */
export const MutationState = {
  Pending: "PENDING",
  InFlight: "IN_FLIGHT",
  Synced: "SYNCED",
  FailedPermanent: "FAILED_PERMANENT",
} as const;
export type MutationState = (typeof MutationState)[keyof typeof MutationState];

/** Settled = will not be retried by the drainer without user action. */
export function isSettled(state: MutationState): boolean {
  return state === MutationState.Synced || state === MutationState.FailedPermanent;
}

/**
 * The entity a mutation belongs to. Ordering is FIFO *per entity*;
 * cross-entity ordering is deliberately not preserved, which is safe because
 * the state machines forbid the dependent transitions.
 */
export const EntityType = {
  Product: "product",
  ProductMedia: "product_media",
  Pricing: "pricing",
  Offer: "offer",
  CustomRequest: "custom_request",
  Message: "message",
  Profile: "profile",
} as const;
export type EntityType = (typeof EntityType)[keyof typeof EntityType];

export const Operation = {
  Create: "create",
  Update: "update",
  Delete: "delete",
  /** A business action that maps to a Postgres RPC rather than a table write. */
  Rpc: "rpc",
} as const;
export type Operation = (typeof Operation)[keyof typeof Operation];

export interface LocalMutation {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: Operation;
  /** For `Rpc`, the function name (see SupabaseRpc in the app package). */
  rpcName?: string;
  payload: unknown;
  /**
   * Generated ONCE at enqueue and never regenerated - not on retry, not on
   * a user-initiated retry after permanent failure. This is what stops an
   * ambiguous timeout from creating a duplicate product or a duplicate
   * message when the request actually landed.
   */
  idempotencyKey: string;
  attempts: number;
  /** Epoch ms. The drainer will not claim this mutation before it. */
  nextAttemptAt: number;
  lastError?: string;
  /**
   * Why a FAILED_PERMANENT mutation failed. The two cases need different
   * words in the UI: "rejected" is the server declining a business rule and
   * needs the artisan to decide something; "exhausted" is an upload that
   * kept breaking and just needs a retry when signal is better.
   */
  failureKind?: "rejected" | "exhausted";
  state: MutationState;
  createdAt: number;
}

/** What a caller supplies; the queue fills in everything else. */
export interface EnqueueInput {
  entityType: EntityType;
  entityId: string;
  operation: Operation;
  rpcName?: string;
  payload: unknown;
}
