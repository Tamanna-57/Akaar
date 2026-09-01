package com.akaar.core.domain.model

/**
 * The capability block. Every field here appears in the matching contract
 * (docs/02-interdependence/shared-spine.md section 4), which is the test for
 * whether a field belongs in it: a field no buyer filters on is a field the
 * seller should not be asked to fill.
 *
 * Complete before publication, or the product is unmatchable and therefore
 * invisible rather than merely incomplete.
 */
data class Capability(
    val moq: Int,
    val capacityPerCycle: Int,
    val cycleDays: Int,
    val leadTimeDays: Int,
    val madeToOrder: Boolean = false,
    val customizationSupported: Boolean = false,
    val customizationTypes: List<String> = emptyList(),
) {
    /**
     * The quantity this seller can actually deliver by [daysAvailable], mirroring
     * the SQL in search_marketplace. Kept here so the client can explain a
     * result rather than only display it.
     */
    fun deliverableBy(daysAvailable: Int): Int {
        val productionDays = daysAvailable - leadTimeDays
        if (productionDays < 0 || cycleDays <= 0) return 0
        val cycles = maxOf(1, productionDays / cycleDays)
        return capacityPerCycle * cycles
    }

    fun canMeet(quantity: Int, daysAvailable: Int): Boolean =
        quantity >= moq && quantity <= deliverableBy(daysAvailable)
}

/** Text carried in both languages. The source is never overwritten by a translation. */
data class Translatable(
    val hi: String? = null,
    val en: String? = null,
    val sourceLang: String = "hi",
) {
    fun inLang(lang: String): String? = when (lang) { "hi" -> hi ?: en; else -> en ?: hi }
    val source: String? get() = if (sourceLang == "hi") hi else en
}

/**
 * What a buyer can see. There is no cost, floor, margin or confidence field on
 * this type at all - those live in [SellerPricing], which is a separate table
 * with owner-only access, so the omission is structural rather than a matter of
 * remembering to strip it.
 */
data class Product(
    val id: String,
    val sellerId: String,
    val status: ProductStatus,
    val title: Translatable,
    val description: Translatable = Translatable(),
    val craftId: String?,
    val productType: String?,
    val materialIds: List<String> = emptyList(),
    val techniqueIds: List<String> = emptyList(),
    val colors: List<String> = emptyList(),
    val care: Translatable = Translatable(),
    val regionState: String?,
    val regionDistrict: String?,
    val capability: Capability?,
    val listedPrice: Money?,
    val negotiable: Boolean = true,
    val stockQty: Int = 0,
    val reservedQty: Int = 0,
    val b2bEnabled: Boolean = false,
    val media: List<Media> = emptyList(),
) {
    val availableQty: Int get() = (stockQty - reservedQty).coerceAtLeast(0)
    val originalImage: Media? get() = media.firstOrNull { it.role == MediaRole.Original }
    val displayImage: Media? get() = media.firstOrNull { it.role == MediaRole.Enhanced } ?: originalImage

    /**
     * The publication invariants, mirrored from publish_product() so the UI can
     * show what is still missing before the round trip. The server remains the
     * authority; this is an affordance, not a check.
     */
    fun missingForPublication(hasPriceCorridor: Boolean): List<String> = buildList {
        if (title.hi.isNullOrBlank() || title.en.isNullOrBlank()) add("title")
        if (craftId == null) add("craft")
        if (listedPrice == null) add("price")
        if (capability == null) add("capability")
        if (regionState == null || regionDistrict == null) add("region")
        if (originalImage == null) add("photo")
        if (!hasPriceCorridor) add("price_corridor")
    }
}

data class Media(
    val id: String,
    val role: MediaRole,
    val storageKey: String,
    val derivedFromId: String? = null,
    val sellerApproved: Boolean = false,
    /** Must be labelled wherever it is shown, in both the seller and buyer UI. */
    val isAiBackground: Boolean = false,
)

/**
 * Seller-only. The Fair Price Shield floor and the negotiation corridor.
 * Never fetched in a buyer session - the row is not readable by one.
 */
data class SellerPricing(
    val productId: String,
    val materialsCost: Money,
    val labourHours: Double,
    val labourRate: Money,
    val packagingCost: Money,
    val overheadCost: Money,
    val shippingEstimate: Money,
    val platformFeePct: Double,
    val minMarginPct: Double,
    val sustainableFloor: Money,
    val d2cRecommended: Money?,
    val wholesaleMin: Money?,
    val wholesaleMax: Money?,
    val netEarningsEstimate: Money?,
    val confidence: Double?,
    val explanation: Translatable = Translatable(),
    val preferredPrice: Money?,
    val minAcceptablePrice: Money?,
) {
    /**
     * The invariant that reconciles the two source documents: the private
     * minimum may never fall below the computed floor. Enforced as a CHECK
     * constraint in the database; repeated here so the UI can refuse earlier
     * and explain why.
     */
    fun isCorridorValid(): Boolean =
        minAcceptablePrice == null || minAcceptablePrice >= sustainableFloor

    fun clearsFloor(amount: Money): Boolean = amount >= sustainableFloor
}
