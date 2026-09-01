package com.akaar.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space

/** What the seller may do with a value the machine proposed. */
enum class AiAction { Accept, Edit, Regenerate, Reject }

/**
 * The recurring component at every AI touchpoint: the proposed value, and the
 * seller's four choices. Used identically everywhere so "the machine suggested
 * this and you decide" becomes a learned pattern rather than a per-screen
 * invention.
 *
 * [lowConfidence] softens the presentation but never hides the value. Where
 * confidence is too low to show a value at all, the caller must ask a question
 * instead of rendering this block with a guess in it - the app does not present
 * an invented attribute as a fact and then wait to be corrected.
 */
@Composable
fun AiOutputBlock(
    label: String,
    value: String,
    onAction: (AiAction) -> Unit,
    modifier: Modifier = Modifier,
    /** Heard by the seller in her own language. Text is never the only channel. */
    onPlayAudio: (() -> Unit)? = null,
    lowConfidence: Boolean = false,
    sourceNote: String? = null,
) {
    AkaarCard(modifier = modifier.fillMaxWidth()) {
        Text(label, style = AkaarType.caption, color = AkaarTheme.colors.textSecondary)
        Text(
            value,
            style = AkaarType.bodyLarge,
            color = AkaarTheme.colors.textPrimary,
            modifier = Modifier.padding(top = Space.xs),
        )

        // Colour is never the only carrier of meaning: the note says it too.
        if (lowConfidence) {
            Text(
                "Please check this one",
                style = AkaarType.caption,
                color = AkaarTheme.colors.warning,
                modifier = Modifier.padding(top = Space.xs),
            )
        }
        if (sourceNote != null) {
            Text(
                sourceNote,
                style = AkaarType.caption,
                color = AkaarTheme.colors.textSecondary,
                modifier = Modifier.padding(top = Space.xs),
            )
        }

        Row(
            Modifier.fillMaxWidth().padding(top = Space.md),
            horizontalArrangement = Arrangement.spacedBy(Space.sm),
        ) {
            AkaarTextButton("Yes", { onAction(AiAction.Accept) })
            AkaarTextButton("Change", { onAction(AiAction.Edit) })
            AkaarTextButton("Try again", { onAction(AiAction.Regenerate) })
            AkaarTextButton("Remove", { onAction(AiAction.Reject) })
        }
        if (onPlayAudio != null) {
            AkaarTextButton("Listen", onPlayAudio)
        }
    }
}

/**
 * Used where a value could not be extracted with enough confidence. The gap
 * becomes a question rather than a plausible guess - this is the "never invent"
 * rule made visible in the UI.
 */
@Composable
fun MissingFieldPrompt(
    question: String,
    modifier: Modifier = Modifier,
    onAnswer: () -> Unit,
    onPlayAudio: (() -> Unit)? = null,
) {
    AkaarCard(modifier = modifier.fillMaxWidth()) {
        Text(question, style = AkaarType.bodyLarge, color = AkaarTheme.colors.textPrimary,
            textAlign = TextAlign.Start)
        Column(Modifier.padding(top = Space.md), verticalArrangement = Arrangement.spacedBy(Space.sm)) {
            AkaarPrimaryButton("Answer", onAnswer, sellerFlow = true)
            if (onPlayAudio != null) AkaarTextButton("Listen", onPlayAudio)
        }
    }
}
