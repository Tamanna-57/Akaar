# Domain model

Canonical models. Mirrored in `backend/app/domain/` (Pydantic) and
`android/core/domain/` (pure Kotlin data classes). Both are generated from, or
reviewed against, this file. Divergence between them is the defect class this
document exists to prevent.

Notation: `?` = nullable. `[]` = list. Tier from `shared-spine.md` §3.

---

## Identity

```
User
  id            UUID
  phone         String            SELLER_PRIVATE
  roles         Role[]
  preferred_lang LangCode         "hi" | "en" | regional
  created_at    Instant
  consent       Consent
```

```
ArtisanProfile
  user_id            UUID
  display_name       String            BUYER_VISIBLE
  legal_name         String?           SELLER_PRIVATE
  state              String            BUYER_VISIBLE
  district           String            BUYER_VISIBLE
  address_line       String?           SELLER_PRIVATE
  crafts             CraftRef[]        BUYER_VISIBLE
  languages          LangCode[]        BUYER_VISIBLE
  cluster_id         UUID?             BUYER_VISIBLE
  verification_tier  UNVERIFIED | SELF | CLUSTER | ADMIN     BUYER_VISIBLE
  packaging_options  Packaging[]       BUYER_VISIBLE
  sample_policy      NONE | PAID | FREE_ABOVE_QTY            BUYER_VISIBLE
  default_labour_rate Money?           SELLER_PRIVATE
  story              Translatable?     BUYER_VISIBLE
  response_signal    ResponseSignal    BUYER_VISIBLE   (derived, see below)
```

```
BuyerProfile
  user_id          UUID
  org_name         String            visible to matched sellers only
  org_type         BOUTIQUE | EXPORTER | RETAILER | CORPORATE_GIFTING | OTHER
  gstin            String?           SELLER_PRIVATE-equivalent; never public
  city, state      String
  sourcing_crafts  CraftRef[]
  typical_order_qty IntRange?
  verification_tier UNVERIFIED | DOCUMENTS | ADMIN
```

`ResponseSignal` is derived, never stored as an editable field:
`{ median_first_response_hours, response_rate_90d, fulfilled_intents }`.
Presented to buyers as a phrase ("usually replies within a day"), not a score.

---

## Craft taxonomy

The knowledge graph. Shared vocabulary for both sides — the reason buyer
`craft=kashidakari` finds seller `craft=kashidakari` rather than a string match.

```
CraftNode
  id, parent_id?, name Translatable, level  CATEGORY|CRAFT|SUB_CRAFT
  regions[], typical_materials[], typical_techniques[], motifs[]
  care_instructions Translatable
  embedding vector(768)         for semantic matching
```

`MaterialNode`, `TechniqueNode` follow the same shape. Buyer filters and seller
attributes both resolve to node IDs; free text is resolved to a node or held as
`unmapped_text` and never silently coerced.

---

## Product — the central object

```
Product
  id                UUID
  seller_id         UUID
  status            ProductStatus                     (state-machines.md)
  # identity
  title             Translatable      BUYER_VISIBLE
  description       Translatable      BUYER_VISIBLE
  bullets           Translatable[]    BUYER_VISIBLE
  seo_keywords      String[]          BUYER_VISIBLE
  # taxonomy
  craft_id, product_type_id           BUYER_VISIBLE
  materials[], techniques[]           BUYER_VISIBLE
  motifs[]                            BUYER_VISIBLE
  # physical
  colors[], dimensions_mm?, weight_g?  BUYER_VISIBLE
  care_instructions Translatable       BUYER_VISIBLE
  # provenance
  artisan_story     Translatable?      BUYER_VISIBLE
  region_district, region_state        BUYER_VISIBLE
  # capability block — REQUIRED before PUBLISHED (shared-spine.md §4)
  capability        CapabilityBlock    BUYER_VISIBLE
  # media
  media             Media[]
  # pricing
  price             PriceCalculation?  mixed tiers
  # provenance of the data itself
  extractions       AttributeExtraction[]   SELLER_PRIVATE
  approvals         ApprovalRecord[]        SELLER_PRIVATE
  published_at?, updated_at
```

```
CapabilityBlock                        all BUYER_VISIBLE
  moq                 Int
  capacity_per_cycle  Int
  cycle_days          Int
  lead_time_days      Int
  made_to_order       Bool
  customization_supported Bool
  customization_types[]   CustomizationType[]
  seasonal_windows[]      DateRange[]
  committed_capacity  Int      derived; subtracted for available capacity
```

Every field in `CapabilityBlock` appears in the matching contract. That is the
test for whether a field belongs here.

```
Media
  id, product_id, role  ORIGINAL | ENHANCED | LIFESTYLE
  storage_key, width, height, checksum
  derived_from_id?              ENHANCED/LIFESTYLE point at their ORIGINAL
  enhancement  EnhancementRecord?
  quality      QualityAssessment?
  is_ai_generated_background Bool     must be labelled in UI
```

