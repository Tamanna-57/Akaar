-- Reconcile the hosted project's migration history with the repo.
--
-- WHY THIS IS NEEDED
--
-- Migrations 1-12 were applied to project mwrlsblddpgjhhfwxvbc through the
-- management API, which records its own version strings. The repo now names
-- the same migrations 20260901180001_foundations.sql and so on. Those two sets
-- of versions do not match, so the CLI and the GitHub integration consider
-- every migration unapplied and will try to run them again - failing on
-- `type "app_role" already exists` at the first statement.
--
-- The database schema is already correct. Only the bookkeeping is wrong. This
-- script rewrites the bookkeeping to match the repo; it does not touch a
-- single application table.
--
-- BEFORE RUNNING: inspect what is actually recorded.
--
--   select version, name from supabase_migrations.schema_migrations
--   order by version;
--
-- Run this only if that list corresponds to the twelve migrations in
-- supabase/migrations. If it shows anything else, stop and re-read the state
-- rather than forcing it.

begin;

-- Guard: refuse to run unless the schema really is fully migrated. Checking a
-- few objects from the last migrations is enough to tell "already applied"
-- from "partially applied", and a partial state must not be marked complete.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    raise exception 'migration 1 has not been applied - do not reconcile';
  end if;
  if not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
                 where n.nspname = 'public' and p.proname = 'search_marketplace') then
    raise exception 'migration 9 has not been applied - do not reconcile';
  end if;
  if (select count(*) from public.crafts) <> 32 then
    raise exception 'taxonomy seed is not in the expected state - do not reconcile';
  end if;
  if has_function_privilege('authenticated', 'public.create_order_from_offer(uuid)', 'EXECUTE') then
    raise exception 'migration 12 has not been applied - do not reconcile';
  end if;
end $$;

delete from supabase_migrations.schema_migrations;

insert into supabase_migrations.schema_migrations (version, name) values
  ('20260901180001', 'foundations'),
  ('20260901180002', 'identity'),
  ('20260901180003', 'taxonomy'),
  ('20260901180004', 'catalog'),
  ('20260901180005', 'demand'),
  ('20260901180006', 'orders'),
  ('20260901180007', 'platform'),
  ('20260901180008', 'rls'),
  ('20260901180009', 'functions'),
  ('20260901180010', 'seed_taxonomy'),
  ('20260901180011', 'grants'),
  ('20260901180012', 'function_privileges');

commit;

-- Afterwards the CLI should report nothing pending:
--   supabase migration list --linked
