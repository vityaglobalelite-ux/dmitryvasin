/**
 * Server-side copy of src/components/site/cart/totals.ts.
 * Keep percent math identical — never trust client-sent amounts.
 */

export type WholesaleTier = {
  minQty: number;
  percent: number;
};

export type CatalogCartTotals = {
  subtotalMinor: number;
  discountMinor: number;
  payableMinor: number;
  percent: number;
};

/** Highest matching `minQty` wins. Empty tiers → 0%. Never invent a fallback percent. */
export function pickWholesalePercent(
  qty: number,
  tiers: WholesaleTier[],
): number {
  const matching = tiers.filter((tier) => qty >= tier.minQty);
  if (matching.length === 0) return 0;
  return matching.reduce((best, tier) =>
    tier.minQty > best.minQty ? tier : best
  ).percent;
}

export function computeCartTotalsFromPrices(
  priceMinors: number[],
  tiers: WholesaleTier[],
): CatalogCartTotals {
  const subtotalMinor = priceMinors.reduce((sum, price) => sum + price, 0);
  const percent = pickWholesalePercent(priceMinors.length, tiers);
  const discountMinor =
    percent > 0 ? Math.round((subtotalMinor * percent) / 100) : 0;
  return {
    subtotalMinor,
    discountMinor,
    payableMinor: Math.max(0, subtotalMinor - discountMinor),
    percent,
  };
}

export function discountedPriceMinor(
  priceMinor: number,
  percent: number,
): number {
  if (percent <= 0) return priceMinor;
  return Math.max(0, priceMinor - Math.round((priceMinor * percent) / 100));
}

export function parseWholesaleTiers(value: unknown): WholesaleTier[] {
  if (!Array.isArray(value)) return [];
  const tiers: WholesaleTier[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as {
      minQty?: unknown;
      min_qty?: unknown;
      percent?: unknown;
    };
    const minQty = parseFiniteNumber(row.minQty) ?? parseFiniteNumber(row.min_qty);
    const percent = parseFiniteNumber(row.percent);
    if (minQty !== null && percent !== null) {
      tiers.push({ minQty, percent });
    }
  }
  return tiers;
}

function parseFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}
