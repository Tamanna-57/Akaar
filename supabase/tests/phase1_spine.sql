-- Phase 1 verification: the guarantees the spine exists to provide.
-- Run against a database with migrations 001-011 applied.
-- Any failed assertion raises and aborts under psql -v ON_ERROR_STOP=1.

\set QUIET on
\set seller  '11111111-1111-1111-1111-111111111111'
\set buyer   '22222222-2222-2222-2222-222222222222'
\set product '33333333-3333-3333-3333-333333333333'

-- ---------------------------------------------------------------- fixtures
insert into auth.users (id, phone) values (:'seller', '+919000000001'), (:'buyer', '+919000000002');
update public.profiles set roles = '{seller}',  full_name = 'Meena Devi' where id = :'seller';
update public.profiles set roles = '{buyer}',   full_name = 'Aditi R'    where id = :'buyer';
insert into public.artisan_profiles (user_id, display_name, state, district)
  values (:'seller', 'Meena Devi', 'Rajasthan', 'Barmer');
insert into public.buyer_profiles (user_id, org_name, org_type, city, state)
  values (:'buyer', 'Indigo Room', 'boutique', 'Bengaluru', 'Karnataka');

insert into public.products (id, seller_id, title_hi, title_en, craft_id, product_type,
  region_state, region_district, moq, capacity_per_cycle, cycle_days, lead_time_days,
  stock_qty, negotiable)
select :'product', :'seller', 'Kashidakari bag', 'Hand-embroidered bag',
  c.id, 'bag', 'Rajasthan', 'Barmer', 1, 8, 7, 12, 10, true
from public.crafts c where c.slug = 'kashidakari';

insert into public.product_pricing_private (product_id, seller_id, materials_cost_paise,
  labour_hours, labour_rate_paise, packaging_cost_paise, overhead_cost_paise,
  shipping_est_paise, platform_fee_pct, min_margin_pct)
values (:'product', :'seller', 18000, 6, 5000, 4000, 2000, 5000, 5, 10);

-- ------------------------------------------------- 1. floor is arithmetic
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

do $$
declare v record;
begin
  select * into v from public.recalculate_price('33333333-3333-3333-3333-333333333333');
  -- base 59000 + 5% fee 2950 = 61950, +10% margin -> 68145
  if v.sustainable_floor_paise <> 68145 then
    raise exception 'FAIL floor: expected 68145, got %', v.sustainable_floor_paise;
  end if;
  if v.confidence <> 1.00 then
    raise exception 'FAIL confidence: expected 1.00, got %', v.confidence;
  end if;
  raise notice 'PASS floor computed = % paise', v.sustainable_floor_paise;
end $$;

-- ------------------------- 2. private minimum may not go below the floor
do $$
begin
  begin
    perform public.set_price_corridor('33333333-3333-3333-3333-333333333333', 120000, 95000, 60000);
    raise exception 'FAIL: a below-floor minimum was accepted';
  exception when check_violation then
    raise notice 'PASS below-floor minimum rejected';
  end;
end $$;

select public.set_price_corridor('33333333-3333-3333-3333-333333333333', 120000, 95000, 70000) is not null as corridor_set;

-- ------------------------------ 3. publication names what is still missing
do $$
declare r jsonb;
begin
  r := public.publish_product('33333333-3333-3333-3333-333333333333');
  if (r->>'published')::boolean then raise exception 'FAIL: published without a photo'; end if;
  if not (r->'missing' ? 'photo') then raise exception 'FAIL: missing list did not name photo: %', r; end if;
  raise notice 'PASS publication blocked, missing = %', r->'missing';
end $$;

insert into public.product_media (product_id, seller_id, role, storage_key)
values ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111',
        'original', 'demo/bag-original.jpg');

do $$
declare r jsonb;
begin
  r := public.publish_product('33333333-3333-3333-3333-333333333333');
  if not (r->>'published')::boolean then raise exception 'FAIL: publish blocked: %', r; end if;
  raise notice 'PASS published';
end $$;

-- ------------------------------- 4. an original photo can never be deleted
do $$
begin
  begin
    delete from public.product_media
      where product_id = '33333333-3333-3333-3333-333333333333' and role = 'original';
    raise exception 'FAIL: original media was deleted';
  exception when check_violation then
    raise notice 'PASS original media protected';
  end;
end $$;

-- ---------------- 5. THE CENTRAL GUARANTEE: a buyer cannot read the corridor
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

do $$
declare n int;
begin
  select count(*) into n from public.product_pricing_private;
  if n <> 0 then raise exception 'FAIL: buyer read % private pricing rows', n; end if;
  raise notice 'PASS buyer sees 0 rows of private pricing';
end $$;

do $$
declare n int;
begin
  select count(*) into n from public.artisan_private;
  if n <> 0 then raise exception 'FAIL: buyer read artisan private data'; end if;
  raise notice 'PASS buyer sees 0 rows of artisan_private';
end $$;

