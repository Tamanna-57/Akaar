import React from "react";
import { Pressable, type StyleProp, Text, type ViewStyle } from "react-native";
import { AkaarType } from "../theme/type";
import { Shapes, Space } from "../theme/space";
import { useAkaarColors } from "../theme/theme";

/**
 * Port of android/core/designsystem/.../component/Chips.kt.
 * 4dp radius, not a pill. Used for marketplace filters and product attributes.
 */
export function AkaarFilterChip({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useAkaarColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        {
          borderRadius: Shapes.chip,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primary : colors.surfaceRaised,
          paddingVertical: Space.sm,
          paddingHorizontal: Space.md,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <Text style={[AkaarType.body, { color: selected ? colors.onPrimary : colors.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
  );
}
