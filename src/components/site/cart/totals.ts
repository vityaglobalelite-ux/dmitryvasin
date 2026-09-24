import {
  applyPostureBundlePricing,
  pricedLinesFromCart,
  productsMapFromCart,
} from "@/lib/catalog/bundle-pricing";
import type { CartItem, Currency, Product, WholesaleTier } from "@/lib/catalog/types";

export type CartTotals = {
  subtotalMinor: number;
  discountMinor: number;
  payableMinor: number;
  percent: number;
  currency: Currency;
};

/** Highest matching `minQty` wins. Empty tiers → 0%. Never invent a fallback percent. */
export function pickWholesalePercent(
  qty: number,
  tiers: WholesaleTier[],
): number {
  const matching = tiers.filter((tier) => qty >= tier.minQty);
  if (matching.length === 0) return 0;
  return matching.reduce((best, tier) =>
    tier.minQty > best.minQty ? tier : best,
  ).percent;
}

export function computeCartTotals(
  items: readonly CartItem[],
  tiers: WholesaleTier[],
  currency: Currency,
  extraProducts: Product[] = [],
): CartTotals {
  const priced = items.filter((item) => item.product);
  const productsById = productsMapFromCart(priced);
  for (const product of extraProducts) {
    if (!productsById.has(product.id)) productsById.set(product.id, product);
  }
  const lines = applyPostureBundlePricing(
    pricedLinesFromCart(priced, currency),
    productsById,
    currency,
  );
  const subtotalMinor = lines.reduce((sum, line) => sum + line.priceMinor, 0);
  const percent = pickWholesalePercent(priced.length, tiers);
  const discountMinor =
    percent > 0 ? Math.round((subtotalMinor * percent) / 100) : 0;
  return {
    subtotalMinor,
    discountMinor,
    payableMinor: Math.max(0, subtotalMinor - discountMinor),
    percent,
    currency,
  };
}

export function discountedPriceMinor(
  priceMinor: number,
  percent: number,
): number {
  if (percent <= 0) return priceMinor;
  return Math.max(0, priceMinor - Math.round((priceMinor * percent) / 100));
}
