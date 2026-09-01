package com.akaar.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.akaar.core.common.UiState
import com.akaar.core.designsystem.component.StateHost

/**
 * A destination whose screen arrives in a later phase. It renders a real Empty
 * state rather than a placeholder, so navigation is exercised end to end from
 * Phase 2 and no route silently leads nowhere.
 */
@Composable
fun PendingScreen(name: String, modifier: Modifier = Modifier) {
    StateHost(
        state = UiState.Empty(
            title = name,
            body = "This screen is built in a later phase.",
        ),
        modifier = modifier,
    ) { }
}
