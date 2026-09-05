import assert from "node:assert/strict";
import { test } from "node:test";

/** See the note in core-data/src/index.test.ts. */
test("the pure entry point loads with no native modules available", async () => {
  const mod = await import("./index.ts");

  assert.equal(typeof mod.voiceReducer, "function");
  assert.equal(typeof mod.canPurgeLocalAudio, "function");
  assert.equal(typeof mod.isCapturing, "function");
});
