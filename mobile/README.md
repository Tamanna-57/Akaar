# Akaar mobile (React Native + TypeScript)

A TypeScript/React Native port of the scaffolding under `android/`, built to
evaluate Kotlin+Compose vs. React Native+TypeScript for Akaar's mobile
client before real screens are built on top of either.

This does not replace `android/`. Both trees exist side by side so they can
be compared directly.

**What is real here:** the domain models, the design system, and the
device-layer logic the architecture docs turn on — the offline outbox
(idempotency, per-entity FIFO, exponential backoff, permanent-failure
blocking), the encrypted-database key handling, the photo quality gate, the
voice recording state machine, and the audio/photo retention rules. All of
it is unit tested (37 tests) and runs in CI without a device.

**What is not verified:** anything that only proves itself on hardware —
that vision-camera focuses, that op-sqlite's SQLCipher build actually
encrypts the file on a given phone, that background-fetch survives a
swipe-away on a particular OEM's Android skin. The adapters are written
against the real library APIs, but none of that has been run on a device
yet. See "Native layer" below for exactly where that line falls.

## Layout

```
mobile/
  packages/
    core-common/       AppResult/AppError, UiState, Stream<T>. No RN deps.
    core-domain/        Money, enums, Product/Offer/Order/..., repository
                         interfaces. No RN deps — pure TS, like :core:domain
                         is pure Kotlin.
    core-data/          The offline outbox + sync engine, secure storage and
                         encrypted-DB ports, network/background-sync
                         adapters. Pure logic in `.`, native adapters in
                         `./native`.
    core-media/         Photo capture ports + the on-device quality gate
                         (blur/exposure/occlusion) and retention rules.
    core-voice/          Voice recording state machine + audio retention.
    design-system/      Theme tokens + RN components (StateHost, buttons,
                         chips, inputs, cards, AiOutputBlock).
  apps/
    mobile/              The React Native app: navigator, placeholder
                         screens, feature route constants, composition root,
                         FLAG_SECURE module, cert-pinning config.
  scripts/
    check-module-boundaries.mjs   TS equivalent of the Gradle
                                   `checkModuleBoundaries` task.
```

Each native-touching package splits its entry points: `@akaar/core-data`
is pure and Node-testable, `@akaar/core-data/native` pulls in the native
modules. That split is what lets the whole outbox be tested in CI with no
emulator.

That split depends on `unstable_enablePackageExports: true` in
`apps/mobile/metro.config.js`. Without it Metro ignores the `exports` field
and, rather than failing, silently resolves `.../native` to the *pure* entry
point - so every native class becomes `undefined` at runtime while `tsc` and
the unit tests stay green. `pnpm check:bundle` builds the real bundle and
asserts the native modules are inside it; it runs in CI, and it is the only
check that can catch this.

**Import convention:** relative imports carry explicit `.ts`/`.tsx`
extensions. Metro, `tsc` (`allowImportingTsExtensions`) and Node's ESM
loader all accept them, and it is what lets `node --test` run the source
directly with no bundler or transform step in CI.

## File-for-file mapping to `android/`

| Kotlin | TypeScript | Notes |
|---|---|---|
| `core/common/.../AppResult.kt` | `packages/core-common/src/result.ts` | `sealed interface` → discriminated union; `when` exhaustiveness → `assertNever` |
| `core/common/.../UiState.kt` | `packages/core-common/src/ui-state.ts` | same pattern |
| `core/common/.../Dispatchers.kt` | *(not ported)* | `CoroutineDispatcher` injection has no JS equivalent — see comment in `core-common/src/index.ts` |
| `core/domain/.../Money.kt` | `packages/core-domain/src/money.ts` | `value class` → small immutable class; integer paise preserved, same tests ported in `money.test.ts` |
| `core/domain/.../Enums.kt` | `packages/core-domain/src/enums.ts` | Kotlin `enum class X(wire: String)` → `as const` object of string literals; the literal *is* the wire value |
| `core/domain/.../Product.kt` | `packages/core-domain/src/{capability,product,translatable}.ts` | `data class` → `interface`; methods become free functions (`missingForPublication(product, ...)` etc.) |
| `core/domain/.../Profiles.kt` | `packages/core-domain/src/profiles.ts` | same |
| `core/domain/.../Trade.kt` | `packages/core-domain/src/trade.ts` | same |
| `core/domain/.../Repositories.kt` | `packages/core-domain/src/repositories.ts` | `Flow<T>` → `Stream<T>` (`packages/core-common/src/stream.ts`); `Result<T>` → `Promise<AppResult<T>>` |
| `core/designsystem/.../theme/*.kt` | `packages/design-system/src/theme/*.ts(x)` | `Color`/`Dimens`/`Type`/`Theme` → `colors.ts`/`space.ts`/`type.ts`/`theme.tsx`; `CompositionLocal` → React Context + `useAkaarColors()` hook |
| `core/designsystem/.../component/*.kt` | `packages/design-system/src/components/*.tsx` | Compose composables → RN function components (`View`/`Text`/`Pressable`) |
| `feature/*/Routes.kt` | `apps/mobile/src/features/*/routes.ts` | same string constants |
| `feature/onboarding/.../LaunchScreen.kt` | `apps/mobile/src/features/onboarding/LaunchScreen.tsx` | |
| `app/.../AkaarNavHost.kt` | `apps/mobile/src/navigation/AkaarNavigator.tsx` | Jetpack `NavHost` → `@react-navigation/native-stack` |
| `app/.../PendingScreen.kt` | `apps/mobile/src/navigation/PendingScreen.tsx` | |
| `core/data/.../SupabaseConfig.kt` | `apps/mobile/src/data/supabaseConfig.ts` | |
| Gradle `checkModuleBoundaries` task | `scripts/check-module-boundaries.mjs` + `.eslintrc.cjs` overrides | source scan, no extra dependency |

