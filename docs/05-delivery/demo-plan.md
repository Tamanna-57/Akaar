# Hackathon demo plan

Eight minutes. One device, mirrored. Live where it is safe, pre-recorded where
network risk is unacceptable — and **say which is which**. A demo caught
overstating loses more than a demo that admits a fallback.

## Setup

- Seeded taxonomy, one buyer account (Aditi, boutique), three seeded listings so
  discovery is not empty. Seed data labelled as seed data.
- Meena's account exists with a completed profile. Onboarding is described, not
  performed — it is not where the value is.
- A physical hand-embroidered bag, deliberately photographed in poor light.
- Offline mode rehearsed. Degraded AI path rehearsed.

## Script

**0:00 — the gap (45s)**
Hold up the bag. "She sells this for ₹450. It retails for ₹1,800. Not because
the middleman is cheating her — because he supplies the photograph, the
description, and the price, and she cannot." State the thesis: those three
artefacts, from a voice and a camera.

**0:45 — capture (60s)**
Photograph the bag in bad light. On-device check flags it; **audio guidance in
Hindi** plays. Move to the window; retake; accepted. Point out this happened
before any upload — she is not paying bandwidth to be told her photo is bad.

**1:45 — voice (60s)**
Record 30 seconds of Hindi describing the bag. Replay. Transcript appears.
Show one deliberate STT error and correct it — the correction step is a feature,
not an apology.

**2:45 — extraction (75s)**
Attributes populate with confidence and source. **Point at the empty
provenance field.** "It did not invent a story or a certification. That is a
deliberate constraint, not a limitation." Two low-confidence fields appear as
questions; answer them by voice.

**4:00 — the Fair Price Shield (90s)** — *the centrepiece*
Enter materials and hours. The breakdown computes: floor ₹520, D2C ₹1,150,
wholesale ₹720–860, net earnings shown. **Play the Hindi audio explanation.**
Then attempt to set ₹400 — refused, with her actual loss stated in Hindi.
"This is arithmetic on her declared costs. Not a model output. That is why it
cannot be argued down."

**5:30 — authenticity (45s)**
Background removed. Before/after slider. "The embroidery is untouched — the
enhancement is bounded outside the product mask and verified by a similarity
check. And the buyer sees the original too." Approve. Published.

**6:15 — the other side (75s)**
Switch to Aditi. Filter: kashidakari · 40 units · ₹800/unit · 5 weeks · Barmer.
Meena appears, **with reasons**: "meets your 40-unit MOQ, ships in 18 days."
Send an RFQ. Switch back to Meena — the inquiry has arrived, **in Hindi**.
Reply by voice. Quotation. "One record. Two roles. The buyer's filters are the
seller's capability fields — that join was designed before either screen was."

**7:30 — metrics and close (30s)**

## Metrics slide

| Metric | Target |
|---|---|
| Listing creation time | < 6 min |
| Typing actions | 0 |
| Fields completed by voice | ≥ 80% |
| Image quality | flagged → corrected → passed |
| Price floor | ₹520 vs. ₹450 current sale — a 16% uplift **at the floor** |
| Buyer match | 1 of 3 seeded listings, on hard constraints |
| Offline resilience | flow survives network loss at any step |

Show the real numbers from the run just performed, not slide numbers.

## Contingencies

| Failure | Response |
|---|---|
| No network | Switch to offline: capture, voice, costs all work. Show the queue. Then play the recorded AI segment, announced as recorded. |
| STT fails live | Correction UI *is* the fallback. Type the transcript and continue. |
| Enhancement times out | Publish with the original. "The original is always the fallback — by design." |
| Device dies | Recorded run, announced as recorded. |

## Questions to expect

**"Isn't this just an AI wrapper?"** The floor is arithmetic on declared costs
with a database-level invariant; enhancement is bounded so it provably cannot
alter the product; every AI output has a human gate and an audit row. Show the
extraction audit table.

**"How do you know artisans will use it?"** We do not, yet — it is listed as an
unverified assumption. Every voice step has a manual fallback and there is an
assisted onboarding mode for that reason.

**"What if the AI hallucinates provenance?"** It cannot populate provenance
fields at all. Show the constraint.

**"What's actually built vs. mocked?"** `mvp-boundaries.md`, read out honestly.
Marketplace exports are flagged simulated in the database.
