package com.akaar.core.domain.model

/**
 * Integer paise. There are no floating point rupees anywhere in Akaar: the
 * price floor is the product's central guarantee and it cannot rest on binary
 * rounding.
 */
@JvmInline
value class Money(val paise: Long) : Comparable<Money> {

    val rupees: Long get() = paise / 100
    val paisePart: Int get() = (paise % 100).toInt()

    operator fun plus(other: Money) = Money(paise + other.paise)
    operator fun minus(other: Money) = Money(paise - other.paise)
    operator fun times(qty: Int) = Money(paise * qty)
    override fun compareTo(other: Money) = paise.compareTo(other.paise)

    /** Indian digit grouping: 1,23,456 rather than 123,456. */
    fun format(withSymbol: Boolean = true): String {
        val sign = if (paise < 0) "-" else ""
        val whole = kotlin.math.abs(rupees).toString()
        val grouped = if (whole.length <= 3) whole else {
            val last3 = whole.takeLast(3)
            val rest = whole.dropLast(3)
            val chunks = mutableListOf<String>()
            var remaining = rest
            while (remaining.length > 2) {
                chunks.add(0, remaining.takeLast(2)); remaining = remaining.dropLast(2)
            }
            if (remaining.isNotEmpty()) chunks.add(0, remaining)
            chunks.joinToString(",") + "," + last3
        }
        val fraction = kotlin.math.abs(paisePart)
        val tail = if (fraction == 0) "" else "." + fraction.toString().padStart(2, '0')
        return (if (withSymbol) "₹" else "") + sign + grouped + tail
    }

    companion object {
        val Zero = Money(0)
        fun ofRupees(rupees: Long) = Money(rupees * 100)
    }
}
