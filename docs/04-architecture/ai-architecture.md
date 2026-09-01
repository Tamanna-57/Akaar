# AI architecture

Three bounded pipelines. Every stage has a schema, a confidence, a version, a
fallback, and a human gate. Nothing is a free-form model call into product data.

---

## Pipeline 1 — Voice → catalog

```
audio → language ID → STT → translation/normalisation → attribute extraction
      → taxonomy matching → gap detection → SELLER CONFIRMATION
      → catalog generation → validation → SELLER APPROVAL
```

The two capitalised stages are hard gates. Nothing advances past them without an
explicit human action recorded in `approval_records`.

### Component choices

| Stage | Primary | Alternative | Open source | Fallback if it fails |
|---|---|---|---|---|
| Language ID | Bhashini LID | Whisper LID | `fastText` lid.176 | Ask the artisan to pick her language (already known from profile) |
| STT (Hindi/Indic) | Bhashini ASR | Google STT (`hi-IN`) | AI4Bharat IndicWhisper | Store audio, mark `TRANSCRIPTION_PENDING`, retry; artisan may proceed with photo + manual fields |
| Translation hi↔en | AI4Bharat IndicTrans2 | Bhashini NMT | IndicTrans2 (self-host) | Show source language only; block publication until English is reviewed |
| Attribute extraction | LLM with strict JSON schema + function calling | Fine-tuned encoder + rules | Rules + taxonomy lookup over transcript | Fall back to guided one-question-at-a-time form. **Never guess.** |
| Taxonomy matching | Embeddings (`pgvector`) + fuzzy over craft nodes | Exact + synonym table | `sentence-transformers` multilingual | Keep as `unmapped_text`, ask the artisan to pick from a shortlist |
| Catalog copy (hi/en) | LLM, constrained to extracted attributes only | Template + slot filling | Templates | Templates. Copy quality degrades; correctness does not. |
| TTS (explanations) | Bhashini TTS | Google TTS | Coqui / Indic-TTS | Show text; the screen is never audio-only |

**Bhashini first** because it is Indian-government-backed, covers Indic languages
the commercial APIs handle poorly, and is defensible in this problem domain.
IndicTrans2 self-hosted is the cost and privacy backstop.

### The "never invent" rule, mechanically

Extraction is constrained to a JSON schema where every field is
`{ value, confidence, source, evidence_span }`. Post-conditions, enforced in
code before anything is persisted:

1. A field with no `evidence_span` in the transcript is dropped, not kept at low
   confidence.
2. Provenance-class fields — certification, cultural history, sustainability,
   artisan story, age of tradition — are **never** LLM-populated. Extraction may
   only lift them verbatim from the artisan's own words, or leave them empty.
3. `TAXONOMY_INFERENCE` is permitted only for facts derivable from a matched
   craft node (standard care instructions, typical technique family), and is
   labelled as such to the seller.
4. Confidence below threshold → the field becomes a **question**, not a value.

Prompts are versioned files in the repository, not strings in code. Every
extraction row records `model_version` and `prompt_version`, so a regression is
attributable.

---

## Pipeline 2 — Image, authenticity-bounded

```
original → quality assessment → segmentation → BOUNDED enhancement
         → e-commerce formatting → authenticity check → SELLER APPROVAL
```

| Stage | Primary | Open source | Fallback |
|---|---|---|---|
| Quality (blur/exposure/occlusion) | On-device ML Kit + OpenCV | Laplacian variance, histogram | Skip scoring, show guidance overlay only |
| Segmentation / background removal | `rembg` (U2Net / IS-Net) server-side | same | Keep original; offer manual crop |
| White balance, exposure | OpenCV, clamped | same | Skip; original stands |
| Formatting | Deterministic crop/pad to marketplace ratios | — | — |
| Authenticity check | SSIM + colour-histogram delta inside the product mask | — | Flag for review; do not auto-publish |
| Lifestyle background | Diffusion, **explicitly labelled** | SDXL inpaint | Feature off |

### The bounds

The enhancement is only credible if it is *provably* incapable of altering the
product. So:

