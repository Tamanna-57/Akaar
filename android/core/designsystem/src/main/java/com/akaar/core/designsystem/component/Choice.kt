package com.akaar.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Shapes
import com.akaar.core.designsystem.theme.Space
import com.akaar.core.designsystem.theme.Touch

/**
 * A large, obvious choice. Used wherever the app asks one question and offers a
 * short list of answers - language, role, craft, capacity.
 *
 * Selection is carried by a border and a tonal fill together, never by colour
 * alone, so it survives both colour blindness and a cheap screen in daylight.
 * [supporting] is where a language's own name goes, which is the only text on
 * that screen a user can be assumed to read.
 */
@Composable
fun ChoiceCard(
    title: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    supporting: String? = null,
    leading: (@Composable () -> Unit)? = null,
) {
    val colors = AkaarTheme.colors
    Surface(
        shape = Shapes.card,
        color = if (selected) colors.primary.copy(alpha = 0.10f) else colors.surfaceRaised,
        border = BorderStroke(if (selected) 2.dp else 1.dp, if (selected) colors.primary else colors.border),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = Touch.listRowSeller)
            .selectable(selected = selected, role = Role.RadioButton, onClick = onClick),
    ) {
        Row(
            Modifier.padding(horizontal = Space.lg, vertical = Space.md),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (leading != null) {
                leading()
                androidx.compose.foundation.layout.Spacer(Modifier.padding(horizontal = Space.sm))
            }
            Column(Modifier.weight(1f)) {
                Text(title, style = AkaarType.bodyLarge, color = colors.textPrimary)
                if (supporting != null) {
                    Text(supporting, style = AkaarType.caption, color = colors.textSecondary)
                }
            }
            if (selected) {
                // Text, not just a tick: colour is never the only carrier of state.
                Text("✓", style = AkaarType.section, color = colors.primary)
            }
        }
    }
}
