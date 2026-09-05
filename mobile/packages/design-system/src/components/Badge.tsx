import React from "react";
import { Text, View } from "react-native";
import { useAkaarColors } from "../theme/theme.tsx";
import { AkaarType } from "../theme/type.ts";
import { Shapes, Space } from "../theme/space.ts";

export type BadgeTone = "neutral" | "accent" | "success" | "warning";

/**
 * A short status word with a quiet frame. Not a pill (4dp, like a chip) -
 * only avatars are round here.
 *
 * `accent` is the madder red, and design-system.md allows it "at most once
 * per screen". On the profile that one use is the verification tier,
 * because that is the single thing on the screen a buyer's trust turns on.
 *
 * Tone is never the only carrier of meaning: the label always says the
 * thing in words, so it survives both colour-blindness and a greyscale
 * screenshot.
 */
export function Badge({ label, tone = "neutral" }: { label: string; tone?: BadgeTone }) {
  const colors = useAkaarColors();

  const color =
    tone === "accent"
      ? colors.accent
      : tone === "success"
        ? colors.success
        : tone === "warning"
          ? colors.warning
          : colors.textSecondary;

  return (
    <View
      style={{
        alignSelf: "flex-start",
        borderRadius: Shapes.chip,
        borderWidth: 1,
        borderColor: color,
        paddingVertical: Space.xs,
        paddingHorizontal: Space.sm,
        backgroundColor: colors.surfaceRaised,
      }}
    >
      <Text style={[AkaarType.caption, { color }]}>{label}</Text>
    </View>
  );
}
