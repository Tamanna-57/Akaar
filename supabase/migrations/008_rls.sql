-- Akaar 008: row level security.
--
-- Read paths go through RLS. Writes that carry a business rule (offers, custom
-- requests, orders, publication, pricing) have NO write policy at all: they are
-- reachable only through the SECURITY DEFINER functions in 009. That is how
-- "deterministic rules for critical business logic" is enforced rather than
-- merely intended - a client cannot bypass a rule it has no grant to bypass.

alter table public.profiles                enable row level security;
alter table public.clusters                enable row level security;
alter table public.artisan_profiles        enable row level security;
alter table public.artisan_private         enable row level security;
alter table public.buyer_profiles          enable row level security;
alter table public.buyer_private           enable row level security;
alter table public.cluster_members         enable row level security;
alter table public.crafts                  enable row level security;
alter table public.materials               enable row level security;
alter table public.techniques              enable row level security;
alter table public.unmapped_terms          enable row level security;
alter table public.products                enable row level security;
alter table public.product_pricing_private enable row level security;
alter table public.product_media           enable row level security;
alter table public.craft_passports         enable row level security;
alter table public.voice_inputs            enable row level security;
alter table public.transcripts             enable row level security;
alter table public.attribute_extractions   enable row level security;
alter table public.offers                  enable row level security;
alter table public.offer_events            enable row level security;
alter table public.custom_requests         enable row level security;
alter table public.custom_request_events   enable row level security;
alter table public.conversations           enable row level security;
alter table public.messages                enable row level security;
alter table public.orders                  enable row level security;
alter table public.order_events            enable row level security;
alter table public.inventory_reservations  enable row level security;
alter table public.notifications           enable row level security;
alter table public.audit_logs              enable row level security;
alter table public.consents                enable row level security;
alter table public.ai_jobs                 enable row level security;
alter table public.marketplace_exports     enable row level security;

-- ---------- identity ----------
create policy profiles_self_read on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy profiles_self_write on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy clusters_read on public.clusters
  for select to authenticated using (true);

-- Artisan public profile is readable by any authenticated user: it is what a
-- buyer sees on a listing.
create policy artisan_public_read on public.artisan_profiles
  for select to authenticated using (true);
create policy artisan_self_write on public.artisan_profiles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Exact address, legal name, labour rate. Owner and admin only - a cluster
-- manager is deliberately excluded.
create policy artisan_private_owner on public.artisan_private
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- A buyer's organisation is visible to sellers they are actually dealing with,
-- not to the whole marketplace.
create policy buyer_profile_read on public.buyer_profiles
  for select to authenticated using (
    user_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.offers o
               where o.buyer_id = buyer_profiles.user_id and o.seller_id = auth.uid())
    or exists (select 1 from public.custom_requests c
               where c.buyer_id = buyer_profiles.user_id and c.seller_id = auth.uid())
    or exists (select 1 from public.orders r
               where r.buyer_id = buyer_profiles.user_id and r.seller_id = auth.uid())
  );
create policy buyer_profile_self_write on public.buyer_profiles
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy buyer_private_owner on public.buyer_private
  for all to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

create policy cluster_members_read on public.cluster_members
  for select to authenticated using (
    user_id = auth.uid() or public.is_admin() or public.manages_cluster(cluster_id));

-- ---------- taxonomy: shared vocabulary, readable by everyone ----------
create policy crafts_read     on public.crafts     for select to authenticated, anon using (true);
create policy materials_read  on public.materials  for select to authenticated, anon using (true);
create policy techniques_read on public.techniques for select to authenticated, anon using (true);
create policy unmapped_admin  on public.unmapped_terms for select to authenticated using (public.is_admin());

-- ---------- products ----------
create policy products_read on public.products
  for select to authenticated using (
    seller_id = auth.uid()
    or status = 'published'
    or public.is_admin()
    or exists (select 1 from public.artisan_profiles a
               where a.user_id = products.seller_id and public.manages_cluster(a.cluster_id))
  );
-- The seller may create and edit drafts directly; publication is not an edit,
-- it is publish_product() in 009.
create policy products_owner_insert on public.products
  for insert to authenticated with check (seller_id = auth.uid());
