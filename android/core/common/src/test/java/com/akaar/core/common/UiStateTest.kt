package com.akaar.core.common

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UiStateTest {

    @Test fun `map transforms only content`() {
        val loaded: UiState<Int> = UiState.Content(2)
        assertEquals(UiState.Content(4), loaded.map { it * 2 })
    }

    @Test fun `map leaves every non-content state untouched`() {
        val states: List<UiState<Int>> = listOf(
            UiState.Loading,
            UiState.Empty("Nothing yet"),
            UiState.Error("Could not load"),
            UiState.Offline(),
            UiState.PermissionDenied("CAMERA", "We need the camera to photograph your product"),
        )
        states.forEach { assertEquals(it, it.map { n -> n * 2 }) }
    }

    @Test fun `contentOrNull only unwraps content`() {
        assertEquals(7, (UiState.Content(7) as UiState<Int>).contentOrNull)
        assertNull((UiState.Loading as UiState<Int>).contentOrNull)
        assertNull((UiState.Offline() as UiState<Int>).contentOrNull)
    }

    @Test fun `offline is distinct from error`() {
        // The two call for different words and a different next step, so the UI
        // must be able to tell them apart rather than treating offline as failure.
        val offline: UiState<Int> = UiState.Offline("Your drafts are saved on this phone")
        val error: UiState<Int> = UiState.Error("Upload failed")
        assertTrue(offline is UiState.Offline)
        assertTrue(error is UiState.Error)
        assertTrue(offline != error)
    }

    @Test fun `permission denial distinguishes a permanent refusal`() {
        val once = UiState.PermissionDenied("CAMERA", "rationale")
        val forever = UiState.PermissionDenied("CAMERA", "rationale", permanentlyDenied = true)
        // A permanent denial must route to settings rather than re-prompting.
        assertTrue(!once.permanentlyDenied && forever.permanentlyDenied)
    }
}
