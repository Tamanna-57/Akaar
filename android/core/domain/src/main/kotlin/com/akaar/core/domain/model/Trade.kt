package com.akaar.core.domain.model

/**
 * A price negotiation on a listed product. Turn-based: only [awaiting] may
 * advance it, which removes every write-conflict class from the MVP.
 *
 * The buyer never sees the seller's minimum - only [band], which is derived
 * from the public listed price.
 */
data class Offer(
    val id: String,
    val productId: String,
    val buyerId: String,
    val sellerId: String,
    val status: OfferStatus,
    val awaiting: Party,
    val quantity: Int,
    val amount: Money,
    val listedPriceAtOffer: Money,
    val band: OfferBand,
    val bandReason: String?,
) {
    fun isMyTurn(myRole: Party): Boolean = !status.isSettled && awaiting == myRole
    val total: Money get() = amount * quantity
}

data class CustomRequest(
    val id: String,
    val productId: String?,
    val buyerId: String,
    val sellerId: String?,
    val status: CustomRequestStatus,
    val awaiting: Party,
    val quantity: Int?,
    val budgetPerUnit: Money?,
    val deadline: String?,
    val deliveryState: String?,
    val sizeNote: String? = null,
    val colorNote: String? = null,
    val materialNote: String? = null,
    val designNote: String? = null,
    val sampleRequired: Boolean = false,
    /** Advisory only. Never an automatic delivery promise. */
    val feasibility: FeasibilityVerdict = FeasibilityVerdict.Unavailable,
    val feasibilityReason: String? = null,
) {
    /** Matching cannot run without these, so they gate leaving draft. */
    val isSubmittable: Boolean
        get() = quantity != null && budgetPerUnit != null && deadline != null && deliveryState != null
}

data class Order(
    val id: String,
    val orderNo: String,
    val buyerId: String,
    val sellerId: String,
    val productId: String,
    val status: OrderStatus,
    val quantity: Int,
    val unitPrice: Money,
    val expectedDeliveryDate: String?,
) {
    val total: Money get() = unitPrice * quantity
}

/** A marketplace row. Buyer-facing, so it carries no private field. */
data class ProductSummary(
    val id: String,
    val title: Translatable,
    val listedPrice: Money?,
    val craftId: String?,
    val regionState: String?,
    val regionDistrict: String?,
    val moq: Int?,
    val leadTimeDays: Int?,
    val capacityPerCycle: Int?,
    val negotiable: Boolean,
    val customizationSupported: Boolean,
    val b2bEnabled: Boolean,
    val sellerId: String,
    val sellerName: String,
    val verificationTier: VerificationTier,
    val primaryMediaKey: String?,
) {
    /**
     * Why this product matched, in words. Buyers are shown reasons, never
     * scores - a number invites argument about the number.
     */
    fun matchReasons(quantity: Int?, daysAvailable: Int?): List<String> = buildList {
        if (quantity != null && moq != null && moq <= quantity) add("meets your $quantity-unit quantity")
        if (daysAvailable != null && leadTimeDays != null && leadTimeDays <= daysAvailable) {
            add("ships in $leadTimeDays days")
        }
        if (customizationSupported) add("accepts customisation")
    }
}
