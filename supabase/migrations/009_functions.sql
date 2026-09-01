-- Akaar 009: business-rule functions.
--
-- Everything here is SECURITY DEFINER, so each function performs its own
-- authorization explicitly. These are the only write paths for offers, orders
-- and publication. The seller's private minimum is read inside these functions
-- and never returned: a buyer receives accept / counter / reject, never a threshold.

create sequence if not exists public.order_no_seq start 1001;

create or replace function public.notify_user(
  p_user uuid, p_kind text, p_title_hi text, p_title_en text,
  p_body_hi text, p_body_en text, p_entity_type text, p_entity_id uuid)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, kind, title_hi, title_en, body_hi, body_en, entity_type, entity_id)
  values (p_user, p_kind, p_title_hi, p_title_en, p_body_hi, p_body_en, p_entity_type, p_entity_id);
$$;

create or replace function public.audit(
  p_action text, p_entity_type text, p_entity_id uuid, p_before jsonb, p_after jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, before, after)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, p_before, p_after);
$$;

-- ---------------------------------------------------------------------------
-- Fair Price Shield. Deterministic arithmetic on seller-declared inputs.
-- Never a model output: that is precisely why it cannot be argued down.
-- ---------------------------------------------------------------------------
create or replace function public.recalculate_price(p_product_id uuid)
returns public.product_pricing_private
language plpgsql security definer set search_path = public as $$
declare
  v_seller uuid;
  v public.product_pricing_private;
  v_base bigint; v_fees bigint; v_floor bigint;
  v_filled int := 0;
begin
  select seller_id into v_seller from public.products where id = p_product_id;
  if v_seller is null then raise exception 'product not found'; end if;
  if v_seller <> auth.uid() then raise exception 'not your product' using errcode = '42501'; end if;

  select * into v from public.product_pricing_private where product_id = p_product_id;
  if not found then
    insert into public.product_pricing_private (product_id, seller_id)
    values (p_product_id, v_seller) returning * into v;
  end if;

  v_base := v.materials_cost_paise
          + round(v.labour_hours * v.labour_rate_paise)::bigint
          + v.packaging_cost_paise + v.overhead_cost_paise + v.shipping_est_paise;
  v_fees := round(v_base * v.platform_fee_pct / 100.0)::bigint;
  v_floor := ceil((v_base + v_fees) * (1 + v.min_margin_pct / 100.0))::bigint;

  -- Confidence reflects input completeness, not model certainty. An estimated
  -- labour figure or an absent overhead lowers it.
  if v.materials_cost_paise > 0 then v_filled := v_filled + 1; end if;
  if v.labour_hours > 0        then v_filled := v_filled + 1; end if;
  if v.labour_rate_paise > 0   then v_filled := v_filled + 1; end if;
  if v.packaging_cost_paise > 0 then v_filled := v_filled + 1; end if;
  if v.overhead_cost_paise > 0 then v_filled := v_filled + 1; end if;

  update public.product_pricing_private set
    sustainable_floor_paise = v_floor,
    d2c_recommended_paise   = round(v_floor * 2.2)::bigint,
    wholesale_min_paise     = round(v_floor * 1.35)::bigint,
    wholesale_max_paise     = round(v_floor * 1.70)::bigint,
    net_earnings_est_paise  = v_floor - (v_base - round(v.labour_hours * v.labour_rate_paise)::bigint) - v_fees,
    confidence              = round(v_filled / 5.0, 2),
    engine_version          = 'floor-v1',
    computed_at             = now(),
    explanation_en = format(
      'Materials %s. Your %s hours of work %s. Packaging %s. Overhead %s. Shipping %s. Fees %s. Minimum sustainable price %s.',
      (v.materials_cost_paise/100.0)::numeric(12,2), v.labour_hours,
      (round(v.labour_hours * v.labour_rate_paise)/100.0)::numeric(12,2),
      (v.packaging_cost_paise/100.0)::numeric(12,2), (v.overhead_cost_paise/100.0)::numeric(12,2),
      (v.shipping_est_paise/100.0)::numeric(12,2), (v_fees/100.0)::numeric(12,2),
      (v_floor/100.0)::numeric(12,2)),
    explanation_hi = format(
      'Saamagri %s rupaye. Aapke %s ghante ke kaam ke %s rupaye. Packaging %s. Upari kharch %s. Bhejne ka kharch %s. Shulk %s. Isse kam daam par bechna aapke liye nuksan hai: %s rupaye.',
      (v.materials_cost_paise/100.0)::numeric(12,2), v.labour_hours,
      (round(v.labour_hours * v.labour_rate_paise)/100.0)::numeric(12,2),
      (v.packaging_cost_paise/100.0)::numeric(12,2), (v.overhead_cost_paise/100.0)::numeric(12,2),
      (v.shipping_est_paise/100.0)::numeric(12,2), (v_fees/100.0)::numeric(12,2),
      (v_floor/100.0)::numeric(12,2))
  where product_id = p_product_id
  returning * into v;

  update public.products
    set status = case when status in ('draft','voice_captured','transcribed','extracted','needs_input')
                      then 'priced'::product_status else status end
  where id = p_product_id;

  return v;
