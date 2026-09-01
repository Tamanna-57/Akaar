package com.akaar.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.unit.dp

/** 4dp base scale. Screen gutter is 20dp in seller flows for a calmer rhythm. */
object Space {
    val xs = 4.dp
    val sm = 8.dp
    val md = 12.dp
    val lg = 16.dp
    val xl = 24.dp
    val xxl = 32.dp
    val xxxl = 48.dp

    val gutter = 16.dp
    val gutterSeller = 20.dp
}

/**
 * Moderate and consistent. Full rounding is reserved for avatars alone -
 * nothing else in the app is pill-shaped.
 */
object Shapes {
    val input = RoundedCornerShape(4.dp)
    val chip = RoundedCornerShape(4.dp)
    val card = RoundedCornerShape(8.dp)
    val button = RoundedCornerShape(8.dp)
    val sheet = RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)
    val dialog = RoundedCornerShape(12.dp)
    val avatar = RoundedCornerShape(percent = 50)
}

/**
 * Touch targets. The seller minimum is larger because the target user is a
 * first-time smartphone user, often outdoors, often in a hurry.
 */
object Touch {
    val min = 48.dp
    val minSeller = 56.dp
    val listRowSeller = 64.dp
}
