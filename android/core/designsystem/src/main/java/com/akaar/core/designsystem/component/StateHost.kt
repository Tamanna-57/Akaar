package com.akaar.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.akaar.core.common.UiState
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space

/**
 * Renders any [UiState] so every screen gets all six states without
 * reimplementing them. Screens supply the content case and, where the shape of
 * the result is known, a matching skeleton.
 *
 * Because [UiState] is sealed and this `when` is exhaustive, adding a state to
 * the hierarchy breaks the build here rather than silently rendering nothing.
 */
@Composable
fun <T> StateHost(
    state: UiState<T>,
    modifier: Modifier = Modifier,
    onRetry: (() -> Unit)? = null,
    onEmptyAction: (() -> Unit)? = null,
    onRequestPermission: (() -> Unit)? = null,
    onOpenSettings: (() -> Unit)? = null,
    skeleton: @Composable () -> Unit = { DefaultSkeleton() },
    content: @Composable (T) -> Unit,
) {
    when (state) {
        is UiState.Loading -> skeleton()

        is UiState.Content -> content(state.data)

        is UiState.Empty -> Message(
            modifier = modifier,
            title = state.title,
            body = state.body,
            actionLabel = state.actionLabel,
            onAction = onEmptyAction,
        )

        is UiState.Error -> Message(
            modifier = modifier,
            title = state.message,
            body = null,
            actionLabel = if (state.retryable && onRetry != null) "Try again" else null,
            onAction = onRetry,
        )

        // Deliberately distinct from Error: "you are offline" and "this failed"
        // call for different words and a different next step.
        is UiState.Offline -> Message(
            modifier = modifier,
            title = "You are offline",
            body = state.safeToContinue ?: "Your work is saved on this phone and will upload when you have signal.",
            actionLabel = if (onRetry != null) "Try again" else null,
            onAction = onRetry,
        )

        is UiState.PermissionDenied -> Message(
            modifier = modifier,
            title = state.rationale,
            body = null,
            actionLabel = if (state.permanentlyDenied) "Open settings" else "Allow",
            onAction = if (state.permanentlyDenied) onOpenSettings else onRequestPermission,
        )
    }
}

@Composable
private fun Message(
    title: String,
    body: String?,
    actionLabel: String?,
    onAction: (() -> Unit)?,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.fillMaxSize().padding(Space.xl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text(title, style = AkaarType.section, color = AkaarTheme.colors.textPrimary,
            textAlign = TextAlign.Center)
        if (body != null) {
            Text(body, style = AkaarType.body, color = AkaarTheme.colors.textSecondary,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = Space.sm))
        }
        if (actionLabel != null && onAction != null) {
            AkaarSecondaryButton(
                text = actionLabel, onClick = onAction,
                modifier = Modifier.padding(top = Space.xl),
            )
        }
    }
}

@Composable
private fun DefaultSkeleton() {
    Column(
        Modifier.fillMaxWidth().padding(Space.gutter),
        verticalArrangement = Arrangement.spacedBy(Space.md),
    ) {
        Skeleton(widthFraction = 0.6f, height = androidx.compose.ui.unit.Dp(24f))
        Skeleton()
        Skeleton(widthFraction = 0.9f)
        Skeleton(widthFraction = 0.4f)
    }
}
