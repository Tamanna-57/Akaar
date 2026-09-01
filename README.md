# Akaar

> Akaar turns a regional-language voice note and a phone photo into a trusted,
> fairly priced, buyer-ready craft catalog.

An Android-first, role-based mobile application for marginalized Indian artisans
and the B2B buyers who source from them.

## Status

**Planning phase.** No application code has been written yet. The seller master
build prompt mandates that the plan is presented and approved before any code is
generated. This repository currently holds that plan.

| Input | State |
|---|---|
| Seller master build prompt | Received — `docs/00-source/seller-master-build-prompt.md` |
| Buyer master build prompt | **Not yet received** — buyer-side docs are provisional |

## Why this repo is structured around a "spine"

Seller and buyer are **not two apps**. They are two roles in one Android
application, backed by one canonical schema, joined by a small set of objects
that only exist because both roles exist: `Product`, `RFQ`, `Match`, `Inquiry`,
`Quotation`, `OrderIntent`.

Building the two halves independently and integrating later is the single
biggest delivery risk on this project. So the contracts where they touch are
specified **first**, in `docs/02-interdependence/`, and both feature stacks are
built against those contracts rather than against each other.

## Documentation map

| Path | What's in it |
|---|---|
| `docs/00-source/` | Verbatim source prompts. The authority for scope. |
| `docs/01-product/` | Understanding, personas, MVP boundaries, journeys. |
| `docs/02-interdependence/` | **The spine.** Shared objects, state machines, matching contract, role visibility. |
| `docs/03-design-system/` | The design system every screen must use. |
| `docs/04-architecture/` | Domain model, database, API contracts, Android, AI, security, offline. |
| `docs/05-delivery/` | Screen inventory, backlog, first vertical slice, risks, demo plan. |

## Reading order

1. `docs/01-product/product-understanding.md`
2. `docs/02-interdependence/shared-spine.md` ← start here if you only read one
3. `docs/04-architecture/domain-model.md`
4. `docs/05-delivery/first-vertical-slice.md`

## Planned repository layout

Not yet created — recorded here so the plan is unambiguous.

```
android/                 Single role-based Android app (Kotlin, Compose)
  app/                   Entry point, navigation host, role routing
  core/
    designsystem/        Tokens, components, states. Section 1 of the prompt.
    domain/              Pure Kotlin. Canonical models + use cases. No Android deps.
    data/                Repositories, Room, Retrofit, offline queue.
    media/               CameraX, photo picker, image pipeline client.
    voice/               Recording, playback, STT client.
    testing/             Shared fakes and fixtures.
  feature/
    onboarding/          Auth, language selection, role selection.
    seller/              Seller-only screens.
    buyer/               Buyer-only screens.
    cluster/             Cluster manager mode.
    shared/              Inquiry threads, notifications — used by BOTH roles.
backend/                 FastAPI, PostgreSQL, Redis, object storage
  app/
    api/                 Routers, split by role scope.
    domain/              Canonical schemas — the mirror of core/domain.
    services/            Pricing, matching, AI orchestration, export.
    workers/             Background jobs.
    db/                  Models, migrations.
docs/                    This plan.
```

`feature/seller` and `feature/buyer` **must not** depend on each other. They meet
only through `core/domain` and `feature/shared`.
