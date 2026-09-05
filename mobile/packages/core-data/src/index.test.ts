import assert from "node:assert/strict";
import { test } from "node:test";

/**
 * The package index must load in a plain Node process, with no React
 * Native and no native modules present. That is the whole reason the
 * native adapters live behind ./native instead of here.
 *
 * This test exists because a TypeScript parameter property
 * (`constructor(private readonly db: X) {}`) silently broke it once: that
 * syntax emits code, so Node's type-stripping refuses it, and nothing else
 * in the suite imported the file that used it.
 */
test("the pure entry point loads with no native modules available", async () => {
  const mod = await import("./index.ts");

  assert.equal(typeof mod.enqueue, "function");
  assert.equal(typeof mod.claimNext, "function");
  assert.equal(typeof mod.drainOutbox, "function");
  assert.equal(typeof mod.syncStateFor, "function");
  assert.equal(typeof mod.getOrCreateDatabaseKey, "function");
  // Reachable from the index, so it must be strippable too.
  assert.equal(typeof mod.SqliteOutboxStore, "function");
  assert.equal(typeof mod.InMemoryOutboxStore, "function");
});
