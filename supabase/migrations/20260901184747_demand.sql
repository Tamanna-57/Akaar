-- Akaar 005: the demand side. Two paths, per the reconciliation:
--   offers          - buyer proposes a price on a listed product
--   custom_requests - customization / bulk RFQ
-- Both are turn-based. awaiting_party is the sole write authority, which
-- removes every write-conflict class from the MVP.

create table public.offers (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  seller_id  uuid not null references public.profiles(id) on delete cascade,
  status     offer_status not null default 'pending',
  awaiting   party not null default 'seller',

  quantity   int not null default 1,
  -- current live amount; history lives in offer_events
  amount_paise bigint not null,
  listed_price_at_offer_paise bigint not null,

  -- advisory only, computed server-side without revealing thresholds
  band       offer_band not null default 'unavailable',
  band_reason text,

  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint offer_amount_positive check (amount_paise > 0),
  constraint offer_qty_positive check (quantity > 0)
);
create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();
create index idx_offers_seller_inbox on public.offers (seller_id, awaiting, updated_at desc);
create index idx_offers_buyer on public.offers (buyer_id, status, updated_at desc);
create index idx_offers_product on public.offers (product_id, status);

-- Append-only negotiation history. A counter is a new event, never a mutation,
-- so the thread stays readable as a chain if a dispute arises.
create table public.offer_events (
  id         uuid primary key default gen_random_uuid(),
  offer_id   uuid not null references public.offers(id) on delete cascade,
  actor      party not null,
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  amount_paise bigint,
  quantity   int,
  note       text,
  created_at timestamptz not null default now()
);
create index idx_offer_events on public.offer_events (offer_id, created_at);

create table public.custom_requests (
  id         uuid primary key default gen_random_uuid(),
  -- null product_id = open RFQ broadcast to matching sellers
  product_id uuid references public.products(id) on delete set null,
  buyer_id   uuid not null references public.profiles(id) on delete cascade,
  seller_id  uuid references public.profiles(id) on delete cascade,
  status     custom_request_status not null default 'draft',
  awaiting   party not null default 'seller',

  craft_id   uuid references public.crafts(id) on delete set null,
  material_ids  uuid[] not null default '{}',
  technique_ids uuid[] not null default '{}',

  -- required before leaving draft; without them matching cannot run
  quantity        int,
  budget_per_unit_paise bigint,
  deadline        date,
  delivery_city   text,
  delivery_state  text,

  size_note text,
  length_mm int, width_mm int, height_mm int,
  color_note text,
  material_note text,
  design_note text,
  reference_media_key text,
  voice_input_id uuid references public.voice_inputs(id) on delete set null,
  packaging text,
  sample_required boolean not null default false,
  min_verification verification_tier,

  -- seller-side advisory analysis; never an automatic delivery promise
  feasibility        feasibility_verdict not null default 'unavailable',
  feasibility_reason text,

  counter_price_paise bigint,
  counter_lead_days   int,
  agreed_price_paise  bigint,

  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint cr_open_is_complete check (
    status = 'draft' or (
      quantity is not null and budget_per_unit_paise is not null
      and deadline is not null and delivery_state is not null)
  ),
  constraint cr_qty_positive check (quantity is null or quantity > 0)
);
create trigger custom_requests_touch before update on public.custom_requests
  for each row execute function public.touch_updated_at();
create index idx_cr_seller_inbox on public.custom_requests (seller_id, awaiting, updated_at desc);
create index idx_cr_buyer on public.custom_requests (buyer_id, status, updated_at desc);
create index idx_cr_open on public.custom_requests (craft_id, deadline) where status = 'open';

create table public.custom_request_events (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  actor      party not null,
  actor_id   uuid references public.profiles(id) on delete set null,
  action     text not null,
  price_paise bigint,
  lead_days  int,
  note       text,
  created_at timestamptz not null default now()
);
create index idx_cr_events on public.custom_request_events (request_id, created_at);

-- Message threads. Contact details are not exchanged here before an order is
-- confirmed; that withholding is the platform's main structural anti-fraud measure.
create table public.conversations (
  id           uuid primary key default gen_random_uuid(),
  subject_type conversation_subject not null,
  subject_id   uuid,
  buyer_id     uuid not null references public.profiles(id) on delete cascade,
  seller_id    uuid not null references public.profiles(id) on delete cascade,
  last_activity_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);
create index idx_conv_buyer  on public.conversations (buyer_id, last_activity_at desc);
create index idx_conv_seller on public.conversations (seller_id, last_activity_at desc);
create unique index idx_conv_subject on public.conversations (subject_type, subject_id)
  where subject_id is not null;

-- Append-only. No edit, no delete: this thread is the record.
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  sender_role party not null,
  body        text not null,
  source_lang text not null default 'hi',
  body_translated text,
  translated_lang text,
  is_machine_translated boolean not null default false,
  attachment_key text,
  created_at  timestamptz not null default now()
);
create index idx_messages_conv on public.messages (conversation_id, created_at);
