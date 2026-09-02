-- Akaar 003: craft taxonomy.
-- Shared vocabulary. Buyer filters and seller attributes both resolve to node
-- ids, which is what makes the two sides join instead of string-matching.

create table public.crafts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  parent_id   uuid references public.crafts(id) on delete set null,
  name_en     text not null,
  name_hi     text not null,
  regions     text[] not null default '{}',
  description_en text,
  description_hi text,
  care_en     text,
  care_hi     text,
  motifs      text[] not null default '{}',
  embedding   extensions.vector(768),
  created_at  timestamptz not null default now()
);
create index idx_crafts_parent on public.crafts (parent_id);
create index idx_crafts_name_trgm on public.crafts using gin (name_en extensions.gin_trgm_ops);

create table public.materials (
  id       uuid primary key default gen_random_uuid(),
  slug     text unique not null,
  name_en  text not null,
  name_hi  text not null,
  category text
);

create table public.techniques (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name_en    text not null,
  name_hi    text not null,
  -- drives the handmade / handwoven marketplace filters, so it is a seller
  -- field rather than a buyer-side inference
  is_handmade  boolean not null default true,
  is_handwoven boolean not null default false
);

-- Free text the taxonomy could not resolve. Preserved for admin curation
-- rather than silently coerced into the nearest node.
create table public.unmapped_terms (
  id         uuid primary key default gen_random_uuid(),
  term       text not null,
  kind       text not null,
  product_id uuid,
  seen_count int not null default 1,
  created_at timestamptz not null default now()
);
