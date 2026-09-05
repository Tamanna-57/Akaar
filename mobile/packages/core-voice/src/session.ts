/**
 * The voice note state machine, from android-architecture.md:
 * "MediaRecorder → AAC/M4A. Record, pause, replay, re-record."
 *
 * A reducer rather than a pile of booleans, for the same reason UiState is
 * a sealed hierarchy: the illegal combinations (playing back while
 * recording, stopping when nothing started) become unrepresentable instead
 * of merely unlikely.
 */
export type VoiceSession =
  | { kind: "idle" }
  | { kind: "recording"; startedAt: number; elapsedMs: number }
  | { kind: "paused"; elapsedMs: number }
  /** A finished take, on disk, not yet sent. */
  | { kind: "recorded"; path: string; durationMs: number }
  | { kind: "playing"; path: string; durationMs: number; positionMs: number }
  /** Queued for transcription; the audio is still on the phone. */
  | { kind: "submitted"; path: string; durationMs: number };

export type VoiceEvent =
  | { type: "start"; at: number }
  | { type: "pause"; elapsedMs: number }
  | { type: "resume"; at: number }
  | { type: "stop"; path: string; durationMs: number }
  | { type: "play" }
  | { type: "playbackProgress"; positionMs: number }
  | { type: "playbackEnded" }
  /** Throw the take away and start over. Nothing is kept. */
  | { type: "discard" }
  | { type: "submit" };

export const initialVoiceSession: VoiceSession = { kind: "idle" };

export function voiceReducer(state: VoiceSession, event: VoiceEvent): VoiceSession {
  switch (event.type) {
    case "start":
      // Only from idle: starting a second recording over an unfinished one
      // would silently lose the first.
      return state.kind === "idle" ? { kind: "recording", startedAt: event.at, elapsedMs: 0 } : state;

    case "pause":
      return state.kind === "recording" ? { kind: "paused", elapsedMs: event.elapsedMs } : state;

    case "resume":
      return state.kind === "paused"
        ? { kind: "recording", startedAt: event.at, elapsedMs: state.elapsedMs }
        : state;

    case "stop":
      return state.kind === "recording" || state.kind === "paused"
        ? { kind: "recorded", path: event.path, durationMs: event.durationMs }
        : state;

    case "play":
      return state.kind === "recorded"
        ? { kind: "playing", path: state.path, durationMs: state.durationMs, positionMs: 0 }
        : state;

    case "playbackProgress":
      return state.kind === "playing" ? { ...state, positionMs: event.positionMs } : state;

    case "playbackEnded":
      return state.kind === "playing"
        ? { kind: "recorded", path: state.path, durationMs: state.durationMs }
        : state;

    case "discard":
      // Allowed from any take-holding state: "re-record" must always work,
      // including mid-playback.
      return state.kind === "recorded" || state.kind === "playing" || state.kind === "paused"
        ? { kind: "idle" }
        : state;

    case "submit":
      return state.kind === "recorded"
        ? { kind: "submitted", path: state.path, durationMs: state.durationMs }
        : state;
  }
}

/** The mic is live - the UI must show it unmistakably while this is true. */
export function isCapturing(state: VoiceSession): boolean {
  return state.kind === "recording";
}

/** A take exists that would be lost by navigating away. */
export function hasUnsavedTake(state: VoiceSession): boolean {
  return state.kind === "recorded" || state.kind === "playing" || state.kind === "paused";
}