```
EnhancementRecord                      the authenticity guarantee, in data
  operations[]        BACKGROUND_REMOVAL | CLUTTER_REMOVAL | WHITE_BALANCE
                      | EXPOSURE | CROP | FORMAT
  bounded_params      JSON     the limits actually applied
  model_version, prompt_version?
  authenticity_check  PASSED | FLAGGED | FAILED
  seller_approved     Bool
```

An `ORIGINAL` is never deleted, never overwritten, never mutated. It is the
evidence that the enhanced image is honest, and it is shown to the buyer beside
the enhanced one.

---

## Voice and extraction

```
VoiceInput
  id, product_id?, seller_id
  storage_key, duration_ms
  detected_lang, detected_lang_confidence
  retention_expires_at        minimal audio retention (security doc)
```

```
Transcript
  voice_input_id, text_source Translatable
  stt_model_version, segments[], confidence
  seller_corrected Bool
```

```
AttributeExtraction              one row per extracted field — auditability
  product_id, field_path         e.g. "materials[0]", "capability.moq"
  value JSON
  confidence Float
  source  VOICE | SELLER_INPUT | TAXONOMY_INFERENCE | IMAGE
  model_version, prompt_version
  seller_action  ACCEPTED | EDITED | REJECTED | PENDING
```

**`source` is why "never invent" is enforceable.** A field with no `source` does
not exist. `TAXONOMY_INFERENCE` is permitted only for genuinely derivable facts
(a craft node's standard care instructions), never for provenance, certification
or story.

---

## Pricing

```
PriceCalculation
  product_id, version
  # inputs — seller-declared
  materials_cost      Money   SELLER_PRIVATE
  labour_hours        Float   SELLER_PRIVATE
  labour_rate         Money   SELLER_PRIVATE
  packaging_cost      Money   SELLER_PRIVATE
  overhead_cost       Money   SELLER_PRIVATE
  shipping_estimate   Money   SELLER_PRIVATE
  platform_fee_pct    Float   SELLER_PRIVATE
  minimum_margin_pct  Float   SELLER_PRIVATE
  # outputs
  sustainable_floor   Money   SELLER_PRIVATE
  d2c_recommended     Money   SELLER_PRIVATE
  wholesale_min       Money   BUYER_VISIBLE
  wholesale_max       Money   BUYER_VISIBLE
  net_earnings_est    Money   SELLER_PRIVATE
  confidence          Float   SELLER_PRIVATE
  explanation         Translatable   SELLER_PRIVATE (audio-playable)
  market_references[] MarketReference[]   SELLER_PRIVATE, clearly labelled as reference only
  computed_at, engine_version
```

Immutable. A change to inputs produces a **new version**; quotations pin the
version they used.

---

## Demand side

```
RFQ
  id, buyer_id, status
  craft_id?, product_type_id?, materials[], techniques[]
  quantity Int                 required
  budget_per_unit Money        required
  deadline Date                required
  delivery_location            required
  customization?, packaging?, sample_required Bool
  min_verification_tier?
  region_preference?
  notes Translatable?
  expires_at
```

```
Match
  rfq_id, product_id, seller_id
  score Float                  internal only
  reasons[] MatchReason[]      surfaced as text to the buyer
  invited_at, seller_viewed_at?
```

```
Inquiry
  id, buyer_id, seller_id, product_id?, rfq_id?
  status, awaiting_party
  messages Message[]
  quotations Quotation[]
  last_activity_at, stale_since?
```

```
Message
  id, inquiry_id, sender_role, sender_id
  body Translatable           source_lang = author's language
  attachments[]
  sent_at                     immutable, append-only
```

```
Quotation
  id, inquiry_id, product_id, price_calculation_version
  quantity, unit_price Money, total Money
  lead_time_days, customization_notes?, packaging?
  sample_offered Bool, sample_price?
  valid_until Date
  status
  below_floor_override  { reason, approved_by, at }?    audited
```

```
OrderIntent
  id, inquiry_id, quotation_id, status
  quantity, unit_price, total, expected_delivery_date
  seller_confirmed_at?, buyer_confirmed_at?
  fulfilled_at?, cancelled_reason?
```

---

## Cross-cutting

```
Consent          user_id, purpose, granted_at, revoked_at?, policy_version
AuditLog         actor_id, actor_role, action, entity, entity_id, before?, after?, at
Notification     user_id, kind, entity_ref, read_at?, delivered_channels[]
MarketplaceExport product_id, target ONDC|INDIA_HANDMADE|GEM|CSV|JSON,
                  payload_checksum, status, is_simulated Bool
Translatable     { source_lang, values{lang:text}, translated_fields[],
                   translation_model?, seller_approved_langs[] }
Money            { amount_paise Long, currency "INR" }
```

`Money` is integer paise. No floats in pricing — the floor guarantee cannot rest
on binary rounding.

`MarketplaceExport.is_simulated` defaults **true** and may only be false with a
recorded authorisation. This is how the "do not claim live integrations" rule is
enforced in data rather than in a disclaimer.
