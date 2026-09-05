/**
 * On-device photo quality gate, from docs/04-architecture/ai-architecture.md
 * (Pipeline 2) and android-architecture.md:
 *
 *   "Running these locally means the artisan gets 'move to the window'
 *    *before* an upload she may not have bandwidth for."
 *
 * The metrics come from native (a vision-camera frame processor or a
 * one-shot analysis of the captured file). The *decision* is here, in pure
 * TypeScript, because it is the part with product judgement in it - and the
 * part worth testing.
 */
export interface ImageQualityMetrics {
  /** Variance of the Laplacian. Low = blurry. */
  laplacianVariance: number;
  /** Mean luminance, 0-255. */
  meanLuminance: number;
  /** Percentage of pixels blown out to pure white. */
  clippedHighlightsPct: number;
  /** Percentage of pixels crushed to pure black. */
  clippedShadowsPct: number;
  /**
   * Fraction of the frame covered by a detected hand/obstruction, if the
   * model produced one. Undefined means "not measured", never "none".
   */
  occlusionPct?: number;
}

export const QualityIssue = {
  Blurry: "blurry",
  TooDark: "too_dark",
  TooBright: "too_bright",
  Overexposed: "overexposed",
  Occluded: "occluded",
} as const;
export type QualityIssue = (typeof QualityIssue)[keyof typeof QualityIssue];

export interface QualityThresholds {
  blurBlock: number;
  blurWarn: number;
  darkBlock: number;
  darkWarn: number;
  brightWarn: number;
  clippedHighlightsWarnPct: number;
  occlusionWarnPct: number;
}

/**
 * Tuned to be forgiving. A blocked capture costs the artisan a retake she
 * may not understand; the enhancement pipeline and the seller's own
 * approval catch a lot. So only genuinely unusable frames are blocked.
 */
export const defaultThresholds: QualityThresholds = {
  blurBlock: 40,
  blurWarn: 120,
  darkBlock: 35,
  darkWarn: 70,
  brightWarn: 215,
  clippedHighlightsWarnPct: 12,
  occlusionWarnPct: 25,
};

export type QualityVerdict =
  | { kind: "ok" }
  | { kind: "warn"; issues: QualityIssue[]; guidance: string[] }
  /** Unusable. Offer a retake rather than spending her bandwidth on it. */
  | { kind: "block"; issues: QualityIssue[]; guidance: string[] };

/**
 * Guidance is phrased as an action she can take standing where she is -
 * "move to the window", not "insufficient illumination".
 */
const guidanceFor: Record<QualityIssue, string> = {
  blurry: "Hold the phone still and tap the product to focus",
  too_dark: "Move to the window or somewhere brighter",
  too_bright: "Move out of direct sunlight",
  overexposed: "Move out of direct sunlight",
  occluded: "Move your hand out of the picture",
};

export function assessQuality(
  metrics: ImageQualityMetrics,
  thresholds: QualityThresholds = defaultThresholds,
): QualityVerdict {
  const blocking: QualityIssue[] = [];
  const warnings: QualityIssue[] = [];

  if (metrics.laplacianVariance < thresholds.blurBlock) blocking.push(QualityIssue.Blurry);
  else if (metrics.laplacianVariance < thresholds.blurWarn) warnings.push(QualityIssue.Blurry);

  if (metrics.meanLuminance < thresholds.darkBlock) blocking.push(QualityIssue.TooDark);
  else if (metrics.meanLuminance < thresholds.darkWarn) warnings.push(QualityIssue.TooDark);
  else if (metrics.meanLuminance > thresholds.brightWarn) warnings.push(QualityIssue.TooBright);

  if (metrics.clippedHighlightsPct > thresholds.clippedHighlightsWarnPct) {
    warnings.push(QualityIssue.Overexposed);
  }

  // Occlusion never blocks: the model is not good enough to overrule a
  // person about what is in her own photograph.
  if (metrics.occlusionPct != null && metrics.occlusionPct > thresholds.occlusionWarnPct) {
    warnings.push(QualityIssue.Occluded);
  }

  if (blocking.length > 0) {
    const issues = [...blocking, ...warnings];
    return { kind: "block", issues, guidance: dedupe(issues.map((i) => guidanceFor[i])) };
  }
  if (warnings.length > 0) {
    return { kind: "warn", issues: warnings, guidance: dedupe(warnings.map((i) => guidanceFor[i])) };
  }
  return { kind: "ok" };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * The gate is advisory by design: the seller can always keep the photo she
 * took. `block` means "we will ask again", never "we refuse".
 */
export function canProceedWithoutRetake(verdict: QualityVerdict): boolean {
  return verdict.kind !== "block";
}
