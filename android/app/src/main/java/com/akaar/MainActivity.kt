package com.akaar

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.akaar.core.designsystem.theme.AkaarTheme
import com.akaar.navigation.AkaarNavHost
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent { AkaarApp() }
    }
}

@Composable
private fun AkaarApp() {
    AkaarTheme {
        Surface(
            color = com.akaar.core.designsystem.theme.AkaarTheme.colors.surface,
            modifier = Modifier.fillMaxSize(),
        ) {
            // Safe areas are respected app-wide rather than per screen.
            AkaarNavHost(modifier = Modifier.windowInsetsPadding(WindowInsets.safeDrawing))
        }
    }
}
