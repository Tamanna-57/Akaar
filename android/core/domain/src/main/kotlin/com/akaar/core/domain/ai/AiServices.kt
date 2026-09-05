package com.akaar.core.domain.ai

import com.akaar.core.domain.model.ExtractionSource

/**
 * The AI gateway, as interfaces.
 *
 * Every model call in Akaar goes through one of these. Screens depend on the
 * interface and never on a provider, so a provider can be swapped without
 * touching a screen, and every one of them has a deterministic mock so the app
 * runs with no keys and no network.
 *
 * No provider key ever reaches the device. Anything requiring one is proxied by
 * an Edge Function; the on-device implementations here (ML Kit) need none.
 */

interface SpeechToTextService {
    /** [audioPath] is a local file. [languageHint] comes from the artisan's profile. */
    suspend fun transcribe(audioPath: String, languageHint: String): Result<Transcription>
}

data class Transcription(
    val text: String,
    val detectedLang: String,
    val confidence: Double,
    val modelVersion: String,
)

interface TranslationService {
    suspend fun translate(text: String, from: String, to: String): Result<String>

    /**
     * On-device translation needs a language pack before it can run offline.
     * The UI asks once, on wifi, rather than failing mid-flow in a village.
     */
    suspend fun ensureModelsReady(from: String, to: String): Result<Unit>
}

/**
 * Turns a transcript into product fields.
 *
 * The contract that matters is what it must NOT do: a field with no supporting
 * span in the transcript is not returned as a value. It is returned as a
 * question. Provenance fields - certification, cultural history, sustainability,
 * age of tradition - are never populated at all.
 */
interface AttributeExtractionService {
    suspend fun extract(transcript: String, lang: String): Result<ExtractionResult>
}

data class ExtractionResult(
    val fields: List<ExtractedField>,
    /** Fields the transcript did not cover. These become questions, never guesses. */
    val gaps: List<FieldGap>,
    val modelVersion: String,
    val promptVersion: String,
)

data class ExtractedField(
    val path: String,
    val label: String,
    val value: String,
    val confidence: Double,
    val source: ExtractionSource,
    /** The words in the transcript this came from. No span, no field. */
    val evidence: String?,
) {
    /** Below this the value is not trustworthy enough to show as a fact. */
    val isLowConfidence: Boolean get() = confidence < 0.7
}

data class FieldGap(
    val path: String,
    /** Asked in the artisan's language, one at a time. */
    val question: String,
    val required: Boolean,
)

/** Fields no model may ever fill. Enforced in the extractor, not left to a prompt. */
object NeverInvented {
    val paths = setOf(
        "artisan_story",
        "certification",
        "gi_reference",
        "cultural_history",
        "sustainability_claim",
        "age_of_tradition",
    )

    fun isForbidden(path: String) = paths.any { path.startsWith(it) }
}
