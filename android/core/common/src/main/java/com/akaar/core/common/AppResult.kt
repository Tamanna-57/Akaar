package com.akaar.core.common

/**
 * Deliberately not kotlin.Result: the offline and permission cases are not
 * exceptions, and collapsing them into one would lose the distinction the UI
 * needs to make.
 */
sealed interface AppResult<out T> {
    data class Ok<out T>(val value: T) : AppResult<T>
    data class Failure(val error: AppError) : AppResult<Nothing>
}

sealed interface AppError {
    val message: String

    data class Network(override val message: String = "No connection") : AppError
    data class Unauthorized(override val message: String = "Please sign in again") : AppError
    data class Forbidden(override val message: String) : AppError

    /** Server rejected a business rule - the message is meant for the user. */
    data class Rejected(override val message: String, val code: String? = null) : AppError

    /**
     * Publication (and similar gated actions) return exactly what is still
     * missing, so the UI can say "3 things left" instead of "invalid".
     */
    data class Incomplete(val missing: List<String>, override val message: String = "Some details are missing") : AppError

    data class Unknown(override val message: String, val cause: Throwable? = null) : AppError
}

inline fun <T> AppResult<T>.onOk(block: (T) -> Unit): AppResult<T> {
    if (this is AppResult.Ok) block(value); return this
}
inline fun <T> AppResult<T>.onFailure(block: (AppError) -> Unit): AppResult<T> {
    if (this is AppResult.Failure) block(error); return this
}
