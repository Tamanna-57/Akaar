# The shared spine

**This is the contract document. Seller and buyer work are both built against
this, and neither is built against the other.**

If the buyer master build prompt contradicts anything here, this file is amended
first and the feature work follows. Nothing in `feature/seller` or
`feature/buyer` may encode an assumption about the other role that is not
written down here.

---

## 1. The two edges

The entire seller↔buyer relationship reduces to two directed edges.

```
                    SELLER                                    BUYER
                       │                                        │
   ┌───────────────────▼────────────────────┐                   │
   │  EDGE A — supply                       │                   │
   │  Product reaches PUBLISHED             │──── discover ────▶│
   │  Gate: seller_approved                 │                   │
   │      (+ cluster_approved if managed)   │                   │
   └────────────────────────────────────────┘                   │
                       │                                        │
                       │◀──── EDGE B — demand ──────────────────┤
                       │      RFQ / Inquiry with committed      │
                       │      quantity, budget, deadline        │
                       │      Gate: buyer profile verified      │
                       ▼                                        ▼
                  ┌─────────────────────────────────────────────┐
                  │  Inquiry thread — the shared workspace      │
                  │  Quotation → negotiation → OrderIntent      │
                  │  Price floor enforced server-side           │
                  └─────────────────────────────────────────────┘
```

**Edge A** is one-way and asynchronous. The seller never knows a buyer is
looking. Nothing on the seller side may block on buyer activity.

**Edge B** is one-way until the seller replies, at which point the `Inquiry`
becomes a shared object with alternating turn ownership.

There is no third edge. If a feature seems to need one, it is out of MVP scope.

---

## 2. Shared objects and who owns each transition

| Object | Created by | Mutated by | Terminal owner |
|---|---|---|---|
| `Product` | Seller | Seller only (cluster may approve/reject, never edit costs) | Seller |
| `PriceCalculation` | System | System, from seller inputs | System — immutable once attached to a published product |
| `RFQ` | Buyer | Buyer only | Buyer |
| `Match` | System | System | System |
| `Inquiry` | Buyer | Both, turn-based | Whoever closes it |
| `Message` | Both | Immutable once sent | — |
| `Quotation` | Seller | Seller creates, buyer responds | Buyer accepts/rejects |
| `OrderIntent` | System on acceptance | Both confirm | Both |

**Rule:** no object is mutated by both roles simultaneously. Where both
participate (`Inquiry`), the object carries `awaiting_party` and only that party
may advance it. This removes every write-conflict class from the MVP.

---

## 3. Field visibility tiers

Every field on every shared object is assigned exactly one tier. Enforced
**server-side** by role, then mirrored in the client models. A field's tier is
part of the schema, not a UI concern.

| Tier | Visible to | Contains |
|---|---|---|
| `SELLER_PRIVATE` | Owning seller, their cluster manager, admin | Cost breakdown, labour rate, margin, sustainable floor, net earnings, exact address, phone, Aadhaar-adjacent identifiers |
| `BUYER_VISIBLE` | Authenticated buyers | Attributes, both image sets, wholesale range, MOQ, capacity, lead time, district-level region, artisan story, craft/technique, care |
| `PUBLIC` | Anyone with the QR link | Craft, region (district), technique, story, care, enhanced image. **No price, no contact, no personal identifiers.** |

### Fields that are deliberately asymmetric

These are the ones that get built wrong if the two sides are designed apart.

| Concept | Seller sees | Buyer sees |
|---|---|---|
| Price | Full cost breakdown, sustainable floor, D2C price, wholesale range, net earnings, confidence | Wholesale range only, plus MOQ-tiered indicative pricing |
| Location | Own exact address | District and state only |
| Identity | Own full profile | Display name, craft, district, verification tier, response signal |
| Capacity | Own true capacity + existing commitments | Available capacity = true capacity − committed, floored at 0 |
| Confidence | AI confidence per extracted field | Nothing — confidence is an internal quality signal, never a buyer-facing hedge |

The last row matters: exposing AI confidence to buyers converts an internal
quality mechanism into a trust liability. Buyers see fields or they see nothing.

---

## 4. The matching contract

**Every buyer filter must map onto a seller-supplied field.** This table is the
join. A filter with no seller field is not built. A seller field no buyer uses
is not asked for.

| Buyer RFQ / filter field | Seller-supplied source | Match rule |
|---|---|---|
| `craft` | `product.craft_id` / `artisan.crafts[]` | Taxonomy node match, or buyer node is an ancestor of seller node |
| `product_type` | `product.product_type_id` | Taxonomy node or ancestor |
| `material[]` | `product.materials[]` | Non-empty intersection |
| `technique[]` | `product.techniques[]` | Non-empty intersection |
| `region` | `artisan.state`, `artisan.district` | Exact district, else state, else unconstrained |
| `quantity` | `product.moq`, `inventory.capacity_per_cycle`, `inventory.cycle_days` | `moq ≤ qty` **and** `qty ≤ capacity_per_cycle × floor(days_to_deadline / cycle_days)` |
| `budget_per_unit` | `price.wholesale_min` | `wholesale_min ≤ budget_per_unit`. **Never** matches below `price.sustainable_floor` |
| `deadline` | `inventory.lead_time_days` + production estimate | `lead_time_days + ceil(qty / capacity_per_cycle) × cycle_days ≤ days_to_deadline` |
| `customization` | `product.customization_supported`, `customization_types[]` | Requested type ∈ supported types |
| `packaging` | `artisan.packaging_options[]` | Requested ∈ supported |
| `sample_required` | `artisan.sample_policy` | `sample_policy != NONE` |
| `verification` | `artisan.verification_tier` | `seller_tier ≥ requested_tier` |
| `price_range` (browse) | `price.wholesale_min`, `wholesale_max` | Range overlap |

