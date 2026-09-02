package com.akaar.core.data.local

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore("akaar_session")

/**
 * Local session state: chosen language, active role, and the artisan's profile
 * answers.
 *
 * Local-first by design - the artisan's own answers are hers and must survive
 * a dead network, per the offline strategy. Nothing secret is kept here; access
 * tokens go to Keystore-backed storage when real authentication lands.
 */
@Singleton
class SessionStore @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val lang = stringPreferencesKey("preferred_lang")
        val activeRole = stringPreferencesKey("active_role")
        val roles = stringSetPreferencesKey("roles")
        val phone = stringPreferencesKey("phone")
        val displayName = stringPreferencesKey("display_name")
        val state = stringPreferencesKey("state")
        val district = stringPreferencesKey("district")
        val craft = stringPreferencesKey("craft_slug")
        val capacity = stringPreferencesKey("capacity_per_week")
        val orgName = stringPreferencesKey("org_name")
        val orgType = stringPreferencesKey("org_type")
    }

    val snapshot: Flow<SessionSnapshot> = context.dataStore.data.map { p ->
        SessionSnapshot(
            preferredLang = p[Keys.lang] ?: "hi",
            activeRole = p[Keys.activeRole],
            roles = p[Keys.roles] ?: emptySet(),
            phone = p[Keys.phone],
            displayName = p[Keys.displayName],
            state = p[Keys.state],
            district = p[Keys.district],
            craftSlug = p[Keys.craft],
            capacityPerWeek = p[Keys.capacity]?.toIntOrNull(),
            orgName = p[Keys.orgName],
            orgType = p[Keys.orgType],
        )
    }

    suspend fun setLanguage(lang: String) = edit { it[Keys.lang] = lang }

    suspend fun setRole(role: String) = edit {
        it[Keys.activeRole] = role
        it[Keys.roles] = (it[Keys.roles] ?: emptySet()) + role
    }

    suspend fun setPhone(phone: String) = edit { it[Keys.phone] = phone }

    suspend fun setArtisanProfile(
        name: String, state: String, district: String, craftSlug: String, capacityPerWeek: Int,
    ) = edit {
        it[Keys.displayName] = name
        it[Keys.state] = state
        it[Keys.district] = district
        it[Keys.craft] = craftSlug
        it[Keys.capacity] = capacityPerWeek.toString()
    }

    suspend fun setBuyerProfile(orgName: String, orgType: String, state: String) = edit {
        it[Keys.orgName] = orgName
        it[Keys.orgType] = orgType
        it[Keys.state] = state
    }

    suspend fun clear() {
        context.dataStore.edit { it.clear() }
    }

    private suspend fun edit(block: (androidx.datastore.preferences.core.MutablePreferences) -> Unit) {
        context.dataStore.edit(block)
    }
}

data class SessionSnapshot(
    val preferredLang: String,
    val activeRole: String?,
    val roles: Set<String>,
    val phone: String?,
    val displayName: String?,
    val state: String?,
    val district: String?,
    val craftSlug: String?,
    val capacityPerWeek: Int?,
    val orgName: String?,
    val orgType: String?,
) {
    val isSignedIn: Boolean get() = phone != null && activeRole != null
    val sellerProfileComplete: Boolean
        get() = displayName != null && state != null && district != null && craftSlug != null
    val buyerProfileComplete: Boolean get() = orgName != null && state != null
}
