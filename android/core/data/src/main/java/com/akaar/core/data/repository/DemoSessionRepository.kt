package com.akaar.core.data.repository

import com.akaar.core.data.local.SessionStore
import com.akaar.core.domain.model.AppRole
import com.akaar.core.domain.model.UserProfile
import com.akaar.core.domain.repository.SessionRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Sign-in for round one.
 *
 * No OTP is sent and no code is checked: any six digits are accepted, and the
 * session is stored on the device. This exists so the whole journey can be
 * demonstrated end to end without SMS infrastructure, and it is deliberately a
 * separate class rather than a flag inside the real one - phase 9 adds a
 * Supabase-backed implementation beside it and changes the binding, so nothing
 * here can survive into production by accident.
 *
 * The screens above it are the real screens. Only this is stubbed.
 */
@Singleton
class DemoSessionRepository @Inject constructor(
    private val store: SessionStore,
) : SessionRepository {

    override val currentUser: Flow<UserProfile?> = store.snapshot.map { s ->
        if (!s.isSignedIn) null
        else UserProfile(
            id = DEMO_USER_ID,
            fullName = s.displayName,
            preferredLang = s.preferredLang,
            roles = s.roles.mapNotNull { r -> runCatching { AppRole.from(r) }.getOrNull() },
            activeRole = s.activeRole?.let { r -> runCatching { AppRole.from(r) }.getOrNull() },
        )
    }

    override suspend fun requestOtp(phone: String): Result<Unit> {
        if (phone.filter(Char::isDigit).length != 10) {
            return Result.failure(IllegalArgumentException("Enter a 10 digit mobile number"))
        }
        store.setPhone(phone)
        return Result.success(Unit)
    }

    override suspend fun verifyOtp(phone: String, otp: String): Result<UserProfile> {
        // Demo mode: shape is validated, the value is not.
        if (otp.filter(Char::isDigit).length != OTP_LENGTH) {
            return Result.failure(IllegalArgumentException("Enter the $OTP_LENGTH digit code"))
        }
        store.setPhone(phone)
        return Result.success(
            UserProfile(
                id = DEMO_USER_ID, fullName = null,
                preferredLang = "hi", roles = emptyList(), activeRole = null,
            )
        )
    }

    override suspend fun setActiveRole(role: AppRole): Result<Unit> {
        store.setRole(role.wire); return Result.success(Unit)
    }

    override suspend fun setPreferredLanguage(lang: String): Result<Unit> {
        store.setLanguage(lang); return Result.success(Unit)
    }

    override suspend fun signOut() {
        store.clear()
    }

    companion object {
        const val OTP_LENGTH = 6
        const val DEMO_USER_ID = "demo-artisan"
    }
}
