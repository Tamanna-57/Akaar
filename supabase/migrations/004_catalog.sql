-- Akaar 004: products, media, pricing, provenance, AI artifacts.

create table public.products (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null references public.profiles(id) on delete cascade,
  status     product_status not null default 'draft',

  -- content (buyer-visible)
  title_hi text, title_en text,
  description_hi text, description_en text,
  bullets_hi text[] not null default '{}',
  bullets_en text[] not null default '{}',
  seo_keywords text[] not null default '{}',

  -- taxonomy
  craft_id      uuid references public.crafts(id) on delete set null,
  product_type  text,
  material_ids  uuid[] not null default '{}',
  technique_ids uuid[] not null default '{}',
  motifs        text[] not null default '{}',
  colors        text[] not null default '{}',

  -- physical
  length_mm int, width_mm int, height_mm int, weight_g int,
  care_hi text, care_en text,

  -- provenance (district is the finest granularity exposed)
  region_state text, region_district text,

  -- capability block: every field here appears in the matching contract
  -- (docs/02-interdependence/shared-spine.md section 4)
  moq                int,
  capacity_per_cycle int,
  cycle_days         int,
  lead_time_days     int,
  made_to_order      boolean not null default false,
  customization_supported boolean not null default false,
  customization_types text[] not null default '{}',
  seasonal_from date, seasonal_to date,

  -- commerce (public face of pricing; the corridor lives in the private table)
  listed_price_paise bigint,
  negotiable   boolean not null default true,
  stock_qty    int not null default 0,
  reserved_qty int not null default 0,
  b2b_enabled  boolean not null default false,
  bulk_price_paise bigint,

  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint stock_non_negative check (stock_qty >= 0 and reserved_qty >= 0),
  constraint reserved_within_stock check (reserved_qty <= stock_qty),
  -- A published product must be matchable. Without the capability block a
  -- buyer's quantity and deadline filters cannot run, so the listing would be
  -- invisible rather than merely incomplete.
  constraint published_is_complete check (
    status <> 'published' or (
      title_hi is not null and title_en is not null
      and craft_id is not null and listed_price_paise is not null
      and moq is not null and capacity_per_cycle is not null
      and cycle_days is not null and lead_time_days is not null
      and region_state is not null and region_district is not null
    )
  )
);
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

create index idx_products_seller on public.products (seller_id, status, updated_at desc);
create index idx_products_discovery on public.products (craft_id, product_type)
  where status = 'published';
create index idx_products_capability on public.products (moq, capacity_per_cycle, lead_time_days)
  where status = 'published';
create index idx_products_price on public.products (listed_price_paise)
  where status = 'published';
create index idx_products_materials  on public.products using gin (material_ids);
create index idx_products_techniques on public.products using gin (technique_ids);
create index idx_products_region on public.products (region_state, region_district)
  where status = 'published';
create index idx_products_title_trgm on public.products
  using gin (title_en extensions.gin_trgm_ops) where status = 'published';

-- Owner-only. This table is the reason a cost figure cannot leak to a buyer:
-- it is not a column a buyer can address, not a column a serialiser must remember
-- to strip. Holds both the Fair Price Shield floor and the negotiation corridor.
create table public.product_pricing_private (
  product_id uuid primary key references public.products(id) on delete cascade,
  seller_id  uuid not null references public.profiles(id) on delete cascade,

  -- declared inputs
  materials_cost_paise bigint not null default 0,
  labour_hours         numeric(7,2) not null default 0,
  labour_rate_paise    bigint not null default 0,
  packaging_cost_paise bigint not null default 0,
  overhead_cost_paise  bigint not null default 0,
  shipping_est_paise   bigint not null default 0,
  platform_fee_pct     numeric(5,2) not null default 0,
  min_margin_pct       numeric(5,2) not null default 10,

  -- computed
  sustainable_floor_paise bigint not null default 0,
  d2c_recommended_paise   bigint,
  wholesale_min_paise     bigint,
  wholesale_max_paise     bigint,
  net_earnings_est_paise  bigint,
  confidence              numeric(3,2),
  explanation_hi text, explanation_en text,

  -- negotiation corridor (buyer doc prompt 12). The buyer never sees any of it.
  preferred_price_paise      bigint,
  min_acceptable_price_paise bigint,

  engine_version text,
  computed_at    timestamptz,
  updated_at     timestamptz not null default now(),

  -- The reconciliation of the two documents, as an invariant: the seller's
  -- private minimum may not fall below the computed sustainable floor.
  constraint min_accept_above_floor check (
    min_acceptable_price_paise is null
    or min_acceptable_price_paise >= sustainable_floor_paise),
  constraint corridor_ordered check (
    preferred_price_paise is null or min_acceptable_price_paise is null
    or preferred_price_paise >= min_acceptable_price_paise),
  constraint wholesale_above_floor check (
    wholesale_min_paise is null or wholesale_min_paise >= sustainable_floor_paise)
);
create trigger pricing_touch before update on public.product_pricing_private
  for each row execute function public.touch_updated_at();

