import React from "react";
import { ActivityIndicator, Pressable, type StyleProp, Text, type ViewStyle } from "react-native";
import { AkaarType } from "../theme/type.ts";
import { Shapes, Space, Touch } from "../theme/space.ts";
import { useAkaarColors } from "../theme/theme.tsx";

/** Port of android/core/designsystem/.../component/Buttons.kt. */

export interface AkaarButtonProps {
  text: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  /** Larger touch target + body-large label. In seller flows the target is
   * 56dp rather than 48dp: the user is often outdoors, standing, on a phone
   * she shares. */
  sellerFlow?: boolean;
  accessibilityLabel?: string;
}

/** One primary action per screen. */
export function AkaarPrimaryButton({
  text,
  onPress,
  style,
  disabled = false,
  loading = false,
  sellerFlow = false,
  accessibilityLabel,
}: AkaarButtonProps & { loading?: boolean }) {
  const colors = useAkaarColors();
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ disabled: isDisabled }}
      style={[
        {
          width: "100%",
          minHeight: sellerFlow ? Touch.minSeller : Touch.min,
          borderRadius: Shapes.button,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          paddingHorizontal: Space.lg,
          backgroundColor: isDisabled ? colors.border : colors.primary,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.onPrimary} style={{ marginRight: Space.sm }} />
      ) : null}
      <Text
        style={[
          sellerFlow ? AkaarType.bodyLarge : AkaarType.label,
          { color: isDisabled ? colors.textSecondary : colors.onPrimary },
        ]}
      >
        {text}
      </Text>
    </Pressable>
  );
}

export function AkaarSecondaryButton({
  text,
  onPress,
  style,
  disabled = false,
  sellerFlow = false,
  accessibilityLabel,
}: AkaarButtonProps) {
  const colors = useAkaarColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ disabled }}
      style={[
        {
          width: "100%",
          minHeight: sellerFlow ? Touch.minSeller : Touch.min,
          borderRadius: Shapes.button,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: Space.lg,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <Text style={[sellerFlow ? AkaarType.bodyLarge : AkaarType.label, { color: colors.textPrimary }]}>
        {text}
      </Text>
    </Pressable>
  );
}

export function AkaarTextButton({
  text,
  onPress,
  style,
}: Pick<AkaarButtonProps, "text" | "onPress" | "style">) {
  const colors = useAkaarColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={[{ minHeight: Touch.min, justifyContent: "center" }, style]}
    >
      <Text style={[AkaarType.label, { color: colors.primary }]}>{text}</Text>
    </Pressable>
  );
}

export function AkaarDestructiveButton({
  text,
  onPress,
  style,
}: Pick<AkaarButtonProps, "text" | "onPress" | "style">) {
  const colors = useAkaarColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={[
        {
          width: "100%",
          minHeight: Touch.min,
          borderRadius: Shapes.button,
          borderWidth: 1,
          borderColor: colors.danger,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: Space.lg,
        },
        style,
      ]}
    >
      <Text style={[AkaarType.label, { color: colors.danger }]}>{text}</Text>
    </Pressable>
  );
}
