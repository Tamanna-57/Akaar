import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppRole } from "@akaar/core-domain";
import React from "react";
import { BuyerRoutes } from "../features/buyer/routes.ts";
import { ClusterRoutes } from "../features/cluster/routes.ts";
import { LaunchScreen } from "../features/onboarding/LaunchScreen.tsx";
import { OnboardingRoutes } from "../features/onboarding/routes.ts";
import { SellerRoutes } from "../features/seller/routes.ts";
import { SellerProfileScreen } from "../features/seller/profile/SellerProfileScreen.tsx";
import { sampleSellerProfile } from "../features/seller/profile/sampleProfile.ts";
import { PendingScreen } from "./PendingScreen.tsx";

/**
 * Port of android/app/.../AkaarNavHost.kt.
 *
 * One navigation host for the whole app. Role selects the graph, not the
 * screen - which is what keeps "role" from degrading into a UI flag
 * scattered across screens.
 *
 * apps/mobile is the only place that imports from every feature folder; the
 * feature folders do not import each other (enforced by
 * scripts/check-module-boundaries.mjs, this file's Kotlin-side counterpart
 * being the `checkModuleBoundaries` Gradle task).
 */
const Stack = createNativeStackNavigator();

export function AkaarNavigator({
  initialRouteName = OnboardingRoutes.Launch,
}: {
  initialRouteName?: string;
}) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        // design-system.md, Motion: "Shared-axis for navigation". On Android
        // the platform's shared-axis transition is what slide_from_right
        // maps to, and it is the transition users already know from every
        // other app on the phone.
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name={OnboardingRoutes.Launch}>
        {({ navigation }) => (
          <LaunchScreen onContinue={() => navigation.navigate(OnboardingRoutes.Language)} />
        )}
      </Stack.Screen>

      {/* Authentication and profile setup land here in Phase 3. */}
      <Stack.Screen name={OnboardingRoutes.Language}>
        {() => <PendingScreen name="Language selection" />}
      </Stack.Screen>
      <Stack.Screen name={OnboardingRoutes.Role}>{() => <PendingScreen name="Role selection" />}</Stack.Screen>
      <Stack.Screen name={OnboardingRoutes.Phone}>
        {() => <PendingScreen name="Phone and OTP" />}
      </Stack.Screen>

      <Stack.Screen name={SellerRoutes.Home}>
        {({ navigation }) => (
          <PendingScreen
            name="Seller home"
            actionLabel="Open your profile"
            onAction={() => navigation.navigate(SellerRoutes.Profile)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name={SellerRoutes.Profile}>
        {({ navigation }) => (
          <SellerProfileScreen
            // Stand-in data until a repository exists - see sampleProfile.ts.
            state={sampleSellerProfile}
            onEdit={() => navigation.navigate(OnboardingRoutes.Role)}
            onOpenProducts={() => navigation.navigate(SellerRoutes.MyProducts)}
            onOpenCluster={() => navigation.navigate(ClusterRoutes.Queue)}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name={SellerRoutes.MyProducts}>
        {() => <PendingScreen name="Your products" />}
      </Stack.Screen>
      <Stack.Screen name={BuyerRoutes.Discover}>{() => <PendingScreen name="Discover" />}</Stack.Screen>
      <Stack.Screen name={ClusterRoutes.Queue}>{() => <PendingScreen name="Cluster queue" />}</Stack.Screen>
    </Stack.Navigator>
  );
}

/** The route each role lands on once authenticated. */
export function startRouteFor(role: AppRole): string {
  switch (role) {
    case AppRole.Seller:
      return SellerRoutes.Home;
    case AppRole.Buyer:
      return BuyerRoutes.Discover;
    case AppRole.ClusterManager:
      return ClusterRoutes.Queue;
    case AppRole.Admin:
      // Admin is a responsive web dashboard, not a mobile surface.
      return BuyerRoutes.Discover;
    default:
      return BuyerRoutes.Discover;
  }
}
