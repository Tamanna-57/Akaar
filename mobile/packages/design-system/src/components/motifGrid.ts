/**
 * Where the block-print motifs go on the cloth.
 *
 * Split out of HeritagePattern.tsx so it imports nothing from React Native
 * and can be unit tested in a plain Node process - the same pure/native
 * split the core packages use. The component only maps over what this
 * returns.
 */
export interface MotifPoint {
  x: number;
  y: number;
  /** True on the staggered rows. Used to vary the motif slightly. */
  offset: boolean;
}

/**
 * Where the motifs go. Pure, and exported, so the cap is testable without
 * rendering anything.
 */
export function motifGrid({
  width,
  height,
  spacing,
  maxMotifs,
}: {
  width: number;
  height: number;
  spacing: number;
  maxMotifs: number;
}): MotifPoint[] {
  const points: MotifPoint[] = [];
  if (height <= 0 || width <= 0 || spacing <= 0 || maxMotifs <= 0) return points;

  // Widen the step until the grid fits inside the cap, rather than drawing
  // the first `maxMotifs` and leaving the rest of the screen bare. A
  // thinner repeat still reads as a repeat; half a repeat does not.
  let step = spacing;
  while ((Math.ceil(height / step) + 1) * (Math.ceil(width / step) + 1) > maxMotifs) {
    step *= 1.25;
  }

  const rows = Math.ceil(height / step) + 1;
  const cols = Math.ceil(width / step) + 1;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Every other row is offset by half a step - the standard staggered
      // repeat of a hand-stamped cloth, which stops the eye finding columns.
      const offset = row % 2 === 1;
      points.push({ x: col * step + (offset ? step / 2 : 0), y: row * step, offset });
    }
  }
  return points;
}
