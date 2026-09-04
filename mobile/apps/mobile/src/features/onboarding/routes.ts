/** Port of android/feature/onboarding/.../LaunchScreen.kt (`OnboardingRoutes`). */
export const OnboardingRoutes = {
  Launch: "onboarding/launch",
  Language: "onboarding/language",
  Role: "onboarding/role",
  Phone: "onboarding/phone",
} as const;
export type OnboardingRoute = (typeof OnboardingRoutes)[keyof typeof OnboardingRoutes];
