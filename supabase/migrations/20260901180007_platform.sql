-- Akaar 007: cross-cutting platform tables.

create table public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(id) on delete cascade,
  kind      text not null,
  title_hi text, title_en text,
  body_hi  text, body_en  text,
  entity_type text, entity_id uuid,
  read_at   timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on public.notifications (user_id, read_at, created_at desc);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  actor_role  app_role,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);
create index idx_audit_entity on public.audit_logs (entity_type, entity_id, created_at desc);

-- Purpose-scoped and versioned. Presented in the user's language with audio:
-- a consent screen a user cannot read is not consent.
create table public.consents (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  purpose    text not null,
  policy_version text not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz
);
create unique index idx_consent_active on public.consents (user_id, purpose)
  where revoked_at is null;

create table public.ai_jobs (
  id         uuid primary key default gen_random_uuid(),
  kind       ai_job_kind not null,
  status     ai_job_status not null default 'queued',
  requested_by uuid references public.profiles(id) on delete set null,
  entity_type text, entity_id uuid,
  provider   text,
  model_version text,
  request    jsonb,
  response   jsonb,
  error      text,
  attempts   int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger ai_jobs_touch before update on public.ai_jobs
  for each row execute function public.touch_updated_at();
create index idx_ai_jobs_entity on public.ai_jobs (entity_type, entity_id, created_at desc);
create index idx_ai_jobs_queue on public.ai_jobs (status, created_at) where status in ('queued','running');

-- is_simulated defaults true so "simulated" is a data fact rather than a caption
-- someone can forget to render. Only an authorised integration may set it false.
create table public.marketplace_exports (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  target     export_target not null,
  payload    jsonb,
  checksum   text,
  is_simulated boolean not null default true,
  authorisation_ref text,
  created_at timestamptz not null default now(),
  constraint live_export_requires_authorisation check (
    is_simulated or authorisation_ref is not null)
);
