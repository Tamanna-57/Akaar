import { useEffect } from "react";
import { disableScreenGuard, enableScreenGuard } from "./screenGuard.ts";

/**
 * Turn FLAG_SECURE on for exactly as long as a cost-bearing screen is
 * mounted, and off again on the way out.
 *
 * Scoped per screen rather than set once for the whole app: the buyer-side
 * marketplace has nothing private on it, and a permanently screenshot-proof
 * app is one an artisan cannot share a listing from.
 *
 * Use on: the pricing screens, the seller's cost breakdown, the negotiation
 * corridor - anywhere a SELLER_PRIVATE number is on screen.
 */
export function useScreenGuard(active = true): void {
  useEffect(() => {
    if (!active) return;
    enableScreenGuard();
    return () => disableScreenGuard();
  }, [active]);
}
