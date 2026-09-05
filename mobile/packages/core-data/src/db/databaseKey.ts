import { SecureKeys, type SecureStorage } from "../secure/secureStorage.ts";

/**
 * The SQLCipher passphrase for the local database.
 *
 * offline-strategy.md: local drafts are "encrypted at rest (SQLCipher)
 * because drafts contain declared costs" - and declared costs are
 * SELLER_PRIVATE. The passphrase itself is random per install and lives in
 * hardware-backed storage, so the encrypted database file is worthless on
 * its own.
 *
 * Generated once, then reused for the life of the install: regenerating it
 * would make every existing draft unreadable.
 */
export interface RandomBytes {
  (byteLength: number): Uint8Array;
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getOrCreateDatabaseKey(
  storage: SecureStorage,
  randomBytes: RandomBytes,
): Promise<string> {
  const existing = await storage.get(SecureKeys.DatabaseKey);
  if (existing != null && existing.length > 0) return existing;

  const key = toHex(randomBytes(32)); // 256-bit
  await storage.set(SecureKeys.DatabaseKey, key);
  return key;
}

/**
 * Sign-out wipe. Dropping the key is what makes the local database
 * unreadable; the file itself is deleted separately by the caller.
 */
export async function destroyDatabaseKey(storage: SecureStorage): Promise<void> {
  await storage.remove(SecureKeys.DatabaseKey);
}
