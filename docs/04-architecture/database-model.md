# Database model

PostgreSQL 16. `pgvector` for taxonomy and attribute embeddings. Object storage
(S3-compatible) for media and audio — never bytes in the database.

## Tables

Grouped by ownership. `→` denotes a foreign key.

**Identity**
`users`, `user_roles`, `artisan_profiles`, `buyer_profiles`, `clusters`,
`cluster_members`, `consents`

**Taxonomy**
`craft_nodes`, `material_nodes`, `technique_nodes`, `craft_node_embeddings`

**Product**
`products`, `product_attributes`, `product_capability`, `media`,
`enhancement_records`, `quality_assessments`, `voice_inputs`, `transcripts`,
`attribute_extractions`, `approval_records`, `translatable_texts`

**Pricing**
`price_calculations` (versioned, immutable), `market_references`

**Demand**
`rfqs`, `matches`, `inquiries`, `messages`, `quotations`, `order_intents`

**Cross-cutting**
`notifications`, `audit_logs`, `marketplace_exports`, `idempotency_keys`,
`outbox_events`

## Invariants enforced in the database

These are the rules that must not depend on application code being correct.

| Invariant | Mechanism |
|---|---|
| `wholesale_min ≥ sustainable_floor` | `CHECK` on `price_calculations` |
| Quotation clears the floor unless overridden | `CHECK (unit_price >= floor_snapshot OR override_reason IS NOT NULL)` |
| A published product has a complete capability block | Partial `CHECK` gated on `status = 'PUBLISHED'` + `NOT NULL` on capability columns |
| An `ORIGINAL` media row is never deleted | No delete grant; revoked at the role level, plus a `BEFORE DELETE` trigger |
| Messages are append-only | No `UPDATE`/`DELETE` grant on `messages` |
| `price_calculations` immutable | No `UPDATE` grant; new row per version, `UNIQUE (product_id, version)` |
| One active order intent per quotation | `UNIQUE (quotation_id)` |
| Money is integer | `BIGINT` paise columns. No `FLOAT`/`NUMERIC` on money. |
| Audio retention | `retention_expires_at NOT NULL` on `voice_inputs`; a worker purges |

Application-level checks are duplicated in the service layer for good error
messages, but the database is the backstop.

## Indexes that matter

Discovery is the hot path. Buyer filtering runs the matching contract, so the
indexes follow that table directly.

```sql
-- discovery: only published rows are ever scanned
CREATE INDEX idx_products_discovery ON products (status, craft_id, product_type_id)
  WHERE status = 'PUBLISHED';

-- capability filters (quantity / deadline rules)
CREATE INDEX idx_capability_match ON product_capability
  (moq, capacity_per_cycle, lead_time_days);

-- price filters; wholesale_min is the buyer-visible bound
CREATE INDEX idx_price_wholesale ON price_calculations (product_id, wholesale_min, wholesale_max)
  WHERE is_current;

-- array overlap on materials/techniques
CREATE INDEX idx_product_materials ON product_attributes USING GIN (materials);
CREATE INDEX idx_product_techniques ON product_attributes USING GIN (techniques);

-- region
CREATE INDEX idx_artisan_region ON artisan_profiles (state, district);

-- semantic ranking
CREATE INDEX idx_craft_embedding ON craft_node_embeddings
  USING hnsw (embedding vector_cosine_ops);

-- inbox: "what needs my attention"
CREATE INDEX idx_inquiries_awaiting ON inquiries (seller_id, awaiting_party, last_activity_at DESC);
CREATE INDEX idx_inquiries_buyer    ON inquiries (buyer_id, status, last_activity_at DESC);
```

`idx_inquiries_awaiting` backs the single most-used seller screen. `awaiting_party`
being a stored column rather than a derived predicate is what makes that index
possible — a deliberate denormalisation.

## Row-level security

RLS is enabled on `products`, `inquiries`, `messages`, `quotations`,
`price_calculations`, `rfqs`, `order_intents`. Policies keyed on a session
variable set per request (`app.user_id`, `app.role`, `app.cluster_id`).

RLS is a second line, not the first — the API layer scopes queries. It exists so
that a missing `WHERE` clause in one handler is not a data breach.

## Outbox

Every state transition writes an `outbox_events` row in the **same transaction**
as the state change. A worker drains it to notifications and push. This is why a
seller cannot have a product publish without the cluster manager being notified,
even if the push service is down.

## Migrations

Alembic, forward-only. Every migration reviewed against `domain-model.md` — a
column that does not appear there does not get created.
