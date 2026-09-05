import React from "react";
import { Text, View } from "react-native";
import { Space } from "../theme/space.ts";
import { AkaarType } from "../theme/type.ts";
import { useAkaarColors } from "../theme/theme.tsx";
import { AkaarPrimaryButton, AkaarTextButton } from "./Buttons.tsx";
import { AkaarCard } from "./Surfaces.tsx";

/** What the seller may do with a value the machine proposed. */
export const AiAction = {
  Accept: "accept",
  Edit: "edit",
  Regenerate: "regenerate",
  Reject: "reject",
} as const;
export type AiAction = (typeof AiAction)[keyof typeof AiAction];

/**
 * Port of android/core/designsystem/.../component/AiOutputBlock.kt.
 *
 * The recurring component at every AI touchpoint: the proposed value, and
 * the seller's four choices. Used identically everywhere so "the machine
 * suggested this and you decide" becomes a learned pattern rather than a
 * per-screen invention.
 *
 * `lowConfidence` softens the presentation but never hides the value. Where
 * confidence is too low to show a value at all, the caller must ask a
 * question instead of rendering this block with a guess in it - the app
 * does not present an invented attribute as a fact and then wait to be
 * corrected.
 */
export function AiOutputBlock({
  label,
  value,
  onAction,
  /** Heard by the seller in her own language. Text is never the only channel. */
  onPlayAudio,
  lowConfidence = false,
  sourceNote,
}: {
  label: string;
  value: string;
  onAction: (action: AiAction) => void;
  onPlayAudio?: () => void;
  lowConfidence?: boolean;
  sourceNote?: string;
}) {
  const colors = useAkaarColors();
  return (
    <AkaarCard>
      <Text style={[AkaarType.caption, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[AkaarType.bodyLarge, { color: colors.textPrimary, marginTop: Space.xs }]}>{value}</Text>

      {/* Colour is never the only carrier of meaning: the note says it too. */}
      {lowConfidence ? (
        <Text style={[AkaarType.caption, { color: colors.warning, marginTop: Space.xs }]}>
          Please check this one
        </Text>
      ) : null}
      {sourceNote != null ? (
        <Text style={[AkaarType.caption, { color: colors.textSecondary, marginTop: Space.xs }]}>
          {sourceNote}
        </Text>
      ) : null}

      <View style={{ flexDirection: "row", gap: Space.sm, marginTop: Space.md }}>
        <AkaarTextButton text="Yes" onPress={() => onAction(AiAction.Accept)} />
        <AkaarTextButton text="Change" onPress={() => onAction(AiAction.Edit)} />
        <AkaarTextButton text="Try again" onPress={() => onAction(AiAction.Regenerate)} />
        <AkaarTextButton text="Remove" onPress={() => onAction(AiAction.Reject)} />
      </View>
      {onPlayAudio != null ? <AkaarTextButton text="Listen" onPress={onPlayAudio} /> : null}
    </AkaarCard>
  );
}

/**
 * Used where a value could not be extracted with enough confidence. The gap
 * becomes a question rather than a plausible guess - this is the "never
 * invent" rule made visible in the UI.
 */
export function MissingFieldPrompt({
  question,
  onAnswer,
  onPlayAudio,
}: {
  question: string;
  onAnswer: () => void;
  onPlayAudio?: () => void;
}) {
  const colors = useAkaarColors();
  return (
    <AkaarCard>
      <Text style={[AkaarType.bodyLarge, { color: colors.textPrimary }]}>{question}</Text>
      <View style={{ marginTop: Space.md, gap: Space.sm }}>
        <AkaarPrimaryButton text="Answer" onPress={onAnswer} sellerFlow />
        {onPlayAudio != null ? <AkaarTextButton text="Listen" onPress={onPlayAudio} /> : null}
      </View>
    </AkaarCard>
  );
}