end $$;

-- Seller sets the negotiation corridor. The floor is the hard bound beneath it.
create or replace function public.set_price_corridor(
  p_product_id uuid, p_listed_paise bigint,
  p_preferred_paise bigint, p_min_acceptable_paise bigint)
returns public.product_pricing_private
language plpgsql security definer set search_path = public as $$
declare v public.product_pricing_private; v_seller uuid;
begin
  select seller_id into v_seller from public.products where id = p_product_id;
  if v_seller is null or v_seller <> auth.uid() then
    raise exception 'not your product' using errcode = '42501';
  end if;

  select * into v from public.product_pricing_private where product_id = p_product_id;
  if not found then raise exception 'price not calculated yet'; end if;

  if p_min_acceptable_paise < v.sustainable_floor_paise then
    raise exception 'minimum acceptable price %  is below the sustainable floor %',
      p_min_acceptable_paise, v.sustainable_floor_paise using errcode = 'check_violation';
  end if;
  if p_listed_paise < p_preferred_paise or p_preferred_paise < p_min_acceptable_paise then
    raise exception 'corridor must be ordered: listed >= preferred >= minimum';
  end if;

  update public.product_pricing_private
    set preferred_price_paise = p_preferred_paise,
        min_acceptable_price_paise = p_min_acceptable_paise
  where product_id = p_product_id returning * into v;

  update public.products set listed_price_paise = p_listed_paise where id = p_product_id;
  perform public.audit('set_price_corridor', 'product', p_product_id, null,
                       jsonb_build_object('listed', p_listed_paise));
  return v;
end $$;

