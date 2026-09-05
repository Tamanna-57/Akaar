import {
  type CustomRequestStatus,
  FeasibilityVerdict,
  isSettled,
  type OfferBand,
  type OfferStatus,
  type OrderStatus,
  type Party,
  type VerificationTier,
} from "./enums.ts";
import { Money } from "./money.ts";
import type { Translatable } from "./translatable.ts";

/**
 * Port of the `Offer` data class in android/core/domain/.../Trade.kt.
 *
 * A price negotiation on a listed product. Turn-based: only `awaiting` may
 * advance it, which removes every write-conflict class from the MVP.
 *
 * The buyer never sees the seller's minimum - only `band`, which is derived
 * from the public listed price.
 */
export interface Offer {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: OfferStatus;
  awaiting: Party;
  quantity: number;
  amount: Money;
  listedPriceAtOffer: Money;
  band: OfferBand;
  bandReason: string | null;
}

export function isMyTurn(offer: Offer, myRole: Party): boolean {
  return !isSettled(offer.status) && offer.awaiting === myRole;
}

export function offerTotal(offer: Offer): Money {
  return offer.amount.times(offer.quantity);
}

export interface CustomRequest {
  id: string;
  productId: string | null;
  buyerId: string;
  sellerId: string | null;
  status: CustomRequestStatus;
  awaiting: Party;
  quantity: number | null;
  budgetPerUnit: Money | null;
  deadline: string | null;
  deliveryState: string | null;
  sizeNote?: string;
  colorNote?: string;
  materialNote?: string;
  designNote?: string;
  sampleRequired?: boolean;
  /** Advisory only. Never an automatic delivery promise. */
  feasibility?: FeasibilityVerdict;
  feasibilityReason?: string;
}

export function customRequestDefaults(): Pick<CustomRequest, "sampleRequired" | "feasibility"> {
  return { sampleRequired: false, feasibility: FeasibilityVerdict.Unavailable };
}

/** Matching cannot run without these, so they gate leaving draft. */
export function isSubmittable(request: CustomRequest): boolean {
  return (
    request.quantity != null &&
    request.budgetPerUnit != null &&
    request.deadline != null &&
    request.deliveryState != null
  );
}

export interface Order {
  id: string;
  orderNo: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  status: OrderStatus;
  quantity: number;
  unitPrice: Money;
  expectedDeliveryDate: string | null;
}

export function orderTotal(order: Order): Money {
  return order.unitPrice.times(order.quantity);
}

/** A marketplace row. Buyer-facing, so it carries no private field. */
export interface ProductSummary {
  id: string;
  title: Translatable;
  listedPrice: Money | null;
  craftId: string | null;
  regionState: string | null;
  regionDistrict: string | null;
  moq: number | null;
  leadTimeDays: number | null;
  capacityPerCycle: number | null;
  negotiable: boolean;
  customizationSupported: boolean;
  b2bEnabled: boolean;
  sellerId: string;
  sellerName: string;
  verificationTier: VerificationTier;
  primaryMediaKey: string | null;
}

/**
 * Why this product matched, in words. Buyers are shown reasons, never
 * scores - a number invites argument about the number.
 */
export function matchReasons(
  summary: ProductSummary,
  quantity: number | null,
  daysAvailable: number | null,
): string[] {
  const reasons: string[] = [];
  if (quantity != null && summary.moq != null && summary.moq <= quantity) {
    reasons.push(`meets your ${quantity}-unit quantity`);
  }
  if (daysAvailable != null && summary.leadTimeDays != null && summary.leadTimeDays <= daysAvailable) {
    reasons.push(`ships in ${summary.leadTimeDays} days`);
  }
  if (summary.customizationSupported) reasons.push("accepts customisation");
  return reasons;
}
