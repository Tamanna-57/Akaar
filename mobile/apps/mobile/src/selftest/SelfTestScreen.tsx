import {
  AkaarCard,
  AkaarPrimaryButton,
  AkaarSectionHeader,
  AkaarType,
  Space,
  useAkaarColors,
} from "@akaar/design-system";
import { hasUnsavedTake, initialVoiceSession, voiceReducer, type VoiceSession } from "@akaar/core-voice";
import React, { useCallback, useReducer, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { type CheckResult, checks } from "./checks.ts";

/**
 * A screen that runs the device-only checks and shows the answers in words.
 *
 * This is a development tool, not a product screen. It exists so that
 * "does the device layer actually work?" is a button press rather than a
 * debugging session - and so that a failure names the thing to fix.
 */
export function SelfTestScreen() {
  const colors = useAkaarColors();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [voice, dispatch] = useReducer(voiceReducer, initialVoiceSession);

  const runAll = useCallback(async () => {
    setRunning(true);
    setResults([]);
    const collected: CheckResult[] = [];
    for (const check of checks) {
      // Sequential, and each result is shown as it lands: if one check hangs
      // on a device, you can still see which one.
      const result = await check.run();
      collected.push(result);
      setResults([...collected]);
    }
    setRunning(false);
  }, []);

  const passed = results.filter((r) => r.passed).length;
  const done = results.length === checks.length;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: Space.gutter, paddingBottom: Space.xxxl }}
    >
      <Text style={[AkaarType.display, { color: colors.textPrimary }]}>Device checks</Text>
      <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.xs }]}>
        These are the things a computer cannot test. Everything else already runs in CI.
      </Text>

      <View style={{ marginTop: Space.xl }}>
        <AkaarPrimaryButton
          text={running ? "Running…" : "Run all checks"}
          onPress={runAll}
          disabled={running}
          loading={running}
          sellerFlow
        />
      </View>

      {done ? (
        <Text
          style={[
            AkaarType.section,
            {
              color: passed === checks.length ? colors.success : colors.danger,
              marginTop: Space.lg,
            },
          ]}
        >
          {passed} of {checks.length} passed
        </Text>
      ) : null}

      {results.map((result) => (
        <AkaarCard key={result.name} style={{ marginTop: Space.md }}>
          <Text
            style={[AkaarType.label, { color: result.passed ? colors.success : colors.danger }]}
          >
            {result.passed ? "PASS" : "FAIL"} · {result.name}
          </Text>
          <Text style={[AkaarType.body, { color: colors.textSecondary, marginTop: Space.xs }]}>
            {result.detail}
          </Text>
        </AkaarCard>
      ))}

      <AkaarSectionHeader title="Voice recorder" />
      <Text style={[AkaarType.body, { color: colors.textSecondary }]}>
        The state machine is tested already. What needs a device is the microphone itself: tap
        through and check the state changes as you expect.
      </Text>
      <AkaarCard style={{ marginTop: Space.md }}>
        <Text style={[AkaarType.label, { color: colors.textPrimary }]}>
          State: {describeVoice(voice)}
        </Text>
        <View style={{ marginTop: Space.md, gap: Space.sm }}>
          <AkaarPrimaryButton
            text="Start"
            onPress={() => dispatch({ type: "start", at: Date.now() })}
            disabled={voice.kind !== "idle"}
          />
          <AkaarPrimaryButton
            text="Stop"
            onPress={() => dispatch({ type: "stop", path: "file://probe.m4a", durationMs: 1000 })}
            disabled={voice.kind !== "recording" && voice.kind !== "paused"}
          />
          <AkaarPrimaryButton
            text="Discard"
            onPress={() => dispatch({ type: "discard" })}
            disabled={!hasUnsavedTake(voice)}
          />
        </View>
      </AkaarCard>
    </ScrollView>
  );
}

function describeVoice(state: VoiceSession): string {
  switch (state.kind) {
    case "idle":
      return "nothing recorded";
    case "recording":
      return "recording";
    case "paused":
      return "paused";
    case "recorded":
      return "have a take";
    case "playing":
      return "playing back";
    case "submitted":
      return "sent for transcription";
  }
}
