package com.akaar.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/**
 * A deliberately small palette drawn from the material domain the app serves -
 * dyed cloth, block-print ink, undyed cotton. Colour carries meaning here; it is
 * never decorative. No gradients, no neon, no pastel card sets, no purple-black
 * AI aesthetic.
 *
 * Backgrounds are warm off-white rather than pure white: this app is used
 * outdoors on cheap LCDs, where pure white is glare.
 */
internal object Palette {
    val Indigo900 = Color(0xFF1B2E3A)
    val Indigo700 = Color(0xFF2E4A5C)
    val Indigo300 = Color(0xFF7FA7BF)

    val Madder700 = Color(0xFF9A4A32)
    val Madder300 = Color(0xFFD08A70)

    val Cotton     = Color(0xFFFBF9F5)
    val CottonRaised = Color(0xFFFFFFFF)
    val Ink        = Color(0xFF1A1815)
    val InkMuted   = Color(0xFF6B645A)
    val Hairline   = Color(0xFFE3DDD2)

    val NightGround = Color(0xFF131211)
    val NightRaised = Color(0xFF1C1A18)
    val NightInk    = Color(0xFFF2EEE7)
    val NightMuted  = Color(0xFFA79E92)
    val NightLine   = Color(0xFF302C28)

    val Success     = Color(0xFF3D6B4A)
    val SuccessDark = Color(0xFF7DB08C)
    val Warning     = Color(0xFF8A6A24)
    val WarningDark = Color(0xFFD4AC5A)
    val Danger      = Color(0xFF8C3A32)
    val DangerDark  = Color(0xFFD68A82)
}

/**
 * Semantic colours. Screens reference these, never [Palette] directly, so a
 * palette change is one edit rather than a sweep.
 */
data class AkaarColors(
    val surface: Color,
    val surfaceRaised: Color,
    val border: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val primary: Color,
    val onPrimary: Color,
    val accent: Color,
    val success: Color,
    val warning: Color,
    val danger: Color,
    val isDark: Boolean,
)

internal val LightColors = AkaarColors(
    surface = Palette.Cotton,
    surfaceRaised = Palette.CottonRaised,
    border = Palette.Hairline,
    textPrimary = Palette.Ink,
    textSecondary = Palette.InkMuted,
    primary = Palette.Indigo700,
    onPrimary = Color.White,
    accent = Palette.Madder700,
    success = Palette.Success,
    warning = Palette.Warning,
    danger = Palette.Danger,
    isDark = false,
)

internal val DarkColors = AkaarColors(
    surface = Palette.NightGround,
    surfaceRaised = Palette.NightRaised,
    border = Palette.NightLine,
    textPrimary = Palette.NightInk,
    textSecondary = Palette.NightMuted,
    primary = Palette.Indigo300,
    onPrimary = Palette.Indigo900,
    accent = Palette.Madder300,
    success = Palette.SuccessDark,
    warning = Palette.WarningDark,
    danger = Palette.DangerDark,
    isDark = true,
)
