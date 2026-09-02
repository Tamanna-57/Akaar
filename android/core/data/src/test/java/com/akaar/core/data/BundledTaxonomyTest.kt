package com.akaar.core.data

import com.akaar.core.data.taxonomy.BundledTaxonomy
import com.akaar.core.data.taxonomy.IndianStates
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The bundled taxonomy is what makes craft selection work with no network. It
 * must stay in step with the seed migration: a craft the app offers but the
 * database does not know is a listing that cannot be published.
 */
class BundledTaxonomyTest {

    @Test fun `mirrors the seed migration counts`() {
        assertEquals(7, BundledTaxonomy.categories.size)
        assertEquals(25, BundledTaxonomy.crafts.size)
    }

    @Test fun `every craft belongs to a real category`() {
        val slugs = BundledTaxonomy.categories.map { it.slug }.toSet()
        BundledTaxonomy.crafts.forEach {
            assertTrue("${it.slug} has orphan parent ${it.parentId}", it.parentId in slugs)
        }
    }

    @Test fun `every craft is named in both languages`() {
        BundledTaxonomy.crafts.forEach {
            assertTrue("${it.slug} missing English name", it.nameEn.isNotBlank())
            assertTrue("${it.slug} missing Hindi name", it.nameHi.isNotBlank())
            // Hindi names must actually be Devanagari, not a Latin transliteration:
            // a fallback here is exactly the credibility failure the design system warns about.
            assertTrue("${it.slug} Hindi name is not Devanagari", it.nameHi.any { c -> c.code in 0x0900..0x097F })
        }
    }

    @Test fun `search finds a craft by english name, hindi name and slug`() {
        assertTrue(BundledTaxonomy.search("kashida", "en").any { it.slug == "kashidakari" })
        assertTrue(BundledTaxonomy.search("मधुबनी", "hi").any { it.slug == "madhubani" })
        assertTrue(BundledTaxonomy.search("blue-pottery", "en").any { it.slug == "blue-pottery" })
    }

    @Test fun `an empty query returns everything rather than nothing`() {
        assertEquals(BundledTaxonomy.crafts.size, BundledTaxonomy.search("   ", "en").size)
    }

    @Test fun `crafts can be listed by category`() {
        val embroidery = BundledTaxonomy.craftsIn("embroidery").map { it.slug }
        assertTrue(embroidery.contains("kashidakari"))
        assertTrue(embroidery.contains("chikankari"))
    }

    @Test fun `lookup by slug covers crafts and categories`() {
        assertNotNull(BundledTaxonomy.bySlug("madhubani"))
        assertNotNull(BundledTaxonomy.bySlug("painting"))
    }

    @Test fun `every craft region is a state the profile step offers`() {
        // Otherwise an artisan could pick a craft whose region she cannot select.
        val states = IndianStates.all.toSet()
        BundledTaxonomy.crafts.flatMap { it.regions }.distinct().forEach {
            assertTrue("$it is not in the state list", it in states)
        }
    }
}
