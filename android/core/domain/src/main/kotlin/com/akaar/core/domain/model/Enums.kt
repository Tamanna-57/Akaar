package com.akaar.core.domain.model

/**
 * Mirrors of the database enums. Kept in a pure-Kotlin module so they can be
 * reviewed against supabase/migrations/001_foundations.sql side by side.
 *
 * [wire] is the exact Postgres label; never rename one without a migration.
 */
enum class AppRole(val wire: String) {
    Seller("seller"), Buyer("buyer"), ClusterManager("cluster_manager"), Admin("admin");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class ProductStatus(val wire: String) {
    Draft("draft"),
    VoiceCaptured("voice_captured"),
    Transcribed("transcribed"),
    Extracted("extracted"),
    NeedsInput("needs_input"),
    Priced("priced"),
    SellerReview("seller_review"),
    SellerApproved("seller_approved"),
    ClusterReview("cluster_review"),
    Published("published"),
    Paused("paused"),
    Archived("archived");

    /** The only status a buyer can ever see. */
    val isDiscoverable: Boolean get() = this == Published
    val isEditableDraft: Boolean get() = this in setOf(Draft, VoiceCaptured, Transcribed, Extracted, NeedsInput, Priced)
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class MediaRole(val wire: String) {
    /** Never deleted, never overwritten. The buyer is shown it beside the enhanced one. */
    Original("original"),
    Enhanced("enhanced"),
    Lifestyle("lifestyle");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class VerificationTier(val wire: String) {
    Unverified("unverified"), SelfDeclared("self"), Cluster("cluster"), Admin("admin");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class Party(val wire: String) {
    Buyer("buyer"), Seller("seller"), None("none");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class OfferStatus(val wire: String) {
    Pending("pending"), Countered("countered"), Accepted("accepted"),
    Rejected("rejected"), Withdrawn("withdrawn"), Expired("expired");
    val isSettled: Boolean get() = this in setOf(Accepted, Rejected, Withdrawn, Expired)
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

/**
 * Advisory band shown to the buyer. Computed from the public listed price only -
 * it never consults the seller's private minimum, so it cannot leak it even
 * indirectly.
 */
enum class OfferBand(val wire: String) {
    BelowTypical("below_typical"), Reasonable("reasonable"),
    Strong("strong"), Unavailable("unavailable");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class CustomRequestStatus(val wire: String) {
    Draft("draft"), Open("open"), SellerReview("seller_review"), Countered("countered"),
    Accepted("accepted"), Declined("declined"), Withdrawn("withdrawn"),
    Expired("expired"), Closed("closed");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class FeasibilityVerdict(val wire: String) {
    Possible("possible"), NeedsNegotiation("needs_negotiation"),
    Unlikely("unlikely"), Unavailable("unavailable");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class OrderStatus(val wire: String) {
    Created("created"), Confirmed("confirmed"), InProduction("in_production"),
    Ready("ready"), Shipped("shipped"), Delivered("delivered"), Cancelled("cancelled");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class ExtractionSource(val wire: String) {
    Voice("voice"), SellerInput("seller_input"),
    TaxonomyInference("taxonomy_inference"), Image("image");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class SellerAction(val wire: String) {
    Pending("pending"), Accepted("accepted"), Edited("edited"), Rejected("rejected");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class ProvenanceSource(val wire: String) {
    SellerProvided("seller_provided"), AdminVerified("admin_verified"),
    ExternalReference("external_reference");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}

enum class BuyerOrgType(val wire: String) {
    Boutique("boutique"), Exporter("exporter"), Retailer("retailer"),
    CorporateGifting("corporate_gifting"), Individual("individual"), Other("other");
    companion object { fun from(w: String) = entries.first { it.wire == w } }
}
