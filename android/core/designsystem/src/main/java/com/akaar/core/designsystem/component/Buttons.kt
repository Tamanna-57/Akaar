package com.akaar.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Shapes
import com.akaar.core.designsystem.theme.Space
import com.akaar.core.designsystem.theme.Touch

/**
 * One primary action per screen. In seller flows the target is 56dp rather than
 * 48dp: the user is often outdoors, standing, on a phone she shares.
 */
@Composable
fun AkaarPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    sellerFlow: Boolean = false,
    contentDescription: String? = null,
) {
    val colors = AkaarTheme.colors
    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        shape = Shapes.button,
        colors = ButtonDefaults.buttonColors(
            containerColor = colors.primary,
            contentColor = colors.onPrimary,
            disabledContainerColor = colors.border,
            disabledContentColor = colors.textSecondary,
        ),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = if (sellerFlow) Touch.minSeller else Touch.min)
            .semantics { contentDescription?.let { this.contentDescription = it } },
    ) {
        if (loading) {
            CircularProgressIndicator(
                modifier = Modifier.size(20.dp),
                color = colors.onPrimary,
                strokeWidth = 2.dp,
            )
            Spacer(Modifier.width(Space.sm))
        }
        Text(text, style = if (sellerFlow) AkaarType.bodyLarge else AkaarType.label)
    }
}

@Composable
fun AkaarSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    sellerFlow: Boolean = false,
) {
    val colors = AkaarTheme.colors
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        shape = Shapes.button,
        border = BorderStroke(1.dp, colors.border),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.textPrimary),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = if (sellerFlow) Touch.minSeller else Touch.min),
    ) { Text(text, style = if (sellerFlow) AkaarType.bodyLarge else AkaarType.label) }
}

@Composable
fun AkaarTextButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    TextButton(
        onClick = onClick,
        modifier = modifier.heightIn(min = Touch.min),
        colors = ButtonDefaults.textButtonColors(contentColor = AkaarTheme.colors.primary),
    ) { Text(text, style = AkaarType.label) }
}

@Composable
fun AkaarDestructiveButton(text: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    val colors = AkaarTheme.colors
    OutlinedButton(
        onClick = onClick,
        shape = Shapes.button,
        border = BorderStroke(1.dp, colors.danger),
        colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.danger),
        modifier = modifier.fillMaxWidth().heightIn(min = Touch.min),
    ) { Text(text, style = AkaarType.label) }
}
