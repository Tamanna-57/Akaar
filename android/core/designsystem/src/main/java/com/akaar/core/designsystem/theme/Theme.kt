package com.akaar.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf

val LocalAkaarColors = staticCompositionLocalOf { LightColors }

/** Dark mode is a first-class theme, not an inversion of the light one. */
@Composable
fun AkaarTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val colors = if (darkTheme) DarkColors else LightColors
    val scheme = if (darkTheme) {
        darkColorScheme(
            primary = colors.primary, onPrimary = colors.onPrimary,
            background = colors.surface, onBackground = colors.textPrimary,
            surface = colors.surfaceRaised, onSurface = colors.textPrimary,
            outline = colors.border, error = colors.danger,
        )
    } else {
        lightColorScheme(
            primary = colors.primary, onPrimary = colors.onPrimary,
            background = colors.surface, onBackground = colors.textPrimary,
            surface = colors.surfaceRaised, onSurface = colors.textPrimary,
            outline = colors.border, error = colors.danger,
        )
    }
    CompositionLocalProvider(LocalAkaarColors provides colors) {
        MaterialTheme(colorScheme = scheme, typography = AkaarTypography, content = content)
    }
}

/** Semantic colours for the current theme. */
object AkaarTheme {
    val colors: AkaarColors
        @Composable get() = LocalAkaarColors.current
}
