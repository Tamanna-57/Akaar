import "react-native-get-random-values";

/**
 * Cryptographic randomness on Hermes.
 *
 * Hermes ships no `crypto` global, so `crypto.randomUUID()` and
 * `crypto.getRandomValues()` are both absent until the polyfill above is
 * imported - and the polyfill is backed by the platform CSPRNG
 * (SecRandomCopyBytes / SecureRandom), not by Math.random.
 *
 * This matters more here than it usually would: these bytes become the
 * SQLCipher passphrase for a database holding SELLER_PRIVATE costs, and
 * idempotency keys that must not collide across devices.
 */
export function getRandomBytes(byteLength: number): Uint8Array {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function newUuid(): string {
  return crypto.randomUUID();
}
