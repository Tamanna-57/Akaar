import type { Capability } from "./capability.ts";
import { MediaRole, type ProductStatus } from "./enums.ts";
import { Money } from "./money.ts";
import type { Translatable } from "./translatable.ts";

export interface Media {
  id: string;
  role: MediaRole;
  storageKey: string;
  derivedFromId?: string;
  sellerApproved?: boolean;
  /** Must be labelled wherever it is shown, in both the seller and buyer UI. */
  isAiBackground?: boolean;
}

/**
 * Port of the `Product` data class in android/core/domain/.../Product.kt.
 *
 * What a buyer can see. There is no cost, floor, margin or confidence field
 * on this type at all - those live in {@link SellerPricing}, which is a
 * separate table with owner-only access, so the omission is structural
 * rather than a matter of remembering to strip it.
 */
export interface Product {
  id: string;
  sellerId: string;
  status: ProductStatus;
  title: Translatable;
  description?: Translatable;
  craftId: string | null;
  productType: string | null;
  materialIds?: string[];
  techniqueIds?: string[];
  colors?: string[];
  care?: Translatable;
  regionState: string | null;
  regionDistrict: string | null;
  capability: Capability | null;
  listedPrice: Money | null;
  negotiable?: boolean;
  stockQty?: number;
  reservedQty?: number;
  b2bEnabled?: boolean;
  media?: Media[];
}

export function availableQty(product: Product): number {
  return Math.max(0, (product.stockQty ?? 0) - (product.reservedQty ?? 0));
}

export function originalImage(product: Product): Media | undefined {
  return (product.media ?? []).find((m) => m.role === MediaRole.Original);
}

export function displayImage(product: Product): Media | undefined {
  return (product.media ?? []).find((m) => m.role === MediaRole.Enhanced) ?? originalImage(product);
}

/**
 * The publication invariants, mirrored from `publish_product()` so the UI
 * can show what is still missing before the round trip. The server remains
 * the authority; this is an affordance, not a check.
 */
export function missingForPublication(product: Product, hasPriceCorridor: boolean): string[] {
  const missing: string[] = [];
  if (!product.title.hi?.trim() || !product.title.en?.trim()) missing.push("title");
  if (product.craftId == null) missing.push("craft");
  if (product.listedPrice == null) missing.push("price");
  if (product.capability == null) missing.push("capability");
  if (product.regionState == null || product.regionDistrict == null) missing.push("region");
  if (originalImage(product) == null) missing.push("photo");
  if (!hasPriceCorridor) missing.push("price_corridor");
  return missing;
}

/**
 * Seller-only. The Fair Price Shield floor and the negotiation corridor.
 * Never fetched in a buyer session - the row is not readable by one.
 */
export interface SellerPricing {
  productId: string;
  materialsCost: Money;
  labourHours: number;
  labourRate: Money;
  packagingCost: Money;
  overheadCost: Money;
  shippingEstimate: Money;
  platformFeePct: number;
  minMarginPct: number;
  sustainableFloor: Money;
  d2cRecommended: Money | null;
  wholesaleMin: Money | null;
  wholesaleMax: Money | null;
  netEarningsEstimate: Money | null;
  confidence: number | null;
  explanation?: Translatable;
  preferredPrice: Money | null;
  minAcceptablePrice: Money | null;
}

/**
 * The invariant that reconciles the two source documents: the private
 * minimum may never fall below the computed floor. Enforced as a CHECK
 * constraint in the database; repeated here so the UI can refuse earlier and
 * explain why.
 */
export function isCorridorValid(pricing: SellerPricing): boolean {
  return pricing.minAcceptablePrice == null || pricing.minAcceptablePrice.atLeast(pricing.sustainableFloor);
}

export function clearsFloor(pricing: SellerPricing, amount: Money): boolean {
  return amount.atLeast(pricing.sustainableFloor);
}
