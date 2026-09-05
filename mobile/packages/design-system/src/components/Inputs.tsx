import React from "react";
import { type KeyboardTypeOptions, Text, TextInput, View } from "react-native";
import { AkaarType } from "../theme/type.ts";
import { Shapes, Space, Touch } from "../theme/space.ts";
import { useAkaarColors } from "../theme/theme.tsx";
import { AkaarTextButton } from "./Buttons.tsx";

/**
 * Port of android/core/designsystem/.../component/Inputs.kt.
 *
 * Label above the field, never a placeholder standing in for one: a
 * placeholder disappears the moment typing starts, which is exactly when a
 * user who reads slowly still needs it.
 *
 * Every field in a seller flow carries a microphone affordance - typing is
 * the fallback here, not the expected path.
 */
export function AkaarTextField({
  label,
  value,
  onChangeText,
  helper,
  error,
  keyboardType = "default",
  singleLine = true,
  onVoiceInput,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  helper?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  singleLine?: boolean;
  onVoiceInput?: () => void;
}) {
  const colors = useAkaarColors();
  const note = error ?? helper;
  return (
    <View style={{ width: "100%" }}>
      <Text style={[AkaarType.label, { color: colors.textPrimary, marginBottom: Space.xs }]}>{label}</Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: Touch.minSeller,
          borderRadius: Shapes.input,
          borderWidth: 1,
          borderColor: error != null ? colors.danger : colors.border,
          backgroundColor: colors.surfaceRaised,
          paddingHorizontal: Space.md,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          multiline={!singleLine}
          keyboardType={keyboardType}
          style={[AkaarType.bodyLarge, { flex: 1, color: colors.textPrimary }]}
        />
        {onVoiceInput != null ? <AkaarTextButton text="Speak" onPress={onVoiceInput} /> : null}
      </View>
      {note != null ? (
        <Text
          style={[
            AkaarType.caption,
            { color: error != null ? colors.danger : colors.textSecondary, marginTop: Space.xs },
          ]}
        >
          {note}
        </Text>
      ) : null}
    </View>
  );
}
