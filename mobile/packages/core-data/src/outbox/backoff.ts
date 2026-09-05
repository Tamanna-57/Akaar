/**
 * Retry scheduling for the outbox drainer. WorkManager gives the Android
 * build exponential backoff for free; in RN it is ours to implement, so it
 * lives here as pure arithmetic that can be tested without a clock.
 */
export interface BackoffPolicy {
  baseDelayMs: number;
  factor: number;
  maxDelayMs: number;
  /** Attempts after which a mutation becomes FAILED_PERMANENT. */
  maxAttempts: number;
  jitter: "none" | "equal" | "full";
}

/**
 * 30s → 1m → 2m → ... capped at an hour, 8 attempts (~ a day of trying).
 *
 * "equal" jitter rather than "full": full jitter can schedule a retry
 * almost immediately, which on a metered connection that just failed is
 * exactly the wrong thing. Equal jitter keeps at least half the backoff
 * while still spreading retries out across devices.
 */
export const defaultBackoff: BackoffPolicy = {
  baseDelayMs: 30_000,
  factor: 2,
  maxDelayMs: 3_600_000,
  maxAttempts: 8,
  jitter: "equal",
};

/**
 * Delay before the next attempt, given how many attempts have already
 * failed. `attempts` is 1-based: 1 means one failure so far.
 */
export function delayForAttempt(
  policy: BackoffPolicy,
  attempts: number,
  random: () => number = Math.random,
): number {
  if (attempts < 1) return 0;
  const raw = policy.baseDelayMs * Math.pow(policy.factor, attempts - 1);
  const capped = Math.min(raw, policy.maxDelayMs);

  switch (policy.jitter) {
    case "none":
      return Math.round(capped);
    case "equal":
      return Math.round(capped / 2 + random() * (capped / 2));
    case "full":
      return Math.round(random() * capped);
  }
}

export function hasAttemptsLeft(policy: BackoffPolicy, attempts: number): boolean {
  return attempts < policy.maxAttempts;
}
