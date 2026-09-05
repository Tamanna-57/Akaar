const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("node:path");

/**
 * Watch and resolve the pnpm workspace packages (packages/core-common,
 * core-domain, design-system) the same way Gradle's included-build module
 * graph makes :core:* visible to :app - Metro needs to be told explicitly
 * because those packages live outside apps/mobile/node_modules.
 */
const workspaceRoot = path.resolve(__dirname, "../..");
const projectRoot = __dirname;

/** @type {import('@react-native/metro-config').MetroConfig} */
const config = {
  watchFolders: [workspaceRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(workspaceRoot, "node_modules"),
    ],

    // REQUIRED, and not optional taste.
    //
    // Our packages expose two entry points: "." (pure, no native modules)
    // and "./native" (the adapters). That split is declared with the
    // "exports" field in each package.json.
    //
    // Metro ignores "exports" unless this flag is on, and - worse - it does
    // not fail when it cannot match a subpath: it silently falls back to the
    // package's "main". So `import { KeychainSecureStorage } from
    // "@akaar/core-data/native"` quietly resolved to the PURE index instead,
    // making every native class `undefined` at runtime, on a device, with no
    // build error anywhere.
    //
    // TypeScript does honour "exports", so `tsc` was perfectly happy while
    // the bundle was wrong. Verified by inspecting the built bundle: with
    // this flag off, react-native-keychain and op-sqlite appear zero times.
    unstable_enablePackageExports: true,
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
