import { StateHost, UiState } from "@akaar/design-system";
import React from "react";

/**
 * Port of android/app/.../PendingScreen.kt.
 *
 * A destination whose screen arrives in a later phase. It renders a real
 * Empty state rather than a placeholder, so navigation is exercised end to
 * end from Phase 2 and no route silently leads nowhere.
 */
export function PendingScreen({ name }: { name: string }) {
  return (
    <StateHost state={UiState.empty(name, "This screen is built in a later phase.")}>{() => null}</StateHost>
  );
}
