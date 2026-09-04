/** Port of `Space` in android/core/designsystem/.../theme/Dimens.kt. 4dp base scale. */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,

  gutter: 16,
  /** Screen gutter is 20dp in seller flows for a calmer rhythm. */
  gutterSeller: 20,
} as const;

/**
 * Port of `Shapes`. Moderate and consistent. Full rounding is reserved for
 * avatars alone - nothing else in the app is pill-shaped.
 */
export const Shapes = {
  input: 4,
  chip: 4,
  card: 8,
  button: 8,
  sheetTop: 12,
  dialog: 12,
  /** Consumers should also set `overflow: "hidden"` + equal width/height for a true circle. */
  avatarPercent: 50,
} as const;

/**
 * Port of `Touch`. Touch targets. The seller minimum is larger because the
 * target user is a first-time smartphone user, often outdoors, often in a
 * hurry.
 */
export const Touch = {
  min: 48,
  minSeller: 56,
  listRowSeller: 64,
} as const;
