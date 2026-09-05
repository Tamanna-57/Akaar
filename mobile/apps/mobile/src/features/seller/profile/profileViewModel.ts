import type { ArtisanProfile, Capability, VerificationTier } from "@akaar/core-domain";
import { deliverableBy, regionLabel } from "@akaar/core-domain";

/**
 * Everything the profile screen decides, kept out of the screen itself.
 *
 * The screen then only arranges what this returns. That split is what makes
 * the wording testable - and on this screen the wording *is* the product:
 * "kaam mila" versus "verified artisan" is the difference between a woman
 * understanding her own standing and not.
 */

export interface VerificationDisplay {
  label: string;
  /** What it actually means, in words she can act on. */
  meaning: string;
  tone: "neutral" | "accent" | "success";
  /** True when there is a next step she can take to improve it. */
  canImprove: boolean;
}

/**
 * Verification is described by what a buyer sees, not by an internal tier
 * name. "self" means nothing to anyone; "you filled this in yourself" does.
 */
export function verificationDisplay(tier: VerificationTier): VerificationDisplay {
  switch (tier) {
    case "unverified":
      return {
        label: "Not verified yet",
        meaning: "Buyers see your listings, but with no verification mark.",
        tone: "neutral",
        canImprove: true,
      };
    case "self":
      return {
        label: "Your own details",
        meaning: "The details here are the ones you gave us.",
        tone: "neutral",
        canImprove: true,
      };
    case "cluster":
      return {
        label: "Checked by your cluster",
        meaning: "Someone from your cooperative confirmed these details.",
        tone: "accent",
        canImprove: true,
      };
    case "admin":
      return {
        label: "Verified by Akaar",
        meaning: "Akaar has confirmed these details.",
        tone: "success",
        canImprove: false,
      };
  }
}

/**
 * Capacity in the seller's own terms.
 *
 * seller-journey.md frames this block as "how many and how fast", not as
 * inventory management - so it is written as a sentence about her week, not
 * as four numbers with database labels.
 */
export function capacitySummary(capability: Capability | null): {
  headline: string;
  detail: string;
  /** Missing capacity makes her invisible to matching - say so plainly. */
  isBlocking: boolean;
} {
  if (capability == null) {
    return {
      headline: "Not filled in yet",
      // The consequence, stated once, without alarm.
      detail: "Buyers searching for your craft cannot find you until this is filled in.",
      isBlocking: true,
    };
  }

  const perCycle = capability.capacityPerCycle;
  const cycleDays = capability.cycleDays;
  const lead = capability.leadTimeDays;

  return {
    headline: `${perCycle} in ${cycleDays} days`,
    detail: `Smallest order ${capability.moq}. Ready to send after about ${lead} days.`,
    isBlocking: false,
  };
}

/**
 * A concrete answer to the question a buyer actually asks, and the one she
 * is most often asked on the phone: "how many can you do by then?"
 */
export function deliverableInDays(capability: Capability | null, days: number): string {
  if (capability == null) return "Not filled in yet";
  const quantity = deliverableBy(capability, days);
  if (quantity <= 0) return `Not enough time in ${days} days`;
  return `About ${quantity} in ${days} days`;
}

export interface ProfileHeader {
  displayName: string;
  region: string;
  /** Years of experience, phrased, or null when she has not said. */
  experience: string | null;
  languages: string;
  verification: VerificationDisplay;
}

export function profileHeader(profile: ArtisanProfile): ProfileHeader {
  return {
    displayName: profile.displayName,
    region: regionLabel(profile),
    experience:
      profile.experienceYears == null
        ? null
        : profile.experienceYears === 1
          ? "1 year of work"
          : `${profile.experienceYears} years of work`,
    // Her languages, in her languages' own names, joined plainly.
    languages: profile.languages.join(" · "),
    verification: verificationDisplay(profile.verificationTier),
  };
}

/**
 * What is still missing from the profile itself.
 *
 * Mirrors the spirit of `missingForPublication` on Product: name what is
 * absent, so the UI can say "two things left" instead of showing a silently
 * thinner screen.
 */
export function missingFromProfile(profile: ArtisanProfile, capability: Capability | null): string[] {
  const missing: string[] = [];
  if (profile.story?.hi == null && profile.story?.en == null) missing.push("your story");
  if (profile.experienceYears == null) missing.push("years of work");
  if (capability == null) missing.push("how many and how fast");
  if (profile.clusterId == null) missing.push("your cooperative");
  return missing;
}
