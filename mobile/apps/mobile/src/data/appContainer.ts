import {
  getOrCreateDatabaseKey,
  migrate,
  type OutboxStore,
  SqliteOutboxStore,
  type SecureStorage,
} from "@akaar/core-data";
import {
  type BackgroundSync,
  createBackgroundSync,
  KeychainSecureStorage,
  NetInfoNetworkMonitor,
  type NetworkMonitor,
  openEncryptedDatabase,
} from "@akaar/core-data/native";
import type { MutationTransport, QueueDeps } from "@akaar/core-data";
import { getRandomBytes, newUuid } from "./random.ts";

/**
 * The composition root - what Hilt's `@Module`s do on the Kotlin side.
 *
 * React Native has no DI framework worth the ceremony, so this is one
 * explicit function that builds the graph in order and hands it back. The
 * ordering matters and is the reason it is not scattered across hooks:
 * the database cannot open before its key exists, and the key cannot be
 * read before secure storage is available.
 */
export interface AppContainer {
  secureStorage: SecureStorage;
  outbox: OutboxStore;
  network: NetworkMonitor;
  backgroundSync: BackgroundSync;
  queueDeps: QueueDeps;
}

export async function createAppContainer(transport: MutationTransport): Promise<AppContainer> {
  const secureStorage = new KeychainSecureStorage();

  // Random per install, held in the Keystore, generated exactly once -
  // regenerating it would make every existing draft unreadable.
  const databaseKey = await getOrCreateDatabaseKey(secureStorage, getRandomBytes);

  const db = openEncryptedDatabase("akaar.db", databaseKey);
  await migrate(db);

  const outbox = new SqliteOutboxStore(db);
  const network = new NetInfoNetworkMonitor();
  const queueDeps: QueueDeps = { now: Date.now, newId: newUuid };

  const backgroundSync = createBackgroundSync({
    store: outbox,
    transport,
    network,
    deps: queueDeps,
  });

  return { secureStorage, outbox, network, backgroundSync, queueDeps };
}
