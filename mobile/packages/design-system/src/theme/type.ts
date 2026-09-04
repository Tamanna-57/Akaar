import { Platform, type TextStyle } from "react-native";

/**
 * Port of `AkaarFonts` in android/core/designsystem/.../theme/Type.kt.
 *
 * Two families. Devanagari is a first-class script here, not a fallback - a
 * Latin-first stack that renders Hindi in a mismatched substitute is an
 * immediate credibility failure with the people this app is for.
 *
 * The serif for display and prices is a deliberate departure from the
 * Inter/Geist/Space Grotesk default; it reads as considered rather than
 * generic.
 *
 * `FontFamily.Serif` / `FontFamily.SansSerif` are Compose's built-in
 * platform generics; iOS has no such generic, so a display font here needs
 * an actual bundled/system font name once one is chosen (Android may keep
 * using the "serif" / "sans-serif" system aliases). Font files are wired in
 * the localisation pass; this scale is the contract and does not change
 * when they land.
 */
export const AkaarFonts = {
  display: Platform.select({ android: "serif", default: undefined }),
  text: Platform.select({ android: "sans-serif", default: undefined }),
} as const;

/**
 * Port of `AkaarType`. Body L is the default in seller flows: the
 * artisan-facing minimum is 17sp. Every style keeps its line height explicit
 * so Devanagari, which runs taller than Latin, is never clipped.
 */
export const AkaarType: Record<
  "display" | "title" | "section" | "bodyLarge" | "body" | "caption" | "price" | "label",
  TextStyle
> = {
  display: { fontFamily: AkaarFonts.display, fontSize: 28, lineHeight: 34, fontWeight: "600" },
  title: { fontFamily: AkaarFonts.display, fontSize: 22, lineHeight: 28, fontWeight: "600" },
  section: { fontFamily: AkaarFonts.text, fontSize: 18, lineHeight: 24, fontWeight: "600" },
  bodyLarge: { fontFamily: AkaarFonts.text, fontSize: 17, lineHeight: 26 },
  body: { fontFamily: AkaarFonts.text, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: AkaarFonts.text, fontSize: 13, lineHeight: 18 },
  price: { fontFamily: AkaarFonts.display, fontSize: 20, lineHeight: 26, fontWeight: "600" },
  label: { fontFamily: AkaarFonts.text, fontSize: 15, lineHeight: 20, fontWeight: "500" },
};
