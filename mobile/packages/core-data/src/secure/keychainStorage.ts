import * as Keychain from "react-native-keychain";
import type { SecureStorage } from "./secureStorage.ts";

/**
 * {@link SecureStorage} backed by react-native-keychain, which on Android
 * stores through the Keystore (AES-GCM, hardware-backed where the device
 * has a TEE) and on iOS through the Keychain.
 *
 * `WHEN_UNLOCKED_THIS_DEVICE_ONLY` is deliberate: the target phone is often
 * *shared*, and nothing here should survive a backup-and-restore onto a
 * different handset.
 *
 * One keychain entry per key - `service` namespaces them, and the value
 * goes in the password field with a fixed username, since we only ever
 * store opaque secrets.
 */
export class KeychainSecureStorage implements SecureStorage {
  private static readonly USERNAME = "akaar";

  async get(key: string): Promise<string | null> {
    const result = await Keychain.getGenericPassword({ service: key });
    return result === false ? null : result.password;
  }

  async set(key: string, value: string): Promise<void> {
    await Keychain.setGenericPassword(KeychainSecureStorage.USERNAME, value, {
      service: key,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async remove(key: string): Promise<void> {
    await Keychain.resetGenericPassword({ service: key });
  }
}
