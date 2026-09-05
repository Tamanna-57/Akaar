/**
 * Narrow SQL port. Everything the data layer needs from the database is
 * behind these three calls, so the SQLCipher implementation can be swapped
 * (or faked in tests) without the queue or repositories knowing.
 *
 * The Kotlin build gets this shape from Room + SQLCipher; here it is
 * op-sqlite compiled against SQLCipher - see opSqliteDatabase.ts.
 */
export interface Database {
  execute(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  transaction<T>(body: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

/** DDL. Mirrors the LocalMutation sketch in offline-strategy.md. */
export const OUTBOX_SCHEMA = `
CREATE TABLE IF NOT EXISTS outbox (
  id               TEXT PRIMARY KEY NOT NULL,
  entity_type      TEXT NOT NULL,
  entity_id        TEXT NOT NULL,
  operation        TEXT NOT NULL,
  rpc_name         TEXT,
  payload          TEXT NOT NULL,
  idempotency_key  TEXT NOT NULL UNIQUE,
  attempts         INTEGER NOT NULL DEFAULT 0,
  next_attempt_at  INTEGER NOT NULL,
  last_error       TEXT,
  failure_kind     TEXT,
  state            TEXT NOT NULL,
  created_at       INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_outbox_entity ON outbox (entity_type, entity_id, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_state ON outbox (state, next_attempt_at);
`;

export async function migrate(db: Database): Promise<void> {
  for (const statement of OUTBOX_SCHEMA.split(";")) {
    const sql = statement.trim();
    if (sql.length > 0) await db.execute(sql);
  }
}
