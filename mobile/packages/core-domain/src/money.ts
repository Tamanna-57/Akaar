/**
 * Port of android/core/domain/.../Money.kt.
 *
 * Integer paise. There are no floating point rupees anywhere in Akaar: the
 * price floor is the product's central guarantee and it cannot rest on
 * binary rounding. The Kotlin type is a `@JvmInline value class Money(val
 * paise: Long)` - zero runtime cost, `paise` still an integer. TS has no
 * value classes, so this is a small immutable class instead; `paise` stays
 * an integer (`Number.isInteger` is asserted in the constructor) and every
 * operation returns a new `Money` rather than mutating.
 */
export class Money {
  static readonly Zero = new Money(0);

  readonly paise: number;

  constructor(paise: number) {
    if (!Number.isInteger(paise)) {
      throw new Error(`Money.paise must be an integer, got ${paise}`);
    }
    this.paise = paise;
  }

  static ofRupees(rupees: number): Money {
    return new Money(rupees * 100);
  }

  get rupees(): number {
    return Math.trunc(this.paise / 100);
  }

  get paisePart(): number {
    return this.paise % 100;
  }

  plus(other: Money): Money {
    return new Money(this.paise + other.paise);
  }

  minus(other: Money): Money {
    return new Money(this.paise - other.paise);
  }

  times(qty: number): Money {
    return new Money(this.paise * qty);
  }

  compareTo(other: Money): number {
    return this.paise - other.paise;
  }

  equals(other: Money): boolean {
    return this.paise === other.paise;
  }

  lessThan(other: Money): boolean {
    return this.paise < other.paise;
  }

  greaterThan(other: Money): boolean {
    return this.paise > other.paise;
  }

  atLeast(other: Money): boolean {
    return this.paise >= other.paise;
  }

  /** Indian digit grouping: 1,23,456 rather than 123,456. */
  format(withSymbol = true): string {
    const sign = this.paise < 0 ? "-" : "";
    const whole = Math.abs(this.rupees).toString();

    let grouped: string;
    if (whole.length <= 3) {
      grouped = whole;
    } else {
      const last3 = whole.slice(-3);
      let rest = whole.slice(0, -3);
      const chunks: string[] = [];
      while (rest.length > 2) {
        chunks.unshift(rest.slice(-2));
        rest = rest.slice(0, -2);
      }
      if (rest.length > 0) chunks.unshift(rest);
      grouped = chunks.join(",") + "," + last3;
    }

    const fraction = Math.abs(this.paisePart);
    const tail = fraction === 0 ? "" : "." + fraction.toString().padStart(2, "0");
    return (withSymbol ? "₹" : "") + sign + grouped + tail;
  }
}
