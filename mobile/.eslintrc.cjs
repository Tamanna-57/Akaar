/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  env: { es2021: true, node: true },
  ignorePatterns: ["**/dist/**", "**/node_modules/**"],
  overrides: [
    {
      // Editor/PR-time signal for the same rule scripts/check-module-boundaries.mjs
      // enforces in CI: feature/seller and feature/buyer only meet through
      // core-domain and feature/shared.
      files: ["apps/mobile/src/features/seller/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [{ group: ["**/features/buyer/**"], message: "feature/seller must not depend on feature/buyer." }] },
        ],
      },
    },
    {
      files: ["apps/mobile/src/features/buyer/**/*.{ts,tsx}"],
      rules: {
        "no-restricted-imports": [
          "error",
          { patterns: [{ group: ["**/features/seller/**"], message: "feature/buyer must not depend on feature/seller." }] },
        ],
      },
    },
  ],
};
