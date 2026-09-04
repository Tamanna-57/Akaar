import type { AppResult, Stream } from "@akaar/core-common";
import type { Capability } from "./capability";
import type { AppRole, VerificationTier } from "./enums";
import { Money } from "./money";
import type { Offer, ProductSummary } from "./trade";
import type { Craft, TaxonomyTerm } from "./profiles";
import type { ArtisanProfile, UserProfile } from "./profiles";
import type { Product, SellerPricing } from "./product";

/**
 * Port of android/core/domain/.../Repositories.kt.
 *
 * Contracts live in this dependency-free package so use cases, screens, and
 * tests never import a concrete Supabase/SQLite client - implementations
 * sit in a future `@akaar/core-data` package, exactly as they sit in
 * `:core:data` on the Android side.
 */

export interface SessionRepository {
  readonly currentUser: Stream<UserProfile | null>;
  requestOtp(phone: string): Promise<AppResult<void>>;
  verifyOtp(phone: string, otp: string): Promise<AppResult<UserProfile>>;
  setActiveRole(role: AppRole): Promise<AppResult<void>>;
  setPreferredLanguage(lang: string): Promise<AppResult<void>>;
  signOut(): Promise<void>;
}

export interface TaxonomyRepository {
  /** Bundled for offline use and refreshed by version check; both roles read it. */
  crafts(parentId?: string): Promise<AppResult<Craft[]>>;
  craft(id: string): Promise<AppResult<Craft>>;
  materials(): Promise<AppResult<TaxonomyTerm[]>>;
  techniques(): Promise<AppResult<TaxonomyTerm[]>>;
}

/** Seller-side. Drafts are local-first; see docs/04-architecture/offline-strategy.md. */
export interface ProductRepository {
  myProducts(): Stream<Product[]>;
  product(id: string): Promise<AppResult<Product>>;
  createDraft(): Promise<AppResult<Product>>;
  update(product: Product): Promise<AppResult<Product>>;
  setCapability(productId: string, capability: Capability): Promise<AppResult<void>>;

  /** Returns the unmet invariants rather than a generic failure. */
  publish(productId: string): Promise<AppResult<PublishOutcome>>;
}

export type PublishOutcome =
  | { kind: "published" }
  | { kind: "sentForClusterReview" }
  | { kind: "incomplete"; missing: string[] };

/** Seller-only: no buyer session ever calls this. */
export interface PricingRepository {
  pricing(productId: string): Promise<AppResult<SellerPricing>>;
  saveInputs(productId: string, inputs: PriceInputs): Promise<AppResult<SellerPricing>>;
  setCorridor(
    productId: string,
    listed: Money,
    preferred: Money,
    minAcceptable: Money,
  ): Promise<AppResult<SellerPricing>>;
}

export interface PriceInputs {
  materialsCost: Money;
  labourHours: number;
  labourRate: Money;
  packagingCost?: Money;
  overheadCost?: Money;
  shippingEstimate?: Money;
}

export function priceInputDefaults(): Pick<
  PriceInputs,
  "packagingCost" | "overheadCost" | "shippingEstimate"
> {
  return { packagingCost: Money.Zero, overheadCost: Money.Zero, shippingEstimate: Money.Zero };
}

/** Buyer-side discovery. Filters mirror the matching contract exactly. */
export interface MarketplaceRepository {
  search(query: MarketplaceQuery): Promise<AppResult<ProductSummary[]>>;
  productDetail(id: string): Promise<AppResult<Product>>;
  artisan(id: string): Promise<AppResult<ArtisanProfile>>;
}

export interface MarketplaceQuery {
  text?: string;
  craftId?: string;
  materialIds?: string[];
  techniqueIds?: string[];
  state?: string;
  district?: string;
  quantity?: number;
  budgetPerUnit?: Money;
  deadline?: string;
  customizable?: boolean;
  negotiable?: boolean;
  b2bOnly?: boolean;
  minVerification?: VerificationTier;
  priceMin?: Money;
  priceMax?: Money;
  sort?: string;
  limit?: number;
  offset?: number;
}

export function marketplaceQueryDefaults(): Pick<MarketplaceQuery, "sort" | "limit" | "offset"> {
  return { sort: "relevance", limit: 20, offset: 0 };
}

/**
 * The shared workspace. Both roles call it; the server decides whose turn
 * it is, and the seller's minimum never crosses this boundary.
 */
export interface NegotiationRepository {
  myOffers(): Stream<Offer[]>;
  placeOffer(productId: string, amount: Money, quantity: number, note?: string): Promise<AppResult<Offer>>;
  sellerRespond(
    offerId: string,
    action: SellerOfferAction,
    counterAmount?: Money,
    note?: string,
    overrideReason?: string,
  ): Promise<AppResult<OfferResponse>>;
  buyerRespond(
    offerId: string,
    action: BuyerOfferAction,
    amount?: Money,
    note?: string,
  ): Promise<AppResult<OfferResponse>>;
}

export const SellerOfferAction = {
  Accept: "accept",
  Counter: "counter",
  Reject: "reject",
} as const;
export type SellerOfferAction = (typeof SellerOfferAction)[keyof typeof SellerOfferAction];

export const BuyerOfferAction = {
  Accept: "accept",
  Counter: "counter",
  Withdraw: "withdraw",
} as const;
export type BuyerOfferAction = (typeof BuyerOfferAction)[keyof typeof BuyerOfferAction];

export type OfferResponse =
  | { kind: "settled"; status: import("./enums").OfferStatus; orderId: string | null }
  /**
   * The seller tried to accept below their own sustainable floor. Not a
   * refusal - a deliberate confirmation step, with the number named so the
   * decision is informed.
   */
  | { kind: "belowFloor"; floor: Money; offered: Money; message: string };
