import React from "react";
import { Text, View } from "react-native";
import { useAkaarColors } from "../theme/theme.tsx";
import { AkaarType } from "../theme/type.ts";
import { Space, Touch } from "../theme/space.ts";

/**
 * A label-and-value row, separated by a hairline.
 *
 * design-system.md is explicit that "not every section should look like a
 * card" - lists and sectioned content sit directly on the surface with
 * hairline separators, and the card is reserved for a discrete, tappable
 * object. A profile is read, not tapped, so it is built from these.
 *
 * The row is 64dp minimum, matching the seller-flow list row, and the
 * label/value pair is read as one unit by a screen reader rather than as
 * two disconnected strings.
 */
export function InfoRow({
  label,
  value,
  hint,
  last = false,
}: {
  label: string;
  value: string;
  /** A short clarification under the value, when the value alone is thin. */
  hint?: string;
  /** Skips the separator on the final row of a section. */
  last?: boolean;
}) {
  const colors = useAkaarColors();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}${hint != null ? `. ${hint}` : ""}`}
      style={{
        minHeight: Touch.listRowSeller,
        justifyContent: "center",
        paddingVertical: Space.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={[AkaarType.caption, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[AkaarType.bodyLarge, { color: colors.textPrimary, marginTop: 2 }]}>{value}</Text>
      {hint != null ? (
        <Text style={[AkaarType.caption, { color: colors.textSecondary, marginTop: 2 }]}>{hint}</Text>
      ) : null}
    </View>
  );
}
