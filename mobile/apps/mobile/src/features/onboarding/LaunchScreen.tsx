import { AkaarPrimaryButton, AkaarType, Space, useAkaarColors } from "@akaar/design-system";
import React from "react";
import { Text, View } from "react-native";

/**
 * Port of android/feature/onboarding/.../LaunchScreen.kt.
 *
 * The launch screen. Language selection comes before anything else in the
 * real flow (Phase 3), because the choice decides what the user can read -
 * so this screen leads with an action rather than with prose.
 */
export function LaunchScreen({ onContinue }: { onContinue: () => void }) {
  const colors = useAkaarColors();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Space.xl }}>
      <Text style={[AkaarType.display, { color: colors.textPrimary }]}>Akaar</Text>
      <Text
        style={[
          AkaarType.bodyLarge,
          { color: colors.textSecondary, textAlign: "center", marginTop: Space.sm, marginBottom: Space.xxl },
        ]}
      >
        Aapki kala, aapka daam
      </Text>
      <AkaarPrimaryButton text="Shuru karein" onPress={onContinue} sellerFlow accessibilityLabel="Start" />
    </View>
  );
}
