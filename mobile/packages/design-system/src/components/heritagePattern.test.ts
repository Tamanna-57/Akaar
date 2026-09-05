import assert from "node:assert/strict";
import { test } from "node:test";
import { motifGrid } from "./motifGrid.ts";

/** A typical cheap Android screen, in dp. */
const phone = { width: 393, height: 851 };

test("the grid covers the whole area it is given", () => {
  const points = motifGrid({ ...phone, spacing: 76, maxMotifs: 200 });
  assert.ok(points.length > 0);
  assert.ok(
    points.some((p) => p.y >= phone.height - 76),
    "reaches the bottom edge",
  );
  assert.ok(
    points.some((p) => p.x >= phone.width - 76),
    "reaches the right edge",
  );
});

test("the motif count never exceeds the cap", () => {
  // The cap is what keeps this affordable on a 3 GB phone: each motif is
  // one or two Views in the tree.
  for (const maxMotifs of [20, 50, 90, 200]) {
    const points = motifGrid({ ...phone, spacing: 24, maxMotifs });
    assert.ok(
      points.length <= maxMotifs,
      `${points.length} motifs drawn with a cap of ${maxMotifs}`,
    );
  }
});

test("hitting the cap thins the repeat instead of clipping it", () => {
  // A tight spacing on a big screen would blow the cap; the step widens so
  // the pattern still spans the area rather than filling one corner.
  const points = motifGrid({ width: 1200, height: 2000, spacing: 16, maxMotifs: 90 });
  assert.ok(points.length <= 90);
  assert.ok(
    points.some((p) => p.y > 1500),
    "still reaches the far end of a large screen",
  );
});

test("alternate rows are staggered, the way a stamped repeat is", () => {
  const points = motifGrid({ ...phone, spacing: 76, maxMotifs: 200 });
  const firstRow = points.filter((p) => p.y === 0);
  const secondRow = points.filter((p) => p.y > 0 && p.y <= 76 * 1.6);

  assert.ok(firstRow.every((p) => !p.offset));
  assert.ok(secondRow.every((p) => p.offset));
  assert.notEqual(firstRow[0]?.x, secondRow[0]?.x, "the second row is shifted");
});

test("a zero-sized area draws nothing rather than dividing by zero", () => {
  assert.deepEqual(motifGrid({ width: 0, height: 0, spacing: 76, maxMotifs: 90 }), []);
  assert.deepEqual(motifGrid({ ...phone, spacing: 0, maxMotifs: 90 }), []);
  assert.deepEqual(motifGrid({ ...phone, spacing: 76, maxMotifs: 0 }), []);
});
