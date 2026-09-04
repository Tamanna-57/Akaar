/**
 * Port of android/feature/buyer/.../BuyerRoutes.kt.
 *
 * Buyer tabs. This module must never import from features/seller - the two
 * meet through @akaar/core-domain and features/shared only.
 */
export const BuyerRoutes = {
  Graph: "buyer",
  Discover: "buyer/discover",
  Search: "buyer/search",
  Requests: "buyer/requests",
  Messages: "buyer/messages",
  Profile: "buyer/profile",
} as const;
export type BuyerRoute = (typeof BuyerRoutes)[keyof typeof BuyerRoutes];
