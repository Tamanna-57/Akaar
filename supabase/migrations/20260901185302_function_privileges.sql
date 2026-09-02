-- Akaar 012: close the PUBLIC execute grant.
--
-- 011 revoked EXECUTE from anon and authenticated, which was not enough:
-- Postgres grants EXECUTE on new functions to PUBLIC, and anon/authenticated
-- inherit through it. The Supabase security advisor caught the consequence -
-- create_order_from_offer was reachable at /rest/v1/rpc/create_order_from_offer
-- by any caller, which would have let a buyer mint an order from any offer id
-- without the seller ever accepting it.
--
-- The fix is to revoke from PUBLIC (not from the roles) and then grant back
-- deliberately, function by function.

revoke all on function public.touch_updated_at()                       from public;
revoke all on function public.protect_original_media()                 from public;
revoke all on function public.handle_new_user()                        from public;
revoke all on function public.has_role(app_role)                       from public;
revoke all on function public.is_admin()                               from public;
revoke all on function public.manages_cluster(uuid)                    from public;
revoke all on function public.notify_user(uuid, text, text, text, text, text, text, uuid) from public;
revoke all on function public.audit(text, text, uuid, jsonb, jsonb)    from public;
revoke all on function public.recalculate_price(uuid)                  from public;
revoke all on function public.set_price_corridor(uuid, bigint, bigint, bigint) from public;
revoke all on function public.publish_product(uuid)                    from public;
revoke all on function public.offer_band_for(bigint, bigint)           from public;
revoke all on function public.create_order_from_offer(uuid)            from public;
revoke all on function public.place_offer(uuid, bigint, int, text)     from public;
revoke all on function public.respond_to_offer(uuid, text, bigint, text, text) from public;
revoke all on function public.buyer_respond_offer(uuid, text, bigint, text) from public;
revoke all on function public.search_marketplace(
  text, uuid, uuid[], uuid[], text, text, int, bigint, date, boolean, boolean,
  boolean, verification_tier, bigint, bigint, text, int, int) from public;

-- RLS policy expressions are evaluated as the querying role, so the role
-- helpers must stay callable by it.
grant execute on function public.has_role(app_role)    to authenticated;
grant execute on function public.is_admin()            to authenticated;
grant execute on function public.manages_cluster(uuid) to authenticated;

-- The deliberate write surface. Each performs its own authorization.
grant execute on function public.recalculate_price(uuid) to authenticated;
grant execute on function public.set_price_corridor(uuid, bigint, bigint, bigint) to authenticated;
grant execute on function public.publish_product(uuid) to authenticated;
grant execute on function public.place_offer(uuid, bigint, int, text) to authenticated;
grant execute on function public.respond_to_offer(uuid, text, bigint, text, text) to authenticated;
grant execute on function public.buyer_respond_offer(uuid, text, bigint, text) to authenticated;
grant execute on function public.offer_band_for(bigint, bigint) to authenticated;
grant execute on function public.search_marketplace(
  text, uuid, uuid[], uuid[], text, text, int, bigint, date, boolean, boolean,
  boolean, verification_tier, bigint, bigint, text, int, int) to anon, authenticated;

-- create_order_from_offer, notify_user and audit are internal: no role is
-- granted execute, so they are reachable only from the functions above, which
-- run as their definer.

-- Defence in depth: even if the grant were restored by accident, an order can
-- only be minted from an offer that has actually been accepted, by a party to it.
create or replace function public.create_order_from_offer(p_offer_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare o public.offers; p public.products; v_order uuid;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.status <> 'accepted' then
    raise exception 'offer % is not accepted', p_offer_id using errcode = '42501';
  end if;
  if auth.uid() is not null and auth.uid() not in (o.buyer_id, o.seller_id) then
    raise exception 'not a party to this offer' using errcode = '42501';
  end if;
  if exists (select 1 from public.orders where offer_id = p_offer_id) then
    raise exception 'an order already exists for this offer';
  end if;

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
revoke all on function public.create_order_from_offer(uuid) from public;

-- Pin search_path on the remaining functions (advisor 0011).
alter function public.touch_updated_at()       set search_path = public;
alter function public.protect_original_media() set search_path = public;
alter function public.offer_band_for(bigint, bigint) set search_path = public;
