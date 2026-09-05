import React from "react";
import { Pressable, type StyleProp, Text, View, type ViewStyle } from "react-native";
import { AkaarType } from "../theme/type.ts";
import { Shapes, Space } from "../theme/space.ts";
import { useAkaarColors } from "../theme/theme.tsx";

/**
 * Port of android/core/designsystem/.../component/Surfaces.kt.
 *
 * A card is for a discrete, tappable object - a product, an offer, an
 * order. Sections and forms sit directly on the surface with hairline
 * separators instead, because not every section should look like a card.
 *
 * Borders and tonal contrast, never a drop shadow.
 */
export function AkaarCard({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useAkaarColors();
  const cardStyle: StyleProp<ViewStyle> = [
    {
      borderRadius: Shapes.card,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
      padding: Space.lg,
    },
    style,
  ];

  if (onPress != null) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" style={cardStyle}>
        {children}
      </Pressable>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

export function AkaarSectionHeader({ title, style }: { title: string; style?: StyleProp<ViewStyle> }) {
  const colors = useAkaarColors();
  return (
    <Text
      style={[AkaarType.section, { color: colors.textPrimary, paddingTop: Space.xl, paddingBottom: Space.sm }, style]}
    >
      {title}
    </Text>
  );
}

export function AkaarDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useAkaarColors();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

/** Shape-matched placeholder. No shimmer sweeping across the whole screen. */
export function Skeleton({
  height = 16,
  widthFraction = 1,
  style,
}: {
  height?: number;
  widthFraction?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useAkaarColors();
  return (
    <View
      style={[
        {
          width: `${widthFraction * 100}%`,
          height,
          borderRadius: Shapes.input,
          backgroundColor: colors.border,
        },
        style,
      ]}
    />
  );
}
