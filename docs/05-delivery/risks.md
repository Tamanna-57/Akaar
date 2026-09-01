# Risks and unsupported assumptions

## Assumptions that are not yet verified

Listed so they are not mistaken for findings.

1. **Artisans will speak to a phone.** Voice-first rests on this. Untested with
   the target population. Mitigation: the Cluster Manager assisted path exists
   precisely because some will not, and every voice step has a manual fallback.
2. **Indic STT is accurate enough on dialect.** Marwari-accented Hindi is not
   what these models are benchmarked on. Mitigation: transcript correction is a
   first-class step, not an edge case; extraction reads the corrected text.
3. **Sellers will supply honest costs.** The floor is only as good as its
   inputs. Mitigation: guided prompts, profile defaults, low confidence when
   inputs are estimated. Not solvable in software.
4. **B2B buyers will source from unverified individuals.** The real blocker for
   Aditi is trust, not discovery. Mitigation: original-image guarantee,
   verification tiers, response signals, cluster attestation.
5. **The two-hour shared-phone window is representative.** Drawn from the
   persona, not from field research.
6. **Craft taxonomy coverage.** Indian craft vocabulary is vast and regional. An
   incomplete taxonomy silently degrades matching. Mitigation: `unmapped_text`
   is preserved and surfaced for admin curation rather than coerced.

## Delivery risks

| Risk | Impact | Mitigation |
|---|---|---|
| **Seller and buyer built apart, integrate late** | Highest. Weeks lost reconciling schemas. | This document set. Spine before features; buyer slice must add no new `Product` field. |
| Buyer prompt contradicts the spine | Rework | Reconciliation procedure, `shared-spine.md` §8. Contracts amended first, features after. |
| AI provider outage on demo day | Demo failure | Every pipeline has a wired non-AI fallback. Rehearse the degraded path. |
| STT quality below usable | Core value prop | Correction UI, guided form fallback, on-device option kept behind an interface |
| Scope: 66 MVP screens × 6 states | Overrun | State scaffolds are components. Cut list in `mvp-boundaries.md`. |
| Cost leak into a buyer payload | Trust and safety | Single serialiser + automated leak test in Phase 0 |
| Floor eroded by negotiation | Undermines the central claim | DB-level invariant, audited overrides, override frequency as a monitored metric |
| GPU cost for enhancement | Budget | `rembg` on CPU is viable at hackathon volume; diffusion is optional |
| Devanagari layout breakage | Polish | Test at 200% Dynamic Type from Phase 0, not at hardening |
| Empty marketplace at demo | Demo credibility | Seeded realistic listings, clearly labelled as seed data |

## Ethical risks

- **Raising expectations we cannot meet.** An artisan who lists and receives no
  inquiry has spent scarce time. Never imply demand that does not exist; the
  home screen shows real state, not encouragement.
- **Assisted onboarding becomes appropriation.** A cluster manager could list on
  an artisan's behalf and control the account. Mitigation: costs are not
  manager-editable, all approvals are audited, the artisan holds the phone
  number.
- **AI story generation would be fabrication.** Provenance fields are never
  model-populated. Non-negotiable.
- **Consent from users who cannot read it** is not consent. Audio consent in the
  user's language is a requirement, not an enhancement.
- **Data as leverage.** Cost and capacity data would be commercially valuable to
  buyers. Tiering is enforced in code, in the database, and in the serialiser.

## Explicitly unsupported claims

Not to appear in the app, the deck, or the demo:

- Live GeM / IndiaHandmade / ONDC integration
- Payment, escrow, settlement, or logistics
- Certification, GI tags, compliance attestation
- Guaranteed income, guaranteed sales, or guaranteed buyer response
- Any statistic about artisan earnings uplift that has not been measured
