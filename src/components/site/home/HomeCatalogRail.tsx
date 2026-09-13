"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/catalog/ProductCard";
import { HomePad } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { homeT } from "@/lib/catalog/home-copy";
import { useProducts } from "@/lib/catalog/hooks";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { ProductType } from "@/lib/catalog/types";

const DESKTOP_COUNT = 3;
const MOBILE_PAGE = 3;

export function HomeCatalogRail() {
  const locale = useLocale();
  const { copy, filters } = homeT(locale);
  const routes = useLocalizedRoutes();
  const [filter, setFilter] = useState<ProductType>("course");
  const [mobileShown, setMobileShown] = useState(MOBILE_PAGE);
  const { data, loading, error } = useProducts({ type: filter });

  const desktopItems = useMemo(
    () => data.slice(0, DESKTOP_COUNT),
    [data],
  );
  const mobileItems = useMemo(
    () => data.slice(0, mobileShown),
    [data, mobileShown],
  );

  const empty = !loading && !error && data.length === 0;
  const failed = !loading && Boolean(error);

  return (
    <section className="py-16 max-[600px]:py-10">
      <HomePad>
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
          {copy.catalogTitle}
        </h2>
        <div className="mt-5 flex flex-wrap items-center gap-5 max-[600px]:mt-4 max-[600px]:gap-[7px]">
          {filters.map((chip) => {
            const active = filter === chip.type;
            return (
              <button
                key={chip.type}
                type="button"
                onClick={() => {
                  setFilter(chip.type);
                  setMobileShown(MOBILE_PAGE);
                }}
                className={[
                  "inline-flex h-[69px] items-center justify-center rounded-[40px] px-10 text-[24px] font-medium leading-[1.2] transition-[filter,transform,background-color,color] duration-200 max-[600px]:h-[35px] max-[600px]:px-[11px] max-[600px]:text-[10px] max-[600px]:font-normal",
                  active
                    ? "bg-[image:var(--brand-gradient)] text-white"
                    : "border border-accent-orange text-accent-orange hover:bg-accent-orange/5",
                ].join(" ")}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {loading || desktopItems.length > 0 ? (
          <div
            className="mt-10 grid grid-cols-1 justify-items-center gap-5 min-[900px]:grid-cols-2 min-[1440px]:grid-cols-3 max-[600px]:hidden"
            aria-busy={loading}
          >
            {loading
              ? Array.from({ length: DESKTOP_COUNT }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : desktopItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        ) : null}

        {loading || mobileItems.length > 0 ? (
          <div
            className="mt-8 hidden grid-cols-1 gap-5 max-[600px]:grid"
            aria-busy={loading}
          >
            {loading
              ? Array.from({ length: MOBILE_PAGE }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : mobileItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>
        ) : null}

        {empty || failed ? (
          <div className="mt-10 flex min-h-[280px] flex-col items-start justify-center rounded-[20px] bg-light-gray p-10 max-[600px]:min-h-[200px] max-[600px]:p-5">
            <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
              {failed ? copy.errorTitle : copy.emptyTitle}
            </p>
            <p className="mt-3 max-w-[640px] text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {failed ? copy.errorBody : copy.emptyBody}
            </p>
            <Button href={routes.catalog} className="mt-8 w-[309px] px-0 max-[600px]:w-full">
              {copy.emptyCta}
            </Button>
          </div>
        ) : null}

        {!loading && !empty && !failed ? (
          <div className="mt-8 hidden justify-center max-[600px]:flex">
            {mobileShown < data.length ? (
              <Button
                type="button"
                variant="secondary"
                className="w-[259px] px-0"
                onClick={() => setMobileShown((n) => n + MOBILE_PAGE)}
              >
                {copy.showMore}
              </Button>
            ) : (
              <Button href={routes.catalog} className="w-[259px] px-0">
                {copy.chooseVideos}
              </Button>
            )}
          </div>
        ) : null}
      </HomePad>
    </section>
  );
}
