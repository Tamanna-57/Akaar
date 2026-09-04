/**
 * Port of the `Capability` data class in android/core/domain/.../Product.kt.
 *
 * Every field here appears in the matching contract
 * (docs/02-interdependence/shared-spine.md section 4), which is the test for
 * whether a field belongs in it: a field no buyer filters on is a field the
 * seller should not be asked to fill.
 *
 * Complete before publication, or the product is unmatchable and therefore
 * invisible rather than merely incomplete.
 */
export interface Capability {
  moq: number;
  capacityPerCycle: number;
  cycleDays: number;
  leadTimeDays: number;
  madeToOrder?: boolean;
  customizationSupported?: boolean;
  customizationTypes?: string[];
}

/**
 * The quantity this seller can actually deliver by `daysAvailable`, mirroring
 * the SQL in search_marketplace. Kept here so the client can explain a
 * result rather than only display it.
 */
export function deliverableBy(capability: Capability, daysAvailable: number): number {
  const productionDays = daysAvailable - capability.leadTimeDays;
  if (productionDays < 0 || capability.cycleDays <= 0) return 0;
  const cycles = Math.max(1, Math.floor(productionDays / capability.cycleDays));
  return capability.capacityPerCycle * cycles;
}

export function canMeet(capability: Capability, quantity: number, daysAvailable: number): boolean {
  return quantity >= capability.moq && quantity <= deliverableBy(capability, daysAvailable);
}
