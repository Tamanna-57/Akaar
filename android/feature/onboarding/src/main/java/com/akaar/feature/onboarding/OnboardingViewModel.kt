package com.akaar.feature.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.akaar.core.data.taxonomy.BundledTaxonomy
import com.akaar.core.domain.repository.ArtisanDraft
import com.akaar.core.domain.repository.BuyerDraft
import com.akaar.core.domain.repository.ProfileRepository
import com.akaar.core.domain.model.AppRole
import com.akaar.core.domain.model.Craft
import com.akaar.core.domain.repository.SessionRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** A language the app ships UI strings for, named in its own script. */
data class LanguageOption(val code: String, val endonym: String, val english: String)

val SupportedLanguages = listOf(
    LanguageOption("hi", "हिन्दी", "Hindi"),
    LanguageOption("en", "English", "English"),
)

data class OnboardingState(
    val lang: String = "hi",
    val role: AppRole? = null,
    val phone: String = "",
    val otp: String = "",
    val error: String? = null,
    val working: Boolean = false,
    // seller profile
    val name: String = "",
    val state: String = "",
    val district: String = "",
    val craftSlug: String? = null,
    val craftQuery: String = "",
    val capacityPerWeek: Int = 6,
    // buyer profile
    val orgName: String = "",
    val orgType: String = "boutique",
) {
    val phoneValid: Boolean get() = phone.filter(Char::isDigit).length == 10
    val otpValid: Boolean get() = otp.filter(Char::isDigit).length == 6
    val craftResults: List<Craft> get() = BundledTaxonomy.search(craftQuery, lang)
}

@HiltViewModel
class OnboardingViewModel @Inject constructor(
    private val session: SessionRepository,
    private val profiles: ProfileRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(OnboardingState())
    val state: StateFlow<OnboardingState> = _state.asStateFlow()

    fun setLanguage(code: String) {
        _state.update { it.copy(lang = code) }
        viewModelScope.launch { session.setPreferredLanguage(code) }
    }

    fun setRole(role: AppRole) {
        _state.update { it.copy(role = role) }
        viewModelScope.launch { session.setActiveRole(role) }
    }

    fun setPhone(v: String) = _state.update { it.copy(phone = v.filter(Char::isDigit).take(10), error = null) }
    fun setOtp(v: String) = _state.update { it.copy(otp = v.filter(Char::isDigit).take(6), error = null) }

    fun sendCode(onSent: () -> Unit) {
        val s = _state.value
        viewModelScope.launch {
            _state.update { it.copy(working = true) }
            session.requestOtp(s.phone)
                .onSuccess { _state.update { it.copy(working = false) }; onSent() }
                .onFailure { e -> _state.update { it.copy(working = false, error = e.message) } }
        }
    }

    fun verify(onVerified: () -> Unit) {
        val s = _state.value
        viewModelScope.launch {
            _state.update { it.copy(working = true) }
            session.verifyOtp(s.phone, s.otp)
                .onSuccess { _state.update { it.copy(working = false) }; onVerified() }
                .onFailure { e -> _state.update { it.copy(working = false, error = e.message) } }
        }
    }

    fun setName(v: String) = _state.update { it.copy(name = v) }
    fun setState(v: String) = _state.update { it.copy(state = v) }
    fun setDistrict(v: String) = _state.update { it.copy(district = v) }
    fun setCraft(slug: String) = _state.update { it.copy(craftSlug = slug) }
    fun setCraftQuery(v: String) = _state.update { it.copy(craftQuery = v) }
    fun setCapacity(v: Int) = _state.update { it.copy(capacityPerWeek = v.coerceIn(1, 200)) }
    fun setOrgName(v: String) = _state.update { it.copy(orgName = v) }
    fun setOrgType(v: String) = _state.update { it.copy(orgType = v) }

    fun finishSellerProfile(onDone: () -> Unit) {
        val s = _state.value
        viewModelScope.launch {
            profiles.saveArtisan(
                ArtisanDraft(
                    displayName = s.name.trim(),
                    state = s.state,
                    district = s.district.trim(),
                    craftSlug = s.craftSlug.orEmpty(),
                    capacityPerWeek = s.capacityPerWeek,
                )
            )
            onDone()
        }
    }

    fun finishBuyerProfile(onDone: () -> Unit) {
        val s = _state.value
        viewModelScope.launch {
            profiles.saveBuyer(BuyerDraft(s.orgName.trim(), s.orgType, s.state))
            onDone()
        }
    }
}
