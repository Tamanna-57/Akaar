package com.akaar.core.common

/**
 * Every screen in Akaar must handle six states. Making them a sealed hierarchy
 * rather than a set of booleans means an unhandled state is a compile error
 * instead of something discovered during the demo.
 *
 * The design system supplies a scaffold for each, so honouring this is cheap.
 */
sealed interface UiState<out T> {

    /** Work in flight and the shape of the result is known: show a skeleton. */
    data object Loading : UiState<Nothing>

    data class Content<out T>(val data: T) : UiState<T>

    /**
     * Succeeded, nothing to show. Always names the action that would create
     * something - an empty screen with no next step is a dead end.
     */
    data class Empty(
        val title: String,
        val body: String? = null,
        val actionLabel: String? = null,
    ) : UiState<Nothing>

    /**
     * Something failed. [cause] is for logs; [message] is plain language for the
     * user, and [audioPrompt] is what gets read aloud in seller flows.
     */
    data class Error(
        val message: String,
        val cause: Throwable? = null,
        val retryable: Boolean = true,
        val audioPrompt: String? = null,
    ) : UiState<Nothing>

    /**
     * Distinct from Error on purpose: "you are offline" and "this failed" call
     * for different words and different next steps. [safeToContinue] tells the
     * user what still works without a network.
     */
    data class Offline(
        val safeToContinue: String? = null,
    ) : UiState<Nothing>

    /** Explains why the permission is needed, and offers settings after a denial. */
    data class PermissionDenied(
        val permission: String,
        val rationale: String,
        val permanentlyDenied: Boolean = false,
    ) : UiState<Nothing>
}

inline fun <T, R> UiState<T>.map(transform: (T) -> R): UiState<R> = when (this) {
    is UiState.Content -> UiState.Content(transform(data))
    is UiState.Loading -> this
    is UiState.Empty -> this
    is UiState.Error -> this
    is UiState.Offline -> this
    is UiState.PermissionDenied -> this
}

val <T> UiState<T>.contentOrNull: T? get() = (this as? UiState.Content)?.data
