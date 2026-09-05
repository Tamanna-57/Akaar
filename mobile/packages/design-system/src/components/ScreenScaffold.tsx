import React from "react";
import { useWindowDimensions, View } from "react-native";
import { HeritagePattern } from "./HeritagePattern.tsx";
import { useAkaarColors } from "../theme/theme.tsx";

/**
 * The layering primitive: patterned ground at the back, content in front.
 *
 * Every screen that wants the textile ground uses this rather than each one
 * placing its own absolutely-positioned layer, so the ordering and the
 * accessibility treatment are decided once. The pattern layer is inert -
 * `pointerEvents="none"` and hidden from screen readers - so it can never
 * intercept a tap or add noise to TalkBack.
 */
export function ScreenScaffold({
  children,
  patterned = true,
  /** Lets a screen tint its own ground, e.g. an indigo header block. */
  backgroundColor,
  patternOpacity,
}: {
  children: React.ReactNode;
  patterned?: boolean;
  backgroundColor?: string;
  patternOpacity?: number;
}) {
  const colors = useAkaarColors();
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor ?? colors.surface }}>
      {patterned ? (
        <HeritagePattern
          width={width}
          height={height}
          // Quieter in dark mode: the same ink on a near-black ground reads
          // considerably louder than it does on cotton.
          // Tuned by looking at a render, not guessed: below this the
          // cloth simply is not there, above it starts competing with body
          // text on a cheap LCD.
          opacity={patternOpacity ?? (colors.isDark ? 0.5 : 0.9)}
        />
      ) : null}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
