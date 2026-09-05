import assert from "node:assert/strict";
import { test } from "node:test";

/** See the note in core-data/src/index.test.ts. */
test("the pure entry point loads with no native modules available", async () => {
  const mod = await import("./index.ts");

  assert.equal(typeof mod.assessQuality, "function");
  assert.equal(typeof mod.canProceedWithoutRetake, "function");
  assert.equal(typeof mod.permissionUiState, "function");
  assert.equal(typeof mod.canPurgeLocalPhoto, "function");
});
