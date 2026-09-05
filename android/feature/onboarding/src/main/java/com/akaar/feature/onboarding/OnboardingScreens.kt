package com.akaar.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import com.akaar.core.designsystem.component.AkaarSecondaryButton
import com.akaar.core.designsystem.component.AkaarTextField
import com.akaar.core.designsystem.component.ChoiceCard
import com.akaar.core.designsystem.component.QuestionScaffold
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.core.designsystem.theme.AkaarType
import com.akaar.core.designsystem.theme.Space
import com.akaar.core.domain.model.AppRole

/**
 * Onboarding, one question per screen.
 *
 * The order matters: language comes before anything else, because the choice
 * decides what the user can read on every screen after it. Role comes next,
 * because it decides which questions are worth asking at all.
 */

@Composable
fun LanguageScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_language_question),
        helper = stringResource(R.string.ob_language_helper),
        primaryLabel = stringResource(R.string.ob_continue),
        onPrimary = onNext,
    ) {
        SupportedLanguages.forEach { option ->
            ChoiceCard(
                // Named in its own script: on this screen that is the only text
                // the user can be assumed to read.
                title = option.endonym,
                supporting = option.english.takeIf { it != option.endonym },
                selected = state.lang == option.code,
                onClick = { vm.setLanguage(option.code) },
            )
        }
    }
}

@Composable
fun RoleScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_role_question),
        onBack = onBack,
        primaryLabel = stringResource(R.string.ob_continue),
        primaryEnabled = state.role != null,
        onPrimary = onNext,
    ) {
        ChoiceCard(
            title = stringResource(R.string.ob_role_seller),
            supporting = stringResource(R.string.ob_role_seller_sub),
            selected = state.role == AppRole.Seller,
            onClick = { vm.setRole(AppRole.Seller) },
        )
        ChoiceCard(
            title = stringResource(R.string.ob_role_buyer),
            supporting = stringResource(R.string.ob_role_buyer_sub),
            selected = state.role == AppRole.Buyer,
            onClick = { vm.setRole(AppRole.Buyer) },
        )
    }
}

@Composable
fun PhoneScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_phone_question),
        helper = stringResource(R.string.ob_phone_helper),
        step = 1, totalSteps = 2,
        onBack = onBack,
        primaryLabel = stringResource(R.string.ob_send_code),
        primaryEnabled = state.phoneValid && !state.working,
        onPrimary = { vm.sendCode(onNext) },
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_phone_label),
            value = state.phone,
            onValueChange = vm::setPhone,
            keyboardType = KeyboardType.Phone,
            imeAction = ImeAction.Done,
            error = state.error,
        )
    }
}

@Composable
fun OtpScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_otp_question),
        helper = state.phone.takeIf { it.isNotBlank() }?.let { "+91 $it" },
        step = 2, totalSteps = 2,
        onBack = onBack,
        primaryLabel = stringResource(R.string.ob_verify),
        primaryEnabled = state.otpValid && !state.working,
        onPrimary = { vm.verify(onNext) },
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_otp_label),
            value = state.otp,
            onValueChange = vm::setOtp,
            keyboardType = KeyboardType.NumberPassword,
            imeAction = ImeAction.Done,
            error = state.error,
        )
        // Stated plainly rather than hidden: no code is sent in round one, and
        // a demo that pretends otherwise is the kind of claim this project avoids.
        Text(
            stringResource(R.string.ob_otp_demo),
            style = AkaarType.caption,
            color = AkaarTheme.colors.warning,
        )
    }
}

// ---------------------------------------------------------------- seller profile

@Composable
fun NameScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_name_question),
        step = 1, totalSteps = 4, onBack = onBack,
        primaryLabel = stringResource(R.string.ob_continue),
        primaryEnabled = state.name.isNotBlank(),
        onPrimary = onNext,
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_name_label),
            value = state.name,
            onValueChange = vm::setName,
            // Voice is the expected path here; typing is the fallback.
            onVoiceInput = {},
        )
    }
}

@Composable
fun StateScreen(
    state: OnboardingState, vm: OnboardingViewModel,
    states: List<String>, onNext: () -> Unit, onBack: () -> Unit,
) {
    QuestionScaffold(
        question = stringResource(R.string.ob_state_question),
        step = 2, totalSteps = 4, onBack = onBack,
        primaryLabel = stringResource(R.string.ob_continue),
        primaryEnabled = state.state.isNotBlank(),
        onPrimary = onNext,
    ) {
        LazyColumn(verticalArrangement = Arrangement.spacedBy(Space.sm)) {
            items(states) { s ->
                ChoiceCard(title = s, selected = state.state == s, onClick = { vm.setState(s) })
            }
        }
    }
}

