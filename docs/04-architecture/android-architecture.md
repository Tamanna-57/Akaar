# Android architecture

Kotlin, Jetpack Compose, Coroutines/Flow, MVVM over Clean Architecture, Hilt,
Room, Retrofit/OkHttp, CameraX, Photo Picker, WorkManager, ML Kit / TF Lite,
Android Keystore. `minSdk 24`, `targetSdk 35`.

`minSdk 24` because the target device is a shared 3 GB Android 11 phone and the
tail below that is not the artisan population — but the tail *above* API 24 is
not worth excluding either.

## Module graph

```
:app                     navigation host, role routing, DI wiring
:core:designsystem       tokens, components, state scaffolds
:core:domain             pure Kotlin models + use cases. NO Android deps.
:core:data               repositories, Room, Retrofit, sync/outbox
:core:media              CameraX, photo picker, image pipeline client
:core:voice              recording, playback, STT client, TTS
:core:common             result types, dispatchers, logging
:core:testing            fakes, fixtures, MockWebServer harness

:feature:onboarding      auth, language, role selection
:feature:seller          seller-only screens
:feature:buyer           buyer-only screens
:feature:cluster         cluster manager mode
:feature:shared          inquiry threads, messaging, notifications, media viewer
```

**Enforced:** `:feature:seller` and `:feature:buyer` must not depend on each
other. A Gradle task in CI fails the build if that edge appears. Shared UI goes
to `:feature:shared`; shared logic goes to `:core:domain`.

## Layering

```
Compose screen  ── state ──▶  ViewModel  ── calls ──▶  UseCase (core:domain)
      ▲                            │                        │
      └──── events ────────────────┘                   Repository (core:data)
                                                         │        │
                                                    Room (local) Retrofit (remote)
```

- ViewModels expose a single `StateFlow<UiState>` and accept a sealed
  `UiEvent`. No `LiveData`, no mutable state escaping.
- `UiState` always models `loading | empty | error | offline | permissionDenied |
  content` explicitly. This is a type, not a set of booleans, so an unhandled
  state is a compile error. The source prompt requires these states on every
  screen; making them a sealed hierarchy is how that becomes enforceable rather
  than aspirational.
- Use cases are pure and JVM-testable. Pricing display logic, capability
  validation, and match-reason phrasing live here, not in ViewModels.

## Offline and sync

Room is the source of truth for the seller's own drafts. See
`offline-strategy.md`. The client-side outbox mirrors the server's: mutations
are enqueued with an `Idempotency-Key`, drained by WorkManager with exponential
backoff, and surfaced in the UI as a per-item sync state rather than a global
spinner.

## Media

- Capture through CameraX with a guidance overlay; import through the Android
  Photo Picker (no storage permission needed on API 33+, and `READ_MEDIA_IMAGES`
  only where required).
- On-device pre-checks with ML Kit / TF Lite: blur (Laplacian variance),
  exposure, occlusion. Running these locally means the artisan gets "move to the
  window" *before* an upload she may not have bandwidth for.
- Originals are written to app-private storage and uploaded before any
  enhancement request. The enhancement never happens client-side, so the
  authenticity record has a single server-side provenance.

## Voice

- `MediaRecorder` → AAC/M4A. Record, pause, replay, re-record.
- Language ID and STT server-side by default; an on-device fallback path is kept
  behind an interface so a low-connectivity variant can be swapped in.
- TTS for price explanations, missing-field prompts, and incoming buyer
  messages. Every audio affordance has a visible text equivalent and vice versa.

## Security on device

- Tokens in `EncryptedSharedPreferences` backed by Android Keystore.
- Room encrypted (SQLCipher) — drafts contain declared costs, which are
  `SELLER_PRIVATE`.
- Certificate pinning on the API host.
- **No API keys in the app.** All third-party AI calls are proxied by the
  backend. This is non-negotiable and is the reason the AI pipeline is
  server-side even where an on-device model exists.
- `FLAG_SECURE` on screens showing cost breakdowns.

## Testing

| Layer | Tool | Bar |
|---|---|---|
| Use cases, pricing display, validation | JUnit5 + Turbine | High coverage; pricing logic exhaustive |
| Repositories | Room in-memory + MockWebServer | Sync, conflict, offline replay |
| ViewModels | JUnit + fake use cases | Every `UiState` branch reachable |
| Compose screens | `createAndroidComposeRule` | Every state scaffold renders; TalkBack labels present |
| End-to-end | The first vertical slice, on a real device | Runs before every demo |

Accessibility assertions (content descriptions, touch target ≥ 48dp, contrast)
are part of the Compose tests, not a manual pass.
