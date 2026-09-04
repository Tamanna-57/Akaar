// Re-exported so screens can pull UiState/AppResult from the same import as
// the components that render them, without a separate @akaar/core-common
// dependency in every feature package.
export * from "@akaar/core-common";

export * from "./theme/colors";
export * from "./theme/space";
export * from "./theme/type";
export * from "./theme/theme";

export * from "./components/Buttons";
export * from "./components/Chips";
export * from "./components/Inputs";
export * from "./components/Surfaces";
export * from "./components/StateHost";
export * from "./components/AiOutputBlock";

// Palette is deliberately not re-exported - see theme/palette.ts.
