package com.akaar.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Shapes
import com.akaar.core.designsystem.theme.Space

/**
 * A card is for a discrete, tappable object - a product, an offer, an order.
 * Sections and forms sit directly on the surface with hairline separators
 * instead, because not every section should look like a card.
 *
 * Borders and tonal contrast, never a drop shadow.
 */
@Composable
fun AkaarCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable ColumnScope.() -> Unit,
) {
    val colors = AkaarTheme.colors
    val shape = Shapes.card
    val border = BorderStroke(1.dp, colors.border)
    val cardColors = CardDefaults.cardColors(containerColor = colors.surfaceRaised)
    val elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)

    if (onClick != null) {
        Card(onClick = onClick, modifier = modifier, shape = shape, colors = cardColors,
            elevation = elevation, border = border) {
            Column(Modifier.padding(Space.lg), content = content)
        }
    } else {
        Card(modifier = modifier, shape = shape, colors = cardColors,
            elevation = elevation, border = border) {
            Column(Modifier.padding(Space.lg), content = content)
        }
    }
}

@Composable
fun AkaarSectionHeader(title: String, modifier: Modifier = Modifier) {
    Text(
        text = title,
        style = AkaarType.section,
        color = AkaarTheme.colors.textPrimary,
        modifier = modifier.padding(top = Space.xl, bottom = Space.sm),
    )
}

@Composable
fun AkaarDivider(modifier: Modifier = Modifier) {
    HorizontalDivider(modifier = modifier, thickness = 1.dp, color = AkaarTheme.colors.border)
}

/** Shape-matched placeholder. No shimmer sweeping across the whole screen. */
@Composable
fun Skeleton(
    modifier: Modifier = Modifier,
    height: androidx.compose.ui.unit.Dp = 16.dp,
    widthFraction: Float = 1f,
) {
    Box(
        modifier
            .fillMaxWidth(widthFraction)
            .height(height)
            .background(AkaarTheme.colors.border, Shapes.input)
    )
}