@Composable
fun DistrictScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_district_question),
        // District is the finest granularity a buyer ever sees, and the coarsest
        // that stays useful to one. Nothing more precise is collected.
        helper = state.state.takeIf { it.isNotBlank() },
        step = 3, totalSteps = 4, onBack = onBack,
        primaryLabel = stringResource(R.string.ob_continue),
        primaryEnabled = state.district.isNotBlank(),
        onPrimary = onNext,
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_district_label),
            value = state.district,
            onValueChange = vm::setDistrict,
            onVoiceInput = {},
        )
    }
}

@Composable
fun CraftScreen(state: OnboardingState, vm: OnboardingViewModel, onNext: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        question = stringResource(R.string.ob_craft_question),
        step = 4, totalSteps = 4, onBack = onBack,
        primaryLabel = stringResource(R.string.ob_continue),
        primaryEnabled = state.craftSlug != null,
        onPrimary = onNext,
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_craft_search),
            value = state.craftQuery,
            onValueChange = vm::setCraftQuery,
            onVoiceInput = {},
        )
        LazyColumn(verticalArrangement = Arrangement.spacedBy(Space.sm)) {
            items(state.craftResults) { craft ->
                ChoiceCard(
                    title = craft.name(state.lang),
                    supporting = craft.regions.joinToString().takeIf { it.isNotBlank() },
                    selected = state.craftSlug == craft.slug,
                    onClick = { vm.setCraft(craft.slug) },
                )
            }
        }
    }
}

@Composable
fun CapacityScreen(state: OnboardingState, vm: OnboardingViewModel, onDone: () -> Unit, onBack: () -> Unit) {
    QuestionScaffold(
        // Framed as "how many can you make", not as inventory management.
        question = stringResource(R.string.ob_capacity_question),
        helper = stringResource(R.string.ob_capacity_helper),
        onBack = onBack,
        primaryLabel = stringResource(R.string.ob_finish),
        onPrimary = { vm.finishSellerProfile(onDone) },
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(Space.md),
        ) {
            AkaarSecondaryButton("−", { vm.setCapacity(state.capacityPerWeek - 1) }, Modifier.weight(1f), sellerFlow = true)
            Text(
                state.capacityPerWeek.toString(),
                style = AkaarType.display,
                color = AkaarTheme.colors.textPrimary,
                modifier = Modifier.padding(horizontal = Space.lg),
            )
            AkaarSecondaryButton("+", { vm.setCapacity(state.capacityPerWeek + 1) }, Modifier.weight(1f), sellerFlow = true)
        }
    }
}

// ---------------------------------------------------------------- buyer profile

@Composable
fun BuyerProfileScreen(state: OnboardingState, vm: OnboardingViewModel, onDone: () -> Unit, onBack: () -> Unit) {
    val types = listOf(
        "boutique" to R.string.ob_type_boutique,
        "exporter" to R.string.ob_type_exporter,
        "retailer" to R.string.ob_type_retailer,
        "corporate_gifting" to R.string.ob_type_gifting,
        "individual" to R.string.ob_type_individual,
    )
    QuestionScaffold(
        question = stringResource(R.string.ob_buyer_org_question),
        onBack = onBack,
        primaryLabel = stringResource(R.string.ob_finish),
        primaryEnabled = state.orgName.isNotBlank(),
        onPrimary = { vm.finishBuyerProfile(onDone) },
    ) {
        AkaarTextField(
            label = stringResource(R.string.ob_buyer_org_label),
            value = state.orgName,
            onValueChange = vm::setOrgName,
        )
        Text(
            stringResource(R.string.ob_buyer_type_question),
            style = AkaarType.label,
            color = AkaarTheme.colors.textPrimary,
            modifier = Modifier.padding(top = Space.md),
        )
        Column(verticalArrangement = Arrangement.spacedBy(Space.sm)) {
            types.forEach { (value, label) ->
                ChoiceCard(
                    title = stringResource(label),
                    selected = state.orgType == value,
                    onClick = { vm.setOrgType(value) },
                )
            }
        }
    }
}
