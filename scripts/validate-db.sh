#!/usr/bin/env bash
# Apply every migration to a throwaway local Postgres and run the spine tests.
# Catches SQL errors before they reach the Supabase project. Requires postgres
# 16+ and a 'postgres' system user.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGVAL=${PGVAL:-/pgval}
PORT=${PGPORT:-55432}
BIN=$(ls -d /usr/lib/postgresql/*/bin | tail -1)

if ! su postgres -c "psql -p $PORT -d postgres -tAc 'select 1'" >/dev/null 2>&1; then
  echo "starting local postgres in $PGVAL"
  rm -rf "$PGVAL"; mkdir -p "$PGVAL/data"; chown -R postgres:postgres "$PGVAL"; chmod 755 "$PGVAL"
  su postgres -c "$BIN/initdb -D $PGVAL/data -A trust -E UTF8" >"$PGVAL/initdb.log" 2>&1
  su postgres -c "$BIN/pg_ctl -D $PGVAL/data -l $PGVAL/pg.log -o '-p $PORT' start" >/dev/null
  sleep 1
fi

mkdir -p "$PGVAL/mig"
cat > "$PGVAL/harness.sql" <<'EOF'
-- Minimal stand-in for the Supabase-managed objects the migrations rely on.
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;
create schema if not exists extensions;
create schema if not exists auth;
grant usage on schema public, extensions to anon, authenticated, service_role;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  phone text unique, email text, created_at timestamptz default now());
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
EOF

su postgres -c "psql -p $PORT -d postgres -q -c 'drop database if exists akaar_val;' -c 'create database akaar_val;'"
cp "$ROOT"/supabase/migrations/*.sql "$PGVAL/mig/"
# pgvector is not installed in the local cluster; the column is exercised on Supabase.
sed -i '/create extension if not exists vector/d' "$PGVAL"/mig/*.sql
sed -i 's/extensions\.vector(768)/text/'          "$PGVAL"/mig/*.sql
cp "$ROOT"/supabase/tests/*.sql "$PGVAL/"
chown -R postgres:postgres "$PGVAL"

su postgres -c "psql -p $PORT -d akaar_val -q -v ON_ERROR_STOP=1 -f $PGVAL/harness.sql"
for f in "$PGVAL"/mig/*.sql; do
  printf '  %-44s' "$(basename "$f")"
  su postgres -c "psql -p $PORT -d akaar_val -q -v ON_ERROR_STOP=1 -f $f" && echo "ok"
done

echo
su postgres -c "psql -p $PORT -d akaar_val -v ON_ERROR_STOP=1 -f $PGVAL/phase1_spine.sql" 2>&1 \
  | grep -E 'PASS|FAIL|ERROR|VERIFIED' | sed -E 's/^psql.*(NOTICE|ERROR):  /\1: /'
