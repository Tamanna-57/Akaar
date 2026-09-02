#!/usr/bin/env bash
# Exercise supabase/tools/reconcile-migration-history.sql before it is ever run
# against the hosted project.
#
# That script rewrites migration bookkeeping on a production database, so the
# thing worth proving is not only that it works, but that its guard refuses a
# database whose schema is incomplete - marking a partially migrated project as
# fully migrated would be worse than leaving it alone.
#
# Assumes scripts/validate-db.sh has already built akaar_val.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PGVAL=${PGVAL:-/pgval}
PORT=${PGPORT:-55432}

# The state the hosted project is in: schema correct, history recorded under
# management-API version strings that do not match the repo filenames.
cat > "$PGVAL/setup_mismatch.sql" <<'EOF'
create schema if not exists supabase_migrations;
drop table if exists supabase_migrations.schema_migrations;
create table supabase_migrations.schema_migrations (
  version text primary key, statements text[], name text);
insert into supabase_migrations.schema_migrations (version, name) values
  ('20260901185101','001_foundations'), ('20260901185115','002_identity'),
  ('20260901185122','003_taxonomy'),    ('20260901185130','004_catalog'),
  ('20260901185141','005_demand'),      ('20260901185149','006_orders'),
  ('20260901185156','007_platform'),    ('20260901185204','008_rls'),
  ('20260901185219','009_functions'),   ('20260901185231','010_seed_taxonomy'),
  ('20260901185238','011_grants'),      ('20260901185254','012_function_privileges');
EOF
cp "$ROOT/supabase/tools/reconcile-migration-history.sql" "$PGVAL/reconcile.sql"
chown postgres:postgres "$PGVAL/setup_mismatch.sql" "$PGVAL/reconcile.sql"
q() { su postgres -c "psql -p $PORT -d $1 -q -v ON_ERROR_STOP=1 ${*:2}"; }

echo "1. fully migrated database -> should reconcile"
q akaar_val -f "$PGVAL/setup_mismatch.sql" >/dev/null 2>&1
q akaar_val -f "$PGVAL/reconcile.sql"
got=$(su postgres -c "psql -p $PORT -d akaar_val -tAc \
  \"select count(*)||':'||min(version)||':'||max(version) from supabase_migrations.schema_migrations\"")
[ "$got" = "12:20260901180001:20260901180012" ] \
  && echo "   PASS history now matches the repo filenames" \
  || { echo "   FAIL got $got"; exit 1; }

echo "2. partially migrated database -> must refuse"
su postgres -c "psql -p $PORT -d postgres -q -c 'drop database if exists akaar_partial;' \
  -c 'create database akaar_partial;'" >/dev/null 2>&1
q akaar_partial -f "$PGVAL/harness.sql" >/dev/null
q akaar_partial -f "$PGVAL"/mig/*_foundations.sql >/dev/null
su postgres -c "psql -p $PORT -d akaar_partial -q -f $PGVAL/setup_mismatch.sql" >/dev/null 2>&1
# Capture first: psql exits non-zero when the guard raises, and under
# `set -o pipefail` a pipeline would inherit that even though grep matched.
out=$(su postgres -c "psql -p $PORT -d akaar_partial -q -v ON_ERROR_STOP=1 -f $PGVAL/reconcile.sql" 2>&1 || true)
if grep -q "do not reconcile" <<<"$out"; then
  echo "   PASS guard refused an incomplete schema"
  grep -o "ERROR:.*do not reconcile" <<<"$out" | head -1 | sed 's/^/        /'
else
  echo "   FAIL guard did not fire - it would have recorded a partial migration as complete"
  echo "$out" | tail -3; exit 1
fi
left=$(su postgres -c "psql -p $PORT -d akaar_partial -tAc \
  \"select min(version) from supabase_migrations.schema_migrations\"")
[ "$left" = "20260901185101" ] \
  && echo "   PASS history left untouched by the refusal" \
  || { echo "   FAIL history was modified: $left"; exit 1; }
