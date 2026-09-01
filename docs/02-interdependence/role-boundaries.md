# Role boundaries

One app, four modes. This file defines what a role *is* at the code and API
level, so that "role" never degrades into a UI flag.

## Roles

| Role | Purpose |
|---|---|
| `SELLER` | Artisan. Creates products, responds to inquiries. |
| `BUYER` | B2B sourcing. Discovers, raises RFQs, negotiates. |
| `CLUSTER_MANAGER` | Assisted onboarding and pre-publication review for a defined artisan set. |
| `ADMIN` | Platform operations, taxonomy, verification, abuse. |

An account holds **one or more** roles. Role is selected at onboarding and
switchable from the profile if more than one is held. Most accounts hold one.

Cluster managers are scoped to their `cluster_id`. There is no global
cluster-manager view.

## Enforcement, in order

1. **Server is the only authority.** Every endpoint declares required role and
   scope. The client is assumed hostile.
2. **Field-level visibility** is applied after the endpoint check, per
   `shared-spine.md` §3. Response serialisation is role-parameterised — a
   `SELLER_PRIVATE` field is *absent* from a buyer response, not null.
3. **Client mirrors, never decides.** The Android layer hides what the server
   would refuse. Hiding is a UX affordance, not a control.

## Android module boundaries

```
:feature:seller  ──┐
                   ├──▶ :core:domain ◀──┬── :feature:shared
:feature:buyer   ──┘                    │
                                        └── :feature:cluster
```

Enforced rules:

- `:feature:seller` **must not** depend on `:feature:buyer`, and vice versa.
  This is enforced by a Gradle dependency check in CI, not by convention.
- Anything both roles need lives in `:feature:shared` (inquiry threads,
  messaging, notifications, media viewer) or `:core:*`.
- `:core:domain` is pure Kotlin — no Android dependencies — so the canonical
  models are testable on the JVM and reviewable against the backend schemas
  side by side.

**Why this matters:** the moment `feature/buyer` imports a seller screen to
"reuse the product card", the two halves fuse and the buyer prompt's design
direction can no longer be applied independently. Shared *domain* is the goal;
shared *features* are a smell unless deliberately placed in `:feature:shared`.

## Navigation

The app has one navigation host. Role determines the graph, not the screen.

| Role | Bottom tabs |
|---|---|
| `SELLER` | Home · Add Product · My Products · Inquiries · Assistant |
| `BUYER` | Discover · Search · RFQs · Messages · Profile |
| `CLUSTER_MANAGER` | Queue · Artisans · Review · Profile |
| `ADMIN` | Not a mobile surface in the MVP — web/ops tooling. |

Seller tabs are five because the source prompt specifies five. Buyer tabs are
provisional pending the buyer prompt; `Messages` and `Profile` are near-certain,
and `Messages` is `:feature:shared` in both graphs.

## Data access scopes

| Role | May read | May write |
|---|---|---|
| `SELLER` | Own products (all tiers), inquiries addressed to them, own RFQ invitations | Own products, own messages, own quotations |
| `BUYER` | `PUBLISHED` products (buyer tier), own RFQs, own inquiries | Own RFQs, own messages, own quotation responses |
| `CLUSTER_MANAGER` | Products of artisans in own cluster, at seller tier **minus** cost breakdown unless the artisan has granted it | Approval decisions, onboarding data. **Never** an artisan's declared costs. |
| `ADMIN` | Everything, logged | Taxonomy, verification, suspension. Never product content. |

The cluster manager's cost restriction is deliberate. The manager is the person
best positioned to shave an artisan's declared labour rate, and the Fair Price
Shield is worthless if that is possible without a trace.
