import assert from "node:assert/strict";
import { test } from "node:test";
import { canPurgeLocalAudio } from "./retention.ts";
import { hasUnsavedTake, initialVoiceSession, isCapturing, voiceReducer, type VoiceSession } from "./session.ts";

function drive(events: Parameters<typeof voiceReducer>[1][], from: VoiceSession = initialVoiceSession) {
  return events.reduce(voiceReducer, from);
}

test("record, pause, resume, stop", () => {
  const recorded = drive([
    { type: "start", at: 0 },
    { type: "pause", elapsedMs: 4_000 },
    { type: "resume", at: 10_000 },
    { type: "stop", path: "file://take.m4a", durationMs: 9_000 },
  ]);

  assert.deepEqual(recorded, { kind: "recorded", path: "file://take.m4a", durationMs: 9_000 });
});

test("a second start cannot silently overwrite a take in progress", () => {
  const state = drive([
    { type: "start", at: 0 },
    { type: "start", at: 5_000 },
  ]);
  assert.equal(state.kind, "recording");
  assert.equal(state.kind === "recording" && state.startedAt, 0);
});

test("replay returns to the take, not to idle", () => {
  const state = drive([
    { type: "start", at: 0 },
    { type: "stop", path: "file://take.m4a", durationMs: 3_000 },
    { type: "play" },
    { type: "playbackProgress", positionMs: 1_500 },
    { type: "playbackEnded" },
  ]);
  assert.deepEqual(state, { kind: "recorded", path: "file://take.m4a", durationMs: 3_000 });
});

test("re-record works mid-playback", () => {
  const state = drive([
    { type: "start", at: 0 },
    { type: "stop", path: "file://take.m4a", durationMs: 3_000 },
    { type: "play" },
    { type: "discard" },
  ]);
  assert.deepEqual(state, { kind: "idle" });
});

test("events that make no sense in the current state are ignored, not crashes", () => {
  assert.deepEqual(voiceReducer(initialVoiceSession, { type: "stop", path: "x", durationMs: 1 }), {
    kind: "idle",
  });
  assert.deepEqual(voiceReducer(initialVoiceSession, { type: "play" }), { kind: "idle" });
  assert.deepEqual(voiceReducer(initialVoiceSession, { type: "submit" }), { kind: "idle" });
});

test("the UI can tell when the mic is live and when a take would be lost", () => {
  const recording = drive([{ type: "start", at: 0 }]);
  assert.equal(isCapturing(recording), true);
  assert.equal(hasUnsavedTake(recording), false);

  const take = drive([{ type: "stop", path: "file://t.m4a", durationMs: 1_000 }], recording);
  assert.equal(isCapturing(take), false);
  assert.equal(hasUnsavedTake(take), true);
});

test("audio is purged only after transcription AND acknowledgement", () => {
  assert.equal(canPurgeLocalAudio({ transcribed: true, serverAcknowledged: false }), false);
  assert.equal(canPurgeLocalAudio({ transcribed: false, serverAcknowledged: true }), false);
  assert.equal(canPurgeLocalAudio({ transcribed: true, serverAcknowledged: true }), true);
});

test("a take she discarded goes immediately, regardless of pipeline state", () => {
  assert.equal(
    canPurgeLocalAudio({ transcribed: false, serverAcknowledged: false, discardedByUser: true }),
    true,
  );
});
