package com.akaar.feature.seller

/**
 * Five tabs, as the seller specification requires. This module must never
 * depend on :feature:buyer - the build enforces it.
 */
object SellerRoutes {
    const val GRAPH = "seller"
    const val HOME = "seller/home"
    const val ADD_PRODUCT = "seller/add"
    const val MY_PRODUCTS = "seller/products"
    const val REQUESTS = "seller/requests"
    const val ASSISTANT = "seller/assistant"
}
