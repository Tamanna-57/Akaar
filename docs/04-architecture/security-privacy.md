# Security and privacy

The user population is the reason this document is not boilerplate. A low-income
artisan has more to lose from a data leak and less ability to recover from one.

## Authentication

- Phone + OTP. Rate-limited per phone and per IP; exponential lockout.
- Short-lived access token, rotating refresh token with reuse detection.
- Tokens in `EncryptedSharedPreferences` backed by Android Keystore.
  Never in plain `SharedPreferences`, never in logs, never in a URL.
- Certificate pinning on the API host, with a documented rotation plan so a
  pin change cannot brick installed apps.

## Authorisation

Three layers, each independent:

1. Endpoint-level role and scope declaration.
2. Field-level tier projection (`backend-architecture.md`).
3. Postgres RLS as a backstop.

## Data protection

| Data | Handling |
|---|---|
| Cost inputs, floor, margins, earnings | `SELLER_PRIVATE`. Encrypted at rest. Never in a buyer payload, never in logs. Cluster managers excluded by default. |
| Original images | Private bucket, signed URLs with short TTL. Never publicly addressable. Never deletable by anyone but the owning seller. |
| Voice audio | Minimal retention with an enforced `retention_expires_at`; purged by a worker. Transcripts persist; audio does not. |
| Phone numbers | Never shown to a counterparty before `OrderIntent.ACTIVE`. |
| Exact address | Never buyer-visible. District is the finest granularity exposed. |
| Government IDs | Not collected in the MVP. Verification is cluster- or admin-attested. |

**Why region is truncated to district:** an artisan's exact location, paired with
a public craft listing and a name, identifies a woman living alone in a village.
The buyer's genuine need — is this the real Barmer kashidakari, can it ship in
time — is fully served at district granularity.

## Consent

- Explicit, purpose-scoped, versioned consent records: AI processing,
  third-party inference, marketplace export, marketing.
- Presented in the artisan's language, **with audio**. A consent screen a user
  cannot read is not consent.
- Revocable in-app. Revocation stops future processing and triggers deletion of
  the affected derived data.
- Deletion request flow with a defined window; audit logs retain the *fact* of
  actions, never the deleted content.

## Abuse and fraud

- Fraud warnings surfaced at the moments they matter: a buyer requesting
  off-platform contact, a request for advance payment, a below-floor pressure
  pattern. Shown in the artisan's language with audio.
- Contact details are withheld until `OrderIntent.ACTIVE`, which is the single
  most effective structural anti-fraud measure available.
- Report/block on both roles. Buyer verification tiers gate RFQ volume.
- Below-floor overrides are audited and rate-limited; a repeated pattern from one
  buyer is a signal, not a transaction.

## Application security

- Server-side validation of every input against the domain schemas; strict JSON
  schema at every AI boundary, failing closed.
- Parameterised queries only; no string-built SQL.
- Upload limits: type, size, and dimension caps; content-type sniffing; images
  re-encoded server-side to strip EXIF (**GPS in particular**) before storage.
- Rate limiting on OTP, upload, and AI-triggering endpoints.
- `FLAG_SECURE` on screens showing cost breakdowns.
- Dependency and secret scanning in CI.

EXIF stripping is not a nicety. A photograph taken in a home carries GPS
coordinates, and the whole point of district-level truncation is defeated if the
enhanced image ships with a lat/long.

## What is deliberately not claimed

Enumerated so no screen or deck implies otherwise:

- No payment processing, escrow, or settlement.
- No logistics, shipment tracking, or delivery guarantee.
- No live publishing to GeM / IndiaHandmade / ONDC without written
  authorisation. Exports are `is_simulated = true` by default, in the data.
- No certification, GI-tag, or compliance attestation.
- No guarantee that a matched buyer will transact.

## Legal surface

Terms of Service and Privacy Policy are **required in the MVP** — their absence
is item 26/27 on the prompt's list of vibecoded failures. Both must exist in
Hindi and English, be reachable from onboarding and settings, and be summarised
in plain language with audio.
