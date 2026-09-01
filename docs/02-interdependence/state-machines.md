# State machines

Every shared object has exactly one state machine, defined here. Both roles read
these statuses; only the owning party may advance them.

---

## Product

The seller→buyer edge. `PUBLISHED` is the only state visible to buyers.

```
DRAFT
  └─▶ VOICE_CAPTURED          audio recorded, not yet transcribed
        └─▶ TRANSCRIBED       STT + translation complete
              └─▶ EXTRACTED   structured attributes, confidences, gaps identified
                    └─▶ NEEDS_INPUT   ◀──┐  missing required fields
                          └─▶ PRICED ───┘  cost inputs supplied, floor computed
                                └─▶ SELLER_REVIEW
                                      ├─▶ REJECTED ──▶ (back to EXTRACTED, regenerate)
                                      └─▶ SELLER_APPROVED
                                            ├─▶ CLUSTER_REVIEW  (if artisan is cluster-managed)
                                            │     ├─▶ CLUSTER_REJECTED ──▶ SELLER_REVIEW
                                            │     └─▶ PUBLISHED
                                            └─▶ PUBLISHED       (if not cluster-managed)

PUBLISHED ──▶ PAUSED ──▶ PUBLISHED      seller temporarily unavailable
PUBLISHED ──▶ ARCHIVED                  terminal
```

**Invariants**
- Cannot enter `PRICED` without materials, labour hours, labour rate, packaging.
- Cannot enter `PUBLISHED` without `moq`, `capacity_per_cycle`, `cycle_days`,
  `lead_time_days`, at least one image, and `seller_approved_langs ⊇ {hi, en}`.
- `PUBLISHED` products with an open inquiry cannot be `ARCHIVED` — must be
  `PAUSED` first, and open inquiries settled.
- Any edit to a `PUBLISHED` product that changes an attribute, price, or
  capability drops it to `SELLER_REVIEW`. Buyers must never see a listing whose
  content changed after approval without re-approval.

**Offline behaviour:** `DRAFT` through `NEEDS_INPUT` are fully local. The first
required sync is at `PRICED` (floor computation is server-side). See
`docs/04-architecture/offline-strategy.md`.

---

## RFQ

Buyer-owned broadcast demand. Does not target a specific seller.

```
DRAFT
  └─▶ OPEN                   published, matching runs
        └─▶ MATCHED          ≥1 seller matched, invitations dispatched
              └─▶ RESPONSES_RECEIVED
                    └─▶ SHORTLISTED
                          ├─▶ CLOSED_WON     an OrderIntent was confirmed
                          └─▶ CLOSED_LOST    buyer closed without proceeding
OPEN | MATCHED | RESPONSES_RECEIVED ──▶ EXPIRED    deadline passed
```

**Invariants**
- `quantity`, `budget_per_unit`, `deadline`, `delivery_location` required to
  leave `DRAFT`. Without them the matching rules in `shared-spine.md` §4 cannot
  execute.
- Expiry is automatic at `deadline`. Sellers see remaining time, never a
  countdown pressure device.
- Closing an RFQ does not close its child inquiries — those settle independently.

---

## Inquiry

The shared workspace. The only object both roles write to. Turn-based.

```
OPENED                     buyer initiated (direct, or from an RFQ match)
  └─▶ SELLER_VIEWED
        └─▶ SELLER_RESPONDED
              └─▶ QUOTED               seller attached a Quotation
                    └─▶ NEGOTIATING    buyer countered
                          ├─▶ ORDER_INTENT_CONFIRMED   terminal, success
                          └─▶ DECLINED                 terminal, either party
OPENED | SELLER_VIEWED ──▶ STALE       no seller response in 7 days
STALE ──▶ SELLER_RESPONDED             recoverable; staleness is a signal, not a close
any ──▶ DECLINED                       either party, with reason
```

**`awaiting_party`** is carried on the object and is the sole write authority:

| Status | `awaiting_party` |
|---|---|
| `OPENED`, `SELLER_VIEWED`, `STALE` | `SELLER` |
| `SELLER_RESPONDED`, `QUOTED` | `BUYER` |
| `NEGOTIATING` | alternates with each counter |
| terminal states | `NONE` |

**Invariants**
- Messages are append-only and immutable. No edit, no delete — this thread is
  the record if a dispute arises.
- Only `awaiting_party` may advance status. The other party may still post a
  message (which does not advance status) or `DECLINE`.
- `STALE` is computed, never set. It surfaces to the seller as a gentle prompt
  and to the buyer as an honest "no response yet", not as a seller penalty.
- Contact details are not exchanged in-thread before `ORDER_INTENT_CONFIRMED`.
  Fraud surface reduction; also what makes the platform worth staying inside.

---

## Quotation

Seller-authored, buyer-answered. Immutable once sent — a counter is a **new**
quotation, so the negotiation history is a readable chain.

```
DRAFTED
  └─▶ SENT
        └─▶ VIEWED
              ├─▶ ACCEPTED   ──▶ creates OrderIntent
              ├─▶ COUNTERED  ──▶ buyer counter-offer; seller may issue a new Quotation
              ├─▶ REJECTED
              └─▶ EXPIRED    validity window elapsed
```

**Invariants**
- `unit_price × quantity` must clear `sustainable_floor × quantity`. Below-floor
  requires explicit seller override with a logged reason (`shared-spine.md` §5).
- A quotation names its `product_id` and pins the price inputs used, so the
  breakdown remains reconstructable after the product is edited.
- Validity window is mandatory. An open-ended quotation is a liability for a
  seller whose material costs move.

---

## OrderIntent

Deliberately named *intent*. The MVP does not do settlement or logistics.

```
CREATED               on quotation acceptance
  └─▶ SELLER_CONFIRMED
        └─▶ BUYER_CONFIRMED
              └─▶ ACTIVE           both parties committed; contact details released
                    ├─▶ FULFILLED  marked by either, confirmed by the other
                    └─▶ CANCELLED  with reason, by either
```

**Invariants**
- Entering `ACTIVE` decrements `available_capacity` for the committed quantity
  over the committed window. This is what makes future matching honest.
- `FULFILLED` is the only event that feeds the seller's reliability signal.
- No money moves. No shipment is tracked. Both parties are told this explicitly
  at confirmation — an unsupported claim here would be the most damaging kind.

---

## Cross-object consistency rules

1. An `Inquiry` may reference an `RFQ` (`rfq_id` nullable) or be direct.
2. Closing an `RFQ` does not cascade to its inquiries.
3. `PAUSED`/`ARCHIVED` products keep their existing inquiries alive; they only
   stop being discoverable.
4. Capacity is decremented at `OrderIntent.ACTIVE`, never at quotation. A seller
   is not committed by discussing.
5. Every transition on every object emits a domain event
   (`docs/04-architecture/api-contracts.md` §notifications) delivered to the
   counterparty. State changes are never silent.
