# API contracts

REST over HTTPS. JSON. Bearer access token (short-lived) + refresh token stored
in Android Keystore. Base: `/api/v1`.

**Serialisation is role-parameterised.** The same resource returns different
field sets to seller and buyer per `shared-spine.md` §3. A `SELLER_PRIVATE`
field is *omitted*, never nulled — a null would leak the field's existence.

Errors: RFC 7807 problem+json, with `code` from a closed enum so the client can
map to a localised message and an audio prompt.

---

## Auth & profile

```
POST   /auth/otp/request           { phone }
POST   /auth/otp/verify            { phone, otp } → { access, refresh, roles[], onboarded }
POST   /auth/refresh
POST   /auth/logout
GET    /me                         → user + profiles for held roles
PATCH  /me/language                { preferred_lang }
POST   /me/roles                   add a role to an existing account
GET    /me/consents  POST /me/consents  DELETE /me/consents/{purpose}
POST   /me/delete-request          consent & deletion (security doc)
```

---

## Taxonomy — shared, cached aggressively

```
GET /taxonomy/crafts?parent=&q=
GET /taxonomy/materials?q=
GET /taxonomy/techniques?q=
GET /taxonomy/crafts/{id}          → node + typical materials/techniques/motifs/care
GET /taxonomy/version              → ETag for client-side cache invalidation
```

Bundled offline as a seed dataset; refreshed by version check. Both roles read
the same taxonomy — this is what makes seller attributes and buyer filters
join.

---

## Seller — product pipeline

```
POST   /seller/products                          → Product{DRAFT}
GET    /seller/products?status=&cursor=
GET    /seller/products/{id}
PATCH  /seller/products/{id}                     partial; PUBLISHED → SELLER_REVIEW
DELETE /seller/products/{id}                     DRAFT only

POST   /seller/products/{id}/voice               multipart audio → VoiceInput
POST   /seller/voice/{voice_id}/transcribe       → Transcript (async; 202 + job)
PATCH  /seller/voice/{voice_id}/transcript       seller correction
POST   /seller/products/{id}/extract             → AttributeExtraction[] + gaps[]
PATCH  /seller/products/{id}/extractions/{eid}   { seller_action, value? }

POST   /seller/products/{id}/media               multipart → Media{ORIGINAL} + QualityAssessment
POST   /seller/media/{mid}/enhance               { operations[] } → 202 + job
GET    /seller/media/{mid}/enhance/{job}         → EnhancementRecord + ENHANCED media
POST   /seller/media/{mid}/approve               seller accepts the enhancement
DELETE /seller/media/{mid}                       ENHANCED/LIFESTYLE only; ORIGINAL never deletable

PUT    /seller/products/{id}/price-inputs        → PriceCalculation (new version)
GET    /seller/products/{id}/price               → current version + explanation
GET    /seller/products/{id}/price/explain?lang=hi&format=audio

PUT    /seller/products/{id}/capability          CapabilityBlock
POST   /seller/products/{id}/approve             → SELLER_APPROVED (or CLUSTER_REVIEW)
POST   /seller/products/{id}/publish             → PUBLISHED; 422 lists unmet invariants
POST   /seller/products/{id}/pause
POST   /seller/products/{id}/archive
```

`POST /publish` returning 422 with the exact unmet invariants is what lets the
client render "3 things left before buyers can see this" rather than a generic
error.

```
GET    /seller/export/{id}?target=csv|json|ondc|india_handmade|gem
                                                 → payload + is_simulated flag
```

## Seller — demand side

```
GET    /seller/inquiries?status=&awaiting=me&cursor=
GET    /seller/inquiries/{id}
POST   /seller/inquiries/{id}/messages           { body, lang }
POST   /seller/inquiries/{id}/quotations         Quotation; 409 if below floor
POST   /seller/inquiries/{id}/quotations/{qid}/override
                                                 { reason } → below-floor, audited
POST   /seller/inquiries/{id}/decline            { reason }
GET    /seller/rfq-invitations?cursor=           matched RFQs
POST   /seller/rfq-invitations/{id}/respond      opens an Inquiry
GET    /seller/analytics                         views, inquiries, response time, listings
```

---

## Buyer — discovery

Filters map 1:1 to the matching contract (`shared-spine.md` §4). **No filter
exists here that is not in that table.**