**Consequences that must be honoured on the seller side:**

1. `moq`, `capacity_per_cycle`, `cycle_days`, `lead_time_days` are **required**
   before a product can be published. They are not optional inventory metadata —
   without them a product is unmatchable and therefore invisible.
2. `customization_supported` and `sample_policy` are profile-level defaults with
   per-product override.
3. Region is captured at district granularity because that is the finest
   granularity a buyer filters on, and the coarsest that stays useful.

**Consequences that must be honoured on the buyer side:**

4. No filter may be offered that is not in this table.
5. Quantity and deadline are required on an RFQ. Without them the capacity and
   lead-time rules cannot run and matching degrades to keyword search.

### Match scoring

Hard constraints above are **filters** (fail → excluded). Ranking among
survivors:

| Signal | Weight | Source |
|---|---|---|
| Capability fit (capacity headroom vs. requested qty) | 0.30 | Seller inventory |
| Price fit (buyer budget vs. wholesale range) | 0.25 | Price calculation |
| Craft/technique semantic similarity | 0.20 | Embeddings over taxonomy + attributes |
| Responsiveness (median first-response time, 90d) | 0.15 | Inquiry history |
| Verification tier | 0.10 | Cluster / admin verification |

Scores are internal. The buyer sees an ordered list and the *reason* a seller
matched ("meets your 40-unit MOQ, ships in 18 days"), never a number.

---

## 5. The price floor is a shared invariant

The single rule that both sides must enforce and neither side owns alone.

```
sustainable_floor = materials + (labour_hours × labour_rate) + packaging
                  + overhead + shipping + platform_fees + minimum_margin
```

- Computed server-side from **seller-declared** inputs. Never model-generated.
- `SELLER_PRIVATE`. The buyer never sees the floor, only `wholesale_min`.
- `wholesale_min ≥ sustainable_floor` is a **database-level invariant**.
- A quotation below `sustainable_floor` is rejected by the API. The seller may
  override, but only with an explicit confirmation and a logged reason, and the
  override is recorded in the audit log with the delta.
- Nothing repriced automatically, ever. Automated repricing is a non-goal
  precisely because it would erode this floor under buyer pressure.

This is where the product's central claim lives. It is implemented once, in
`backend/app/services/pricing`, and both roles call it.

---

## 6. The language bridge

The seller works in Hindi or a regional language. The buyer works in English.
The same content object serves both.

Every translatable field is stored as:

```json
{
  "source_lang": "hi",
  "values": { "hi": "…", "en": "…" },
  "translated_fields": ["en"],
  "translation_model": "indictrans2-v1",
  "seller_approved_langs": ["hi", "en"]
}
```

Rules:

1. `source_lang` content is never overwritten by a translation.
2. The seller approves both the Hindi and the English before publication —
   English is what the buyer judges them on, so it is not allowed to be
   unreviewed machine output on a published listing.
3. Inquiry messages are auto-translated on read, with a persistent **"show
   original"** toggle. Auto-translation in a thread is *not* seller-approved and
   is labelled as machine-translated.
4. Buyer-authored English is translated to the seller's language on delivery,
   and read aloud on request. A buyer's message must be *hearable*, not just
   readable — Meena reads Hindi slowly.

---

## 7. What each side may assume about the other

Written as assertions, so violations are testable.

**The seller side may assume:**
- Buyers exist but are never present. No seller flow blocks on a buyer.
- An inquiry can arrive at any time and must be readable offline once fetched.
- Its output contract is: a `Product` in `PUBLISHED` with a complete capability
  block and a `PriceCalculation`.

**The buyer side may assume:**
- Every discoverable product is seller-approved, priced, and has both original
  and enhanced imagery.
- Every discoverable product has `moq`, `capacity_per_cycle`, `cycle_days`,
  `lead_time_days` populated. Matching may rely on them being present.
- A seller may take days to respond, and may respond in Hindi.
- Its output contract is: an `RFQ` or `Inquiry` with quantity, budget and
  deadline.

**Neither side may assume:**
- That the other is online, has read anything, or will respond.
- Anything about the other's internal state machine beyond the shared statuses
  in `state-machines.md`.
- That it may write a field the visibility table does not grant it.

---

## 8. Reconciling the incoming buyer prompt

When the buyer master build prompt arrives, it is processed in this order:

1. Diff its buyer feature list against §4 of the seller prompt (already captured
   in `docs/01-product/buyer-journey.md` as provisional).
2. **Any new buyer filter → add a seller field** in this document's §4 table, or
   reject the filter. No orphan filters.
3. **Any new buyer-visible field → assign a visibility tier** in §3.
4. **Any new interaction → model it as a transition** on an existing shared
   object in `state-machines.md`, or justify a new shared object. New shared
   objects are expensive; prefer transitions.
5. Amend this file, then the domain model, then the API contracts, then feature
   work. In that order.

Buyer-side UI, copy, and screen structure from that prompt do **not** require
changes here — only things that cross an edge do.
