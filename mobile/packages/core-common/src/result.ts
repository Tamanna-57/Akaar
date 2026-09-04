/**
 * Port of android/core/common/.../AppResult.kt.
 *
 * Deliberately not a thrown exception: the offline and permission cases are
 * not exceptions, and collapsing them into one would lose the distinction
 * the UI needs to make. A discriminated union is TypeScript's equivalent of
 * Kotlin's `sealed interface` - the `kind` tag plays the role `when` uses for
 * exhaustiveness, checked here via {@link assertNever}.
 */
export type AppResult<T> = { kind: "ok"; value: T } | { kind: "failure"; error: AppError };

export function ok<T>(value: T): AppResult<T> {
  return { kind: "ok", value };
}

export function failure<T = never>(error: AppError): AppResult<T> {
  return { kind: "failure", error };
}

export type AppError =
  | { kind: "network"; message: string }
  | { kind: "unauthorized"; message: string }
  | { kind: "forbidden"; message: string }
  /** Server rejected a business rule - the message is meant for the user. */
  | { kind: "rejected"; message: string; code?: string }
  /**
   * Publication (and similar gated actions) return exactly what is still
   * missing, so the UI can say "3 things left" instead of "invalid".
   */
  | { kind: "incomplete"; message: string; missing: string[] }
  | { kind: "unknown"; message: string; cause?: unknown };

export const AppError = {
  network: (message = "No connection"): AppError => ({ kind: "network", message }),
  unauthorized: (message = "Please sign in again"): AppError => ({ kind: "unauthorized", message }),
  forbidden: (message: string): AppError => ({ kind: "forbidden", message }),
  rejected: (message: string, code?: string): AppError => ({ kind: "rejected", message, code }),
  incomplete: (missing: string[], message = "Some details are missing"): AppError => ({
    kind: "incomplete",
    message,
    missing,
  }),
  unknown: (message: string, cause?: unknown): AppError => ({ kind: "unknown", message, cause }),
};

export function onOk<T>(result: AppResult<T>, block: (value: T) => void): AppResult<T> {
  if (result.kind === "ok") block(result.value);
  return result;
}

export function onFailure<T>(result: AppResult<T>, block: (error: AppError) => void): AppResult<T> {
  if (result.kind === "failure") block(result.error);
  return result;
}

/** Compile-time exhaustiveness check, the TS analogue of an exhaustive `when`. */
export function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
