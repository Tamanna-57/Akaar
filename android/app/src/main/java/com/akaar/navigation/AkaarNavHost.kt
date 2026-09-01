package com.akaar.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.akaar.core.domain.model.AppRole
import com.akaar.feature.buyer.BuyerRoutes
import com.akaar.feature.cluster.ClusterRoutes
import com.akaar.feature.onboarding.LaunchScreen
import com.akaar.feature.onboarding.OnboardingRoutes
import com.akaar.feature.seller.SellerRoutes

/**
 * One navigation host for the whole app. Role selects the graph, not the
 * screen - which is what keeps "role" from degrading into a UI flag scattered
 * across screens.
 *
 * The app module is the only place that knows about every feature module; the
 * feature modules do not know about each other.
 */
@Composable
fun AkaarNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
    startDestination: String = OnboardingRoutes.LAUNCH,
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier,
    ) {
        composable(OnboardingRoutes.LAUNCH) {
            LaunchScreen(onContinue = { navController.navigate(OnboardingRoutes.LANGUAGE) })
        }

        // Authentication and profile setup land here in Phase 3.
        composable(OnboardingRoutes.LANGUAGE) { PendingScreen("Language selection") }
        composable(OnboardingRoutes.ROLE) { PendingScreen("Role selection") }
        composable(OnboardingRoutes.PHONE) { PendingScreen("Phone and OTP") }

        composable(SellerRoutes.HOME) { PendingScreen("Seller home") }
        composable(BuyerRoutes.DISCOVER) { PendingScreen("Discover") }
        composable(ClusterRoutes.QUEUE) { PendingScreen("Cluster queue") }
    }
}

/** The route each role lands on once authenticated. */
fun startRouteFor(role: AppRole): String = when (role) {
    AppRole.Seller -> SellerRoutes.HOME
    AppRole.Buyer -> BuyerRoutes.DISCOVER
    AppRole.ClusterManager -> ClusterRoutes.QUEUE
    // Admin is a responsive web dashboard, not a mobile surface.
    AppRole.Admin -> BuyerRoutes.DISCOVER
}
