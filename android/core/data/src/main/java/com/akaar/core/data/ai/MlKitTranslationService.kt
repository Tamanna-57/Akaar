package com.akaar.core.data.ai

import com.akaar.core.domain.ai.TranslationService
import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.Translator
import com.google.mlkit.nl.translate.TranslatorOptions
import kotlinx.coroutines.suspendCancellableCoroutine
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * On-device translation.
 *
 * Chosen over a cloud API for three reasons that matter to this product: it
 * needs no API key, so nothing sensitive ships in the APK; it works with no
 * network once the language pack is downloaded, which is the normal condition
 * for the artisan this app is for; and it costs nothing per listing.
 *
 * Quality is the trade. Google handles everyday Hindi well but is weaker on
 * craft vocabulary and dialect, which is why the artisan reviews and edits every
 * translation before publishing. Swapping in Bhashini or IndicTrans2 later means
 * writing another [TranslationService] and changing one binding.
 */
@Singleton
class MlKitTranslationService @Inject constructor() : TranslationService {

    private val translators = mutableMapOf<String, Translator>()

    override suspend fun translate(text: String, from: String, to: String): Result<String> {
        if (text.isBlank()) return Result.success("")
        if (from == to) return Result.success(text)
        return runCatching {
            val translator = translatorFor(from, to)
            suspendCancellableCoroutine { cont ->
                translator.translate(text)
                    .addOnSuccessListener { cont.resume(it) }
                    .addOnFailureListener { cont.resumeWithException(it) }
            }
        }
    }

    /**
     * Downloads the language pack. Restricted to wifi so it never eats an
     * artisan's mobile data without her knowing, and called once up front so a
     * download cannot strand her in the middle of listing a product.
     */
    override suspend fun ensureModelsReady(from: String, to: String): Result<Unit> = runCatching {
        val translator = translatorFor(from, to)
        val conditions = DownloadConditions.Builder().requireWifi().build()
        suspendCancellableCoroutine { cont ->
            translator.downloadModelIfNeeded(conditions)
                .addOnSuccessListener { cont.resume(Unit) }
                .addOnFailureListener { cont.resumeWithException(it) }
        }
    }

    private fun translatorFor(from: String, to: String): Translator {
        val key = "$from-$to"
        return translators.getOrPut(key) {
            Translation.getClient(
                TranslatorOptions.Builder()
                    .setSourceLanguage(mlKitCode(from))
                    .setTargetLanguage(mlKitCode(to))
                    .build()
            )
        }
    }

    private fun mlKitCode(lang: String): String = when (lang) {
        "hi" -> TranslateLanguage.HINDI
        "en" -> TranslateLanguage.ENGLISH
        "bn" -> TranslateLanguage.BENGALI
        "gu" -> TranslateLanguage.GUJARATI
        "mr" -> TranslateLanguage.MARATHI
        "ta" -> TranslateLanguage.TAMIL
        "te" -> TranslateLanguage.TELUGU
        "kn" -> TranslateLanguage.KANNADA
        "ur" -> TranslateLanguage.URDU
        else -> TranslateLanguage.ENGLISH
    }
}
