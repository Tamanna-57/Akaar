package com.akaar.core.data.remote

/**
 * Supabase connection settings.
 *
 * Only the publishable anon key is ever present in the app. It is not a secret
 * in the usual sense and it grants nothing on its own: row level security and
 * the SECURITY DEFINER functions are the actual boundary, which is why a
 * decompiled APK still cannot read a seller's costs or accept an offer.
 *
 * No AI provider key ever reaches the device. Those live in Edge Function
 * secrets, server side.
 */
data class SupabaseConfig(
    val url: String,
    val anonKey: String,
) {
    val isConfigured: Boolean get() = url.isNotBlank() && anonKey.isNotBlank()

    companion object {
        /** RPC names, matching supabase/migrations/009_functions.sql. */
        object Rpc {
            const val RECALCULATE_PRICE = "recalculate_price"
            const val SET_PRICE_CORRIDOR = "set_price_corridor"
            const val PUBLISH_PRODUCT = "publish_product"
            const val PLACE_OFFER = "place_offer"
            const val RESPOND_TO_OFFER = "respond_to_offer"
            const val BUYER_RESPOND_OFFER = "buyer_respond_offer"
            const val SEARCH_MARKETPLACE = "search_marketplace"
        }

        /** Tables a client may read. Writes with a business rule go through Rpc. */
        object Table {
            const val PROFILES = "profiles"
            const val ARTISAN_PROFILES = "artisan_profiles"
            const val ARTISAN_PRIVATE = "artisan_private"
            const val BUYER_PROFILES = "buyer_profiles"
            const val PRODUCTS = "products"
            const val PRODUCT_PRICING_PRIVATE = "product_pricing_private"
            const val PRODUCT_MEDIA = "product_media"
            const val CRAFTS = "crafts"
            const val MATERIALS = "materials"
            const val TECHNIQUES = "techniques"
            const val OFFERS = "offers"
            const val CUSTOM_REQUESTS = "custom_requests"
            const val ORDERS = "orders"
            const val CONVERSATIONS = "conversations"
            const val MESSAGES = "messages"
            const val NOTIFICATIONS = "notifications"
        }
    }
}
