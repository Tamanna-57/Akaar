package com.akaar.feature.onboarding

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class OnboardingStateTest {

    @Test fun `phone is valid only at ten digits`() {
        assertFalse(OnboardingState(phone = "98765").phoneValid)
        assertTrue(OnboardingState(phone = "9876543210").phoneValid)
    }

    @Test fun `otp is valid only at six digits`() {
        assertFalse(OnboardingState(otp = "123").otpValid)
        assertTrue(OnboardingState(otp = "123456").otpValid)
    }

    @Test fun `hindi is the default language`() {
        // The seller journey is the one this app exists for, so Hindi leads.
        assertEquals("hi", OnboardingState().lang)
    }

    @Test fun `craft results narrow as the query is typed`() {
        val all = OnboardingState().craftResults.size
        val narrowed = OnboardingState(craftQuery = "pottery").craftResults
        assertTrue(narrowed.isNotEmpty())
        assertTrue(narrowed.size < all)
    }

    @Test fun `supported languages are named in their own script`() {
        val hindi = SupportedLanguages.first { it.code == "hi" }
        assertTrue(hindi.endonym.any { it.code in 0x0900..0x097F })
    }
}
