/**
 * Port of android/core/domain/.../Enums.kt.
 *
 * Mirrors of the database enums. Kept in a dependency-free module so they
 * can be reviewed against supabase/migrations/*.sql side by side.
 *
 * `wire` is the exact Postgres label; never rename one without a migration.
 * Kotlin's `enum class X(val wire: String)` becomes a plain union of string
 * literal values here - the literal *is* the wire value, so there is no
 * separate `.wire` field to keep in sync.
 */

export const AppRole = {
  Seller: "seller",
  Buyer: "buyer",
  ClusterManager: "cluster_manager",
  Admin: "admin",
} as const;
export type AppRole = (typeof AppRole)[keyof typeof AppRole];

export const ProductStatus = {
  Draft: "draft",
  VoiceCaptured: "voice_captured",
  Transcribed: "transcribed",
  Extracted: "extracted",
  NeedsInput: "needs_input",
  Priced: "priced",
  SellerReview: "seller_review",
  SellerApproved: "seller_approved",
  ClusterReview: "cluster_review",
  Published: "published",
  Paused: "paused",
  Archived: "archived",
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];

/** The only status a buyer can ever see. */
export function isDiscoverable(status: ProductStatus): boolean {
  return status === ProductStatus.Published;
}

export function isEditableDraft(status: ProductStatus): boolean {
  return (
    [
      ProductStatus.Draft,
      ProductStatus.VoiceCaptured,
      ProductStatus.Transcribed,
      ProductStatus.Extracted,
      ProductStatus.NeedsInput,
      ProductStatus.Priced,
    ] as ProductStatus[]
  ).includes(status);
}

export const MediaRole = {
  /** Never deleted, never overwritten. The buyer is shown it beside the enhanced one. */
  Original: "original",
  Enhanced: "enhanced",
  Lifestyle: "lifestyle",
} as const;
export type MediaRole = (typeof MediaRole)[keyof typeof MediaRole];

export const VerificationTier = {
  Unverified: "unverified",
  SelfDeclared: "self",
  Cluster: "cluster",
  Admin: "admin",
} as const;
export type VerificationTier = (typeof VerificationTier)[keyof typeof VerificationTier];

export const Party = {
  Buyer: "buyer",
  Seller: "seller",
  None: "none",
} as const;
export type Party = (typeof Party)[keyof typeof Party];

export const OfferStatus = {
  Pending: "pending",
  Countered: "countered",
  Accepted: "accepted",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
  Expired: "expired",
} as const;
export type OfferStatus = (typeof OfferStatus)[keyof typeof OfferStatus];

export function isSettled(status: OfferStatus): boolean {
  return (
    [
      OfferStatus.Accepted,
      OfferStatus.Rejected,
      OfferStatus.Withdrawn,
      OfferStatus.Expired,
    ] as OfferStatus[]
  ).includes(status);
}

/**
 * Advisory band shown to the buyer. Computed from the public listed price
 * only - it never consults the seller's private minimum, so it cannot leak
 * it even indirectly.
 */
export const OfferBand = {
  BelowTypical: "below_typical",
  Reasonable: "reasonable",
  Strong: "strong",
  Unavailable: "unavailable",
} as const;
export type OfferBand = (typeof OfferBand)[keyof typeof OfferBand];

export const CustomRequestStatus = {
  Draft: "draft",
  Open: "open",
  SellerReview: "seller_review",
  Countered: "countered",
  Accepted: "accepted",
  Declined: "declined",
  Withdrawn: "withdrawn",
  Expired: "expired",
  Closed: "closed",
} as const;
export type CustomRequestStatus = (typeof CustomRequestStatus)[keyof typeof CustomRequestStatus];

export const FeasibilityVerdict = {
  Possible: "possible",
  NeedsNegotiation: "needs_negotiation",
  Unlikely: "unlikely",
  Unavailable: "unavailable",
} as const;
export type FeasibilityVerdict = (typeof FeasibilityVerdict)[keyof typeof FeasibilityVerdict];

export const OrderStatus = {
  Created: "created",
  Confirmed: "confirmed",
  InProduction: "in_production",
  Ready: "ready",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ExtractionSource = {
  Voice: "voice",
  SellerInput: "seller_input",
  TaxonomyInference: "taxonomy_inference",
  Image: "image",
} as const;
export type ExtractionSource = (typeof ExtractionSource)[keyof typeof ExtractionSource];

export const SellerAction = {
  Pending: "pending",
  Accepted: "accepted",
  Edited: "edited",
  Rejected: "rejected",
} as const;
export type SellerAction = (typeof SellerAction)[keyof typeof SellerAction];

export const ProvenanceSource = {
  SellerProvided: "seller_provided",
  AdminVerified: "admin_verified",
  ExternalReference: "external_reference",
} as const;
export type ProvenanceSource = (typeof ProvenanceSource)[keyof typeof ProvenanceSource];

export const BuyerOrgType = {
  Boutique: "boutique",
  Exporter: "exporter",
  Retailer: "retailer",
  CorporateGifting: "corporate_gifting",
  Individual: "individual",
  Other: "other",
} as const;
export type BuyerOrgType = (typeof BuyerOrgType)[keyof typeof BuyerOrgType];
