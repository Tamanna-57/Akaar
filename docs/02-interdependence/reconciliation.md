# Reconciliation — buyer prompt chain into the spine

Applied per `shared-spine.md` §8. The buyer document (SIH 2026 PS 26090 prompt
chain) is broader than a buyer spec: it covers seller, buyer **and admin**, and
supersedes parts of the seller-only plan. Where they conflict, the resolution is
recorded here.

## Decisions

**1. Backend is Supabase-native, not FastAPI.**
Instruction from the user: Supabase is the database, already connected. Rather
than run a separate FastAPI host in front of it, business logic lives in:

| Concern | Mechanism |
|---|---|
| Reads (marketplace, own data) | PostgREST + Row Level Security |
| Business rules, state transitions, anything touching private data | `SECURITY DEFINER` Postgres functions (RPC) |
| AI calls, provider keys | Supabase Edge Functions (Deno) |
| Media | Supabase Storage with signed URLs |

This satisfies both documents' hard requirement that business logic be
server-side and that no API key reaches the Android app, without a second
deployment target. `docs/04-architecture/backend-architecture.md` is superseded
for hosting; its service decomposition still holds as the shape of the RPC and
Edge Function layer.

**2. Field visibility is enforced by table split, not by a serialiser.**
PostgREST cannot mask columns per user, so the tier model from
`shared-spine.md` §3 is implemented as separate tables with owner-only RLS:

| Public / buyer-visible | Owner-only |
|---|---|
| `products` | `product_pricing_private` |
| `artisan_profiles` | `artisan_private` |
| `buyer_profiles` | `buyer_private` |

This is stronger than the original plan. A missing `WHERE` clause can no longer
leak a cost field, because the field is not in a table the buyer can address.

**3. Fair Price Shield and the private minimum are the same mechanism.**
The seller doc's `sustainable_floor` and the buyer doc's
`min_acceptable_price` reconcile as one invariant, enforced in the database:

```sql
CHECK (min_acceptable_price_paise >= sustainable_floor_paise)
```

The seller sets a negotiation corridor (listed / preferred / minimum); the floor
is the hard bound beneath the corridor. Buyers see only `listed_price`.
Offer evaluation runs in a `SECURITY DEFINER` function so the client never reads
the minimum — it receives only accept / counter / reject.

**4. Two demand paths, not one.**
The original spine had a single broadcast RFQ. The buyer doc separates them:

| Path | Object | Trigger |
|---|---|---|
| Price negotiation on a listed product | `offers` | Buyer taps Make an Offer |
| Customization / bulk sourcing | `custom_requests` | Buyer submits an RFQ, product-specific or open |

Both are turn-based with `awaiting_party`, per `state-machines.md`.

**5. Orders are real, replacing `OrderIntent`.**
The buyer doc requires an order lifecycle with inventory reservation and an
abstracted `PaymentService`. `orders` + `inventory_reservations` replace
`order_intents`. Payment remains abstract — no order is marked paid without a
verified backend state.

**6. Craft Passport replaces the QR story.**
Structured provenance with an explicit source tier per field
(`seller_provided` / `admin_verified` / `external_reference`). No GI or
authenticity claim is ever generated. QR is a deep-link identifier; no
blockchain.

**7. Admin is a responsive web dashboard**, not a fourth mobile mode. Cluster
manager stays in the Android app.

**8. AI gateway is provider-agnostic.** Interfaces —
`SpeechToTextService`, `TranslationService`, `TextGenerationService`,
`VisionService`, `ImageEnhancementService`, `PricingService`,
`FairOfferService`, `FeasibilityService` — each with a deterministic mock
implementation so the whole app builds and demos with no provider configured.

## Unchanged by this document

The matching contract (`shared-spine.md` §4), the two edges, turn-based
ownership, the language bridge, the never-invent rule, and the original-image
guarantee all survive intact. The buyer doc's principles ("AI proposes, artisan
confirms"; "do not expose the seller's minimum"; "deterministic rules for
critical business logic") restate them.

## New filters requiring seller fields

Per the §8 rule that no buyer filter may exist without a seller field, the buyer
doc's marketplace filters add these to `products`:

`negotiable` · `customization_supported` · `b2b_enabled` · `handmade/handwoven`
(derived from technique) · `bulk_price` · `stock_qty`

All are seller-supplied. No orphan filters were introduced.
