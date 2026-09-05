import BackgroundFetch from "react-native-background-fetch";
import { drainOutbox, type MutationTransport } from "../outbox/drainer.ts";
import type { QueueDeps } from "../outbox/queue.ts";
import type { OutboxStore } from "../outbox/store.ts";
import { canSync, type NetworkMonitor } from "./network.ts";

/**
 * The WorkManager stand-in.
 *
 * android-architecture.md specifies the outbox is "drained by WorkManager
 * with exponential backoff and a network constraint". react-native-background-fetch
 * is backed by WorkManager on Android (and BGTaskScheduler on iOS), so the
 * Android behaviour is the real thing rather than an approximation; the
 * backoff itself is ours (../outbox/backoff.ts) because the schedule has to
 * survive process death in our own table either way.
 *
 * `registerHeadlessTask` is what keeps this working after the app is
 * swiped away - the case that matters most for a phone that gets handed
 * back to someone else mid-upload.
 */
export interface BackgroundSync {
  start(): Promise<void>;
  stop(): Promise<void>;
  /** Run a pass right now - on app foreground, or after a manual retry tap. */
  runNow(): Promise<void>;
}

export interface BackgroundSyncConfig {
  store: OutboxStore;
  transport: MutationTransport;
  network: NetworkMonitor;
  deps: QueueDeps;
  /** Minutes between background passes. 15 is the Android floor. */
  intervalMinutes?: number;
  requiresUnmetered?: boolean;
}

export function createBackgroundSync(config: BackgroundSyncConfig): BackgroundSync {
  const { store, transport, network, deps } = config;

  const runPass = async (): Promise<void> => {
    const status = await network.current();
    // The network constraint is enforced here as well as in the scheduler:
    // "connected" from the OS is not the same as "packets get through".
    if (!canSync(status)) return;
    await drainOutbox(store, transport, deps);
  };

  return {
    async start() {
      await BackgroundFetch.configure(
        {
          minimumFetchInterval: config.intervalMinutes ?? 15,
          stopOnTerminate: false,
          startOnBoot: true,
          enableHeadless: true,
          requiredNetworkType: config.requiresUnmetered
            ? BackgroundFetch.NETWORK_TYPE_UNMETERED
            : BackgroundFetch.NETWORK_TYPE_ANY,
        },
        async (taskId: string) => {
          await runPass();
          BackgroundFetch.finish(taskId);
        },
        async (taskId: string) => {
          // Timed out by the OS. The outbox is durable, so the next pass
          // picks up exactly where this one stopped.
          BackgroundFetch.finish(taskId);
        },
      );
      await BackgroundFetch.start();
    },

    async stop() {
      await BackgroundFetch.stop();
    },

    runNow: runPass,
  };
}

/**
 * Registered from index.js, outside the React tree, so a drain can run with
 * no UI mounted. Mirrors a WorkManager Worker being invoked with the app
 * process dead.
 */
export function registerHeadlessSync(run: () => Promise<void>): void {
  BackgroundFetch.registerHeadlessTask(async ({ taskId }: { taskId: string }) => {
    await run();
    BackgroundFetch.finish(taskId);
  });
}