create table public.product_media (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  seller_id  uuid not null references public.profiles(id) on delete cascade,
  role       media_role not null,
  storage_key text not null,
  width int, height int, bytes bigint, checksum text,
  derived_from_id uuid references public.product_media(id) on delete set null,
  sort_order int not null default 0,

  -- quality assessment (on-device pre-check, persisted for audit)
  blur_score numeric(6,3), exposure_score numeric(6,3), occlusion_score numeric(6,3),

  -- bounded enhancement record: the authenticity guarantee, in data
  operations text[] not null default '{}',
  bounded_params jsonb,
  model_version text,
  authenticity  authenticity_result,
  ssim_in_mask  numeric(5,4),
  seller_approved boolean not null default false,
  is_ai_background boolean not null default false,

  created_at timestamptz not null default now()
);
create index idx_media_product on public.product_media (product_id, role, sort_order);

-- An original is never deleted or overwritten. It is the evidence that the
-- enhanced image is honest, and the buyer is shown it alongside.
create or replace function public.protect_original_media()
returns trigger language plpgsql as $$
begin
  if old.role = 'original' then
    raise exception 'original media cannot be deleted (product %)', old.product_id
      using errcode = 'check_violation';
  end if;
  return old;
end $$;
create trigger media_protect_original before delete on public.product_media
  for each row execute function public.protect_original_media();

-- Craft Passport (buyer doc prompt 21). Every field carries its source tier;
-- nothing is ever generated as an authenticity or GI claim.
create table public.craft_passports (
  product_id  uuid primary key references public.products(id) on delete cascade,
  public_code text unique not null,
  craft_name_hi text, craft_name_en text,
  region text,
  technique_note_hi text, technique_note_en text,
  process_note_hi text, process_note_en text,
  artisan_story_hi text, artisan_story_en text,
  certification_ref text,
  gi_reference text,
  source provenance_source not null default 'seller_provided',
  admin_verified_at timestamptz,
  admin_verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger passport_touch before update on public.craft_passports
  for each row execute function public.touch_updated_at();

-- Voice and extraction artifacts.
create table public.voice_inputs (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid references public.products(id) on delete cascade,
  storage_key text not null,
  duration_ms int,
  detected_lang text,
  detected_lang_confidence numeric(3,2),
  -- minimal audio retention: a worker purges past this point, transcripts stay
  retention_expires_at timestamptz not null default (now() + interval '30 days'),
  created_at  timestamptz not null default now()
);
create index idx_voice_retention on public.voice_inputs (retention_expires_at);

create table public.transcripts (
  id             uuid primary key default gen_random_uuid(),
  voice_input_id uuid not null references public.voice_inputs(id) on delete cascade,
  text_source    text not null,
  source_lang    text not null,
  text_en        text,
  stt_model_version text,
  confidence     numeric(3,2),
  seller_corrected boolean not null default false,
  created_at     timestamptz not null default now()
);

-- One row per extracted field. This is what makes "never invent" auditable:
-- a field with no source and no evidence span does not get persisted.
create table public.attribute_extractions (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  field_path  text not null,
  value       jsonb,
  confidence  numeric(3,2),
  source      extraction_source not null,
  evidence_span text,
  model_version text,
  prompt_version text,
  seller_action seller_action not null default 'pending',
  created_at  timestamptz not null default now()
);
create index idx_extractions_product on public.attribute_extractions (product_id, seller_action);
