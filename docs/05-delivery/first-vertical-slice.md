# First vertical slice

Mandated by §11 of the source prompt:

```
seller login → seller profile → product photo → voice recording
→ speech-to-text → structured extraction → image enhancement
→ price calculation → seller approval → saved catalog item
```

One artisan, one product, end to end, on a real device. **No buyer surface in
this slice** — but every object it writes conforms to the spine, so the buyer
slice reads it without a migration.

## Definition of done

- Meena signs in with OTP, picks Hindi, completes her profile.
- She photographs a bag; on-device quality check gives audio guidance.
- She describes it in Hindi; STT and extraction populate attributes with
  confidences and sources.
- Low-confidence fields appear as questions, not as filled values.
- She supplies costs; the server computes the floor and explains it in spoken
  Hindi.
- Background removal runs; the original is retained and shown side by side; she
  approves or keeps the original.
- She approves; the product reaches `PUBLISHED` with a complete capability
  block.
- Killing the network at any step loses nothing; work resumes on reconnect.
- Every screen renders all six states.
- The product row satisfies every publication invariant in
  `state-machines.md` — verified by a test, not by inspection.

## Build order

**Phase 0 — foundations (must precede everything)**
Gradle multi-module skeleton with the seller↛buyer dependency check in CI ·
design system tokens and components with all six state scaffolds ·
`:core:domain` canonical models · FastAPI skeleton with role-parameterised
serialiser · Postgres schema and RLS · auth · CI.

*The role-parameterised serialiser and the dependency check are Phase 0 on
purpose. Both are cheap now and near-impossible to retrofit once thirty
endpoints and forty screens exist.*

**Phase 1 — identity** OTP, language, role, profile, taxonomy seed and picker.

**Phase 2 — capture** CameraX + overlay, on-device quality, original storage,
resumable upload, voice record/pause/replay, local draft persistence, outbox.

**Phase 3 — AI** STT and translation adapters with fallbacks · extraction with
strict schema, confidences, sources · taxonomy matching · gap detection ·
transcript and attribute review UI · the AI-output block component.

**Phase 4 — pricing** Pricing service (pure, exhaustively tested) · cost input ·
breakdown component · Hindi TTS explanation · floor invariant in the database.

**Phase 5 — image** Enhancement worker, bounded ops, authenticity check,
before/after compare, approval.

**Phase 6 — publication** Capability input · publication invariants with a 422
that names what is missing · approval · product list with sync states ·
cluster review path.

Phases 3–5 are independently demoable. If AI providers fail on demo day, the
fallbacks in `ai-architecture.md` keep the slice complete — slower and with more
typing, but not broken.

## Immediately after the slice

The buyer slice, against the same objects: discovery with the matching contract
→ product detail with both image sets → RFQ → inquiry → quotation with floor
enforcement → order intent.

If the seller slice is built correctly against the spine, the buyer slice adds
**no** new fields to `Product`. That is the test of whether the interdependence
work was done properly, and it is worth stating as a prediction now so it can be
checked later.
