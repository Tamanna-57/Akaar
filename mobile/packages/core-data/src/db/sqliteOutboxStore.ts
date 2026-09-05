import type { OutboxStore } from "../outbox/store.ts";
import type { EntityType, LocalMutation, MutationState, Operation } from "../outbox/types.ts";
import type { Database } from "./database.ts";

/**
 * {@link OutboxStore} over the encrypted database. The queue logic in
 * ../outbox/queue.ts is unchanged by this: it is written against the port,
 * and this is the row-mapping half.
 */
export class SqliteOutboxStore implements OutboxStore {
  // Plain field + assignment rather than a TS parameter property: a
  // parameter property *emits* code, so it cannot be type-stripped, and
  // this file is reachable from the package index that `node --test` loads.
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async insert(mutation: LocalMutation): Promise<void> {
    await this.db.execute(
      `INSERT INTO outbox
         (id, entity_type, entity_id, operation, rpc_name, payload, idempotency_key,
          attempts, next_attempt_at, last_error, failure_kind, state, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mutation.id,
        mutation.entityType,
        mutation.entityId,
        mutation.operation,
        mutation.rpcName ?? null,
        JSON.stringify(mutation.payload),
        mutation.idempotencyKey,
        mutation.attempts,
        mutation.nextAttemptAt,
        mutation.lastError ?? null,
        mutation.failureKind ?? null,
        mutation.state,
        mutation.createdAt,
      ],
    );
  }

  async update(mutation: LocalMutation): Promise<void> {
    await this.db.execute(
      `UPDATE outbox
          SET attempts = ?, next_attempt_at = ?, last_error = ?, failure_kind = ?, state = ?
        WHERE id = ?`,
      [
        mutation.attempts,
        mutation.nextAttemptAt,
        mutation.lastError ?? null,
        mutation.failureKind ?? null,
        mutation.state,
        mutation.id,
      ],
    );
  }

  async byId(id: string): Promise<LocalMutation | null> {
    const { rows } = await this.db.execute("SELECT * FROM outbox WHERE id = ?", [id]);
    const row = rows[0];
    return row ? toMutation(row) : null;
  }

  async unsynced(): Promise<LocalMutation[]> {
    const { rows } = await this.db.execute(
      "SELECT * FROM outbox WHERE state != 'SYNCED' ORDER BY created_at ASC",
    );
    return rows.map(toMutation);
  }

  async forEntity(entityType: string, entityId: string): Promise<LocalMutation[]> {
    const { rows } = await this.db.execute(
      "SELECT * FROM outbox WHERE entity_type = ? AND entity_id = ? ORDER BY created_at ASC",
      [entityType, entityId],
    );
    return rows.map(toMutation);
  }

  async deleteSyncedBefore(before: number): Promise<number> {
    const { rows } = await this.db.execute(
      "SELECT COUNT(*) AS n FROM outbox WHERE state = 'SYNCED' AND created_at < ?",
      [before],
    );
    const count = Number(rows[0]?.n ?? 0);
    await this.db.execute("DELETE FROM outbox WHERE state = 'SYNCED' AND created_at < ?", [before]);
    return count;
  }
}

function toMutation(row: Record<string, unknown>): LocalMutation {
  return {
    id: String(row.id),
    entityType: String(row.entity_type) as EntityType,
    entityId: String(row.entity_id),
    operation: String(row.operation) as Operation,
    rpcName: row.rpc_name == null ? undefined : String(row.rpc_name),
    payload: JSON.parse(String(row.payload)),
    idempotencyKey: String(row.idempotency_key),
    attempts: Number(row.attempts),
    nextAttemptAt: Number(row.next_attempt_at),
    lastError: row.last_error == null ? undefined : String(row.last_error),
    failureKind: row.failure_kind == null ? undefined : (String(row.failure_kind) as "rejected" | "exhausted"),
    state: String(row.state) as MutationState,
    createdAt: Number(row.created_at),
  };
}
