# Product understanding

## The problem, stated precisely

A rural artisan can make a product worth ₹2,400 and sell it for ₹450, because
the three things that set price — a credible description, a usable photograph,
and a defensible cost basis — all require literacy, English, a camera skill, and
market knowledge they do not have. The middleman supplies those three things and
charges for them by capturing the margin.

Akaar does not try to remove the middleman. It removes the *dependency* by
manufacturing those three artefacts from inputs the artisan already has: a voice
and a phone camera.

## What Akaar actually is

A **catalog production tool** with a B2B demand side attached. Not a
marketplace, not a chatbot.

The distinction matters for every design decision:

- A marketplace optimises for transaction volume. Akaar optimises for **listing
  quality and price floor integrity**.
- A chatbot optimises for conversational range. Akaar optimises for a **bounded,
  auditable pipeline** where every AI output is reviewable and rejectable.

## The three claims the product must survive

Anything that undermines one of these makes the product dismissible.

**1. "It's just an AI wrapper."**
Rebuttal is the Fair Price Shield and the authenticity guarantee — both are
constrained, explainable systems with human approval gates, not prompt calls.
The price floor is arithmetic on declared costs, not a model output. Image
enhancement is bounded so it provably cannot alter the product.

**2. "Artisans won't use it."**
Rebuttal is the voice-first, one-question-at-a-time, minimal-typing UX and the
Cluster Manager assisted-onboarding mode. The target is a listing created with
zero typing actions.

**3. "The AI will hallucinate a false provenance."**
Rebuttal is the hard rule: **never invent** attributes, certifications, cultural
history, sustainability claims, or artisan stories. Missing is a first-class
state that surfaces as a question, never as a plausible guess. Every extracted
field carries a confidence score and a source.

## Why seller and buyer are interdependent, not parallel

The seller side produces exactly one artefact of value: an **approved, priced,
canonical product record**. The buyer side consumes exactly that artefact and
produces exactly one artefact in return: an **RFQ or inquiry with committed
quantity, budget and deadline**.

Everything else on both sides is scaffolding around that exchange.

This means:

- The buyer's search filters are not a UI decision. They are a **read of the
  seller's capability fields**. Every filter must correspond to a field the
  seller actually supplied, or the filter returns noise.
- The seller's inventory fields are not bookkeeping. They are the **inputs to
  buyer matching**. A field no buyer filters on is a field the seller should not
  be asked to fill.
- Price is the shared object with two faces: the floor is seller-private, the
  wholesale range is buyer-visible, and negotiation between them is
  server-clamped.

If either side is designed without the other in view, the join is noise. That is
why `docs/02-interdependence/` is specified before either feature stack.

## Non-goals

Explicitly out of scope, from the source prompt and by inference:

- Consumer D2C marketplace with cart, reviews, and recommendation feeds
- Social feed or follower graph
- Blockchain certificates without a named partner
- Automated dynamic repricing (violates the price floor guarantee)
- AR / 3D preview
- Full logistics and settlement
- Live publishing to GeM / IndiaHandmade / ONDC without written authorisation
