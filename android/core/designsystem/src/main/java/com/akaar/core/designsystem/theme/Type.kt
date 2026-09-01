package com.akaar.core.designsystem.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Two families. Devanagari is a first-class script here, not a fallback - a
 * Latin-first stack that renders Hindi in a mismatched substitute is an
 * immediate credibility failure with the people this app is for.
 *
 * The serif for display and prices is a deliberate departure from the
 * Inter/Geist/Space Grotesk default; it reads as considered rather than generic.
 *
 * Font files are wired in the localisation pass; the scale below is the contract
 * and does not change when they land.
 */
object AkaarFonts {
    val display: FontFamily = FontFamily.Serif
    val text: FontFamily = FontFamily.SansSerif
}

/**
 * Body L is the default in seller flows: the artisan-facing minimum is 17sp.
 * Every style keeps its line height explicit so Devanagari, which runs taller
 * than Latin, is never clipped.
 */
object AkaarType {
    val display = TextStyle(fontFamily = AkaarFonts.display, fontSize = 28.sp, lineHeight = 34.sp, fontWeight = FontWeight.SemiBold)
    val title = TextStyle(fontFamily = AkaarFonts.display, fontSize = 22.sp, lineHeight = 28.sp, fontWeight = FontWeight.SemiBold)
    val section = TextStyle(fontFamily = AkaarFonts.text, fontSize = 18.sp, lineHeight = 24.sp, fontWeight = FontWeight.SemiBold)
    val bodyLarge = TextStyle(fontFamily = AkaarFonts.text, fontSize = 17.sp, lineHeight = 26.sp)
    val body = TextStyle(fontFamily = AkaarFonts.text, fontSize = 15.sp, lineHeight = 22.sp)
    val caption = TextStyle(fontFamily = AkaarFonts.text, fontSize = 13.sp, lineHeight = 18.sp)
    val price = TextStyle(fontFamily = AkaarFonts.display, fontSize = 20.sp, lineHeight = 26.sp, fontWeight = FontWeight.SemiBold)
    val label = TextStyle(fontFamily = AkaarFonts.text, fontSize = 15.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium)
}

internal val AkaarTypography = Typography(
    headlineLarge = AkaarType.display,
    headlineMedium = AkaarType.title,
    titleMedium = AkaarType.section,
    bodyLarge = AkaarType.bodyLarge,
    bodyMedium = AkaarType.body,
    bodySmall = AkaarType.caption,
    labelLarge = AkaarType.label,
)
