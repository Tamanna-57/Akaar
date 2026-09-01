package com.akaar.core.domain.repository

import com.akaar.core.domain.model.*
import kotlinx.coroutines.flow.Flow

/**
 * Contracts live in the pure-Kotlin module so use cases and tests never depend
 * on Android or on Supabase. Implementations sit in :core:data.
 */

interface SessionRepository {
    val currentUser: Flow<UserProfile?>
    suspend fun requestOtp(phone: String): Result<Unit>
    suspend fun verifyOtp(phone: String, otp: String): Result<UserProfile>
    suspend fun setActiveRole(role: AppRole): Result<Unit>
    suspend fun setPreferredLanguage(lang: String): Result<Unit>
    suspend fun signOut()
}

interface TaxonomyRepository {
    /** Bundled for offline use and refreshed by version check; both roles read it. */
    suspend fun crafts(parentId: String? = null): Result<List<Craft>>
    suspend fun craft(id: String): Result<Craft>
    suspend fun materials(): Result<List<TaxonomyTerm>>
    suspend fun techniques(): Result<List<TaxonomyTerm>>
}

/** Seller-side. Drafts are local-first; see docs/04-architecture/offline-strategy.md. */
interface ProductRepository {
    fun myProducts(): Flow<List<Product>>
    suspend fun product(id: String): Result<Product>
    suspend fun createDraft(): Result<Product>
    suspend fun update(product: Product): Result<Product>
    suspend fun setCapability(productId: String, capability: Capability): Result<Unit>

    /** Returns the unmet invariants rather than a generic failure. */
    suspend fun publish(productId: String): Result<PublishOutcome>
}

sealed interface PublishOutcome {
    data object Published : PublishOutcome
    data object SentForClusterReview : PublishOutcome
    data class Incomplete(val missing: List<String>) : PublishOutcome
}

/** Seller-only: no buyer session ever calls this. */
interface PricingRepository {
    suspend fun pricing(productId: String): Result<SellerPricing>
    suspend fun saveInputs(productId: String, inputs: PriceInputs): Result<SellerPricing>
    suspend fun setCorridor(
        productId: String,
        listed: Money,
        preferred: Money,
        minAcceptable: Money,
    ): Result<SellerPricing>
}

data class PriceInputs(
    val materialsCost: Money,
    val labourHours: Double,
    val labourRate: Money,
    val packagingCost: Money = Money.Zero,
    val overheadCost: Money = Money.Zero,
    val shippingEstimate: Money = Money.Zero,
)

/** Buyer-side discovery. Filters mirror the matching contract exactly. */
interface MarketplaceRepository {
    suspend fun search(query: MarketplaceQuery): Result<List<ProductSummary>>
    suspend fun productDetail(id: String): Result<Product>
    suspend fun artisan(id: String): Result<ArtisanProfile>
}

data class MarketplaceQuery(
    val text: String? = null,
    val craftId: String? = null,
    val materialIds: List<String>? = null,
    val techniqueIds: List<String>? = null,
    val state: String? = null,
    val district: String? = null,
    val quantity: Int? = null,
    val budgetPerUnit: Money? = null,
    val deadline: String? = null,
    val customizable: Boolean? = null,
    val negotiable: Boolean? = null,
    val b2bOnly: Boolean? = null,
    val minVerification: VerificationTier? = null,
    val priceMin: Money? = null,
    val priceMax: Money? = null,
    val sort: String = "relevance",
    val limit: Int = 20,
    val offset: Int = 0,
)

/**
 * The shared workspace. Both roles call it; the server decides whose turn it is,
 * and the seller's minimum never crosses this boundary.
 */
interface NegotiationRepository {
    fun myOffers(): Flow<List<Offer>>
    suspend fun placeOffer(productId: String, amount: Money, quantity: Int, note: String?): Result<Offer>
    suspend fun sellerRespond(
        offerId: String,
        action: SellerOfferAction,
        counterAmount: Money? = null,
        note: String? = null,
        overrideReason: String? = null,
    ): Result<OfferResponse>
    suspend fun buyerRespond(
        offerId: String,
        action: BuyerOfferAction,
        amount: Money? = null,
        note: String? = null,
    ): Result<OfferResponse>
}

enum class SellerOfferAction { Accept, Counter, Reject }
enum class BuyerOfferAction { Accept, Counter, Withdraw }

sealed interface OfferResponse {
    data class Settled(val status: OfferStatus, val orderId: String?) : OfferResponse

    /**
     * The seller tried to accept below their own sustainable floor. Not a
     * refusal - a deliberate confirmation step, with the number named so the
     * decision is informed.
     */
    data class BelowFloor(val floor: Money, val offered: Money, val message: String) : OfferResponse
}