```
GET /buyer/products
    ?craft=&product_type=&material=&technique=
    &region_state=&region_district=
    &quantity=&budget_per_unit=&deadline=
    &customization=&packaging=&sample_required=
    &min_verification=&price_min=&price_max=
    &sort=relevance|lead_time|price&cursor=
    → { items[], facets{}, next_cursor }

GET /buyer/products/{id}      → buyer-tier Product: attributes, capability,
                                wholesale range, ORIGINAL + ENHANCED media,
                                artisan story, district, response signal
GET /buyer/artisans/{id}      → buyer-tier ArtisanProfile + published products
GET /buyer/search/suggest?q=  → taxonomy-backed suggestions, not free-text guesses
```

`facets` are computed from the same capability fields, so a buyer never sees a
filter value that cannot return results.

## Buyer — demand

```
POST   /buyer/rfqs                   → RFQ{DRAFT}
PATCH  /buyer/rfqs/{id}
POST   /buyer/rfqs/{id}/publish      → OPEN; 422 if quantity/budget/deadline missing
GET    /buyer/rfqs?status=&cursor=
GET    /buyer/rfqs/{id}/matches      → Match[] with reasons[], no scores
POST   /buyer/rfqs/{id}/close        { outcome }

POST   /buyer/inquiries              { product_id? , rfq_id?, seller_id, message }
GET    /buyer/inquiries?status=&awaiting=me&cursor=
GET    /buyer/inquiries/{id}
POST   /buyer/inquiries/{id}/messages
POST   /buyer/inquiries/{id}/quotations/{qid}/accept
POST   /buyer/inquiries/{id}/quotations/{qid}/counter   { unit_price, quantity, notes }
POST   /buyer/inquiries/{id}/quotations/{qid}/reject
POST   /buyer/inquiries/{id}/decline
```

## Shared — order intent & threads

```
GET    /order-intents?role=&cursor=
GET    /order-intents/{id}
POST   /order-intents/{id}/confirm
POST   /order-intents/{id}/fulfil
POST   /order-intents/{id}/cancel      { reason }
GET    /messages/{id}/translate?to=    on-read translation, marked machine-translated
GET    /messages/{id}/audio?lang=      TTS for low-literacy reading
```

---

## Notifications & events

Every state transition emits a domain event to the counterparty.

```
GET   /notifications?unread=&cursor=
POST  /notifications/{id}/read
PUT   /me/push-token
```

| Event | To | Trigger |
|---|---|---|
| `product.published` | Cluster manager | Publication in a managed cluster |
| `product.cluster_rejected` | Seller | Cluster review outcome |
| `rfq.matched` | Seller | Included in match set |
| `inquiry.opened` | Seller | Buyer initiated |
| `inquiry.message` | Counterparty | Message posted |
| `quotation.sent` | Buyer | Seller quoted |
| `quotation.accepted` / `.countered` / `.rejected` | Seller | Buyer responded |
| `order_intent.*` | Counterparty | Any transition |
| `inquiry.stale` | Seller | 7 days without response |

Push is a delivery channel, not a source of truth. The client reconciles by
fetching; a dropped push must never lose an inquiry.

---

## Cluster manager

```
GET  /cluster/queue?status=cluster_review
GET  /cluster/artisans
POST /cluster/artisans                     assisted onboarding
POST /cluster/products/{id}/approve
POST /cluster/products/{id}/reject         { reason }
```

Cost fields are omitted from every response on this router unless the artisan
granted access (`role-boundaries.md`).

---

## Conventions

- **Pagination** is cursor-based everywhere. No offsets — listings shift under
  concurrent publication.
- **Idempotency:** every mutating endpoint accepts `Idempotency-Key`. Required
  for offline replay (`offline-strategy.md`) — a retried upload must not create
  a duplicate product.
- **Async jobs** (transcription, enhancement, matching) return `202` with a job
  URL. The client polls with backoff; the job result is durable, so a client that
  dies mid-poll recovers.
- **Optimistic concurrency** via `If-Match` on `PATCH`. Relevant for `Inquiry`,
  where two devices may hold the same thread.
- **`Accept-Language`** sets response language for server-generated text
  (errors, explanations). Content translations come from the `Translatable`
  object, not this header.
