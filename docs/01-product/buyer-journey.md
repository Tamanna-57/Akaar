# Buyer journey — PROVISIONAL

> **Status:** derived from §4 of the seller master build prompt only. The buyer
> master build prompt has not yet been received. Screen structure, copy, and
> visual direction here are placeholders. **The contracts in
> `docs/02-interdependence/` are not** — those are fixed, and the incoming
> prompt is reconciled against them per `shared-spine.md` §8.

## Onboarding

Language (English default) → role → phone/OTP → organisation profile
(name, type, city, sourcing crafts, typical order quantity) → optional
verification documents. Verification tier gates RFQ volume.

## Discover

Curated by craft and region. Every card shows what actually decides a sourcing
decision: image, craft, district, wholesale range, MOQ, lead time. Not a
consumer feed — no infinite scroll, no engagement mechanics.

## Search and filter

Filters are exactly the matching contract (`shared-spine.md` §4) — craft,
product type, material, technique, region, quantity, budget per unit, deadline,
customisation, packaging, sample, verification, price range.

Quantity and deadline are the two that make this B2B rather than shopping. A
buyer who enters them gets results filtered by real capacity and real lead time,
not by keyword.

## Product detail

- **Enhanced and original images side by side.** The original is the trust
  anchor and is presented as such, not buried. Any AI lifestyle background is
  labelled.
- Attributes, craft, region, materials, techniques, care.
- Artisan story, in the artisan's own words, translated with the original
  available.
- MOQ, capacity, lead time, customisation.
- Wholesale range. **No cost breakdown, no floor, no confidence scores.**
- Seller response signal as a phrase ("usually replies within a day").
- Actions: Send inquiry · Request sample · Ask a question.

## RFQ

Craft/product · quantity · budget per unit · deadline · delivery location ·
customisation · packaging · sample requirement. Quantity, budget and deadline
are required — matching cannot run without them.

Matches return with **reasons, not scores**: "meets your 40-unit MOQ, ships in
18 days, within budget."

## Inquiry and negotiation

One thread per inquiry. Seller messages arrive machine-translated with the Hindi
original one tap away. Quotations arrive as structured objects — quantity, unit
price, lead time, sample terms, validity — and can be accepted, countered, or
rejected. A counter below the seller's floor is refused by the API; the buyer is
told the seller's minimum, never the seller's costs.

Acceptance creates an `OrderIntent`. Both parties confirm; contact details
release only then. The MVP explicitly does not handle payment or logistics, and
says so at that moment.

## Deliberately absent

Cart, checkout, reviews, ratings, wishlists, recommendation feed, social
features. This is a sourcing tool.

## Open questions for the buyer prompt

1. Buyer tabs — assumed Discover / Search / RFQs / Messages / Profile.
2. Is a saved-search or shortlist object needed? If so it is buyer-local and
   crosses no edge — no spine change.
3. Sample-request workflow: distinct object, or a quotation with
   `sample_offered`? Currently modelled as the latter.
4. Cluster-as-supplier for the exporter persona — data model allows it; is it
   in MVP scope?
5. Any buyer filter not in the matching contract requires a corresponding
   seller field, or is not built.
