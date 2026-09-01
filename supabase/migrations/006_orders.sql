-- Akaar 006: orders and inventory.
-- Payment is abstracted. No order is marked paid without a verified backend
-- state, and the prototype makes no settlement or logistics claim.

create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  order_no   text unique not null,
  buyer_id   uuid not null references public.profiles(id) on delete restrict,
  seller_id  uuid not null references public.profiles(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,

  -- provenance of the price: which negotiation produced it
  offer_id          uuid references public.offers(id) on delete set null,
  custom_request_id uuid references public.custom_requests(id) on delete set null,

  status  order_status not null default 'created',
  payment payment_status not null default 'not_applicable',

  quantity         int not null,
  unit_price_paise bigint not null,
  total_paise      bigint not null,

  expected_delivery_date date,
  delivery_city text, delivery_state text,
  cancelled_reason text,

  confirmed_at timestamptz,
  delivered_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint order_qty_positive check (quantity > 0),
  constraint order_total_consistent check (total_paise = unit_price_paise * quantity)
);
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();
create index idx_orders_buyer  on public.orders (buyer_id, status, created_at desc);
create index idx_orders_seller on public.orders (seller_id, status, created_at desc);

create table public.order_events (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid not null references public.orders(id) on delete cascade,
  actor_id   uuid references public.profiles(id) on delete set null,
  from_status order_status,
  to_status   order_status not null,
  note       text,
  created_at timestamptz not null default now()
);
create index idx_order_events on public.order_events (order_id, created_at);

-- Capacity is committed here, not at quotation. A seller is not committed by
-- discussing, which is what keeps future matching honest.
create table public.inventory_reservations (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  order_id   uuid not null references public.orders(id) on delete cascade,
  quantity   int not null,
  released   boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reservation_qty_positive check (quantity > 0)
);
create unique index idx_reservation_order on public.inventory_reservations (order_id);