-- a buyer must not be able to edit someone else's listing
do $$
declare n int;
begin
  update public.products set listed_price_paise = 1
    where id = '33333333-3333-3333-3333-333333333333';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: buyer updated a seller product'; end if;
  raise notice 'PASS buyer cannot edit a seller listing';
end $$;

-- ------------------------------------ 6. discovery finds the published item
do $$
declare n int;
begin
  select count(*) into n from public.search_marketplace(
    p_query => null, p_quantity => 5, p_budget_per_unit_paise => 150000,
    p_deadline => current_date + 40);
  if n <> 1 then raise exception 'FAIL: search returned % rows, expected 1', n; end if;
  raise notice 'PASS marketplace search matched on quantity, budget and deadline';
end $$;

-- deadline the seller's lead time cannot meet must exclude the product
do $$
declare n int;
begin
  select count(*) into n from public.search_marketplace(p_deadline => current_date + 3);
  if n <> 0 then raise exception 'FAIL: lead-time filter let % rows through', n; end if;
  raise notice 'PASS lead-time filter excludes unreachable deadlines';
end $$;

-- --------------------------------------------- 7. offer, band, and the floor
do $$
declare o record;
begin
  select * into o from public.place_offer('33333333-3333-3333-3333-333333333333', 60000, 2, 'Interested');
  if o.band <> 'below_typical' then raise exception 'FAIL band: got %', o.band; end if;
  if o.awaiting <> 'seller' then raise exception 'FAIL: turn should be with seller'; end if;
  raise notice 'PASS offer placed, band = %', o.band;
end $$;

set request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

-- accepting below the floor is refused until the seller confirms with a reason
do $$
declare r jsonb; oid uuid;
begin
  select id into oid from public.offers limit 1;
  r := public.respond_to_offer(oid, 'accept');
  if (r->>'ok')::boolean then raise exception 'FAIL: below-floor accept went through silently'; end if;
  if r->>'reason' <> 'below_floor' then raise exception 'FAIL: wrong guard: %', r; end if;
  raise notice 'PASS below-floor accept requires explicit confirmation';

  r := public.respond_to_offer(oid, 'counter', 90000, 'I can do this price');
  if r->>'status' <> 'countered' then raise exception 'FAIL counter: %', r; end if;
  raise notice 'PASS seller countered';
end $$;

-- the seller may not answer twice in a row
do $$
declare oid uuid;
begin
  select id into oid from public.offers limit 1;
  begin
    perform public.respond_to_offer(oid, 'reject');
    raise exception 'FAIL: seller acted out of turn';
  exception when others then
    if sqlerrm like 'FAIL%' then raise; end if;
    raise notice 'PASS turn order enforced (%)', sqlerrm;
  end;
end $$;

-- ------------------------------- 8. buyer accepts -> order + reservation
set request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

do $$
declare r jsonb; oid uuid; o record; p record;
begin
  select id into oid from public.offers limit 1;
  r := public.buyer_respond_offer(oid, 'accept');
  if not (r->>'ok')::boolean then raise exception 'FAIL accept: %', r; end if;

  select * into o from public.orders where id = (r->>'order_id')::uuid;
  if o.unit_price_paise <> 90000 then raise exception 'FAIL price: %', o.unit_price_paise; end if;
  if o.total_paise <> 180000 then raise exception 'FAIL total: %', o.total_paise; end if;

  select * into p from public.products where id = '33333333-3333-3333-3333-333333333333';
  if p.reserved_qty <> 2 then raise exception 'FAIL reservation: %', p.reserved_qty; end if;
  raise notice 'PASS order % created, 2 units reserved', o.order_no;
end $$;

reset role;

-- ------------------------------------------------------------- 9. audit trail
do $$
declare n int;
begin
  select count(*) into n from public.audit_logs where action in ('publish','create_order');
  if n < 2 then raise exception 'FAIL: audit trail incomplete (% rows)', n; end if;
  raise notice 'PASS audit trail recorded % actions', n;
end $$;

\echo '=== PHASE 1 SPINE VERIFIED ==='

-- ---------------- 10. internal functions are not part of the API surface
do $$
declare fn text;
begin
  foreach fn in array array['create_order_from_offer','notify_user','audit'] loop
    if has_function_privilege('authenticated',
         (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='public' and p.proname=fn limit 1), 'EXECUTE')
    then raise exception 'FAIL: % is callable by authenticated', fn; end if;
    if has_function_privilege('anon',
         (select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
          where n.nspname='public' and p.proname=fn limit 1), 'EXECUTE')
    then raise exception 'FAIL: % is callable by anon', fn; end if;
  end loop;
  raise notice 'PASS internal functions not callable by anon or authenticated';
end $$;

-- a client cannot write the negotiation tables directly
do $$
declare t text;
begin
  foreach t in array array['offers','orders','inventory_reservations','custom_requests'] loop
    if has_table_privilege('authenticated', 'public.'||t, 'INSERT')
       or has_table_privilege('authenticated', 'public.'||t, 'UPDATE')
    then raise exception 'FAIL: authenticated can write % directly', t; end if;
  end loop;
  raise notice 'PASS negotiation and order tables are read-only to clients';
end $$;
