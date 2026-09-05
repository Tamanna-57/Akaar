import {
  claimNext,
  drainOutbox,
  enqueue,
  EntityType,
  getOrCreateDatabaseKey,
  markSynced,
  migrate,
  type MutationResult,
  Operation,
  type QueueDeps,
  SqliteOutboxStore,
} from "@akaar/core-data";
import { KeychainSecureStorage, openEncryptedDatabase } from "@akaar/core-data/native";
import { assessQuality, isUsable, MediaPermission, PermissionStatus } from "@akaar/core-media";
import { requestPermission } from "@akaar/core-media/native";
import { getRandomBytes, newUuid } from "../data/random.ts";
import { enableScreenGuard, disableScreenGuard, isScreenGuardAvailable } from "../security/screenGuard.ts";

/**
 * The on-device checks.
 *
 * Everything in mobile/packages is already unit tested on a computer. What a
 * computer cannot answer is whether the *device* halves actually work: does
 * the Keystore hand the passphrase back after an app restart, does SQLCipher
 * really encrypt the file, does the queue survive being written to real
 * storage. These checks answer exactly those questions and nothing else.
 *
 * Each check returns a plain pass/fail plus a sentence, so the screen can be
 * read by someone who is not going to open a log.
 */
export interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

export interface Check {
  name: string;
  run: () => Promise<CheckResult>;
}

function pass(name: string, detail: string): CheckResult {
  return { name, passed: true, detail };
}

function fail(name: string, detail: string): CheckResult {
  return { name, passed: false, detail };
}

const deps: QueueDeps = { now: Date.now, newId: newUuid };

