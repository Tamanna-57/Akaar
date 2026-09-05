import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assessQuality,
  canProceedWithoutRetake,
  type ImageQualityMetrics,
  QualityIssue,
} from "./quality.ts";

/** A well-lit, sharp frame. */
function goodFrame(overrides: Partial<ImageQualityMetrics> = {}): ImageQualityMetrics {
  return {
    laplacianVariance: 300,
    meanLuminance: 130,
    clippedHighlightsPct: 1,
    clippedShadowsPct: 1,
    ...overrides,
  };
}

test("a sharp, well-lit frame passes", () => {
  assert.deepEqual(assessQuality(goodFrame()), { kind: "ok" });
});

test("a badly blurred frame is blocked before it costs her an upload", () => {
  const verdict = assessQuality(goodFrame({ laplacianVariance: 10 }));
  assert.equal(verdict.kind, "block");
  assert.ok("issues" in verdict && verdict.issues.includes(QualityIssue.Blurry));
});

test("a slightly soft frame only warns", () => {
  const verdict = assessQuality(goodFrame({ laplacianVariance: 90 }));
  assert.equal(verdict.kind, "warn");
  assert.equal(canProceedWithoutRetake(verdict), true);
});

test("a dark frame gets the window instruction, in words she can act on", () => {
  const verdict = assessQuality(goodFrame({ meanLuminance: 20 }));
  assert.equal(verdict.kind, "block");
  assert.ok("guidance" in verdict && verdict.guidance.includes("Move to the window or somewhere brighter"));
});

test("occlusion warns but never blocks - the model does not overrule her", () => {
  const verdict = assessQuality(goodFrame({ occlusionPct: 60 }));
  assert.equal(verdict.kind, "warn");
  assert.ok("issues" in verdict && verdict.issues.includes(QualityIssue.Occluded));
  assert.equal(canProceedWithoutRetake(verdict), true);
});

test("unmeasured occlusion is not treated as no occlusion", () => {
  const verdict = assessQuality(goodFrame({ occlusionPct: undefined }));
  assert.deepEqual(verdict, { kind: "ok" });
});

test("guidance is deduplicated so she never sees the same sentence twice", () => {
  const verdict = assessQuality(goodFrame({ meanLuminance: 240, clippedHighlightsPct: 30 }));
  assert.equal(verdict.kind, "warn");
  if (verdict.kind === "warn") {
    assert.equal(new Set(verdict.guidance).size, verdict.guidance.length);
  }
});
