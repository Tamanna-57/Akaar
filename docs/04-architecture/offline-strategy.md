# Offline strategy

Meena has the phone for two hours in the evening, indoors, on 4G that drops. If
losing signal loses her work, she does not come back. Offline is a correctness
requirement, not a resilience nicety.

## What works fully offline

| Capability | Mechanism |
|---|---|
| Create and edit a product draft | Room, local-first |
| Capture photos | App-private storage; upload queued |
| Record voice | Local file; transcription queued |
| Fill costs, capability, inventory | Local |
| Browse own products and cached inquiries | Room |
| Read a fetched inquiry thread | Room |
| Taxonomy browse and search | Seeded local dataset, version-refreshed |

## What requires connectivity

Transcription, translation, extraction, image enhancement, **floor
computation**, publication, discovery, RFQ, messaging.

Each of these is presented as a queued step with a clear state, never as a
blocking failure. The product pipeline is designed so that everything the
artisan can do alone happens before the first mandatory network hop.

**Pricing is deliberately server-side** even though the arithmetic is trivial.
The floor is the product's central guarantee; a client-side implementation is a
client-side implementation that can be tampered with, and a second place for the
formula to drift.

The one accepted consequence: the artisan can complete a full draft offline but
cannot see her price until she syncs. The UI states this plainly at the point of
capture ("price will be calculated when you're back online"), rather than
letting her discover it at the end.

## The outbox

Mutations queue locally as intents, not as raw HTTP retries.

```
LocalMutation
  id, entity_type, entity_id, operation, payload
  idempotency_key            generated at enqueue, never regenerated on retry
  attempts, next_attempt_at, last_error?
  state  PENDING | IN_FLIGHT | SYNCED | FAILED_PERMANENT
```

- Drained by WorkManager with exponential backoff and a network constraint.
- `Idempotency-Key` is generated once at enqueue, so a retry after an
  ambiguous timeout cannot create a duplicate product or a duplicate message.
- Ordering is per-entity FIFO. Cross-entity ordering is not preserved, which is
  safe because the state machines forbid the dependent transitions.
- Media uploads are chunked and resumable; a dropped 40 MB photo upload resumes
  rather than restarting on a metered connection.

## Sync state is per item, never global

A global "syncing…" banner tells the artisan nothing actionable. Each product
carries a visible state:

| State | Shown as (Hindi + icon) |
|---|---|
| `LOCAL_ONLY` | "Saved on your phone" |
| `QUEUED` | "Will upload when you have signal" |
| `UPLOADING` | progress |
| `PROCESSING` | "AI is working — you can leave this screen" |
| `NEEDS_ATTENTION` | "Something needs your input" |
| `SYNCED` | "Saved" |
| `FAILED` | "Couldn't upload — tap to retry" |

`PROCESSING` explicitly says she can leave the screen. Holding a low-literacy
user hostage to a spinner is how a session gets abandoned.

## Conflicts

Rare by construction: a seller's own products are single-writer, and inquiries
are turn-based with `awaiting_party` gating writes.

The residual cases:

| Case | Resolution |
|---|---|
| Same product edited on two devices | `If-Match` / version. Server rejects stale; client shows both versions and asks. Never silently overwrite declared costs. |
| Message sent while thread advanced | Message appends regardless — append-only, no conflict. |
| Product published while an offline edit was pending | Edit applies and drops the product to `SELLER_REVIEW`; the artisan is told the listing is hidden until she re-approves. |
| Capacity committed while offline | Server is authoritative. If capacity is gone, the quotation is rejected with a clear reason — never an oversell. |

## Retention

Local drafts and their media persist until published or deleted. Local audio is
purged after successful transcription and server acknowledgement, mirroring the
server retention rule. Encrypted at rest (SQLCipher) because drafts contain
declared costs.
