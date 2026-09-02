-- Akaar 011: explicit privileges.
--
-- Supabase grants table privileges to anon/authenticated by default privilege,
-- which means the security of a table would rest on a setting made elsewhere.
-- This migration states the grants deliberately instead: read paths are opened,
-- and the write paths that carry a business rule are revoked so they are
-- reachable only through the SECURITY DEFINER functions in 009.

revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- Taxonomy: shared vocabulary, readable by everyone (RLS still applies).
grant select on public.crafts, public.materials, public.techniques to anon, authenticated;

-- Public passport page: reachable by QR without an account.
grant select on public.craft_passports, public.products, public.product_media to anon;

-- Identity and catalog: RLS decides the rows, these decide the verbs.
grant select, insert, update on public.profiles, public.artisan_profiles,
  public.artisan_private, public.buyer_profiles, public.buyer_private to authenticated;
grant select on public.clusters, public.cluster_members to authenticated;

grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update on public.product_pricing_private to authenticated;
grant select, insert, update, delete on public.product_media to authenticated;
grant select, insert, update on public.craft_passports to authenticated;
grant select, insert, update, delete on public.voice_inputs, public.transcripts,
  public.attribute_extractions to authenticated;

-- Negotiation, orders and inventory: SELECT only. Every state transition on
-- these goes through a function that enforces turn order, the price floor and
-- capacity. A client has no grant with which to bypass those rules.
grant select on public.offers, public.offer_events,
  public.custom_requests, public.custom_request_events,
  public.orders, public.order_events, public.inventory_reservations to authenticated;

grant select on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;   -- append-only by grant
grant select, update on public.notifications to authenticated;
grant select, insert, update on public.consents to authenticated;
grant select on public.ai_jobs, public.marketplace_exports, public.audit_logs to authenticated;

grant usage, select on all sequences in schema public to authenticated;

-- Callable business rules.
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

-- Internal only: called by respond_to_offer / buyer_respond_offer, never directly.
revoke all on function public.create_order_from_offer(uuid) from anon, authenticated;
revoke all on function public.notify_user(uuid, text, text, text, text, text, text, uuid)
  from anon, authenticated;
revoke all on function public.audit(text, text, uuid, jsonb, jsonb) from anon, authenticated;
