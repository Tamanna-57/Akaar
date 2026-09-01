package com.akaar.core.designsystem.component

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.foundation.text.KeyboardOptions
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Shapes
import com.akaar.core.designsystem.theme.Space
import com.akaar.core.designsystem.theme.Touch

/**
 * Label above the field, never a placeholder standing in for one: a placeholder
 * disappears the moment typing starts, which is exactly when a user who reads
 * slowly still needs it.
 *
 * Every field in a seller flow carries a microphone affordance - typing is the
 * fallback here, not the expected path.
 */
@Composable
fun AkaarTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    helper: String? = null,
    error: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    imeAction: ImeAction = ImeAction.Next,
    singleLine: Boolean = true,
    onVoiceInput: (() -> Unit)? = null,
) {
    val colors = AkaarTheme.colors
    Column(modifier.fillMaxWidth()) {
        Text(label, style = AkaarType.label, color = colors.textPrimary,
            modifier = Modifier.padding(bottom = Space.xs))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = singleLine,
            isError = error != null,
            shape = Shapes.input,
            textStyle = AkaarType.bodyLarge,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType, imeAction = imeAction),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = colors.primary,
                unfocusedBorderColor = colors.border,
                errorBorderColor = colors.danger,
                focusedContainerColor = colors.surfaceRaised,
                unfocusedContainerColor = colors.surfaceRaised,
            ),
            trailingIcon = if (onVoiceInput != null) {
                { AkaarTextButton("Speak", onVoiceInput) }
            } else null,
            modifier = Modifier.fillMaxWidth().heightIn(min = Touch.minSeller),
        )
        val note = error ?: helper
        if (note != null) {
            Text(
                note,
                style = AkaarType.caption,
                color = if (error != null) colors.danger else colors.textSecondary,
                modifier = Modifier.padding(top = Space.xs),
            )
        }
    }
}