-- ---------------------------------------------------------------------------
-- Publication. Returns the unmet invariants rather than a generic failure, so
-- the client can render "3 things left before buyers can see this".
-- ---------------------------------------------------------------------------
create or replace function public.publish_product(p_product_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare p public.products; missing text[] := '{}'; v_cluster uuid;
begin
  select * into p from public.products where id = p_product_id;
  if p.id is null then raise exception 'product not found'; end if;
  if p.seller_id <> auth.uid() then raise exception 'not your product' using errcode = '42501'; end if;

  if p.title_hi is null or p.title_en is null then missing := missing || 'title'::text; end if;
  if p.craft_id is null                       then missing := missing || 'craft'::text; end if;
  if p.listed_price_paise is null             then missing := missing || 'price'::text; end if;
  if p.moq is null                            then missing := missing || 'moq'::text; end if;
  if p.capacity_per_cycle is null             then missing := missing || 'capacity'::text; end if;
  if p.cycle_days is null                     then missing := missing || 'cycle_days'::text; end if;
  if p.lead_time_days is null                 then missing := missing || 'lead_time'::text; end if;
  if p.region_state is null or p.region_district is null then missing := missing || 'region'::text; end if;
  if not exists (select 1 from public.product_media m
                 where m.product_id = p_product_id and m.role = 'original')
    then missing := missing || 'photo'::text; end if;
  if not exists (select 1 from public.product_pricing_private pp
                 where pp.product_id = p_product_id and pp.min_acceptable_price_paise is not null)
    then missing := missing || 'price_corridor'::text; end if;

  if array_length(missing, 1) > 0 then
    return jsonb_build_object('published', false, 'missing', to_jsonb(missing));
  end if;

  -- A cluster-managed artisan's listing goes to review, not straight to buyers.
  select a.cluster_id into v_cluster from public.artisan_profiles a where a.user_id = p.seller_id;

  if v_cluster is not null then
    update public.products set status = 'cluster_review' where id = p_product_id;
    perform public.notify_user((select manager_id from public.clusters where id = v_cluster),
      'product.cluster_review', 'Nayi suchi jaanch ke liye', 'New listing to review',
      null, null, 'product', p_product_id);
    perform public.audit('submit_cluster_review', 'product', p_product_id, null, null);
    return jsonb_build_object('published', false, 'status', 'cluster_review');
  end if;

  update public.products set status = 'published', published_at = now() where id = p_product_id;
  perform public.audit('publish', 'product', p_product_id, null, null);
  return jsonb_build_object('published', true, 'status', 'published');
end $$;

-- ---------------------------------------------------------------------------
-- Negotiation.
-- The band is computed from the PUBLIC listed price only. It deliberately does
-- not consult the seller's minimum, so it cannot leak it even indirectly.
-- ---------------------------------------------------------------------------
create or replace function public.offer_band_for(p_listed bigint, p_amount bigint)
returns offer_band language sql immutable as $$
  select case
    when p_listed is null or p_listed = 0 then 'unavailable'::offer_band
    when p_amount::numeric / p_listed >= 0.95 then 'strong'::offer_band
    when p_amount::numeric / p_listed >= 0.80 then 'reasonable'::offer_band
    else 'below_typical'::offer_band
  end;
$$;

create or replace function public.place_offer(
  p_product_id uuid, p_amount_paise bigint, p_quantity int default 1, p_note text default null)
returns public.offers
language plpgsql security definer set search_path = public as $$
declare p public.products; o public.offers; c_id uuid; v_band offer_band;
begin
  if not public.has_role('buyer') then raise exception 'buyer role required' using errcode = '42501'; end if;
  select * into p from public.products where id = p_product_id;
  if p.id is null or p.status <> 'published' then raise exception 'product not available'; end if;
  if not p.negotiable then raise exception 'this product is not negotiable'; end if;
  if p.seller_id = auth.uid() then raise exception 'cannot offer on your own product'; end if;
  if p_amount_paise <= 0 or p_quantity <= 0 then raise exception 'invalid offer'; end if;
  if p.moq is not null and p_quantity < p.moq then
    raise exception 'minimum order quantity is %', p.moq;
  end if;

  v_band := public.offer_band_for(p.listed_price_paise, p_amount_paise);

  insert into public.offers (product_id, buyer_id, seller_id, amount_paise, quantity,
                             listed_price_at_offer_paise, band, band_reason, expires_at)
  values (p_product_id, auth.uid(), p.seller_id, p_amount_paise, p_quantity,
          p.listed_price_paise, v_band,
          case v_band
            when 'strong'        then 'Close to the listed price for this craft.'
            when 'reasonable'    then 'Within the usual range buyers offer.'
            when 'below_typical' then 'Below what sellers of this craft usually accept.'
            else null end,
          now() + interval '7 days')
  returning * into o;

  insert into public.offer_events (offer_id, actor, actor_id, action, amount_paise, quantity, note)
  values (o.id, 'buyer', auth.uid(), 'placed', p_amount_paise, p_quantity, p_note);

  insert into public.conversations (subject_type, subject_id, buyer_id, seller_id)
  values ('offer', o.id, auth.uid(), p.seller_id)
  on conflict do nothing returning id into c_id;

  perform public.notify_user(p.seller_id, 'offer.received',
    'Nayi peshkash aayi hai', 'You have a new offer', null, null, 'offer', o.id);
  return o;
end $$;

create or replace function public.respond_to_offer(
  p_offer_id uuid, p_action text, p_counter_amount_paise bigint default null,
  p_note text default null, p_override_reason text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.offers; v_floor bigint; v_order uuid;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.seller_id <> auth.uid() then raise exception 'not your offer' using errcode = '42501'; end if;
  if o.awaiting <> 'seller' then raise exception 'it is not your turn on this offer'; end if;
  if o.status in ('accepted','rejected','withdrawn','expired') then
    raise exception 'offer already settled'; end if;

  if p_action = 'accept' then
    select sustainable_floor_paise into v_floor
      from public.product_pricing_private where product_id = o.product_id;

    -- Accepting below your own floor is permitted, but never silently: it is a
    -- deliberate, audited act. This is the seller's protection, not a block.
    if v_floor is not null and o.amount_paise < v_floor and p_override_reason is null then
      return jsonb_build_object(
        'ok', false, 'reason', 'below_floor',
        'floor_paise', v_floor, 'offer_paise', o.amount_paise,
        'message', 'This offer is below your sustainable price. Confirm with a reason to accept anyway.');
    end if;
    if v_floor is not null and o.amount_paise < v_floor then
      perform public.audit('accept_below_floor', 'offer', o.id,
        jsonb_build_object('floor', v_floor),
        jsonb_build_object('accepted', o.amount_paise, 'reason', p_override_reason));
    end if;

    update public.offers set status = 'accepted', awaiting = 'none' where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, amount_paise, note)
    values (o.id, 'seller', auth.uid(), 'accepted', o.amount_paise, p_note);
    v_order := public.create_order_from_offer(o.id);
    perform public.notify_user(o.buyer_id, 'offer.accepted',
      null, 'Your offer was accepted', null, null, 'order', v_order);
    return jsonb_build_object('ok', true, 'status', 'accepted', 'order_id', v_order);

  elsif p_action = 'counter' then
    if p_counter_amount_paise is null or p_counter_amount_paise <= 0 then
      raise exception 'counter amount required'; end if;
    update public.offers
      set status = 'countered', awaiting = 'buyer', amount_paise = p_counter_amount_paise
    where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, amount_paise, note)
    values (o.id, 'seller', auth.uid(), 'countered', p_counter_amount_paise, p_note);
    perform public.notify_user(o.buyer_id, 'offer.countered',
      null, 'The seller sent a counter-offer', null, null, 'offer', o.id);
    return jsonb_build_object('ok', true, 'status', 'countered');

  elsif p_action = 'reject' then
    update public.offers set status = 'rejected', awaiting = 'none' where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, note)
    values (o.id, 'seller', auth.uid(), 'rejected', p_note);
    perform public.notify_user(o.buyer_id, 'offer.rejected',
      null, 'The seller declined your offer', null, null, 'offer', o.id);
    return jsonb_build_object('ok', true, 'status', 'rejected');
  end if;

  raise exception 'unknown action %', p_action;
