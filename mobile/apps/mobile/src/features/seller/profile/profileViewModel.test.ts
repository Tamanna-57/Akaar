import assert from "node:assert/strict";
import { test } from "node:test";
import type { ArtisanProfile, Capability } from "@akaar/core-domain";
import {
  capacitySummary,
  deliverableInDays,
  missingFromProfile,
  profileHeader,
  verificationDisplay,
} from "./profileViewModel.ts";

function meena(overrides: Partial<ArtisanProfile> = {}): ArtisanProfile {
  return {
    userId: "u1",
    displayName: "Meena Devi",
    state: "Rajasthan",
    district: "Barmer",
    languages: ["Marwari", "Hindi"],
    experienceYears: 22,
    clusterId: "c1",
    verificationTier: "cluster",
    story: { hi: "मैं कशीदाकारी करती हूँ", sourceLang: "hi" },
    ...overrides,
  };
}

const capability: Capability = {
  moq: 5,
  capacityPerCycle: 8,
  cycleDays: 7,
  leadTimeDays: 3,
};

test("verification is described by what it means, not by its tier name", () => {
  // "self" is a database word. It must never reach the screen.
  const self = verificationDisplay("self");
  assert.equal(self.label, "Your own details");
  assert.ok(!self.label.includes("self"));
  assert.equal(self.canImprove, true);

  const admin = verificationDisplay("admin");
  assert.equal(admin.tone, "success");
  assert.equal(admin.canImprove, false, "nothing left to do at the top tier");
});

test("cluster verification is the one accent use on the screen", () => {
  assert.equal(verificationDisplay("cluster").tone, "accent");
});

test("capacity reads as a sentence about her week, not as four fields", () => {
  const summary = capacitySummary(capability);
  assert.equal(summary.headline, "8 in 7 days");
  assert.match(summary.detail, /Smallest order 5/);
  assert.equal(summary.isBlocking, false);
});

test("missing capacity says the consequence plainly", () => {
  const summary = capacitySummary(null);
  assert.equal(summary.isBlocking, true);
  // She is invisible to matching without it, so the screen must say so.
  assert.match(summary.detail, /cannot find you/);
});

test("deliverable quantity answers the question a buyer actually asks", () => {
  // 30 days - 3 lead = 27 production days / 7 day cycles = 3 cycles x 8.
  assert.equal(deliverableInDays(capability, 30), "About 24 in 30 days");
  assert.equal(deliverableInDays(capability, 1), "Not enough time in 1 days");
  assert.equal(deliverableInDays(null, 30), "Not filled in yet");
});

test("the header uses district-level region, never a full address", () => {
  const header = profileHeader(meena());
  assert.equal(header.region, "Barmer, Rajasthan");
  assert.equal(header.displayName, "Meena Devi");
  assert.equal(header.languages, "Marwari · Hindi");
  assert.equal(header.experience, "22 years of work");
});

test("one year is not written as '1 years'", () => {
  assert.equal(profileHeader(meena({ experienceYears: 1 })).experience, "1 year of work");
});

test("experience she has not given is absent, never guessed at", () => {
  assert.equal(profileHeader(meena({ experienceYears: null })).experience, null);
});

test("missing pieces are named, so the UI can say what is left", () => {
  assert.deepEqual(missingFromProfile(meena(), capability), []);

  const bare = meena({ story: undefined, experienceYears: null, clusterId: null });
  assert.deepEqual(missingFromProfile(bare, null), [
    "your story",
    "years of work",
    "how many and how fast",
    "your cooperative",
  ]);
});
