package com.akaar.core.domain

import com.akaar.core.domain.model.Money
import org.junit.Assert.assertEquals
import org.junit.Test

class MoneyTest {

    @Test fun `formats with indian digit grouping`() {
        assertEquals("₹450", Money(45_000).format())
        assertEquals("₹1,200", Money(120_000).format())
        assertEquals("₹1,23,456", Money(12_345_600).format())
        assertEquals("₹12,34,567", Money(123_456_700).format())
    }

    @Test fun `keeps paise when present`() {
        assertEquals("₹681.45", Money(68_145).format())
        assertEquals("₹0.05", Money(5).format())
    }

    @Test fun `arithmetic stays exact`() {
        // The floor guarantee cannot rest on binary rounding, so this is integer maths.
        val unit = Money(68_145)
        assertEquals(Money(204_435), unit * 3)
        assertEquals(Money(68_145 * 7), unit * 7)
    }

    @Test fun `compares by paise`() {
        assert(Money(68_145) > Money(60_000))
        assert(Money(60_000) < Money(68_145))
    }
}
