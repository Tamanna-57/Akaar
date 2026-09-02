package com.akaar.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space

/**
 * One question per screen: a step counter, a large question, the answers, and a
 * single primary action pinned to the bottom where a thumb reaches it.
 *
 * The layout is deliberately the same on every onboarding screen so that after
 * the first one the user already knows where to look and what to press.
 */
@Composable
fun QuestionScaffold(
    question: String,
    modifier: Modifier = Modifier,
    step: Int? = null,
    totalSteps: Int? = null,
    helper: String? = null,
    onBack: (() -> Unit)? = null,
    audioLabel: String? = null,
    onPlayAudio: (() -> Unit)? = null,
    primaryLabel: String,
    primaryEnabled: Boolean = true,
    onPrimary: () -> Unit,
    content: @Composable () -> Unit,
) {
    val colors = AkaarTheme.colors
    Column(
        modifier
            .fillMaxSize()
            .background(colors.surface)
            .padding(horizontal = Space.gutterSeller),
    ) {
        Row(
            Modifier.fillMaxWidth().padding(top = Space.lg),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (onBack != null) AkaarTextButton("←", onBack)
            if (step != null && totalSteps != null) {
                Text(
                    "$step / $totalSteps",
                    style = AkaarType.caption,
                    color = colors.textSecondary,
                    modifier = Modifier.padding(start = if (onBack != null) Space.xs else 0.dp),
                )
            }
        }
        if (step != null && totalSteps != null) StepProgress(step, totalSteps)

        Text(
            question,
            style = AkaarType.title,
            color = colors.textPrimary,
            modifier = Modifier.padding(top = Space.lg),
        )
        if (helper != null) {
            Text(
                helper,
                style = AkaarType.body,
                color = colors.textSecondary,
                modifier = Modifier.padding(top = Space.xs),
            )
        }
        // A word, not a speaker emoji: emoji as UI is on the avoid list, and a
        // label is what a screen reader announces usefully anyway.
        if (onPlayAudio != null) AkaarTextButton(audioLabel ?: "Listen", onPlayAudio)

        Column(
            Modifier.weight(1f).padding(top = Space.lg),
            verticalArrangement = Arrangement.spacedBy(Space.md),
        ) { content() }

        AkaarPrimaryButton(
            text = primaryLabel,
            onClick = onPrimary,
            enabled = primaryEnabled,
            sellerFlow = true,
            modifier = Modifier.padding(vertical = Space.lg),
        )
    }
}

/** Segments rather than a bar: discrete steps read as "how many questions left". */
@Composable
fun StepProgress(step: Int, total: Int, modifier: Modifier = Modifier) {
    val colors = AkaarTheme.colors
    Row(
        modifier.fillMaxWidth().padding(top = Space.sm),
        horizontalArrangement = Arrangement.spacedBy(Space.xs),
    ) {
        repeat(total) { i ->
            Box(
                Modifier
                    .weight(1f)
                    .height(4.dp)
                    .background(
                        if (i < step) colors.primary else colors.border,
                        RoundedCornerShape(2.dp),
                    )
            )
        }
    }
}

/** Simple screen header for the tabbed sections. */
@Composable
fun AkaarTopBar(title: String, modifier: Modifier = Modifier, action: (@Composable () -> Unit)? = null) {
    val colors = AkaarTheme.colors
    Row(
        modifier
            .fillMaxWidth()
            .background(colors.surface)
            .padding(horizontal = Space.gutterSeller, vertical = Space.md),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(title, style = AkaarType.title, color = colors.textPrimary, modifier = Modifier.weight(1f))
        action?.invoke()
    }
}
