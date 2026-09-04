# Akaar mobile (React Native + TypeScript) — skeleton

A TypeScript/React Native port of the scaffolding currently under
`android/`, built to evaluate Kotlin+Compose vs. React Native+TypeScript for
Akaar's mobile client before real screens are built on top of either. Status
mirrors the Android side: **scaffolding only** — models, design tokens,
route constants, and a navigator wired to placeholder screens. No feature
logic yet.

This does not replace `android/`. Both trees exist side by side so they can
be compared directly; nothing here is wired into the app's CI as the
build target.

## Layout

```
mobile/
  packages/
    core-common/       AppResult/AppError, UiState, Stream<T>. No RN deps.
    core-domain/        Money, enums, Product/Offer/Order/..., repository
                         interfaces. No RN deps — pure TS, like :core:domain
                         is pure Kotlin.
    design-system/      Theme tokens + RN components (StateHost, buttons,
                         chips, inputs, cards, AiOutputBlock).
  apps/
    mobile/              The React Native app: navigator, placeholder
                         screens, feature route constants.
  scripts/
    check-module-boundaries.mjs   TS equivalent of the Gradle
                                   `checkModuleBoundaries` task.
```

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

## What is deliberately NOT ported here yet

Everything native-module-shaped that the architecture docs
(`docs/04-architecture/android-architecture.md`,
`docs/04-architecture/offline-strategy.md`) require, since it needs a real
library choice and device testing, not a type port:

| Requirement | Kotlin | RN library to evaluate |
|---|---|---|
| Camera capture | CameraX | `react-native-vision-camera` |
| Voice record/playback | `MediaRecorder` | `expo-av` / `react-native-audio-recorder-player` |
| Encrypted local DB (source of truth for drafts) | Room + SQLCipher | `op-sqlite` (SQLCipher build) or WatermelonDB |
| Secure token storage | `EncryptedSharedPreferences` / Keystore | `react-native-keychain` / `expo-secure-store` |
| Background sync outbox | WorkManager | Headless JS + a background-fetch bridge (Android parity is solid; iOS is weaker — matters only if iOS ships) |
| On-device blur/exposure check | ML Kit / TFLite | `react-native-fast-tflite` / `@react-native-ml-kit` |
| Certificate pinning | OkHttp pinning | `react-native-ssl-pinning` |
| `FLAG_SECURE` on cost screens | native flag | small native module (~20 lines) |

None of this is a blocker — every item has a maintained RN library — but it
is real assembly work, called out here rather than glossed over.

## Working with this workspace

```sh
cd mobile
pnpm install
pnpm boundaries      # feature/seller vs feature/buyer independence check
pnpm lint
pnpm --filter @akaar/core-domain test
pnpm typecheck        # packages/*
pnpm typecheck:app    # apps/mobile
```

Running the app on a device/simulator needs the native RN toolchain
(Xcode/Android SDK) the same way `android/` needs the Android SDK and
Supabase secrets — out of scope for this skeleton, same as the Kotlin one.
