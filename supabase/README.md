# Supabase

Akaar's backend is Supabase-native. There is no separate API server.

| Concern | Mechanism |
|---|---|
| Reads | PostgREST + Row Level Security |
| Business rules and state transitions | `SECURITY DEFINER` functions (`009_functions.sql`) |
| AI provider calls and keys | Edge Functions (Phase 11) |
| Media | Supabase Storage, private buckets, signed URLs |

Project: **Akaar** — `mwrlsblddpgjhhfwxvbc`, Postgres 17, ap-northeast-1.

## Migrations

Applied in numeric order. Committed here, never applied only to the remote.

Filenames follow the Supabase CLI convention `<YYYYMMDDHHMMSS>_<name>.sql`.
The CLI and the GitHub integration reject any other version format, so the
prefix is not decorative.

| Migration | Contents |
|---|---|
| `…0001_foundations` | Extensions, enums, `touch_updated_at` |
| `…0002_identity` | Profiles, artisan/buyer profiles, the `*_private` split, role helpers |
| `…0003_taxonomy` | Crafts, materials, techniques, unmapped terms |
| `…0004_catalog` | Products, private pricing, media, craft passports, voice/extraction |
| `…0005_demand` | Offers, custom requests, conversations, messages |
| `…0006_orders` | Orders, order events, inventory reservations |
| `…0007_platform` | Notifications, audit, consents, AI jobs, exports |
| `…0008_rls` | Row level security for every table |
| `…0009_functions` | Pricing, publication, negotiation, ordering, marketplace search |
| `…0010_seed_taxonomy` | 7 categories, 25 crafts, 20 materials, 15 techniques |
| `…0011_grants` | Explicit privileges; revokes the write paths that must go through RPC |
| `…0012_function_privileges` | Revokes the PUBLIC execute grant; guards inside `create_order_from_offer` |

## The two enforcement mechanisms

**Private data is a separate table, not a hidden column.** PostgREST cannot mask
columns per user, so `product_pricing_private`, `artisan_private` and
`buyer_private` hold everything a counterparty must never see, with owner-only
RLS. A buyer cannot leak a cost figure through a forgotten filter, because the
column is not in a table they can address.

**Writes that carry a business rule have no grant.** `offers`, `custom_requests`,
`orders` and `inventory_reservations` are `SELECT`-only for `authenticated`.
Every transition goes through a function that enforces turn order, the price
floor and capacity. A client has no privilege with which to bypass a rule.

## Verifying before you push

```bash
./scripts/validate-db.sh
```

Spins up a throwaway local Postgres, applies every migration in order, and runs
`supabase/tests/phase1_spine.sql` — 16 assertions covering the floor arithmetic,
the below-floor guard, publication invariants, original-image protection, buyer
isolation from private pricing, the matching filters, offer turn order, and
order creation with inventory reservation.

pgvector is not installed in the local cluster, so the taxonomy embedding column
is stubbed there and exercised only on Supabase.

## Verifying against the real Supabase CLI

The repo's structure can be checked without touching the hosted project:

```bash
npm install supabase@latest --no-save
npx supabase --workdir . migration list \
  --db-url "postgresql://postgres@127.0.0.1:55432/akaar_val?sslmode=disable"
```

Against a database whose history matches the repo, every migration reports the
same `local` and `remote` version and nothing is pending.

Against a database whose history was recorded under different version strings -
which is what happens when migrations are applied through the management API
rather than the CLI - the same command reports all twelve as unapplied plus
twelve recorded versions with no matching file. Deploying in that state re-runs
migration one and fails on `type "app_role" already exists`.

That second state is what `tools/reconcile-migration-history.sql` exists to fix,
and `scripts/test-reconcile.sh` proves both the fix and its refusal to run on a
partially migrated database.
