import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { type AkaarColors, DarkColors, LightColors } from "./colors.ts";

/**
 * Port of `LocalAkaarColors` / `AkaarTheme` (the `@Composable` function) in
 * android/core/designsystem/.../theme/Theme.kt.
 *
 * Dark mode is a first-class theme, not an inversion of the light one.
 * `useColorScheme()` is RN's equivalent of Compose's `isSystemInDarkTheme()`.
 */
const AkaarColorsContext = createContext<AkaarColors>(LightColors);

export interface AkaarThemeProviderProps {
  /** Omit to follow the system setting, same default as the Kotlin composable. */
  darkTheme?: boolean;
  children: React.ReactNode;
}

export function AkaarThemeProvider({ darkTheme, children }: AkaarThemeProviderProps) {
  const systemScheme = useColorScheme();
  const isDark = darkTheme ?? systemScheme === "dark";
  const colors = useMemo(() => (isDark ? DarkColors : LightColors), [isDark]);
  return <AkaarColorsContext.Provider value={colors}>{children}</AkaarColorsContext.Provider>;
}

/** Semantic colours for the current theme - the hook equivalent of `AkaarTheme.colors`. */
export function useAkaarColors(): AkaarColors {
  return useContext(AkaarColorsContext);
}
