import type { Currency, Product } from "@/lib/catalog/types";

export type PricedCatalogProduct = Pick<
  Product,
  "priceMinor" | "priceUsdMinor" | "priceEurMinor"
>;

export function catalogPriceMinor(
  product: PricedCatalogProduct,
  currency: Currency,
): number {
  if (currency === "usd") return product.priceUsdMinor;
  if (currency === "eur") return product.priceEurMinor;
  return product.priceMinor;
}
