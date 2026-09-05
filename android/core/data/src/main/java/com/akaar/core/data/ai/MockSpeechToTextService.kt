package com.akaar.core.data.ai

import com.akaar.core.domain.ai.SpeechToTextService
import com.akaar.core.domain.ai.Transcription
import kotlinx.coroutines.delay
import javax.inject.Inject

/**
 * Speech to text, stubbed for round one.
 *
 * Returns a fixed Hindi sentence rather than listening. It is deterministic so
 * tests and the demo behave identically every run, and the delay is there so
 * the processing state is actually visible instead of flashing past - a screen
 * that never appears in practice is a screen nobody has checked.
 *
 * Phase 10 replaces this with Bhashini or IndicWhisper through an Edge
 * Function, keeping the provider key server-side. The correction step above it
 * exists precisely because real speech recognition on dialect will get things
 * wrong.
 */
class MockSpeechToTextService @Inject constructor() : SpeechToTextService {

    override suspend fun transcribe(audioPath: String, languageHint: String): Result<Transcription> {
        delay(1_800)
        val text = if (languageHint == "hi") DEMO_HINDI else DEMO_ENGLISH
        return Result.success(
            Transcription(
                text = text,
                detectedLang = languageHint,
                confidence = 0.88,
                modelVersion = "mock-stt-v1",
            )
        )
    }

    companion object {
        // Deliberately mentions material, technique and colour but not size or
        // price, so the gap-detection and question flow are exercised rather
        // than skipped.
        /** Public so extraction tests run against the same words the demo uses. */
        const val DEMO_HINDI =
            "यह एक सूती बैग है जिस पर मैंने हाथ से कढ़ाई की है। " +
                "इसमें नीला रंग है और शीशा का काम भी है। " +
                "इसे बनाने में मुझे छह घंटे लगे।"
        const val DEMO_ENGLISH =
            "This is a cotton bag with hand embroidery done by me. " +
                "It has blue colour and mirror work as well. " +
                "It took me six hours to make."
    }
}
