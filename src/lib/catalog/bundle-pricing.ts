import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import type { CartItem, Currency, Product } from "@/lib/catalog/types";
import { catalogPriceMinor } from "@/lib/catalog/money";

export type PricedLine = {
  productId: string;
  priceMinor: number;
};

/**
 * When both posture blocks are in the cart, payable for those SKUs is
 * min(block1 + block2, full) before wholesale (same rule as checkout).
 */
export function applyPostureBundlePricing(
  lines: PricedLine[],
  productsById: Map<string, Product>,
  currency: Currency,
): PricedLine[] {
  const ids = new Set(lines.map((line) => line.productId));
  const hasB1 = ids.has(POSTURE_BUNDLE.block1Id);
  const hasB2 = ids.has(POSTURE_BUNDLE.block2Id);
  if (!hasB1 || !hasB2) return lines;

  const full = productsById.get(POSTURE_BUNDLE.fullId);
  const b1 = productsById.get(POSTURE_BUNDLE.block1Id);
  const b2 = productsById.get(POSTURE_BUNDLE.block2Id);
  if (!b1 || !b2) return lines;

  const blockSum =
    catalogPriceMinor(b1, currency) + catalogPriceMinor(b2, currency);
  const fullPrice = full ? catalogPriceMinor(full, currency) : 0;
  if (fullPrice <= 0 || blockSum <= fullPrice) return lines;

  const half = Math.floor(fullPrice / 2);
  const remainder = fullPrice - half;
  const priced = new Map(lines.map((line) => [line.productId, line]));
  priced.set(POSTURE_BUNDLE.block1Id, {
    productId: POSTURE_BUNDLE.block1Id,
    priceMinor: half,
  });
  priced.set(POSTURE_BUNDLE.block2Id, {
    productId: POSTURE_BUNDLE.block2Id,
    priceMinor: remainder,
  });
  return lines.map((line) => priced.get(line.productId) ?? line);
}

export function pricedLinesFromCart(
  items: CartItem[],
  currency: Currency,
): PricedLine[] {
  return items
    .filter((item) => item.product)
    .map((item) => ({
      productId: item.productId,
      priceMinor: catalogPriceMinor(item.product!, currency),
    }));
}

export function productsMapFromCart(items: CartItem[]): Map<string, Product> {
  const map = new Map<string, Product>();
  for (const item of items) {
    if (item.product) map.set(item.productId, item.product);
  }
  return map;
}
