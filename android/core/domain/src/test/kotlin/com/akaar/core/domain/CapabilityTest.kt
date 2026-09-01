package com.akaar.core.domain

import com.akaar.core.domain.model.Capability
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The client-side mirror of the quantity and deadline rules in
 * search_marketplace. If these drift from the SQL, a buyer sees a product the
 * server would not have matched, so the arithmetic is pinned by tests on both
 * sides.
 */
class CapabilityTest {

    private val meena = Capability(moq = 1, capacityPerCycle = 8, cycleDays = 7, leadTimeDays = 12)

    @Test fun `deliverable quantity accounts for lead time then cycles`() {
        // 40 days - 12 lead = 28 production days = 4 cycles of 8
        assertEquals(32, meena.deliverableBy(40))
    }

    @Test fun `a deadline inside the lead time delivers nothing`() {
        assertEquals(0, meena.deliverableBy(10))
        assertFalse(meena.canMeet(1, 10))
    }

    @Test fun `at least one cycle once lead time is cleared`() {
        assertEquals(8, meena.deliverableBy(13))
    }

    @Test fun `quantity below moq does not match`() {
        val bulk = meena.copy(moq = 20)
        assertFalse(bulk.canMeet(5, 60))
        assertTrue(bulk.canMeet(20, 60))
    }

    @Test fun `quantity beyond capacity does not match`() {
        assertFalse(meena.canMeet(100, 40))
        assertTrue(meena.canMeet(32, 40))
    }
}
