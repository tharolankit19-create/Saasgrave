// Dynamic ad-slot pricing (server-only). The price of the NEXT slot rises as
// slots sell — pure FOMO: $19 → $29 → $49, then holds at $49. `soldCount` is
// how many of the 6 slots are already booked.
export const AD_PRICE_LADDER = [19, 29, 49, 49, 49, 49]; // dollars, indexed by soldCount

export type AdTier = { dollars: number; cents: number; nextDollars: number; isLast: boolean };

export function adTier(soldCount: number): AdTier {
  const n = AD_PRICE_LADDER.length;
  const i = Math.min(Math.max(soldCount || 0, 0), n - 1);
  const dollars = AD_PRICE_LADDER[i];
  const nextDollars = AD_PRICE_LADDER[Math.min(i + 1, n - 1)];
  return { dollars, cents: dollars * 100, nextDollars, isLast: dollars >= 49 };
}

// Which Dodo product to charge for a given price tier. Create one product per
// price ($19 / $29 / $49) and set these env vars.
export function adProductId(dollars: number): string | undefined {
  const pick =
    dollars <= 19
      ? process.env.DODO_PRODUCT_ID_ADS_19 || process.env.DODO_PRODUCT_ID_ADS
      : dollars <= 29
        ? process.env.DODO_PRODUCT_ID_ADS_29
        : process.env.DODO_PRODUCT_ID_ADS_49;
  return pick?.trim() || undefined;
}
