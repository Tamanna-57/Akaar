package com.akaar.feature.seller

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.akaar.core.designsystem.component.AkaarCard
import com.akaar.core.designsystem.component.AkaarPrimaryButton
import com.akaar.core.designsystem.component.AkaarSectionHeader
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space

/**
 * The seller's home.
 *
 * Ordered by what needs her attention, not by metrics. An artisan opening this
 * screen has roughly two hours with a shared phone; the first thing she sees
 * should be the thing that is waiting for her, and if nothing is, the screen
 * says so plainly rather than inventing activity to look busy.
 */
@Composable
fun SellerHomeScreen(
    state: SellerHomeState,
    onAddProduct: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = AkaarTheme.colors
    Column(
        modifier
            .fillMaxSize()
            .padding(horizontal = Space.gutterSeller),
        verticalArrangement = Arrangement.spacedBy(Space.sm),
    ) {
        Text(
            stringResource(R.string.seller_greeting, state.name.ifBlank { "—" }),
            style = AkaarType.title,
            color = colors.textPrimary,
            modifier = Modifier.padding(top = Space.lg),
        )
        if (state.craftName.isNotBlank()) {
            Text(
                listOfNotNull(state.craftName, state.district.takeIf { it.isNotBlank() })
                    .joinToString(" · "),
                style = AkaarType.body,
                color = colors.textSecondary,
            )
        }

        AkaarSectionHeader(stringResource(R.string.seller_needs_attention))

        if (state.attention.isEmpty()) {
            AkaarCard(Modifier.fillMaxWidth()) {
                Text(
                    stringResource(R.string.seller_nothing_waiting),
                    style = AkaarType.bodyLarge, color = colors.textPrimary,
                )
                Text(
                    stringResource(R.string.seller_nothing_waiting_body),
                    style = AkaarType.body, color = colors.textSecondary,
                    modifier = Modifier.padding(top = Space.xs),
                )
            }
        } else {
            state.attention.forEach { item ->
                AkaarCard(Modifier.fillMaxWidth()) {
                    Text(item, style = AkaarType.bodyLarge, color = colors.textPrimary)
                }
            }
        }

        // The one action this screen exists to make obvious.
        AkaarCard(Modifier.fillMaxWidth().padding(top = Space.lg)) {
            Text(
                stringResource(R.string.seller_add_product),
                style = AkaarType.section, color = colors.textPrimary,
            )
            Text(
                stringResource(R.string.seller_add_product_sub),
                style = AkaarType.body, color = colors.textSecondary,
                modifier = Modifier.padding(top = Space.xs, bottom = Space.md),
            )
            AkaarPrimaryButton(
                text = stringResource(R.string.seller_add_product),
                onClick = onAddProduct,
                sellerFlow = true,
            )
        }
    }
}