## Native layer

Each requirement from `docs/04-architecture/android-architecture.md` and
`offline-strategy.md`, with the library chosen and where the line between
"tested" and "needs a device" falls.

| Requirement | Kotlin | Here | Tested off-device? |
|---|---|---|---|
| Offline outbox | WorkManager + Room | `core-data/src/outbox/*` | **Yes** — idempotency, per-entity FIFO, backoff, permanent-failure blocking, drain summary |
| Background drain | WorkManager | `react-native-background-fetch` (WorkManager-backed on Android) in `core-data/src/sync/backgroundSync.ts` | Scheduling logic only; the OS wake-up needs a device |
| Encrypted local DB | Room + SQLCipher | `@op-engineering/op-sqlite` with `sqlcipher: true`, `core-data/src/db/*` | Key handling **yes**; that the file is truly encrypted needs a device |
| Secure token storage | `EncryptedSharedPreferences` / Keystore | `react-native-keychain`, `core-data/src/secure/*` | Port + fake **yes**; Keystore behaviour needs a device |
| Camera capture | CameraX | `react-native-vision-camera`, `core-media/src/visionCamera.ts` | No — needs a device |
| Blur / exposure / occlusion gate | ML Kit / TFLite | `core-media/src/quality.ts` | **Yes** — thresholds and guidance are pure; only metric *extraction* is native |
| Voice record / pause / replay | `MediaRecorder` | `react-native-audio-recorder-player`, `core-voice/src/recorder.ts` | State machine **yes**; the recorder needs a device |
| Audio + photo retention rules | server-mirrored | `core-voice/src/retention.ts`, `core-media/src/capture.ts` | **Yes** |
| Connectivity | — | `@react-native-community/netinfo`, `core-data/src/sync/network.ts` | Decision helpers **yes** |
| Certificate pinning | OkHttp pinning | Android `network_security_config.xml` (declarative — covers every connection in the process, not just wrapped `fetch`) | No — pins are placeholders, see the file's header |
| `FLAG_SECURE` on cost screens | native flag | `ScreenGuardModule.kt` + `useScreenGuard()` | No — needs a device |
| CSPRNG for keys / idempotency | `SecureRandom` | `react-native-get-random-values`, `apps/mobile/src/data/random.ts` | No — Hermes has no `crypto` until the polyfill loads |

### Before this runs on a phone

The Android project **is** generated and wired now — `pnpm android` in
`apps/mobile` builds and installs it. See
[RUNNING-ON-A-PHONE.md](RUNNING-ON-A-PHONE.md).

What is still open:

1. Replace the placeholder certificate pins with real SPKI hashes, and ship
   a backup pin (the file explains why). Pinning is deliberately **not**
   switched on in the manifest until then — turning it on with placeholders
   would fail every request.
2. Supply a real `MutationTransport` — the Supabase client wired to the RPC
   names in `apps/mobile/src/data/supabaseConfig.ts` — and pass it to
   `createAppContainer`. Nothing talks to a real server yet.
3. Write the frame-processor plugin that produces `ImageQualityMetrics`;
   the decision logic that consumes them is already done and tested.
4. Build a camera preview screen. The plumbing exists; the screen does not.
5. Generate the iOS project (needs a Mac).

## Working with this workspace

```sh
cd mobile
pnpm install
pnpm boundaries      # feature/seller vs feature/buyer independence check
pnpm lint
pnpm -r run test      # 37 tests, no device or emulator needed
pnpm typecheck        # packages/*
pnpm typecheck:app    # apps/mobile
pnpm check:bundle     # builds the JS bundle, checks the native modules are in it
```

To run it on a real phone, see **[RUNNING-ON-A-PHONE.md](RUNNING-ON-A-PHONE.md)**.
The app has a built-in **Device checks** screen (debug builds only) that runs
the eight checks a computer cannot answer - including whether the local
database is genuinely encrypted.

Running the app on a device/simulator needs the native RN toolchain
(Xcode/Android SDK) the same way `android/` needs the Android SDK and
Supabase secrets.
