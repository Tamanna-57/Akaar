# Backend architecture

FastAPI (Python 3.12), PostgreSQL 16 + pgvector, Redis, S3-compatible object
storage, RQ/Celery workers. Deliberately boring — the interesting engineering in
this product is the pricing invariant and the authenticity bound, not the
infrastructure.

```
Android ──HTTPS──▶ FastAPI ──▶ services ──▶ PostgreSQL
                      │            │
                      │            ├──▶ Redis (cache, queue, rate limit)
                      │            └──▶ Object storage (media, audio)
                      │
                      └──▶ outbox ──▶ workers ──▶ AI providers / push
                                              └──▶ export adapters
```

## Layout

```
backend/app/
  api/v1/
    auth.py  seller.py  buyer.py  shared.py  cluster.py  taxonomy.py
  domain/          Pydantic canonical schemas — mirror of docs/04-architecture/domain-model.md
  services/
    pricing/       the floor. Pure functions, exhaustively tested.
    matching/      the filter + rank contract from shared-spine.md §4
    catalog/       product lifecycle, publication invariants
    ai/            orchestration; provider adapters behind interfaces
    media/         upload, enhancement jobs, authenticity check
    export/        marketplace adapters
    notify/        outbox drain, push
  workers/         transcription, enhancement, matching, retention purge, outbox
  db/              SQLAlchemy models, Alembic migrations, RLS policies
  core/            config, security, role serialisation, errors
```

**`services/pricing` and `services/matching` are the two modules that must not
be duplicated per role.** Both roles' routers call the same functions. If a
pricing rule appears in `api/v1/buyer.py`, that is the defect.

## Role-parameterised serialisation

One mechanism, applied everywhere. Each domain schema declares field tiers; a
single serialiser projects by requesting role.

```python
class ProductOut(TieredModel):
    title: Translatable                       = tier(BUYER_VISIBLE)
    wholesale_min: Money | None               = tier(BUYER_VISIBLE)
    sustainable_floor: Money | None           = tier(SELLER_PRIVATE)
    materials_cost: Money | None              = tier(SELLER_PRIVATE)

# a buyer response simply does not contain the SELLER_PRIVATE keys
return serialize(product, role=ctx.role, owner=ctx.is_owner)
```

Hand-written per-role response models are forbidden — that is how a cost field
eventually leaks into a buyer payload. There is one serialiser and it is
covered by a test that asserts, for every schema, that no `SELLER_PRIVATE` field
appears in any buyer-role projection.

## Async work

Redis-backed queue. Jobs: `transcribe`, `translate`, `extract`, `enhance`,
`authenticity_check`, `match_rfq`, `drain_outbox`, `purge_expired_audio`,
`build_export`.

All are idempotent and keyed by entity + version, so a retry after a worker
crash cannot double-charge an AI provider or produce a duplicate `ENHANCED`
image.

GPU work (`rembg`, optional diffusion) runs on a separate queue so a slow
enhancement never delays transcription.

## Reliability

- Provider adapters behind interfaces with per-provider circuit breakers; the
  fallbacks in `ai-architecture.md` are wired, not theoretical.
- Every AI call has a timeout and a bounded retry. Exhausted → the entity
  enters a `*_PENDING` state the UI can render honestly, never a silent failure.
- Rate limits per user and per IP on OTP, upload, and AI-triggering endpoints.

## Configuration and secrets

Environment-injected; nothing committed. No provider key is ever proxied to the
client. `.env.example` documents the keys without values.

## Observability

Structured JSON logs with a request ID propagated from the client. **No PII, no
transcript text, no cost values in logs.** Metrics: listing funnel by stage, AI
stage latency and failure rate, floor-override frequency, match yield per RFQ,
inquiry first-response time.

Floor-override frequency is the health metric for the product's central claim.
If it climbs, the shield is being routed around and the multipliers or the
defaults are wrong.

## Deployment

Single container image for API and workers, differing only by entrypoint.
Managed Postgres, managed Redis, S3-compatible bucket with private ACL and
signed URLs (short TTL). One staging, one production. Alembic runs on deploy.
