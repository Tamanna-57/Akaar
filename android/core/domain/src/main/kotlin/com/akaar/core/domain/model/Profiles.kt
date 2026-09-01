package com.akaar.core.domain.model

data class UserProfile(
    val id: String,
    val fullName: String?,
    val preferredLang: String,
    val roles: List<AppRole>,
    val activeRole: AppRole?,
) {
    fun has(role: AppRole) = roles.contains(role)
    val needsRoleChoice: Boolean get() = activeRole == null && roles.size > 1
}

/** Buyer-visible. Exact address and legal name are not on this type by design. */
data class ArtisanProfile(
    val userId: String,
    val displayName: String,
    val state: String,
    val district: String,
    val languages: List<String>,
    val experienceYears: Int?,
    val story: Translatable = Translatable(),
    val clusterId: String?,
    val verificationTier: VerificationTier,
) {
    /** District granularity is the finest a buyer needs and the coarsest that stays useful. */
    val regionLabel: String get() = "$district, $state"
}

data class BuyerProfile(
    val userId: String,
    val orgName: String,
    val orgType: BuyerOrgType,
    val city: String?,
    val state: String?,
    val verificationTier: VerificationTier,
)

data class Craft(
    val id: String,
    val slug: String,
    val parentId: String?,
    val nameEn: String,
    val nameHi: String,
    val regions: List<String> = emptyList(),
    val care: Translatable = Translatable(),
) {
    fun name(lang: String) = if (lang == "hi") nameHi else nameEn
}

data class TaxonomyTerm(
    val id: String,
    val slug: String,
    val nameEn: String,
    val nameHi: String,
) {
    fun name(lang: String) = if (lang == "hi") nameHi else nameEn
}
