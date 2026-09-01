# Phased backlog

Epics in dependency order. `[S]` seller · `[B]` buyer · `[X]` shared/spine.

## Phase 0 — foundations
- `[X]` Gradle multi-module skeleton + Hilt + CI
- `[X]` **CI check: `:feature:seller` ↛ `:feature:buyer`**
- `[X]` Design system: tokens, typography, six state scaffolds, AI-output block
- `[X]` `:core:domain` canonical models (mirror of `domain-model.md`)
- `[X]` FastAPI skeleton, config, structured logging
- `[X]` **Role-parameterised serialiser + test asserting no `SELLER_PRIVATE` leak**
- `[X]` Postgres schema, invariants, RLS, Alembic
- `[X]` Object storage, signed URLs, EXIF stripping
- `[X]` Auth: OTP, tokens, Keystore, refresh rotation

## Phase 1 — identity and taxonomy
- `[X]` Language select, role select, onboarding shell
- `[X]` Consent records + audio consent screens
- `[X]` Terms of Service + Privacy Policy (hi/en)
- `[S]` Artisan profile, one-question-per-screen
- `[X]` Craft taxonomy seed, API, offline bundle, picker

## Phase 2 — capture and offline
- `[S]` CameraX + framing/lighting overlay
- `[S]` On-device quality checks + audio guidance
- `[S]` Original storage, resumable chunked upload
- `[S]` Voice record / pause / replay / re-record
- `[X]` Room + SQLCipher, local drafts
- `[X]` Outbox, WorkManager, idempotency keys
- `[X]` Per-item sync state UI

## Phase 3 — AI pipeline
- `[X]` Provider adapters + circuit breakers + fallbacks
- `[S]` STT + language ID; transcript correction UI
- `[X]` Translation hi↔en; `Translatable` handling
- `[S]` Extraction: strict schema, confidence, source, evidence span
- `[X]` Taxonomy matching (embeddings + fuzzy)
- `[S]` Gap detection → one-question-at-a-time flow
- `[S]` Attribute review with Accept/Edit/Regenerate/Reject
- `[X]` Prompt/model versioning + audit rows

## Phase 4 — pricing
- `[X]` Pricing service, pure, exhaustive tests
- `[X]` Floor invariant in the database
- `[S]` Cost input screens with defaults from profile
- `[S]` Price breakdown component
- `[S]` Hindi TTS explanation
- `[S]` Price versioning; edits create a new version

## Phase 5 — image pipeline
- `[X]` Enhancement worker, bounded operations
- `[X]` Authenticity check (masked SSIM + hue delta)
- `[S]` Image studio, before/after compare, approval
- `[S]` Original always retained and displayed

## Phase 6 — publication
- `[S]` Capability input (MOQ, capacity, cycle, lead time)
- `[X]` Publication invariants + 422 naming what is missing
- `[S]` Seller approval flow, hi/en review with audio
- `[S]` Product list with lifecycle + sync states
- `[X]` Cluster review queue, approve/reject

## Phase 7 — buyer discovery *(first buyer-visible work)*
- `[B]` Buyer profile and verification
- `[X]` **Matching contract: filters + facets in SQL**
- `[B]` Discover, search, filters, results
- `[B]` Product detail with both image sets
- `[B]` Artisan profile (buyer tier)

## Phase 8 — demand and negotiation
- `[B]` RFQ create, publish, list
- `[X]` Matching worker; match reasons
- `[S]` RFQ invitations for sellers
- `[X]` Inquiry thread, append-only messages, `awaiting_party`
- `[X]` Language bridge in-thread + audio playback
- `[S]` Quotation builder with floor enforcement + audited override
- `[B]` Quotation accept / counter / reject
- `[X]` OrderIntent, dual confirmation, capacity decrement, contact release
- `[X]` Notifications, outbox drain, push

## Phase 9 — should-build
- `[S]` Catalog export (CSV/JSON/simulated ONDC)
- `[X]` Craft knowledge graph enrichment
- `[S]` QR story page (public tier, no PII)
- `[X]` Scam/fraud warnings
- `[S]` Business Assistant (own data only)
- `[X]` Second regional language
- `[X]` Analytics

## Phase 10 — hardening
- `[X]` TalkBack pass on the full seller flow
- `[X]` Dynamic Type 200% pass
- `[X]` Contrast audit, both themes
- `[X]` Offline/failure matrix test
- `[X]` Load test on discovery
- `[X]` Security review, dependency + secret scan
- `[X]` Review every screen against the 30-pattern checklist

## Sequencing note

Phases 0–6 are seller-only in **surface** but Phase 0's spine work is what makes
Phase 7 cheap. The temptation will be to defer the role-parameterised serialiser
and the module dependency check until buyers exist. That is the specific
mistake this plan is arranged to prevent.
