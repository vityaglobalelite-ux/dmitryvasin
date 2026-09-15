"use client";

import { Skeleton } from "@/components/site/ui/Skeleton";
import { formatCatalogPrice } from "@/components/site/catalog/display";
import { useCatalogCurrency } from "@/lib/catalog/currency-context";
import { catalogPriceMinor } from "@/lib/catalog/money";
import type { Currency, Product } from "@/lib/catalog/types";

function PriceSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={["inline-block h-[1em] w-[5.5ch] align-baseline", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

export function CatalogPrice({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const { currency, ready } = useCatalogCurrency();
  if (!ready) return <PriceSkeleton className={className} />;
  return (
    <span className={className}>
      {formatCatalogPrice(catalogPriceMinor(product, currency), currency)}
    </span>
  );
}

export function CatalogMoney({
  minor,
  currency: locked,
  className,
}: {
  minor: number;
  currency?: Currency;
  className?: string;
}) {
  const geo = useCatalogCurrency();
  const currency = locked ?? geo.currency;
  const ready = locked ? true : geo.ready;
  if (!ready) return <PriceSkeleton className={className} />;
  return (
    <span className={className}>{formatCatalogPrice(minor, currency)}</span>
  );
}
