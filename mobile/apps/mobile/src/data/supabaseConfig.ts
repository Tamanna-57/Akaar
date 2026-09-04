/**
 * Port of android/core/data/.../SupabaseConfig.kt.
 *
 * Only the publishable anon key is ever present in the app. It is not a
 * secret in the usual sense and it grants nothing on its own: row level
 * security and the SECURITY DEFINER functions are the actual boundary,
 * which is why a decompiled/bundled app still cannot read a seller's costs
 * or accept an offer.
 *
 * No AI provider key ever reaches the device. Those live in Edge Function
 * secrets, server side. Values are injected via react-native-config /
 * .env at build time - never committed - mirroring how the Kotlin side
 * pulls them from local.properties / CI secrets into BuildConfig.
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function isConfigured(config: SupabaseConfig): boolean {
  return config.url.trim().length > 0 && config.anonKey.trim().length > 0;
}

/** RPC names, matching supabase/migrations/*_functions.sql. */
export const SupabaseRpc = {
  RecalculatePrice: "recalculate_price",
  SetPriceCorridor: "set_price_corridor",
  PublishProduct: "publish_product",
  PlaceOffer: "place_offer",
  RespondToOffer: "respond_to_offer",
  BuyerRespondOffer: "buyer_respond_offer",
  SearchMarketplace: "search_marketplace",
} as const;

/** Tables a client may read. Writes with a business rule go through Rpc. */
export const SupabaseTable = {
  Profiles: "profiles",
  ArtisanProfiles: "artisan_profiles",
  ArtisanPrivate: "artisan_private",
  BuyerProfiles: "buyer_profiles",
  Products: "products",
  ProductPricingPrivate: "product_pricing_private",
  ProductMedia: "product_media",
  Crafts: "crafts",
  Materials: "materials",
  Techniques: "techniques",
  Offers: "offers",
  CustomRequests: "custom_requests",
  Orders: "orders",
  Conversations: "conversations",
  Messages: "messages",
  Notifications: "notifications",
} as const;
