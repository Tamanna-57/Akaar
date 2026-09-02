# Phase plan

Reordered for SIH Round 1, whose deliverable is a **presentation**, not a
running system. The goal for round 1 is therefore an app that *looks and moves
like a finished product* across the whole demo journey — screens worth
screenshotting — with the AI and network work behind it stubbed.

`[X]` both roles · `[S]` seller · `[B]` buyer · `[A]` admin

## Done

| # | Phase | What it gave us |
|---|---|---|
| 1 | Data spine on Supabase | 12 migrations, 32 tables, RLS everywhere, the price-floor invariant, marketplace search. Both roles read one schema. |
| 2 | Android foundation + design system | 10 Gradle modules, design tokens and components, the six-state `UiState`, domain models, navigation, CI. |

## Round 1 — the deck

Every phase here ends with screens that can be photographed for a slide.

| # | Phase | Scope |
|---|---|---|
| **3** | **Onboarding and seller home** | `[X]` Language picker, role picker, profile setup, seller home with its five tabs. Sign-in is a demo path — no OTP infrastructure. |
| 4 | Seller: add a product | `[S]` The whole flow as UI: camera → voice capture → transcript review → AI-proposed attributes → missing-field questions → capability. AI answers come from mock implementations. |
| 5 | Seller: the two signature screens | `[S]` Fair Price Shield — cost breakdown, floor, earnings, spoken explanation. Image studio — before/after with the original always present. |
| 6 | Buyer: discover and detail | `[B]` Marketplace grid, search, the real filters, product page, Craft Passport. |
| 7 | Bargaining | `[X]` Make an Offer, the offer thread, seller accept/counter/reject, the below-floor warning. |
| 8 | Demo data and the deck | `[X]` Realistic artisans and listings, screenshots of the full journey, architecture diagram, the deck itself. |

**Critical path to a submittable deck: 3 → 4 → 5 → 6 → 7 → 8.**

### Why stubbing the AI is not throwaway work

The buyer prompt chain requires it. Prompts 04, 06, 07 and 22 each say to put
AI behind a service interface and ship a mock implementation for when
credentials are absent. So building the screens against
`SpeechToTextService`, `TextGenerationService`, `PricingService` and friends
*is* the specified architecture. Round 2 swaps the implementation behind those
interfaces; no screen is rewritten.

It also means the app demos on a laptop with no API keys and no network, which
is worth having on a stage.

## Round 2 — the working prototype

| # | Phase | Scope |
|---|---|---|
| 9 | Auth and live data | `[X]` Phone/OTP, real Supabase reads and writes, session handling |
| 10 | Voice and catalog AI | `[S]` STT, translation, extraction through Edge Functions, keys server-side |
| 11 | Image pipeline | `[S]` Background removal, bounded enhancement, authenticity check |
| 12 | Custom requests and B2B | `[X]` RFQ, feasibility, bulk quotes |
| 13 | Orders and earnings | `[X]` Order lifecycle, inventory reservation, seller earnings |
| 14 | Admin portal | `[A]` Web dashboard, moderation, craft health analytics |
| 15 | Hardening | `[X]` Localisation, accessibility, security pass, offline |
| 16 | Final polish | `[X]` Tests, demo script, judges FAQ |

## Rules that still hold

1. Every phase ends with the project building.
2. Every AI dependency has a deterministic mock, so any phase demos with no
   provider key configured.
3. No buyer filter without a seller field (`shared-spine.md` §4).
4. Nothing private crosses a role boundary — enforced by table split and RLS.
5. Migrations are committed, and their filenames match the versions the hosted
   project recorded. Never renumber an existing one.
6. `:feature:seller` and `:feature:buyer` never depend on each other.

## What round 1 deliberately does not include

Real OTP delivery · live AI calls · payments · logistics · the admin portal ·
live marketplace publishing. Saying so plainly in the deck is stronger than
implying otherwise and being asked.
