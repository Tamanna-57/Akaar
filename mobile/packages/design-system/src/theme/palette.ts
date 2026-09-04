/**
 * Port of android/core/designsystem/.../theme/Color.kt (`Palette` object).
 *
 * A deliberately small palette drawn from the material domain the app
 * serves - dyed cloth, block-print ink, undyed cotton. Colour carries
 * meaning here; it is never decorative. No gradients, no neon, no pastel
 * card sets, no purple-black AI aesthetic.
 *
 * Backgrounds are warm off-white rather than pure white: this app is used
 * outdoors on cheap LCDs, where pure white is glare.
 *
 * Not exported from the package index - screens reference `colors` (below),
 * never these raw hex values, so a palette change is one edit rather than a
 * sweep. Same rule as the Kotlin `internal object Palette`.
 */
export const Palette = {
  indigo900: "#1B2E3A",
  indigo700: "#2E4A5C",
  indigo300: "#7FA7BF",

  madder700: "#9A4A32",
  madder300: "#D08A70",

  cotton: "#FBF9F5",
  cottonRaised: "#FFFFFF",
  ink: "#1A1815",
  inkMuted: "#6B645A",
  hairline: "#E3DDD2",

  nightGround: "#131211",
  nightRaised: "#1C1A18",
  nightInk: "#F2EEE7",
  nightMuted: "#A79E92",
  nightLine: "#302C28",

  success: "#3D6B4A",
  successDark: "#7DB08C",
  warning: "#8A6A24",
  warningDark: "#D4AC5A",
  danger: "#8C3A32",
  dangerDark: "#D68A82",

  white: "#FFFFFF",
} as const;
