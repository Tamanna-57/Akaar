import React, { useMemo } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import { useAkaarColors } from "../theme/theme.tsx";
import { motifGrid } from "./motifGrid.ts";

/**
 * A block-print motif, tiled, sitting behind content.
 *
 * The design system's identity section names the visual reference directly:
 * "Indian textile and print craft: dyed cloth, block-print ink, undyed
 * cotton". This is that reference made literal - the *butti*, the small
 * repeated motif stamped across handloom cloth - rather than decoration
 * added on top of a generic layout.
 *
 * Three rules it has to obey, all from design-system.md:
 *
 * 1. "Colour carries meaning; it is never decorative." So the pattern is
 *    drawn in `border` - the hairline colour that already means "structure"
 *    - at an opacity low enough that it reads as woven texture, never as an
 *    element competing with content.
 * 2. "No gradients as decoration." There are none. Flat ink on flat cloth,
 *    which is what block printing actually is.
 * 3. Contrast is not harmed: at these opacities the pattern shifts the
 *    background by a fraction of a step, so body text keeps its full
 *    contrast ratio against `surface`.
 *
 * Built from plain Views rather than SVG on purpose. react-native-svg is a
 * native module - one more thing to link and one more thing to break - and
 * the target device is a shared 3 GB Android 11 phone. Rotated squares and
 * bordered circles cost nothing to rasterise, and the motif is geometric
 * anyway.
 */
export interface HeritagePatternProps {
  /** Defaults to the theme's hairline colour. */
  color?: string;
  /** 0-1. Kept low: this is texture, not an element. */
  opacity?: number;
  /** Distance between motif centres, in dp. */
  spacing?: number;
  /**
   * Hard ceiling on how many motifs are drawn.
   *
   * Every motif is one or two Views, and the target device is a shared
   * 3 GB Android 11 phone. On a full screen at a tight spacing the naive
   * grid runs to several hundred extra nodes in the tree - real cost, for
   * texture. The cap keeps it bounded no matter the screen size, and the
   * grid thins itself rather than clipping to a corner.
   */
  maxMotifs?: number;
  /** Size of one motif, in dp. */
  motifSize?: number;
  style?: StyleProp<ViewStyle>;
  /** Height of the area to fill. Width always fills the parent. */
  height: number;
  width: number;
}

export function HeritagePattern({
  color,
  opacity = 0.5,
  // Sparse by default. This is the ground behind a whole screen of text,
  // and on a cheap LCD in daylight a busy ground costs legibility - the
  // same reason the surface is warm off-white rather than white.
  spacing = 76,
  motifSize = 14,
  maxMotifs = 90,
  height,
  width,
  style,
}: HeritagePatternProps) {
  const colors = useAkaarColors();
  const ink = color ?? colors.border;

  // Positions are derived once per size change. A fixed grid, not a
  // randomised scatter: block printing repeats because the block repeats.
  const positions = useMemo(
    () => motifGrid({ width, height, spacing, maxMotifs }),
    [height, width, spacing, maxMotifs],
  );

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: "absolute", top: 0, left: 0, width, height, opacity, overflow: "hidden" }, style]}
    >
      {positions.map((point, index) => (
        <Butti key={index} x={point.x} y={point.y} size={motifSize} ink={ink} alternate={point.offset} />
      ))}
    </View>
  );
}

/**
 * One motif: a diamond outline with a dot at its centre. The diamond is a
 * square rotated 45 degrees, which is how the shape is actually cut on a
 * wooden block.
 */
function Butti({
  x,
  y,
  size,
  ink,
  alternate,
}: {
  x: number;
  y: number;
  size: number;
  ink: string;
  alternate: boolean;
}) {
  return (
    <View style={{ position: "absolute", left: x - size / 2, top: y - size / 2 }}>
      <View
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: ink,
          transform: [{ rotate: "45deg" }],
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* The centre dot is dropped on alternating motifs so the repeat has
            the slight variation a hand-stamped cloth has. */}
        {alternate ? null : (
          <View style={{ width: size / 4, height: size / 4, borderRadius: size / 8, backgroundColor: ink }} />
        )}
      </View>
    </View>
  );
}
