import type { LocalMutation } from "./types.ts";
import { MutationState } from "./types.ts";

/**
 * Persistence port for the outbox. The queue logic is written against this
 * so it can be unit-tested in memory and run in production against the
 * encrypted SQLite database (see ../db/) - the same split as the Kotlin
 * repository interfaces in :core:domain versus their Room implementations.
 */
export interface OutboxStore {
  insert(mutation: LocalMutation): Promise<void>;
  update(mutation: LocalMutation): Promise<void>;
  byId(id: string): Promise<LocalMutation | null>;
  /**
   * Every mutation that has not synced yet - PENDING, IN_FLIGHT *and*
   * FAILED_PERMANENT - oldest first.
   *
   * Permanent failures are included deliberately: they still occupy their
   * place in their entity's queue, so the mutations behind them stay
   * blocked until a human resolves the failure. Dropping them from this
   * view would let an update be sent for a product whose create never
   * landed.
   */
  unsynced(): Promise<LocalMutation[]>;
  /** All mutations for one entity, oldest first. Drives per-item sync state. */
  forEntity(entityType: string, entityId: string): Promise<LocalMutation[]>;
  /** Synced rows older than `before`, for housekeeping. */
  deleteSyncedBefore(before: number): Promise<number>;
}

/** Test/fake implementation. Also usable before the DB is opened at cold start. */
export class InMemoryOutboxStore implements OutboxStore {
  private rows = new Map<string, LocalMutation>();

  async insert(mutation: LocalMutation): Promise<void> {
    this.rows.set(mutation.id, { ...mutation });
  }

  async update(mutation: LocalMutation): Promise<void> {
    this.rows.set(mutation.id, { ...mutation });
  }

  async byId(id: string): Promise<LocalMutation | null> {
    const row = this.rows.get(id);
    return row ? { ...row } : null;
  }

  async unsynced(): Promise<LocalMutation[]> {
    return [...this.rows.values()]
      .filter((m) => m.state !== MutationState.Synced)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((m) => ({ ...m }));
  }

  async forEntity(entityType: string, entityId: string): Promise<LocalMutation[]> {
    return [...this.rows.values()]
      .filter((m) => m.entityType === entityType && m.entityId === entityId)
      .sort((a, b) => a.createdAt - b.createdAt)
      .map((m) => ({ ...m }));
  }

  async deleteSyncedBefore(before: number): Promise<number> {
    let removed = 0;
    for (const [id, m] of this.rows) {
      if (m.state === MutationState.Synced && m.createdAt < before) {
        this.rows.delete(id);
        removed++;
      }
    }
    return removed;
  }
}
