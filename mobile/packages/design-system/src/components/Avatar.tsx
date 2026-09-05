import React from "react";
import { Image, Text, View } from "react-native";
import { useAkaarColors } from "../theme/theme.tsx";
import { AkaarType } from "../theme/type.ts";

/**
 * The one round thing in the app.
 *
 * design-system.md: "999 reserved for avatars **only**. Nothing else is
 * pill-shaped." Keeping that rule in a component rather than a convention
 * is what stops it eroding.
 *
 * Falls back to initials rather than a generic person icon: a placeholder
 * silhouette reads as "no one", and the artisan's name is the one thing we
 * always have.
 */
export function Avatar({
  name,
  imageUri,
  size = 88,
  ringColor,
}: {
  name: string;
  imageUri?: string;
  size?: number;
  /** A contrasting ring, for an avatar that overlaps two backgrounds. */
  ringColor?: string;
}) {
  const colors = useAkaarColors();
  const ring = ringColor ?? colors.surface;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <View
      accessible
      accessibilityLabel={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: ring,
        backgroundColor: colors.surfaceRaised,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {imageUri != null ? (
        <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      ) : (
        <Text style={[AkaarType.title, { color: colors.primary }]}>{initials}</Text>
      )}
    </View>
  );
}
