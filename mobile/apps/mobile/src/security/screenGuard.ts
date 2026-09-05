import { NativeModules, Platform } from "react-native";

/**
 * `FLAG_SECURE` on screens showing cost breakdowns, per
 * android-architecture.md ("Security on device").
 *
 * Declared cost, sustainable floor and the negotiation corridor are
 * SELLER_PRIVATE. The phone is often shared, and a screenshot in a gallery
 * (or a screen recorder) is the easiest way for that data to leave. This
 * blocks both at the window level.
 *
 * Implemented as a two-method native module rather than a dependency: the
 * Android side is `window.addFlags(FLAG_SECURE)` and nothing more, and iOS
 * has no equivalent flag (the screenshot has already been taken by the time
 * an app is notified), so a library would be mostly empty surface.
 *
 * Native side: android/app/src/main/java/com/akaar/security/ScreenGuardModule.kt
 */
interface ScreenGuardNativeModule {
  enable(): void;
  disable(): void;
}

const native = NativeModules.AkaarScreenGuard as ScreenGuardNativeModule | undefined;

export function enableScreenGuard(): void {
  if (Platform.OS !== "android" || native == null) return;
  native.enable();
}

export function disableScreenGuard(): void {
  if (Platform.OS !== "android" || native == null) return;
  native.disable();
}

/** True where the guard can actually be applied - the UI should not promise it otherwise. */
export function isScreenGuardAvailable(): boolean {
  return Platform.OS === "android" && native != null;
}
