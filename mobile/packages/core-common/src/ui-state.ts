import { assertNever } from "./result";

/**
 * Port of android/core/common/.../UiState.kt.
 *
 * Every screen in Akaar must handle six states. In Kotlin, making them a
 * `sealed interface` turns an unhandled state into a compile error instead
 * of something discovered during the demo. A TypeScript discriminated union
 * gets the same property: `switch` on `state.kind` plus {@link assertNever}
 * in the `default` branch fails the *build*, not just the test, on a missing
 * case - see `mapUiState` below.
 *
 * The design system supplies a scaffold for each, so honouring this is cheap
 * (see packages/design-system/src/components/StateHost.tsx).
 */
export type UiState<T> =
  /** Work in flight and the shape of the result is known: show a skeleton. */
  | { kind: "loading" }
  | { kind: "content"; data: T }
  /**
   * Succeeded, nothing to show. Always names the action that would create
   * something - an empty screen with no next step is a dead end.
   */
  | { kind: "empty"; title: string; body?: string; actionLabel?: string }
  /**
   * Something failed. `cause` is for logs; `message` is plain language for
   * the user, and `audioPrompt` is what gets read aloud in seller flows.
   */
  | {
      kind: "error";
      message: string;
      cause?: unknown;
      retryable?: boolean;
      audioPrompt?: string;
    }
  /**
   * Distinct from Error on purpose: "you are offline" and "this failed" call
   * for different words and different next steps. `safeToContinue` tells the
   * user what still works without a network.
   */
  | { kind: "offline"; safeToContinue?: string }
  /** Explains why the permission is needed, and offers settings after a denial. */
  | {
      kind: "permissionDenied";
      permission: string;
      rationale: string;
      permanentlyDenied?: boolean;
    };

export const UiState = {
  loading: <T = never>(): UiState<T> => ({ kind: "loading" }),
  content: <T>(data: T): UiState<T> => ({ kind: "content", data }),
  empty: <T = never>(title: string, body?: string, actionLabel?: string): UiState<T> => ({
    kind: "empty",
    title,
    body,
    actionLabel,
  }),
  error: <T = never>(
    message: string,
    opts: { cause?: unknown; retryable?: boolean; audioPrompt?: string } = {},
  ): UiState<T> => ({ kind: "error", message, retryable: opts.retryable ?? true, ...opts }),
  offline: <T = never>(safeToContinue?: string): UiState<T> => ({ kind: "offline", safeToContinue }),
  permissionDenied: <T = never>(
    permission: string,
    rationale: string,
    permanentlyDenied = false,
  ): UiState<T> => ({ kind: "permissionDenied", permission, rationale, permanentlyDenied }),
};

export function mapUiState<T, R>(state: UiState<T>, transform: (data: T) => R): UiState<R> {
  switch (state.kind) {
    case "content":
      return { ...state, data: transform(state.data) };
    case "loading":
    case "empty":
    case "error":
    case "offline":
    case "permissionDenied":
      return state;
    default:
      return assertNever(state);
  }
}

export function contentOrNull<T>(state: UiState<T>): T | null {
  return state.kind === "content" ? state.data : null;
}
