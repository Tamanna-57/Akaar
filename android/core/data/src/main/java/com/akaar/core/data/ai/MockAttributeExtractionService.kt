package com.akaar.core.data.ai

import com.akaar.core.domain.ai.AttributeExtractionService
import com.akaar.core.domain.ai.ExtractedField
import com.akaar.core.domain.ai.ExtractionResult
import com.akaar.core.domain.ai.FieldGap
import com.akaar.core.domain.ai.NeverInvented
import com.akaar.core.domain.model.ExtractionSource
import javax.inject.Inject

/**
 * Extraction without a model.
 *
 * This is deliberately a vocabulary matcher rather than a canned response. It
 * only returns a field when the word is actually present in what the artisan
 * said, and it hands back the matched span as evidence. Everything else becomes
 * a question.
 *
 * That makes the demo honest in the way that matters: the app is not pretending
 * to know things it was not told, and the behaviour on stage is the same
 * behaviour a real model would be held to. When a model does arrive, it is held
 * to this same contract - no evidence span, no field.
 */
class MockAttributeExtractionService @Inject constructor() : AttributeExtractionService {

    override suspend fun extract(transcript: String, lang: String): Result<ExtractionResult> {
        val text = transcript.lowercase()
        val fields = mutableListOf<ExtractedField>()

        fun match(path: String, label: String, terms: Map<String, String>, source: ExtractionSource) {
            // A model may never fill these, so neither may the stand-in for one.
            if (NeverInvented.isForbidden(path)) return
            val hit = terms.entries.firstOrNull { text.contains(it.key) } ?: return
            fields += ExtractedField(
                path = path,
                label = label,
                value = hit.value,
                // Vocabulary matches are certain; the uncertainty is whether the
                // artisan meant this field, which the review step settles.
                confidence = 0.92,
                source = source,
                evidence = hit.key,
            )
        }

        match("materials", "Material", MATERIALS, ExtractionSource.Voice)
        match("techniques", "Technique", TECHNIQUES, ExtractionSource.Voice)
        match("colors", "Colour", COLOURS, ExtractionSource.Voice)
        match("product_type", "Product", PRODUCT_TYPES, ExtractionSource.Voice)

        // Numbers in the transcript are candidates, not conclusions: "six" could
        // be hours, pieces or rupees. Surfaced at low confidence for review.
        NUMBER_WORDS.entries.firstOrNull { text.contains(it.key) }?.let { (word, n) ->
            fields += ExtractedField(
                path = "production_hours", label = "Hours of work",
                value = n.toString(), confidence = 0.45,
                source = ExtractionSource.Voice, evidence = word,
            )
        }

        val found = fields.map { it.path }.toSet()
        val gaps = REQUIRED.filterNot { it.path in found }

        return Result.success(
            ExtractionResult(
                fields = fields,
                gaps = gaps,
                modelVersion = "vocabulary-matcher-v1",
                promptVersion = "none",
            )
        )
    }

    private companion object {
        // Hindi and English terms an artisan actually uses, mapped to the value
        // stored. Keys are what we search for; values are what we record.
        val MATERIALS = mapOf(
            "cotton" to "Cotton", "सूती" to "Cotton", "सूत" to "Cotton",
            "silk" to "Silk", "रेशम" to "Silk",
            "wool" to "Wool", "ऊन" to "Wool",
            "jute" to "Jute", "जूट" to "Jute",
            "clay" to "Terracotta clay", "मिट्टी" to "Terracotta clay",
            "brass" to "Brass", "पीतल" to "Brass",
            "bamboo" to "Bamboo", "बांस" to "Bamboo",
            "wood" to "Wood", "लकड़ी" to "Wood",
        )
        val TECHNIQUES = mapOf(
            "embroidery" to "Hand embroidery", "कढ़ाई" to "Hand embroidery",
            "weaving" to "Handloom weaving", "बुनाई" to "Handloom weaving",
            "block print" to "Hand block printing", "छपाई" to "Hand block printing",
            "mirror" to "Mirror work", "शीशा" to "Mirror work",
            "painting" to "Hand painting", "चित्रकारी" to "Hand painting",
            "carving" to "Hand carving", "नक्काशी" to "Hand carving",
        )
        val COLOURS = mapOf(
            "blue" to "Blue", "नीला" to "Blue", "नीली" to "Blue",
            "red" to "Red", "लाल" to "Red",
            "green" to "Green", "हरा" to "Green", "हरी" to "Green",
            "yellow" to "Yellow", "पीला" to "Yellow",
            "black" to "Black", "काला" to "Black", "काली" to "Black",
            "white" to "White", "सफेद" to "White",
        )
        val PRODUCT_TYPES = mapOf(
            "bag" to "Bag", "बैग" to "Bag", "थैला" to "Bag",
            "saree" to "Saree", "साड़ी" to "Saree",
            "dupatta" to "Dupatta", "दुपट्टा" to "Dupatta",
            "shawl" to "Shawl", "शॉल" to "Shawl",
            "pot" to "Pot", "बर्तन" to "Pot",
            "cushion" to "Cushion cover", "कुशन" to "Cushion cover",
            "toy" to "Toy", "खिलौना" to "Toy",
        )
        val NUMBER_WORDS = mapOf(
            "एक" to 1, "दो" to 2, "तीन" to 3, "चार" to 4, "पांच" to 5, "पाँच" to 5,
            "छह" to 6, "छः" to 6, "सात" to 7, "आठ" to 8, "नौ" to 9, "दस" to 10,
            "two" to 2, "three" to 3, "four" to 4, "five" to 5, "six" to 6,
            "seven" to 7, "eight" to 8, "nine" to 9, "ten" to 10,
        )

        /** Asked one at a time, in her language, when the transcript did not cover them. */
        val REQUIRED = listOf(
            FieldGap("product_type", "आप क्या बना रही हैं?", required = true),
            FieldGap("materials", "यह किस चीज़ से बना है?", required = true),
            FieldGap("techniques", "आपने इसे कैसे बनाया?", required = true),
            FieldGap("colors", "इसका रंग क्या है?", required = false),
        )
    }
}