- Every operation runs **outside** the segmentation mask, or is a global
  colour-space adjustment within fixed limits.
- Inside the mask: no generative fill, no sharpening that invents texture, no
  saturation shift beyond a clamp, no geometry change.
- The authenticity check compares original and enhanced **within the mask**.
  SSIM below threshold or a hue shift beyond tolerance → `FLAGGED`, blocked
  from auto-approval.
- `ORIGINAL` is retained permanently and shown to the buyer beside the enhanced
  image. This is the strongest available answer to "did the AI fake this?"
- AI lifestyle backgrounds carry a persistent, non-dismissible label in both the
  seller and buyer UI, and are a separate `Media.role`.

Embroidery, texture, colour, and shape are the things a buyer is paying for.
This pipeline exists to make them untouchable.

---

## Pipeline 3 — Pricing

**Not a model.** Deterministic arithmetic on declared inputs.

```
sustainable_floor = materials + labour_hours × labour_rate + packaging
                  + overhead + shipping + platform_fees + minimum_margin
d2c_recommended   = floor × d2c_multiplier(craft, complexity)
wholesale_range   = [floor × wholesale_min_mult, floor × wholesale_max_mult]
```

ML is confined to two advisory, clearly-labelled roles:

1. **Multiplier suggestion** — gradient boosting over comparable listings to
   suggest `d2c_multiplier`. Suggestion only; the seller sets the value, and the
   floor is never a model output.
2. **Market reference** — comparable price ranges, shown as *reference*, never as
   a recommendation, and never able to lower the floor.

Confidence reflects **input completeness**, not model certainty: estimated
labour hours or absent overhead lowers it. The explanation is generated from the
computation, sentence by sentence, and read aloud in Hindi:

> "Material ₹180. Aapka 6 ghante ka kaam ₹300. Packaging ₹40. Kul lagat ₹520.
> Isse kam mein bechna aapke liye nuksan hai."

Automated repricing is a **non-goal**. A price that drifts under buyer pressure
is not a shield.

---

## Pipeline 4 — Matching

Hard filters from `shared-spine.md` §4 run first in SQL. Survivors are ranked by
the weighted signals in that section; craft/technique similarity uses `pgvector`
cosine over taxonomy + attribute embeddings.

No learned ranker in the MVP. With low listing volume it would overfit, and it
would make match reasons unexplainable — and the buyer is shown *reasons*, not
scores.

---

## Cross-cutting requirements

**Cost and latency** (per listing, order of magnitude):

| Stage | Latency | Notes |
|---|---|---|
| STT (60 s audio) | 3–8 s | Async, 202 + poll |
| Translation | < 1 s | |
| Extraction | 2–5 s | Largest token cost |
| Enhancement | 4–10 s | GPU worker; queued |
| Pricing | < 50 ms | Pure arithmetic |
| Matching | < 300 ms | Indexed |

Budget roughly ₹4–8 per listing at hackathon volume, dominated by extraction and
GPU enhancement. Self-hosted IndicTrans2 + `rembg` cuts it to compute cost.

**Privacy**
- Audio is minimally retained with a hard `retention_expires_at`; a worker
  purges. Transcripts persist, audio does not.
- No PII in prompts. Extraction sees the transcript, not the profile.
- Third-party inference is opt-in via `consents`, disclosed in the artisan's
  language, and revocable.
- All model calls are server-side. No API keys reach the device.

**Governance**
- Strict JSON schemas at every boundary; a schema violation fails closed.
- `model_version` + `prompt_version` on every AI-produced row.
- Full audit log of AI output and the seller's accept/edit/reject.
- Every pipeline has a documented non-AI fallback, above. **The app must be
  fully usable — slower, more typing — with every model unavailable.** A
  demo-day API outage must not be able to make the product look broken.

**Hackathon feasibility**
Realistic in scope: Bhashini/Google STT, IndicTrans2, LLM extraction with strict
schemas, `rembg`, OpenCV, deterministic pricing, pgvector matching. Deferred:
fine-tuned craft models, learned ranking, on-device Indic STT, diffusion
lifestyle backgrounds.
