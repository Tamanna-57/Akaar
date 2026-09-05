import NetInfo from "@react-native-community/netinfo";

/**
 * Connectivity, as the app actually needs to reason about it.
 *
 * `reachable` is deliberately separate from `connected`: on the target
 * network, "connected to a tower" and "packets get through" are not the
 * same claim, and the offline UiState should follow the second one.
 */
export interface NetworkStatus {
  connected: boolean;
  reachable: boolean;
  /** True on cellular. Media uploads are held back on metered links by default. */
  metered: boolean;
}

export interface NetworkMonitor {
  current(): Promise<NetworkStatus>;
  subscribe(listener: (status: NetworkStatus) => void): () => void;
}

export const offlineStatus: NetworkStatus = { connected: false, reachable: false, metered: false };

export class NetInfoNetworkMonitor implements NetworkMonitor {
  async current(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    return {
      connected: state.isConnected === true,
      // isInternetReachable is null while unknown - treat unknown as reachable
      // so a slow probe does not flash an "you are offline" screen at someone
      // who is merely on a slow link.
      reachable: state.isInternetReachable !== false,
      metered: state.type === "cellular",
    };
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    return NetInfo.addEventListener((state) => {
      listener({
        connected: state.isConnected === true,
        reachable: state.isInternetReachable !== false,
        metered: state.type === "cellular",
      });
    });
  }
}

/** Should the drainer run right now? */
export function canSync(status: NetworkStatus): boolean {
  return status.connected && status.reachable;
}

/** Should a large media upload run right now, or wait for wifi? */
export function canUploadMedia(status: NetworkStatus, allowMetered: boolean): boolean {
  return canSync(status) && (allowMetered || !status.metered);
}
