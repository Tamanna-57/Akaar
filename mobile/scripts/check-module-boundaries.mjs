#!/usr/bin/env node
/**
 * TS/RN equivalent of the Gradle `checkModuleBoundaries` task in
 * android/build.gradle.kts. Enforces the same rule the CI comment in
 * .github/workflows/ci.yml states for the Android build:
 *
 *   "Seller and buyer must stay independent."
 *
 * feature/seller and feature/buyer may each depend on core-domain,
 * core-common, design-system, and feature/shared - but never on each other.
 * No extra dependency (madge, dependency-cruiser, ...) needed for this:
 * it's a plain source scan, so it runs with nothing but `node`.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const featuresDir = join(root, "apps/mobile/src/features");

/** @type {Record<string, string[]>} */
const forbidden = {
  seller: ["buyer"],
  buyer: ["seller"],
};

const IMPORT_RE = /(?:from\s+|require\()\s*["']([^"']+)["']/g;

function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) files.push(full);
  }
  return files;
}

/** @type {string[]} */
const violations = [];

for (const [feature, disallowed] of Object.entries(forbidden)) {
  const dir = join(featuresDir, feature);
  let files;
  try {
    files = walk(dir);
  } catch {
    continue; // feature not scaffolded yet - nothing to check
  }

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(IMPORT_RE)) {
      const spec = match[1];
      for (const other of disallowed) {
        if (spec.includes(`features/${other}`)) {
          violations.push(
            `${relative(root, file)} imports "${spec}" - feature/${feature} must not depend on feature/${other}`,
          );
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error("Module boundary violations:\n");
  for (const v of violations) console.error(`  - ${v}`);
  console.error(
    "\nfeature/seller and feature/buyer must only meet through core-domain / feature/shared.",
  );
  process.exit(1);
}

console.log("Module boundaries OK: feature/seller and feature/buyer stay independent.");
