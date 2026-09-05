import { StateHost, UiState } from "@akaar/design-system";
import React from "react";

/**
 * Port of android/app/.../PendingScreen.kt.
 *
 * A destination whose screen arrives in a later phase. It renders a real
 * Empty state rather than a placeholder, so navigation is exercised end to
 * end and no route silently leads nowhere.
 *
 * The optional action exists so a placeholder can still carry the user
 * onward to a screen that *is* built - an empty screen with no next step is
 * a dead end, which is exactly what UiState.Empty was defined to prevent.
 */
export function PendingScreen({
  name,
  actionLabel,
  onAction,
}: {
  name: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <StateHost
      state={UiState.empty(name, "This screen is built in a later phase.", actionLabel)}
      onEmptyAction={onAction}
    >
      {() => null}
    </StateHost>
  );
}
