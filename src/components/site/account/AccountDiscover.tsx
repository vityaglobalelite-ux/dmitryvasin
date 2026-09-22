"use client";

import Link from "next/link";
import { useMemo } from "react";
import { accountT } from "@/components/site/account/copy";
import { ProductCard } from "@/components/site/catalog/ProductCard";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import { siteFocusRing } from "@/components/site/ui/Button";
import { HorizontalRail } from "@/components/site/ui/HorizontalRail";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { isStorefrontListingProduct } from "@/lib/catalog/bundles";
import { useProducts } from "@/lib/catalog/hooks";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";

export function AccountDiscover({
  ownedIds,
}: {
  ownedIds: ReadonlySet<string>;
}) {
  const locale = useLocale();
  const copy = accountT(locale);
  const routes = useLocalizedRoutes();
  const products = useProducts({ locale });
  const addToCart = useAddToCart();
  const inCartIds = useCartProductIds();

  const items = useMemo(
    () =>
      products.data
        .filter(isStorefrontListingProduct)
        .filter((product) => !ownedIds.has(product.id)),
    [ownedIds, products.data],
  );

  if (!products.loading && !products.error && items.length === 0) return null;

  const token = items.map((product) => product.id).join("|");

  return (
    <section className="flex flex-col gap-6" aria-labelledby="account-discover-title">
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-accent-orange">
            {copy.discoverEyebrow}
          </p>
          <h2
            id="account-discover-title"
            className="mt-2 text-[36px] font-medium leading-[1.1] tracking-[-1px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.6px]"
          >
            {copy.discoverTitle}
          </h2>
          <p className="mt-3 max-w-[640px] text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {copy.discoverLead}
          </p>
        </div>
        <Link
          href={routes.catalog}
          className={[
            "mb-1 hidden shrink-0 items-center gap-2 rounded-full bg-[image:var(--brand-gradient)] px-6 py-3 text-[15px] font-semibold text-white shadow-[0_10px_28px_rgba(219,12,37,0.24)]",
            "transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 min-[900px]:inline-flex",
            siteFocusRing,
          ].join(" ")}
        >
          {copy.discoverAll}
        </Link>
      </div>

      {products.loading ? (
        <div className="flex gap-5 overflow-hidden" aria-busy="true">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="h-[520px] w-[340px] shrink-0 overflow-hidden rounded-[20px] bg-light-gray max-[600px]:w-[280px]"
            >
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : products.error ? (
        <div className="rounded-[20px] bg-light-gray p-8 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
            {copy.discoverError}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className={[
              "mt-5 text-[16px] font-semibold text-plum underline-offset-4 hover:underline",
              siteFocusRing,
            ].join(" ")}
          >
            {copy.retry}
          </button>
        </div>
      ) : (
        <HorizontalRail token={token}>
          {items.map((product) => (
            <div
              key={product.id}
              data-rail-card
              className="w-[340px] shrink-0 snap-start max-[600px]:w-[280px]"
            >
              <ProductCard
                product={product}
                onAdd={(item) => {
                  void addToCart.add(item.id);
                }}
                adding={addToCart.pendingId === product.id}
                inCart={inCartIds.has(product.id)}
              />
            </div>
          ))}
        </HorizontalRail>
      )}

      <Link
        href={routes.catalog}
        className={[
          "inline-flex h-[50px] w-full items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[15px] font-semibold text-white shadow-[0_10px_28px_rgba(219,12,37,0.24)] min-[900px]:hidden",
          siteFocusRing,
        ].join(" ")}
      >
        {copy.discoverAll}
      </Link>
      <WholesaleModal open={addToCart.modalOpen} onClose={addToCart.closeModal} />
    </section>
  );
}
