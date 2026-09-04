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
} as const;
export type SellerRoute = (typeof SellerRoutes)[keyof typeof SellerRoutes];
