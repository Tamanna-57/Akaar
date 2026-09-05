/**
 * Hardware-backed secret storage - the RN counterpart of
 * `EncryptedSharedPreferences` + Android Keystore in
 * docs/04-architecture/android-architecture.md ("Security on device").
 *
 * Two things live here and nothing else: the session tokens, and the
 * passphrase for the encrypted database. No product data, no costs.
 */
export interface SecureStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export const SecureKeys = {
  SessionToken: "akaar.session.token",
  RefreshToken: "akaar.session.refresh",
  /** SQLCipher passphrase for the local database. Never leaves the device. */
  DatabaseKey: "akaar.db.key",
} as const;

/** For tests and for the JS-only parts of CI. Not for production use. */
export class InMemorySecureStorage implements SecureStorage {
  private readonly values = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.values.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    this.values.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.values.delete(key);
  }
}