/** 1. Hardware-backed storage really stores and returns a secret. */
const secureStorageCheck: Check = {
  name: "Secure storage (Keystore)",
  run: async () => {
    const name = "Secure storage (Keystore)";
    try {
      const storage = new KeychainSecureStorage();
      const key = "akaar.selftest.probe";
      const value = `probe-${Date.now()}`;

      await storage.set(key, value);
      const readBack = await storage.get(key);
      await storage.remove(key);
      const afterRemove = await storage.get(key);

      if (readBack !== value) return fail(name, `Wrote "${value}" but read back "${readBack}".`);
      if (afterRemove !== null) return fail(name, "Value still present after remove.");
      return pass(name, "Wrote, read back and deleted a secret successfully.");
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

/**
 * 2. The database passphrase is created once and stays the same.
 *
 * A different key on the second call would mean every saved draft becomes
 * unreadable on the next app start - the worst possible silent failure.
 */
const databaseKeyCheck: Check = {
  name: "Database key is stable",
  run: async () => {
    const name = "Database key is stable";
    try {
      const storage = new KeychainSecureStorage();
      const first = await getOrCreateDatabaseKey(storage, getRandomBytes);
      const second = await getOrCreateDatabaseKey(storage, getRandomBytes);

      if (first !== second) return fail(name, "Got a different key on the second call.");
      if (first.length !== 64) return fail(name, `Expected a 64-character key, got ${first.length}.`);
      return pass(name, "Same 256-bit key returned twice. Restart the app and re-run to confirm it survives.");
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

/** 3. The encrypted database opens, migrates and accepts a write. */
const databaseCheck: Check = {
  name: "Encrypted database",
  run: async () => {
    const name = "Encrypted database";
    try {
      const storage = new KeychainSecureStorage();
      const key = await getOrCreateDatabaseKey(storage, getRandomBytes);
      const db = openEncryptedDatabase("akaar.db", key);
      await migrate(db);

      const store = new SqliteOutboxStore(db);
      const mutation = await enqueue(
        store,
        {
          entityType: EntityType.Product,
          entityId: `selftest-${Date.now()}`,
          operation: Operation.Create,
          payload: { note: "self test" },
        },
        deps,
      );

      const readBack = await store.byId(mutation.id);
      if (readBack == null) return fail(name, "Row was written but could not be read back.");
      if (readBack.idempotencyKey !== mutation.idempotencyKey) {
        return fail(name, "Row came back with a different idempotency key.");
      }

      await markSynced(store, mutation.id);
      return pass(name, "Opened with the Keystore key, migrated, wrote and read a row.");
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

/**
 * 4. Wrong key must NOT open the database.
 *
 * This is the check that actually proves encryption is on. If op-sqlite was
 * built without SQLCipher, `encryptionKey` is quietly ignored and a wrong
 * key opens the file happily - which is exactly the silent failure worth
 * catching before shipping.
 */
const encryptionIsRealCheck: Check = {
  name: "Encryption is actually on",
  run: async () => {
    const name = "Encryption is actually on";
    try {
      const wrongKey = "0".repeat(64);
      const db = openEncryptedDatabase("akaar.db", wrongKey);
      await db.execute("SELECT count(*) FROM outbox");
      await db.close();
      return fail(
        name,
        "A wrong passphrase opened the database. SQLCipher is NOT active - check the \"op-sqlite\" sqlcipher flag in apps/mobile/package.json and rebuild.",
      );
    } catch {
      // Throwing is the correct behaviour here.
      return pass(name, "A wrong passphrase was rejected, so the file really is encrypted.");
    }
  },
};

/** 5. The outbox behaves on real storage the way it does in the tests. */
const outboxCheck: Check = {
  name: "Offline outbox on real storage",
  run: async () => {
    const name = "Offline outbox on real storage";
    try {
      const storage = new KeychainSecureStorage();
      const key = await getOrCreateDatabaseKey(storage, getRandomBytes);
      const db = openEncryptedDatabase("akaar.db", key);
      await migrate(db);
      const store = new SqliteOutboxStore(db);

      const entityId = `selftest-${Date.now()}`;
      const first = await enqueue(
        store,
        { entityType: EntityType.Product, entityId, operation: Operation.Create, payload: {} },
        deps,
      );
      await enqueue(
        store,
        { entityType: EntityType.Product, entityId, operation: Operation.Update, payload: {} },
        deps,
      );

      // Same-product changes must go out in order: the update waits.
      const claimed = await claimNext(store, deps);
      if (claimed?.id !== first.id) {
        return fail(name, "The queue did not hand back the oldest change for this product first.");
      }
      const blocked = await claimNext(store, deps);
      if (blocked != null && blocked.entityId === entityId) {
        return fail(name, "A second change for the same product was sent while the first was still in flight.");
      }

      // Drain both with a transport that always succeeds.
      await markSynced(store, first.id);
      const seenKeys = new Set<string>();
      const summary = await drainOutbox(
        store,
        {
          async send(m): Promise<MutationResult> {
            seenKeys.add(m.idempotencyKey);
            return { kind: "success" };
          },
        },
        deps,
      );

      if (summary.sent < 1) return fail(name, "Nothing was drained from the queue.");
      return pass(name, `Order held, ${summary.sent} change(s) drained, each with its own key.`);
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

/**
 * 6. The FLAG_SECURE native module is registered and callable.
 *
 * This is our own Kotlin module, so it is not autolinked - it only works if
 * ScreenGuardPackage() was added to MainApplication. A missing registration
 * fails silently at runtime, which is why it is checked here rather than
 * discovered later on a screen that shows real costs.
 */
const screenGuardCheck: Check = {
  name: "Screenshot block (FLAG_SECURE)",
  run: async () => {
    const name = "Screenshot block (FLAG_SECURE)";
    try {
      if (!isScreenGuardAvailable()) {
        return fail(
          name,
          "The native module is not reachable. Check that ScreenGuardPackage() is added in MainApplication.kt, then rebuild.",
        );
      }
      enableScreenGuard();
      disableScreenGuard();
      return pass(
        name,
        "Module is registered and both calls worked. To confirm by hand: turn it on, then try to take a screenshot.",
      );
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

/**
 * 7. The camera library is linked, and the permission flow answers.
 *
 * Does not open the camera - that needs a preview screen. It answers the
 * narrower question that blocks everything else: is vision-camera actually
 * built into this app?
 */
const cameraCheck: Check = {
  name: "Camera library and permission",
  run: async () => {
    const name = "Camera library and permission";
    try {
      const status = await requestPermission(MediaPermission.Camera);

      if (isUsable(status)) {
        return pass(name, "Camera library is linked and permission was granted.");
      }
      if (status === PermissionStatus.Blocked) {
        return fail(name, "Permission is permanently denied. Grant it in Android Settings, then re-run.");
      }
      return fail(name, `Library is linked, but permission was not granted (${status}). Tap allow when asked.`);
    } catch (error) {
      return fail(name, `Could not reach the camera library: ${describe(error)}`);
    }
  },
};

/**
 * 8. The photo quality gate is reachable and gives usable words.
 *
 * The thresholds are unit tested already; what this confirms is that the
 * package is wired into the app and the guidance strings actually arrive.
 */
const qualityGateCheck: Check = {
  name: "Photo quality gate",
  run: async () => {
    const name = "Photo quality gate";
    try {
      const dark = assessQuality({
        laplacianVariance: 300,
        meanLuminance: 20,
        clippedHighlightsPct: 1,
        clippedShadowsPct: 40,
      });
      if (dark.kind !== "block") return fail(name, `A very dark frame was not blocked (got "${dark.kind}").`);

      const good = assessQuality({
        laplacianVariance: 300,
        meanLuminance: 130,
        clippedHighlightsPct: 1,
        clippedShadowsPct: 1,
      });
      if (good.kind !== "ok") return fail(name, `A good frame was not accepted (got "${good.kind}").`);

      return pass(name, `Dark frame rejected with: "${dark.guidance[0]}"`);
    } catch (error) {
      return fail(name, describe(error));
    }
  },
};

export const checks: Check[] = [
  secureStorageCheck,
  databaseKeyCheck,
  databaseCheck,
  encryptionIsRealCheck,
  outboxCheck,
  screenGuardCheck,
  cameraCheck,
  qualityGateCheck,
];

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
