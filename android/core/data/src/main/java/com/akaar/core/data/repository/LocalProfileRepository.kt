package com.akaar.core.data.repository

import com.akaar.core.data.local.SessionStore
import com.akaar.core.domain.repository.ArtisanDraft
import com.akaar.core.domain.repository.BuyerDraft
import com.akaar.core.domain.repository.ProfileRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Profiles kept on the device.
 *
 * Local-first is the point, not a limitation: an artisan answering these
 * questions may have no signal, and losing her answers to a dropped connection
 * is how a first session becomes a last one. Phase 9 syncs these upward; the
 * local copy stays the one she edits.
 */
@Singleton
class LocalProfileRepository @Inject constructor(
    private val store: SessionStore,
) : ProfileRepository {

    override val artisan: Flow<ArtisanDraft?> = store.snapshot.map { s ->
        if (!s.sellerProfileComplete) null
        else ArtisanDraft(
            displayName = s.displayName.orEmpty(),
            state = s.state.orEmpty(),
            district = s.district.orEmpty(),
            craftSlug = s.craftSlug.orEmpty(),
            capacityPerWeek = s.capacityPerWeek ?: 0,
        )
    }

    override val buyer: Flow<BuyerDraft?> = store.snapshot.map { s ->
        if (!s.buyerProfileComplete) null
        else BuyerDraft(s.orgName.orEmpty(), s.orgType.orEmpty(), s.state.orEmpty())
    }

    override suspend fun saveArtisan(draft: ArtisanDraft): Result<Unit> {
        store.setArtisanProfile(
            draft.displayName, draft.state, draft.district,
            draft.craftSlug, draft.capacityPerWeek,
        )
        return Result.success(Unit)
    }

    override suspend fun saveBuyer(draft: BuyerDraft): Result<Unit> {
        store.setBuyerProfile(draft.orgName, draft.orgType, draft.state)
        return Result.success(Unit)
    }
}
