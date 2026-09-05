import { UiState } from "@akaar/design-system";
import type { SellerProfileData } from "./SellerProfileScreen.tsx";

/**
 * Stand-in data until a repository implementation exists.
 *
 * There is no server connection yet (see mobile/README.md), so the screen
 * needs *something* to render. This is deliberately Meena from
 * docs/01-product/personas.md, with her real numbers - 8 bags a week alone,
 * Barmer, Marwari and Hindi - so what we look at is the actual case the
 * product is designed around, not a "John Doe" that flatters the layout.
 *
 * Replace with `ArtisanRepository` when the Supabase client lands. Nothing
 * outside this file knows it is fake: the screen takes a UiState either way.
 */
export const sampleSellerProfile: UiState<SellerProfileData> = UiState.content<SellerProfileData>({
  profile: {
    userId: "sample-meena",
    displayName: "Meena Devi",
    state: "Rajasthan",
    district: "Barmer",
    languages: ["Marwari", "Hindi"],
    experienceYears: 22,
    clusterId: "sample-cluster",
    verificationTier: "cluster",
    story: {
      hi: "मैं बचपन से कशीदाकारी कर रही हूँ। यह काम मेरी माँ ने सिखाया था।",
      en: "I have done kashidakari embroidery since childhood. My mother taught me this work.",
      sourceLang: "hi",
    },
  },
  capability: {
    moq: 5,
    capacityPerCycle: 8,
    cycleDays: 7,
    leadTimeDays: 3,
    customizationSupported: true,
    customizationTypes: ["colour", "size"],
  },
  craft: {
    id: "sample-kashidakari",
    slug: "kashidakari",
    parentId: null,
    nameEn: "Kashidakari embroidery",
    nameHi: "कशीदाकारी",
  },
  productCount: 3,
});

/** The same screen with nothing filled in - the state a new seller sees. */
export const emptySellerProfile: UiState<SellerProfileData> = UiState.content<SellerProfileData>({
  profile: {
    userId: "sample-new",
    displayName: "Nayi Kaarigar",
    state: "Rajasthan",
    district: "Barmer",
    languages: ["Hindi"],
    experienceYears: null,
    clusterId: null,
    verificationTier: "unverified",
  },
  capability: null,
  craft: null,
  productCount: 0,
});
