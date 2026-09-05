// Re-exported so screens can pull UiState/AppResult from the same import as
// the components that render them, without a separate @akaar/core-common
// dependency in every feature package.
export * from "@akaar/core-common";

export * from "./theme/colors.ts";
export * from "./theme/space.ts";
export * from "./theme/type.ts";
export * from "./theme/theme.tsx";

export * from "./components/Buttons.tsx";
export * from "./components/HeritagePattern.tsx";
export * from "./components/motifGrid.ts";
export * from "./components/ScreenScaffold.tsx";
export * from "./components/Avatar.tsx";
export * from "./components/Badge.tsx";
export * from "./components/InfoRow.tsx";
export * from "./components/Chips.tsx";
export * from "./components/Inputs.tsx";
export * from "./components/Surfaces.tsx";
export * from "./components/StateHost.tsx";
export * from "./components/AiOutputBlock.tsx";

// Palette is deliberately not re-exported - see theme/palette.ts.
