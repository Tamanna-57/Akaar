-- Akaar 001: extensions, enums, helper functions.
-- Money is always BIGINT paise. No floats in commerce paths.

create extension if not exists vector      with schema extensions;
create extension if not exists pg_trgm     with schema extensions;
create extension if not exists moddatetime with schema extensions;

create type app_role             as enum ('seller','buyer','cluster_manager','admin');
create type verification_tier    as enum ('unverified','self','cluster','admin');
create type buyer_org_type       as enum ('boutique','exporter','retailer','corporate_gifting','individual','other');
create type sample_policy        as enum ('none','paid','free_above_qty');

create type product_status       as enum (
  'draft','voice_captured','transcribed','extracted','needs_input','priced',
  'seller_review','seller_approved','cluster_review','published','paused','archived');

create type media_role           as enum ('original','enhanced','lifestyle');
create type authenticity_result  as enum ('passed','flagged','failed');

create type extraction_source    as enum ('voice','seller_input','taxonomy_inference','image');
create type seller_action        as enum ('pending','accepted','edited','rejected');
create type provenance_source    as enum ('seller_provided','admin_verified','external_reference');

create type party                as enum ('buyer','seller','none');
create type offer_status         as enum ('pending','countered','accepted','rejected','withdrawn','expired');
create type offer_band           as enum ('below_typical','reasonable','strong','unavailable');

create type custom_request_status as enum (
  'draft','open','seller_review','countered','accepted','declined','withdrawn','expired','closed');
create type feasibility_verdict  as enum ('possible','needs_negotiation','unlikely','unavailable');

create type order_status         as enum (
  'created','confirmed','in_production','ready','shipped','delivered','cancelled');
create type payment_status       as enum ('unpaid','pending','paid','refunded','not_applicable');

create type ai_job_kind          as enum (
  'transcribe','translate','extract','enhance','authenticity_check',
  'price_suggest','fair_offer','feasibility','chat');
create type ai_job_status        as enum ('queued','running','succeeded','failed','cancelled');

create type conversation_subject as enum ('offer','custom_request','order','general');
create type export_target        as enum ('csv','json','ondc','india_handmade','gem');

-- updated_at maintenance
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
