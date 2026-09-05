package com.akaar.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space
import com.akaar.core.designsystem.theme.Touch

data class NavItem(
    val route: String,
    val label: String,
)

/**
 * Labels only, for now.
 *
 * The design system calls for an icon set drawn for this product; until that
 * exists, borrowed glyphs would be exactly the generic iconography the brief
 * says to avoid. An icon-only tab bar would be unusable for a first-time
 * smartphone user anyway, so when icons do arrive they join the labels rather
 * than replace them.
 */
@Composable
fun AkaarBottomNav(
    items: List<NavItem>,
    selectedRoute: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = AkaarTheme.colors
    Column(modifier.fillMaxWidth().background(colors.surfaceRaised)) {
        HorizontalDivider(thickness = 1.dp, color = colors.border)
        Row(
            Modifier.fillMaxWidth().heightIn(min = Touch.minSeller),
            horizontalArrangement = Arrangement.SpaceEvenly,
        ) {
            items.forEach { item ->
                val active = item.route == selectedRoute
                Column(
                    Modifier
                        .weight(1f)
                        .clickable { onSelect(item.route) }
                        .padding(vertical = Space.sm)
                        .semantics { contentDescription = item.label },
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(
                        item.label,
                        style = AkaarType.body,
                        textAlign = TextAlign.Center,
                        color = if (active) colors.primary else colors.textSecondary,
                    )
                }
            }
        }
    }
}
