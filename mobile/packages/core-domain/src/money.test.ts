// Port of android/core/domain/.../MoneyTest.kt, same cases, node:test instead
// of JUnit. Run with `pnpm --filter @akaar/core-domain test`.
import assert from "node:assert/strict";
import { test } from "node:test";
import { Money } from "./money.ts";

test("formats with indian digit grouping", () => {
  assert.equal(new Money(45_000).format(), "₹450");
  assert.equal(new Money(120_000).format(), "₹1,200");
  assert.equal(new Money(12_345_600).format(), "₹1,23,456");
  assert.equal(new Money(123_456_700).format(), "₹12,34,567");
});

test("keeps paise when present", () => {
  assert.equal(new Money(68_145).format(), "₹681.45");
  assert.equal(new Money(5).format(), "₹0.05");
});

test("arithmetic stays exact", () => {
  // The floor guarantee cannot rest on binary rounding, so this is integer maths.
  const unit = new Money(68_145);
  assert.equal(unit.times(3).paise, new Money(204_435).paise);
  assert.equal(unit.times(7).paise, new Money(68_145 * 7).paise);
});

test("compares by paise", () => {
  assert.ok(new Money(68_145).greaterThan(new Money(60_000)));
  assert.ok(new Money(60_000).lessThan(new Money(68_145)));
});
