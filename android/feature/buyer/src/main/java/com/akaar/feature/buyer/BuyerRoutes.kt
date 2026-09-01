package com.akaar.feature.buyer

/**
 * Buyer tabs. This module must never depend on :feature:seller - the two meet
 * through :core:domain and :feature:shared only.
 */
object BuyerRoutes {
    const val GRAPH = "buyer"
    const val DISCOVER = "buyer/discover"
    const val SEARCH = "buyer/search"
    const val REQUESTS = "buyer/requests"
    const val MESSAGES = "buyer/messages"
    const val PROFILE = "buyer/profile"
}
