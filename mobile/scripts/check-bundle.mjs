#!/usr/bin/env node
/**
 * Builds the app's JavaScript bundle and checks that the native adapters
 * actually made it in.
 *
 * This exists because of a real bug that nothing else caught. Our packages
 * expose a pure entry point (".") and a native one ("./native"). Metro used
 * to ignore the "exports" field, and when it could not match "./native" it
 * did not fail - it silently fell back to the pure entry point. Result:
 * every native class was `undefined` at runtime, on a device, while `tsc`,
 * the unit tests and the bundle build were all green, because TypeScript
 * *does* honour "exports".
 *
 * So: type checking cannot catch this, and unit tests cannot catch this.
 * Only looking inside the built bundle can.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = fileURLToPath(new URL("../apps/mobile", import.meta.url));

/** Every native module the device layer depends on. */
const required = [
  '"react-native-keychain"',
  '"@op-engineering/op-sqlite"',
  '"react-native-vision-camera"',
  '"react-native-background-fetch"',
  '"@react-native-community/netinfo"',
  '"react-native-get-random-values"',
];

const work = mkdtempSync(join(tmpdir(), "akaar-bundle-"));
const bundlePath = join(work, "index.android.bundle");

try {
  console.log("Building the JavaScript bundle (this takes a minute)…");
  execFileSync(
    "npx",
    [
      "react-native",
      "bundle",
      "--platform",
      "android",
      // Dev bundle: the device-check screen is behind __DEV__, and it is the
      // thing that pulls the native adapters in today.
      "--dev",
      "true",
      "--entry-file",
      "index.js",
      "--bundle-output",
      bundlePath,
    ],
    { cwd: appDir, stdio: ["ignore", "pipe", "pipe"] },
  );

  const bundle = readFileSync(bundlePath, "utf8");
  const missing = required.filter((lib) => !bundle.includes(lib));

  if (missing.length > 0) {
    console.error("\nThe bundle built, but these native modules are not in it:\n");
    for (const lib of missing) console.error(`  - ${lib}`);
    console.error(
      "\nUsually this means a `/native` subpath import resolved to the pure entry\n" +
        "point instead. Check that unstable_enablePackageExports is still true in\n" +
        "apps/mobile/metro.config.js, and that the package's exports map is intact.",
    );
    process.exit(1);
  }

  console.log(`Bundle OK: all ${required.length} native modules are present.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
