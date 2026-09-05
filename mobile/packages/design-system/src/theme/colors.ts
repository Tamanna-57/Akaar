import { Palette } from "./palette.ts";

/**
 * Port of `AkaarColors` / `LightColors` / `DarkColors` in
 * android/core/designsystem/.../theme/Color.kt.
 *
 * Semantic colours. Screens reference these, never {@link Palette} directly.
 */
export interface AkaarColors {
  surface: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  isDark: boolean;
}

export const LightColors: AkaarColors = {
  surface: Palette.cotton,
  surfaceRaised: Palette.cottonRaised,
  border: Palette.hairline,
  textPrimary: Palette.ink,
  textSecondary: Palette.inkMuted,
  primary: Palette.indigo700,
  onPrimary: Palette.white,
  accent: Palette.madder700,
  success: Palette.success,
  warning: Palette.warning,
  danger: Palette.danger,
  isDark: false,
};

export const DarkColors: AkaarColors = {
  surface: Palette.nightGround,
  surfaceRaised: Palette.nightRaised,
  border: Palette.nightLine,
  textPrimary: Palette.nightInk,
  textSecondary: Palette.nightMuted,
  primary: Palette.indigo300,
  onPrimary: Palette.indigo900,
  accent: Palette.madder300,
  success: Palette.successDark,
  warning: Palette.warningDark,
  danger: Palette.dangerDark,
  isDark: true,
};
