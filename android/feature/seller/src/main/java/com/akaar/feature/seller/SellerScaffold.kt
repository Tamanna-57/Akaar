package com.akaar.feature.seller

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.akaar.core.common.UiState
import com.akaar.core.designsystem.component.AkaarBottomNav
import com.akaar.core.designsystem.component.NavItem
import com.akaar.core.designsystem.component.StateHost

/**
 * The seller's five tabs, as the seller specification requires. Tab state is
 * local to this shell rather than in the app's navigation graph, so the buyer
 * graph never has to know these routes exist.
 */
@Composable
fun SellerScaffold(
    home: SellerHomeState,
    onAddProduct: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val tabs = listOf(
        NavItem(SellerRoutes.HOME, stringResource(R.string.tab_home)),
        NavItem(SellerRoutes.ADD_PRODUCT, stringResource(R.string.tab_add)),
        NavItem(SellerRoutes.MY_PRODUCTS, stringResource(R.string.tab_products)),
        NavItem(SellerRoutes.REQUESTS, stringResource(R.string.tab_requests)),
        NavItem(SellerRoutes.ASSISTANT, stringResource(R.string.tab_assistant)),
    )
    var selected by remember { mutableStateOf(SellerRoutes.HOME) }

    Column(modifier.fillMaxSize()) {
        Column(Modifier.weight(1f)) {
            when (selected) {
                SellerRoutes.HOME -> SellerHomeScreen(home, onAddProduct)
                SellerRoutes.ADD_PRODUCT -> ComingSoon(stringResource(R.string.tab_add))
                SellerRoutes.MY_PRODUCTS -> ComingSoon(stringResource(R.string.seller_my_products))
                SellerRoutes.REQUESTS -> ComingSoon(stringResource(R.string.tab_requests))
                else -> ComingSoon(stringResource(R.string.tab_assistant))
            }
        }
        AkaarBottomNav(
            items = tabs,
            selectedRoute = selected,
            onSelect = { route ->
                // Add Product opens the capture flow rather than a tab.
                if (route == SellerRoutes.ADD_PRODUCT) onAddProduct() else selected = route
            },
        )
    }
}

/**
 * A tab whose screen arrives in a later phase. It renders a real Empty state
 * from the design system rather than a placeholder, so every tab is reachable
 * and correctly shaped from now on.
 */
@Composable
private fun ComingSoon(name: String, modifier: Modifier = Modifier) {
    StateHost(
        state = UiState.Empty(title = name, body = stringResource(R.string.seller_coming_soon)),
        modifier = modifier,
    ) { }
}
