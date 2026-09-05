import { open } from "@op-engineering/op-sqlite";
import type { Database } from "./database.ts";

/**
 * {@link Database} over op-sqlite. op-sqlite ships a SQLCipher build, which
 * is why it is the pick here over the alternatives: `encryptionKey` is what
 * makes the on-disk file unreadable without the Keystore-held passphrase.
 *
 * NOTE: SQLCipher is only active when the app is built with op-sqlite's
 * `sqlcipher` flag set in package.json ("op-sqlite": { "sqlcipher": true }).
 * Without it `open` silently ignores `encryptionKey` and you get a plain
 * database - so that flag is set in apps/mobile/package.json and must not
 * be removed.
 */
export function openEncryptedDatabase(name: string, encryptionKey: string): Database {
  const db = open({ name, encryptionKey });

  return {
    async execute(sql, params = []) {
      const result = await db.execute(sql, params as never[]);
      return { rows: (result.rows ?? []) as Record<string, unknown>[] };
    },

    async transaction(body) {
      await db.execute("BEGIN");
      try {
        const value = await body();
        await db.execute("COMMIT");
        return value;
      } catch (error) {
        await db.execute("ROLLBACK");
        throw error;
      }
    },

    async close() {
      db.close();
    },
  };
}