create policy products_owner_update on public.products
  for update to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());
create policy products_owner_delete on public.products
  for delete to authenticated using (seller_id = auth.uid() and status = 'draft');

-- Costs, floor, and the private minimum. Owner and admin only, no exceptions.
create policy pricing_owner on public.product_pricing_private
  for all to authenticated
  using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid());

create policy media_read on public.product_media
  for select to authenticated using (
    seller_id = auth.uid() or public.is_admin()
    or exists (select 1 from public.products p
               where p.id = product_media.product_id and p.status = 'published')
  );
create policy media_owner_write on public.product_media
  for all to authenticated using (seller_id = auth.uid()) with check (seller_id = auth.uid());

create policy passport_read on public.craft_passports
  for select to authenticated, anon using (
    exists (select 1 from public.products p
            where p.id = craft_passports.product_id and p.status = 'published')
  );
create policy passport_owner_write on public.craft_passports
  for all to authenticated
  using (exists (select 1 from public.products p
                 where p.id = craft_passports.product_id and p.seller_id = auth.uid()))
  with check (exists (select 1 from public.products p
                      where p.id = craft_passports.product_id and p.seller_id = auth.uid()));

-- ---------- AI artifacts: seller's own working data ----------
create policy voice_owner on public.voice_inputs
  for all to authenticated using (seller_id = auth.uid() or public.is_admin())
  with check (seller_id = auth.uid());
create policy transcripts_owner on public.transcripts
  for all to authenticated
  using (exists (select 1 from public.voice_inputs v
                 where v.id = transcripts.voice_input_id
                   and (v.seller_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.voice_inputs v
                      where v.id = transcripts.voice_input_id and v.seller_id = auth.uid()));
create policy extractions_owner on public.attribute_extractions
  for all to authenticated
  using (exists (select 1 from public.products p
                 where p.id = attribute_extractions.product_id
                   and (p.seller_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.products p
                      where p.id = attribute_extractions.product_id and p.seller_id = auth.uid()));

-- ---------- demand: read for participants, writes only via RPC ----------
create policy offers_participants on public.offers
  for select to authenticated using (
    buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
create policy offer_events_participants on public.offer_events
  for select to authenticated using (
    exists (select 1 from public.offers o where o.id = offer_events.offer_id
            and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or public.is_admin())));

create policy custom_requests_participants on public.custom_requests
  for select to authenticated using (
    buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
    -- an open RFQ is broadcast: any seller may see it
    or (status = 'open' and seller_id is null and public.has_role('seller')));
create policy cr_events_participants on public.custom_request_events
  for select to authenticated using (
    exists (select 1 from public.custom_requests c where c.id = custom_request_events.request_id
            and (c.buyer_id = auth.uid() or c.seller_id = auth.uid() or public.is_admin())));

create policy conversations_participants on public.conversations
  for select to authenticated using (
    buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());

create policy messages_read on public.messages
  for select to authenticated using (
    exists (select 1 from public.conversations c where c.id = messages.conversation_id
            and (c.buyer_id = auth.uid() or c.seller_id = auth.uid() or public.is_admin())));
-- Messages carry no business rule, so a participant may insert directly.
-- Append-only: there is deliberately no update or delete policy.
create policy messages_insert on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.conversations c where c.id = messages.conversation_id
                and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())));

-- ---------- orders ----------
create policy orders_participants on public.orders
  for select to authenticated using (
    buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin());
create policy order_events_participants on public.order_events
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_events.order_id
            and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or public.is_admin())));
create policy reservations_participants on public.inventory_reservations
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = inventory_reservations.order_id
            and (o.buyer_id = auth.uid() or o.seller_id = auth.uid() or public.is_admin())));

-- ---------- platform ----------
create policy notifications_self on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_self_update on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy audit_admin_read on public.audit_logs
  for select to authenticated using (public.is_admin());

create policy consents_self on public.consents
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy ai_jobs_owner on public.ai_jobs
  for select to authenticated using (requested_by = auth.uid() or public.is_admin());

create policy exports_owner on public.marketplace_exports
  for select to authenticated using (
    exists (select 1 from public.products p where p.id = marketplace_exports.product_id
            and (p.seller_id = auth.uid() or public.is_admin())));
