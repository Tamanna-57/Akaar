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
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
