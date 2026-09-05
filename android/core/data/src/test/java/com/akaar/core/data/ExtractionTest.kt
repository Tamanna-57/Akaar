package com.akaar.core.data

import com.akaar.core.data.ai.MockAttributeExtractionService
import com.akaar.core.data.ai.MockSpeechToTextService
import com.akaar.core.domain.ai.NeverInvented
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * These pin the "never invent" rule, which is the product's central claim about
 * its own AI. They apply to the stand-in extractor now and to a real model
 * later: the contract is the same either way.
 */
class ExtractionTest {

    private val extractor = MockAttributeExtractionService()

    @Test fun `extracts only what the transcript actually contains`() = runTest {
        val r = extractor.extract("यह एक सूती बैग है जिस पर कढ़ाई है।", "hi").getOrThrow()
        val paths = r.fields.map { it.path }
        assertTrue("material stated", paths.contains("materials"))
        assertTrue("technique stated", paths.contains("techniques"))
        // Colour was never mentioned, so it must not appear as a value.
        assertFalse("colour was not mentioned", paths.contains("colors"))
    }

    @Test fun `every returned field carries the words it came from`() = runTest {
        val r = extractor.extract(MockSpeechToTextService.DEMO_HINDI, "hi").getOrThrow()
        assertTrue(r.fields.isNotEmpty())
        r.fields.forEach {
            assertNotNull("${it.path} has no evidence span", it.evidence)
            assertTrue("${it.path} evidence is empty", it.evidence!!.isNotBlank())
        }
    }

    @Test fun `unmentioned required fields come back as questions, not guesses`() = runTest {
        val r = extractor.extract("नमस्ते", "hi").getOrThrow()
        assertTrue("nothing should be extracted", r.fields.isEmpty())
        val gapPaths = r.gaps.map { it.path }
        assertTrue(gapPaths.contains("product_type"))
        assertTrue(gapPaths.contains("materials"))
        assertTrue(gapPaths.contains("techniques"))
    }

    @Test fun `provenance fields are never populated`() = runTest {
        // Even when the transcript talks about heritage, no such field is returned.
        val r = extractor.extract(
            "यह सूती बैग है, हमारे परिवार की सौ साल पुरानी परंपरा है और यह प्रमाणित है।", "hi",
        ).getOrThrow()
        r.fields.forEach {
            assertFalse("${it.path} is a provenance field", NeverInvented.isForbidden(it.path))
        }
    }

    @Test fun `an ambiguous number is low confidence rather than an assertion`() = runTest {
        // "six" could be hours, pieces or rupees. The app must not decide silently.
        val r = extractor.extract("इसे बनाने में छह घंटे लगे", "hi").getOrThrow()
        val hours = r.fields.first { it.path == "production_hours" }
        assertTrue("should be flagged for review", hours.isLowConfidence)
    }

    @Test fun `works in english as well as hindi`() = runTest {
        val r = extractor.extract("This is a cotton bag with hand embroidery in blue", "en").getOrThrow()
        val values = r.fields.associate { it.path to it.value }
        assertEquals("Cotton", values["materials"])
        assertEquals("Hand embroidery", values["techniques"])
        assertEquals("Blue", values["colors"])
        assertEquals("Bag", values["product_type"])
    }

    @Test fun `extraction is deterministic`() = runTest {
        // The demo must behave identically every run, and so must the tests.
        val a = extractor.extract("सूती बैग नीला", "hi").getOrThrow()
        val b = extractor.extract("सूती बैग नीला", "hi").getOrThrow()
        assertEquals(a.fields.map { it.path to it.value }, b.fields.map { it.path to it.value })
    }
}
