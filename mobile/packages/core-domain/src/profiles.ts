import type { AppRole, BuyerOrgType, VerificationTier } from "./enums";
import type { Translatable } from "./translatable";

export interface UserProfile {
  id: string;
  fullName?: string;
  preferredLang: string;
  roles: AppRole[];
  activeRole: AppRole | null;
}

export function has(profile: UserProfile, role: AppRole): boolean {
  return profile.roles.includes(role);
}

export function needsRoleChoice(profile: UserProfile): boolean {
  return profile.activeRole == null && profile.roles.length > 1;
}

/** Buyer-visible. Exact address and legal name are not on this type by design. */
export interface ArtisanProfile {
  userId: string;
  displayName: string;
  state: string;
  district: string;
  languages: string[];
  experienceYears: number | null;
  story?: Translatable;
  clusterId: string | null;
  verificationTier: VerificationTier;
}

/** District granularity is the finest a buyer needs and the coarsest that stays useful. */
export function regionLabel(profile: ArtisanProfile): string {
  return `${profile.district}, ${profile.state}`;
}

export interface BuyerProfile {
  userId: string;
  orgName: string;
  orgType: BuyerOrgType;
  city: string | null;
  state: string | null;
  verificationTier: VerificationTier;
}

export interface Craft {
  id: string;
  slug: string;
  parentId: string | null;
  nameEn: string;
  nameHi: string;
  regions?: string[];
  care?: Translatable;
}

export function craftName(craft: Craft, lang: string): string {
  return lang === "hi" ? craft.nameHi : craft.nameEn;
}

export interface TaxonomyTerm {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
}

export function taxonomyTermName(term: TaxonomyTerm, lang: string): string {
  return lang === "hi" ? term.nameHi : term.nameEn;
}
