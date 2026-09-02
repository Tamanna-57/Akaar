# Akaar Android

One role-based application. Seller, Buyer and Cluster Manager are modes of the
same app; Admin is a web dashboard and is not here.

## Module graph

```
:app                  navigation host, role routing - the only module that
                      knows every feature module
:core:common          UiState, AppResult, dispatchers. No UI, no Android UI deps.
:core:designsystem    tokens, components, the six state scaffolds
:core:domain          pure Kotlin. Canonical models + repository contracts.
:core:data            repository implementations, Supabase wiring
:feature:onboarding   language, role, phone/OTP, profile
:feature:seller       seller-only screens
:feature:buyer        buyer-only screens
:feature:cluster      assisted onboarding and pre-publication review
:feature:shared       conversations, notifications, settings - used by BOTH roles
```

`:feature:seller` and `:feature:buyer` **must not** depend on each other.
`gradle checkModuleBoundaries` fails the build if they do, and CI runs it before
anything expensive. Shared code goes to `:core:domain` (logic) or
`:feature:shared` (UI).

The reason is practical rather than architectural taste: the two halves are
built in separate phases, and the moment one imports the other they can no
longer be worked on independently.

## The six states

Every screen handles loading, content, empty, error, offline and
permission-denied. `UiState` is a sealed hierarchy and `StateHost` renders it
with an exhaustive `when`, so adding a state breaks the build rather than
silently rendering nothing, and forgetting one is a compile error rather than a
discovery during the demo.

Offline is deliberately separate from error: "you are offline" and "this failed"
need different words and different next steps.

## Design system

Implements `docs/03-design-system/design-system.md`.

| Spec | Code |
|---|---|
| Palette, semantic colours, dark theme | `theme/Color.kt`, `theme/Theme.kt` |
| Type scale, 17sp seller default | `theme/Type.kt` |
| 4dp spacing, radii, touch targets | `theme/Dimens.kt` |
| Buttons, inputs, cards, chips, skeletons | `component/` |
| The recurring AI accept/edit/regenerate/reject block | `component/AiOutputBlock.kt` |
| Missing value becomes a question, never a guess | `component/AiOutputBlock.kt` → `MissingFieldPrompt` |

Screens reference semantic colours (`AkaarTheme.colors.primary`), never the raw
palette, so a palette change is one edit.

## Building

```bash
export ANDROID_HOME=/path/to/android-sdk
gradle checkModuleBoundaries        # boundary check, seconds
gradle :core:domain:test            # pure JVM, no SDK needed
gradle testDebugUnitTest
gradle assembleDebug
```

Supabase settings are injected, never committed. Add to `local.properties`:

```
supabase.url=https://<project>.supabase.co
supabase.anonKey=<publishable anon key>
```

Only the publishable anon key ever reaches the app, and it grants nothing on its
own: row level security and the `SECURITY DEFINER` functions are the real
boundary. No AI provider key is ever present on the device.

## Localisation

UI strings live in Android resources — `values/strings.xml` and
`values-hi/strings.xml` per feature module — and are never translated by a model
at runtime. Only user-generated content (a product description an artisan
speaks) goes through translation. Hindi is the default: the seller journey is
the one this app exists for.

Hindi strings are real Devanagari, and a test asserts it. A Latin
transliteration standing in for Hindi would be exactly the credibility failure
the design system warns about.

## Sign-in in round one

`DemoSessionRepository` accepts any six digits and stores the session on the
device. No SMS is sent, and the OTP screen says so on screen rather than
implying a code is coming.

It is a separate class rather than a flag inside the real one: phase 9 adds a
Supabase-backed implementation beside it and changes one line in `DataModule`,
so the demo path cannot survive into production by accident. Every screen above
it is the real screen.

## What is not here yet

`:core:data` currently holds the connection settings, the table and RPC names,
and the DI graph. The Supabase SDK itself is added in Phase 3, where
authentication is the first thing that actually needs a client - adding it now
would mean an unused dependency and an untested integration.

Compose UI tests for the state scaffolds need an emulator, so they land with the
accessibility pass in Phase 13. Font files for Source Serif 4 and Noto Sans
Devanagari land in the same phase; the type scale in `theme/Type.kt` is the
contract and does not change when they do.
