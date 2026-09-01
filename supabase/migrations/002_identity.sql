-- Akaar 002: identity.
-- Private data lives in separate *_private tables with owner-only RLS, because
-- PostgREST cannot mask columns per user. See docs/02-interdependence/reconciliation.md.

create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  phone          text unique,
  full_name      text,
  preferred_lang text        not null default 'hi',
  roles          app_role[]  not null default '{}',
  active_role    app_role,
  avatar_key     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create table public.clusters (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  state      text not null,
  district   text not null,
  manager_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Buyer-visible artisan data.
create table public.artisan_profiles (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  display_name       text not null,
  state              text not null,
  district           text not null,
  languages          text[] not null default '{hi}',
  experience_years   int,
  story_hi           text,
  story_en           text,
  cluster_id         uuid references public.clusters(id) on delete set null,
  verification_tier  verification_tier not null default 'unverified',
  packaging_options  text[] not null default '{}',
  sample_policy      sample_policy not null default 'none',
  default_capacity_per_cycle int,
  default_cycle_days int,
  digital_literacy   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger artisan_profiles_touch before update on public.artisan_profiles
  for each row execute function public.touch_updated_at();
create index idx_artisan_region on public.artisan_profiles (state, district);

-- Never buyer-visible. Exact address is withheld deliberately: district is the
-- finest granularity a buyer needs and the coarsest that stays useful.
create table public.artisan_private (
  user_id                   uuid primary key references public.artisan_profiles(user_id) on delete cascade,
  legal_name                text,
  address_line              text,
  pincode                   text,
  default_labour_rate_paise bigint,
  payout_ref                text,
  updated_at                timestamptz not null default now()
);
create trigger artisan_private_touch before update on public.artisan_private
  for each row execute function public.touch_updated_at();

create table public.buyer_profiles (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  org_name            text not null,
  org_type            buyer_org_type not null default 'individual',
  city                text,
  state               text,
  sourcing_craft_ids  uuid[] not null default '{}',
  typical_qty_min     int,
  typical_qty_max     int,
  verification_tier   verification_tier not null default 'unverified',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger buyer_profiles_touch before update on public.buyer_profiles
  for each row execute function public.touch_updated_at();

create table public.buyer_private (
  user_id       uuid primary key references public.buyer_profiles(user_id) on delete cascade,
  gstin         text,
  contact_name  text,
  contact_phone text,
  address_line  text,
  updated_at    timestamptz not null default now()
);
create trigger buyer_private_touch before update on public.buyer_private
  for each row execute function public.touch_updated_at();

create table public.cluster_members (
  cluster_id uuid not null references public.clusters(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (cluster_id, user_id)
);

-- Role helpers. SECURITY DEFINER so RLS policies can call them without
-- recursing into profiles' own policies.
create or replace function public.has_role(r app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and r = any(p.roles));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles));
$$;

create or replace function public.manages_cluster(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select c is not null and exists (
    select 1 from public.clusters cl where cl.id = c and cl.manager_id = auth.uid());
$$;

-- New auth user -> profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
