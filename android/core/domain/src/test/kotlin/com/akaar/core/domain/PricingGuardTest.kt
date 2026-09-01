package com.akaar.core.domain

import com.akaar.core.domain.model.Money
import com.akaar.core.domain.model.SellerPricing
import com.akaar.core.domain.model.Translatable
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The client-side mirror of the database CHECK constraint
 * min_acceptable_price_paise >= sustainable_floor_paise.
 *
 * The server remains the authority. This exists so the seller is told why a
 * corridor is refused before a round trip, in her own language, rather than
 * receiving a generic failure.
 */
class PricingGuardTest {

    private fun pricing(floor: Long, minAcceptable: Long?) = SellerPricing(
        productId = "p1",
        materialsCost = Money(18_000),
        labourHours = 6.0,
        labourRate = Money(5_000),
        packagingCost = Money(4_000),
        overheadCost = Money(2_000),
        shippingEstimate = Money(5_000),
        platformFeePct = 5.0,
        minMarginPct = 10.0,
        sustainableFloor = Money(floor),
        d2cRecommended = null,
        wholesaleMin = null,
        wholesaleMax = null,
        netEarningsEstimate = null,
        confidence = 1.0,
        explanation = Translatable(),
        preferredPrice = Money(95_000),
        minAcceptablePrice = minAcceptable?.let { Money(it) },
    )

    @Test fun `a minimum at or above the floor is valid`() {
        assertTrue(pricing(68_145, 70_000).isCorridorValid())
        assertTrue(pricing(68_145, 68_145).isCorridorValid())
    }

    @Test fun `a minimum below the floor is refused`() {
        assertFalse(pricing(68_145, 60_000).isCorridorValid())
    }

    @Test fun `an unset minimum is not yet invalid`() {
        assertTrue(pricing(68_145, null).isCorridorValid())
    }

    @Test fun `clearsFloor decides whether an offer needs explicit confirmation`() {
        val p = pricing(68_145, 70_000)
        assertFalse(p.clearsFloor(Money(60_000)))
        assertTrue(p.clearsFloor(Money(68_145)))
        assertTrue(p.clearsFloor(Money(90_000)))
    }
}
