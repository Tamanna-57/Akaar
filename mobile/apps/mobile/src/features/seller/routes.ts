/**
 * Port of android/feature/seller/.../SellerRoutes.kt.
 *
 * Five tabs, as the seller specification requires. This module must never
 * import from features/buyer - scripts/check-module-boundaries.mjs fails CI
 * if that edge appears (the TS equivalent of the Gradle module-boundary
 * task).
 */
export const SellerRoutes = {
  Graph: "seller",
  Home: "seller/home",
  AddProduct: "seller/add",
  MyProducts: "seller/products",
  Requests: "seller/requests",
  Assistant: "seller/assistant",
  /**
   * Not one of the five tabs, and not in the Kotlin SellerRoutes: it is the
   * Profile group in docs/05-delivery/screen-inventory.md (name, region,
   * craft, capacity, cluster link, view/edit), reached from Home.
   */
  Profile: "seller/profile",
} as const;
export type SellerRoute = (typeof SellerRoutes)[keyof typeof SellerRoutes];
