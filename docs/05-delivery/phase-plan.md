# Phase plan

Seller and buyer work divided into phases, built one at a time. Each phase ends
buildable and demonstrable. Maps to the buyer doc's 28 prompts and its
recommended build order.

`[X]` both roles · `[S]` seller · `[B]` buyer · `[A]` admin

| # | Phase | Scope | Covers prompts |
|---|---|---|---|
| **1** | **Data spine on Supabase** | `[X]` Schema, enums, RLS, invariants, RPCs, taxonomy seed | 08 (partial) |
| 2 | Android foundation + design system | `[X]` Gradle modules, theme, nav, DI, Supabase client, core domain | 01, 02 |
| 3 | Auth, role, language, profiles | `[X]` OTP, role select, language, buyer + seller profile | 03 |
| 4 | Seller voice onboarding + product capture + AI catalog | `[S]` | 04, 05, 06 |
| 5 | Seller image studio + pricing assistant | `[S]` | 07, 11 |
| 6 | Buyer marketplace: search, filters, discovery | `[B]` | 09 |
| 7 | Buyer product detail + Craft Passport | `[B]` | 10, 21 |
| 8 | Bargaining: offers + AI fair-offer band | `[X]` | 12, 13 |
| 9 | Customization / RFQ + feasibility + B2B | `[X]` | 14, 15, 17 |
| 10 | Orders, inventory, seller earnings | `[X]` | 18 |
| 11 | AI gateway consolidation + role-aware chatbot | `[X]` | 16, 22 |
| 12 | Admin web portal + craft health analytics | `[A]` | 19, 20 |
| 13 | Localization, accessibility, security, offline | `[X]` | 23, 24, 25 |
| 14 | Demo data, tests, polish, demo script, judges FAQ | `[X]` | 26, 27, 28 |

## Why this order

Phases 1–3 are shared foundation — neither role can start without them.

Phases 4–5 are seller-only and 6–7 are buyer-only. They are **independent** once
Phase 1 exists, because both read and write the same schema. This is the payoff
of specifying the spine first: the buyer marketplace can be built against seeded
products before the seller capture flow is finished, and neither blocks.

Phase 8 is the first true join — the first place seller and buyer state machines
touch at runtime. It is deliberately after both sides exist independently, so
the join is exercised against real data rather than mocks.

Phases 9–11 extend the join. Phase 12 is a separate surface. Phases 13–14 are
hardening and demo readiness.

## The demo journey, and which phase completes it

```
seller onboards (3) → adds product by voice (4) → AI catalog (4)
→ image studio + pricing (5) → publishes (1,4)
→ buyer searches and filters (6) → opens product + passport (7)
→ makes an offer (8) → seller counters (8)
→ buyer sends custom request (9) → seller sees feasibility (9)
→ order created (10) → admin sees impact (12)
```

The critical path to a credible demo is **1 → 2 → 3 → 4 → 5 → 6 → 7 → 8**.
Phases 9–12 extend it; 13–14 harden it.

## Rules for every phase

1. Ends with the project building.
2. Every AI dependency has a deterministic mock, so the phase demos with no
   provider key configured.
3. No new buyer filter without a seller field (`shared-spine.md` §4).
4. Nothing private crosses a role boundary — enforced by table split and RLS,
   verified by a test each phase.
5. Migrations are committed to the repo, never applied only to the remote.

## Status

| Phase | State |
|---|---|
| 1 — Data spine on Supabase | Migrations written and verified locally (11 files, 16 assertions passing). `001` applied to the remote project; `002`–`011` pending — the Supabase connector dropped mid-apply. |
| 2 — Android foundation | Next |