end $$;

create or replace function public.buyer_respond_offer(
  p_offer_id uuid, p_action text, p_amount_paise bigint default null, p_note text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.offers; v_order uuid;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.buyer_id <> auth.uid() then raise exception 'not your offer' using errcode = '42501'; end if;
  if o.status in ('accepted','rejected','withdrawn','expired') then
    raise exception 'offer already settled'; end if;

  if p_action = 'accept' then
    if o.awaiting <> 'buyer' then raise exception 'nothing to accept'; end if;
    update public.offers set status = 'accepted', awaiting = 'none' where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, amount_paise, note)
    values (o.id, 'buyer', auth.uid(), 'accepted', o.amount_paise, p_note);
    v_order := public.create_order_from_offer(o.id);
    perform public.notify_user(o.seller_id, 'offer.accepted',
      'Peshkash sweekar hui', 'Your counter-offer was accepted', null, null, 'order', v_order);
    return jsonb_build_object('ok', true, 'status', 'accepted', 'order_id', v_order);

  elsif p_action = 'counter' then
    if o.awaiting <> 'buyer' then raise exception 'it is not your turn'; end if;
    if p_amount_paise is null or p_amount_paise <= 0 then raise exception 'amount required'; end if;
    update public.offers set status = 'pending', awaiting = 'seller', amount_paise = p_amount_paise
    where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, amount_paise, note)
    values (o.id, 'buyer', auth.uid(), 'countered', p_amount_paise, p_note);
    perform public.notify_user(o.seller_id, 'offer.countered',
      'Nayi peshkash aayi hai', 'The buyer sent a new offer', null, null, 'offer', o.id);
    return jsonb_build_object('ok', true, 'status', 'pending');

  elsif p_action = 'withdraw' then
    update public.offers set status = 'withdrawn', awaiting = 'none' where id = o.id;
    insert into public.offer_events (offer_id, actor, actor_id, action, note)
    values (o.id, 'buyer', auth.uid(), 'withdrawn', p_note);
    return jsonb_build_object('ok', true, 'status', 'withdrawn');
  end if;

  raise exception 'unknown action %', p_action;
end $$;

