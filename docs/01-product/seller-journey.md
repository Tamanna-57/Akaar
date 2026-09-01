# Seller journey

The complete artisan path. Times are targets, measured on the demo device.

## First run — under 3 minutes

1. **Language** — spoken language names with audio, large tiles. Before any
   text is shown, because the choice determines what she can read.
2. **Role** — Seller / Buyer, illustrated, spoken.
3. **Phone + OTP** — number pad, autofill, audio prompt on error.
4. **Profile** — one question per screen, voice answers accepted:
   name → state/district → craft → capacity → cooperative/cluster.
   Craft picks from the taxonomy with images, not a text field.
5. **Consent** — AI processing, in her language, with audio.
6. **Home** — with one obvious next action: Add Product.

## Creating a product — target under 6 minutes, zero typing actions

```
Add Product
  │
  ├─ 1. Photograph                 CameraX, framing + lighting overlay
  │     on-device blur/exposure/occlusion check → audio guidance
  │     ("thoda roshni mein le jaayein")
  │     retake or accept · original saved locally
  │
  ├─ 2. Speak about it             one prompt, spoken: "aap kya bana rahe hain?"
  │     record · pause · replay · re-record
  │     visible waveform so she knows it is listening
  │
  ├─ 3. AI works                   [QUEUED if offline]
  │     STT → translation → extraction → taxonomy match → gap detection
  │     screen says she may leave; a notification brings her back
  │
  ├─ 4. Review what it heard       transcript with correction
  │     each extracted attribute: value + Accept / Edit / Regenerate / Reject
  │     low confidence surfaces as a QUESTION, never a filled-in guess
  │
  ├─ 5. Answer what's missing      one question per screen, voice-answerable
  │     only asks for fields the matching contract actually needs
  │
  ├─ 6. Costs                      materials → hours → rate → packaging
  │     numeric pads, spoken prompts, sensible defaults from her profile
  │
  ├─ 7. Fair Price Shield          [needs network]
  │     line-item breakdown, floor marked, D2C + wholesale range,
  │     net earnings, spoken Hindi explanation
  │     she may raise the price; lowering below floor is refused with a reason
  │
  ├─ 8. Capability                 MOQ · capacity per cycle · cycle days ·
  │     lead time · customisation. Framed as "how many and how fast",
  │     not as inventory management. Required — without it she is invisible.
  │
  ├─ 9. Image studio               background/clutter removal, white balance,
  │     crop. Before/after slider. Original always retained and shown.
  │     Optional AI lifestyle background, explicitly labelled.
  │     She approves or keeps the original.
  │
  ├─ 10. Review the listing        Hindi and English, both spoken.
  │      English matters because it is what the buyer judges her on,
  │      so it is read aloud in Hindi translation before approval.
  │
  └─ 11. Approve → PUBLISHED       (or CLUSTER_REVIEW if she is cluster-managed;
         told plainly that a manager will check it first)
```

**The zero-typing claim** holds if: craft comes from the taxonomy picker,
attributes come from voice, costs come from numeric pads, and capability comes
from steppers. Text entry exists as a fallback on every one of these, never as
the only path.

## Living with the app

**Home** — what needs attention, in priority order: inquiries awaiting her,
drafts that stalled, products needing re-approval. Not a metrics dashboard.

**My Products** — list with per-item sync and lifecycle state
(`offline-strategy.md`). Pause, edit, archive. An edit to a published product
tells her plainly that buyers will not see it until she approves again.

**Inquiries** — buyer messages in Hindi, machine-translated with "show original"
and audio playback. Reply by voice. Quotation creation walks the same
line-item pattern as pricing, with the floor enforced.

**Business Assistant** — answers from **her own data only**: "how many bags did
I list?", "what is my lowest price?", "who asked about the blue bag?" Grounded in
her records; it does not answer general questions and says so.

## The failure paths, designed

| Failure | What she sees |
|---|---|
| Network drops mid-flow | Work is saved. "Will upload when you have signal." She continues. |
| STT fails | "We couldn't hear that clearly." Replay, re-record, or type/pick. Never a dead end. |
| Extraction low confidence | Becomes questions, one at a time. No wrong facts to un-say. |
| Enhancement fails or is flagged | Original stands. She can publish with it. |
| Publication blocked | Named list: "3 things left" — each tappable, each spoken. |
| Buyer pushes below floor | Warning in Hindi with the reason and her actual earnings at that price. Override requires deliberate confirmation. |
