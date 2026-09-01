package com.akaar.core.designsystem.component

import androidx.compose.foundation.BorderStroke
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Shapes

/** 4dp radius, not a pill. Used for marketplace filters and product attributes. */
@Composable
fun AkaarFilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = AkaarTheme.colors
    FilterChip(
        selected = selected,
        onClick = onClick,
        shape = Shapes.chip,
        border = BorderStroke(1.dp, if (selected) colors.primary else colors.border),
        colors = FilterChipDefaults.filterChipColors(
            containerColor = colors.surfaceRaised,
            labelColor = colors.textPrimary,
            selectedContainerColor = colors.primary,
            selectedLabelColor = colors.onPrimary,
        ),
        label = { Text(label, style = AkaarType.body) },
        modifier = modifier,
    )
}