-- Capacity is committed here, at the order, never while merely negotiating.
create or replace function public.create_order_from_offer(p_offer_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.offers; p public.products; v_order uuid;
begin
  select * into o from public.offers where id = p_offer_id;
  select * into p from public.products where id = o.product_id for update;

  if p.stock_qty - p.reserved_qty < o.quantity and not p.made_to_order then
    raise exception 'not enough stock: % available', p.stock_qty - p.reserved_qty;
  end if;

  insert into public.orders (order_no, buyer_id, seller_id, product_id, offer_id,
                             quantity, unit_price_paise, total_paise, expected_delivery_date)
  values ('AK-' || nextval('public.order_no_seq'), o.buyer_id, o.seller_id, o.product_id, o.id,
          o.quantity, o.amount_paise, o.amount_paise * o.quantity,
          (current_date + coalesce(p.lead_time_days, 14)))
  returning id into v_order;

  insert into public.order_events (order_id, actor_id, to_status, note)
  values (v_order, auth.uid(), 'created', 'created from accepted offer');

  if not p.made_to_order then
    insert into public.inventory_reservations (product_id, order_id, quantity)
    values (p.id, v_order, o.quantity);
    update public.products set reserved_qty = reserved_qty + o.quantity where id = p.id;
  end if;

  perform public.audit('create_order', 'order', v_order, null,
                       jsonb_build_object('offer_id', o.id));
  return v_order;
end $$;

-- ---------------------------------------------------------------------------
-- Marketplace search: the matching contract from
-- docs/02-interdependence/shared-spine.md section 4, as one function.
-- Every filter here maps to a seller-supplied field. There are no orphan filters.
-- ---------------------------------------------------------------------------
create or replace function public.search_marketplace(
  p_query        text    default null,
  p_craft_id     uuid    default null,
  p_material_ids uuid[]  default null,
  p_technique_ids uuid[] default null,
  p_state        text    default null,
  p_district     text    default null,
  p_quantity     int     default null,
  p_budget_per_unit_paise bigint default null,
  p_deadline     date    default null,
  p_customizable boolean default null,
  p_negotiable   boolean default null,
  p_b2b_only     boolean default null,
  p_min_verification verification_tier default null,
  p_price_min_paise bigint default null,
  p_price_max_paise bigint default null,
  p_sort         text    default 'relevance',
  p_limit        int     default 20,
  p_offset       int     default 0)
returns table (
  id uuid, title_en text, title_hi text, listed_price_paise bigint,
  craft_id uuid, region_state text, region_district text,
  moq int, lead_time_days int, capacity_per_cycle int,
  negotiable boolean, customization_supported boolean, b2b_enabled boolean,
  seller_id uuid, seller_name text, verification_tier verification_tier,
  primary_media_key text, total_count bigint)
language sql stable security definer set search_path = public as $$
  with base as (
    select p.*, a.display_name, a.verification_tier as v_tier,
           (select m.storage_key from public.product_media m
             where m.product_id = p.id
             order by (m.role = 'enhanced') desc, m.sort_order limit 1) as media_key
    from public.products p
    join public.artisan_profiles a on a.user_id = p.seller_id
    where p.status = 'published'
      and (p_craft_id is null or p.craft_id = p_craft_id)
      and (p_material_ids  is null or p.material_ids  && p_material_ids)
      and (p_technique_ids is null or p.technique_ids && p_technique_ids)
      and (p_state    is null or p.region_state = p_state)
      and (p_district is null or p.region_district = p_district)
      -- quantity clears MOQ and is reachable within capacity before the deadline
      and (p_quantity is null or p.moq is null or p.moq <= p_quantity)
      and (p_quantity is null or p_deadline is null or p.capacity_per_cycle is null
           or p_quantity <= p.capacity_per_cycle
              * greatest(1, floor((p_deadline - current_date - coalesce(p.lead_time_days,0))
                                  / nullif(p.cycle_days,0))))
      and (p_deadline is null or p.lead_time_days is null
           or current_date + p.lead_time_days <= p_deadline)
      and (p_budget_per_unit_paise is null or p.listed_price_paise <= p_budget_per_unit_paise)
      and (p_customizable is null or p.customization_supported = p_customizable)
      and (p_negotiable   is null or p.negotiable = p_negotiable)
      and (p_b2b_only     is null or p_b2b_only = false or p.b2b_enabled)
      and (p_min_verification is null or a.verification_tier >= p_min_verification)
      and (p_price_min_paise is null or p.listed_price_paise >= p_price_min_paise)
      and (p_price_max_paise is null or p.listed_price_paise <= p_price_max_paise)
      and (p_query is null or p.title_en ilike '%'||p_query||'%'
           or p.title_hi ilike '%'||p_query||'%'
           or p.description_en ilike '%'||p_query||'%')
  )
  select b.id, b.title_en, b.title_hi, b.listed_price_paise,
         b.craft_id, b.region_state, b.region_district,
         b.moq, b.lead_time_days, b.capacity_per_cycle,
         b.negotiable, b.customization_supported, b.b2b_enabled,
         b.seller_id, b.display_name, b.v_tier, b.media_key,
         count(*) over () as total_count
  from base b
  order by
    case when p_sort = 'price_asc'  then b.listed_price_paise end asc nulls last,
    case when p_sort = 'price_desc' then -b.listed_price_paise end asc nulls last,
    case when p_sort = 'lead_time'  then b.lead_time_days end asc nulls last,
    b.published_at desc
  limit greatest(1, least(p_limit, 100)) offset greatest(0, p_offset);
$$;

revoke all on function public.create_order_from_offer(uuid) from public, anon, authenticated;
