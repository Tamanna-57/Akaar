package com.akaar.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import com.akaar.core.designsystem.component.AkaarPrimaryButton
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space

object OnboardingRoutes {
    const val LAUNCH = "onboarding/launch"
    const val LANGUAGE = "onboarding/language"
    const val ROLE = "onboarding/role"
    const val PHONE = "onboarding/phone"
    const val OTP = "onboarding/otp"

    // Seller profile: one question per screen.
    const val NAME = "onboarding/name"
    const val STATE = "onboarding/state"
    const val DISTRICT = "onboarding/district"
    const val CRAFT = "onboarding/craft"
    const val CAPACITY = "onboarding/capacity"

    const val BUYER_PROFILE = "onboarding/buyer"
}

/**
 * The launch screen. Language selection comes before anything else in the real
 * flow (Phase 3), because the choice decides what the user can read - so this
 * screen leads with an action rather than with prose.
 */
@Composable
fun LaunchScreen(onContinue: () -> Unit, modifier: Modifier = Modifier) {
    val colors = AkaarTheme.colors
    Column(
        modifier = modifier.fillMaxSize().padding(Space.xl),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Akaar", style = AkaarType.display, color = colors.textPrimary)
        Text(
            "Aapki kala, aapka daam",
            style = AkaarType.bodyLarge,
            color = colors.textSecondary,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = Space.sm, bottom = Space.xxl),
        )
        AkaarPrimaryButton(
            text = "Shuru karein",
            onClick = onContinue,
            sellerFlow = true,
            contentDescription = "Start",
        )
    }
}
