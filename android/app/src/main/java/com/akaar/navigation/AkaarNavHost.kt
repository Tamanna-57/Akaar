package com.akaar.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.akaar.core.data.taxonomy.IndianStates
import com.akaar.core.domain.model.AppRole
import com.akaar.feature.buyer.BuyerRoutes
import com.akaar.feature.onboarding.*
import com.akaar.feature.seller.SellerHomeState
import com.akaar.feature.seller.SellerHomeViewModel
import com.akaar.feature.seller.SellerRoutes
import com.akaar.feature.seller.SellerScaffold

/**
 * One navigation host for the whole app. Role selects the graph, not the
 * screen. The app module is the only place that knows about every feature
 * module; the feature modules do not know about each other.
 */
@Composable
fun AkaarNavHost(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
) {
    NavHost(
        navController = navController,
        startDestination = OnboardingRoutes.LAUNCH,
        modifier = modifier,
    ) {
        composable(OnboardingRoutes.LAUNCH) {
            LaunchScreen(onContinue = { navController.navigate(OnboardingRoutes.LANGUAGE) })
        }

        composable(OnboardingRoutes.LANGUAGE) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            LanguageScreen(state, vm) { navController.navigate(OnboardingRoutes.ROLE) }
        }

        composable(OnboardingRoutes.ROLE) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            RoleScreen(state, vm,
                onNext = { navController.navigate(OnboardingRoutes.PHONE) },
                onBack = { navController.popBackStack() })
        }

        composable(OnboardingRoutes.PHONE) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            PhoneScreen(state, vm,
                onNext = { navController.navigate(OnboardingRoutes.OTP) },
                onBack = { navController.popBackStack() })
        }

        composable(OnboardingRoutes.OTP) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            OtpScreen(state, vm,
                onNext = {
                    val next = if (state.role == AppRole.Buyer) OnboardingRoutes.BUYER_PROFILE
                    else OnboardingRoutes.NAME
                    navController.navigate(next)
                },
                onBack = { navController.popBackStack() })
        }

        // ---- seller profile, one question per screen ----
        composable(OnboardingRoutes.NAME) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            NameScreen(state, vm,
                onNext = { navController.navigate(OnboardingRoutes.STATE) },
                onBack = { navController.popBackStack() })
        }
        composable(OnboardingRoutes.STATE) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            StateScreen(state, vm, IndianStates.all,
                onNext = { navController.navigate(OnboardingRoutes.DISTRICT) },
                onBack = { navController.popBackStack() })
        }
        composable(OnboardingRoutes.DISTRICT) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            DistrictScreen(state, vm,
                onNext = { navController.navigate(OnboardingRoutes.CRAFT) },
                onBack = { navController.popBackStack() })
        }
        composable(OnboardingRoutes.CRAFT) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            CraftScreen(state, vm,
                onNext = { navController.navigate(OnboardingRoutes.CAPACITY) },
                onBack = { navController.popBackStack() })
        }
        composable(OnboardingRoutes.CAPACITY) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            CapacityScreen(state, vm,
                onDone = {
                    navController.navigate(SellerRoutes.HOME) {
                        popUpTo(OnboardingRoutes.LAUNCH) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() })
        }

        composable(OnboardingRoutes.BUYER_PROFILE) {
            val vm: OnboardingViewModel = hiltViewModel()
            val state by vm.state.collectAsState()
            BuyerProfileScreen(state, vm,
                onDone = {
                    navController.navigate(BuyerRoutes.DISCOVER) {
                        popUpTo(OnboardingRoutes.LAUNCH) { inclusive = true }
                    }
                },
                onBack = { navController.popBackStack() })
        }

        // ---- role graphs ----
        composable(SellerRoutes.HOME) {
            val vm: SellerHomeViewModel = hiltViewModel()
            val state by vm.state.collectAsStateWithLifecycle(SellerHomeState())
            SellerScaffold(home = state, onAddProduct = { /* phase 4 */ })
        }

        composable(BuyerRoutes.DISCOVER) { PendingScreen("Discover") }
    }
}
