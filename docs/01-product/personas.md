# Personas

Personas exist here to settle design arguments, not to decorate a deck. Each one
ends with the decisions it dictates.

---

## Seller — Meena Devi

Age 41. Barmer district, Rajasthan. Hand embroidery (kashidakari) on bags and
yokes. Speaks Marwari, reads Hindi slowly, does not read English. Shares an
Android phone (4G, 3 GB RAM, Android 11) with her son; has it for roughly two
hours in the evening. Network drops indoors. Sells to a visiting trader at
₹350–500 per bag; the trader retails at ₹1,800.

Produces 6–8 bags a week alone, up to 25 with four women in her cooperative.

**What she is afraid of:** being blamed for a mistake in the app; committing to
an order she cannot deliver; someone stealing her designs.

**Decisions this dictates:**
- Voice is the primary input; typing is a fallback, never a requirement.
- Every screen has one primary action and can be completed in under 30 seconds.
- Every AI output is reversible and has an audible Hindi explanation.
- Work must survive losing network mid-flow — drafts are local-first.
- Never auto-commit her to a quantity or a date. Capacity is declared, then
  confirmed per order.
- Original photographs are retained and shown alongside enhanced ones.

---

## Seller (assisted) — Cluster Manager, Ramesh

Age 29. Runs a 40-artisan SHG federation office. Literate in Hindi and
functional English. Onboards artisans in batches on a shared tablet, reviews
listings before they go live.

**Decisions this dictates:**
- Cluster mode is not an admin panel — it is a *queue*: onboard, review, approve.
- A product can require cluster approval before publication. This is a second
  gate on the seller→buyer edge.
- He must never be able to alter an artisan's declared costs without an audit
  entry.

---

## Buyer — Aditi, boutique owner (primary B2B)

Age 34. Runs two stores in Bengaluru plus an export-facing Instagram. Sources
40–60 units per style, 6–10 styles a season. Budget ₹700–1,400 per unit
wholesale. Needs delivery inside 5 weeks. Fluent English, reads no Hindi.

**What she is afraid of:** paying for a sample and receiving something that looks
nothing like the photo; a seller who ghosts after the first message; missing her
season because lead time was understated.

**Decisions this dictates:**
- Enhanced and original images must both be visible on the product detail page.
  The original is the trust anchor, not a footnote.
- MOQ, capacity and lead time are **required** filters, not optional ones — they
  are her real constraints and the seller must supply them.
- Everything the seller writes in Hindi must reach her in English, with the
  original one tap away.
- Response-time and reliability signals on the seller matter more than rating
  stars.

---

## Buyer — Vikram, exporter (secondary)

Sources 300–1,000 units, 90-day lead time, needs consistency and compliance
documentation. Cares about capacity aggregation across a cluster more than any
individual artisan.

**Decisions this dictates:**
- A cluster must be addressable as a supply unit, not just individual artisans.
  Capacity aggregation is a `SHOULD BUILD`, but the data model must allow it now.
- Do not fabricate compliance or certification claims. Absent is absent.

---

## Deliberately not served in the MVP

Retail consumers. They would pull the product toward cart, reviews, and
recommendation feeds — all explicit non-goals — and their price sensitivity
works directly against the Fair Price Shield.
