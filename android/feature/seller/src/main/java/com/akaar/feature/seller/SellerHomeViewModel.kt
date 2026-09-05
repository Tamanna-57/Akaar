package com.akaar.feature.seller

import androidx.lifecycle.ViewModel
import com.akaar.core.domain.repository.ProfileRepository
import com.akaar.core.domain.repository.SessionRepository
import com.akaar.core.data.taxonomy.BundledTaxonomy
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import javax.inject.Inject

data class SellerHomeState(
    val name: String = "",
    val craftName: String = "",
    val district: String = "",
    val listedCount: Int = 0,
    val draftCount: Int = 0,
    /** Inquiries and stalled drafts. Empty is the honest state in round one. */
    val attention: List<String> = emptyList(),
)

@HiltViewModel
class SellerHomeViewModel @Inject constructor(
    profiles: ProfileRepository,
    session: SessionRepository,
) : ViewModel() {

    val state: Flow<SellerHomeState> = combine(
        profiles.artisan, session.currentUser,
    ) { artisan, user ->
        val lang = user?.preferredLang ?: "hi"
        SellerHomeState(
            name = artisan?.displayName.orEmpty(),
            craftName = artisan?.craftSlug
                ?.let { BundledTaxonomy.bySlug(it)?.name(lang) }
                .orEmpty(),
            district = artisan?.district.orEmpty(),
        )
    }
}
