package com.akaar.feature.shared

/**
 * Screens both roles use. Anything needed by seller and buyer alike belongs
 * here rather than in either feature module - that is what keeps the two
 * independent of each other.
 */
object SharedRoutes {
    const val CONVERSATIONS = "shared/conversations"
    const val CONVERSATION = "shared/conversation/{id}"
    const val NOTIFICATIONS = "shared/notifications"
    const val SETTINGS = "shared/settings"

    fun conversation(id: String) = "shared/conversation/$id"
}
