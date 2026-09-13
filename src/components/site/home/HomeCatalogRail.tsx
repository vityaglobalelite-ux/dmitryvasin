"use client";

import { ProductCard } from "@/components/site/catalog/ProductCard";
import { catalogFilterHref } from "@/components/site/catalog/display";
import { Layer } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { homeT } from "@/lib/catalog/home-copy";
import { useProducts } from "@/lib/catalog/hooks";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const DESKTOP_COUNT = 3;
const MOBILE_COUNT = 3;

export function HomeCatalogRailDesktop() {
  const locale = useLocale();
  const { copy, filters } = homeT(locale);
  const routes = useLocalizedRoutes();
  const { data, loading, error } = useProducts();
  const items = data.slice(0, DESKTOP_COUNT);
  const empty = !loading && !error && items.length === 0;
  const failed = !loading && Boolean(error);

  return (
    <>
      <Layer x={242} y={3989} w={833} h={55} z={2}>
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {copy.catalogTitle}
        </h2>
      </Layer>
      <div className="absolute left-[242px] top-[4064px] z-[2] flex h-[69px] items-center gap-5">
        {filters.map((chip) => {
          const filled = chip.type === "course";
          return (
            <Button
              key={chip.type}
              href={catalogFilterHref(chip.type === "peek" ? "peek" : chip.type, locale)}
              variant={filled ? "primary" : "secondary"}
              className={[
                "h-[69px] rounded-[40px] px-10 text-[24px] font-medium leading-[1.2]",
                filled
                  ? "border-0 bg-[image:var(--brand-gradient)] font-medium"
                  : "border-accent-orange text-accent-orange",
              ].join(" ")}
            >
              {chip.label}
            </Button>
          );
        })}
      </div>

      <Layer x={239} y={4173} w={1441} h={631} z={2}>
        {loading ? (
          <div className="flex gap-5" aria-busy="true">
            {Array.from({ length: DESKTOP_COUNT }, (_, i) => (
              <div key={i} className="h-[631px] w-[467px] overflow-hidden rounded-[20px] bg-light-gray">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : empty || failed ? (
          <div className="flex h-full flex-col items-start justify-center rounded-[20px] bg-light-gray p-10">
            <p className="text-[24px] font-medium leading-[1.2] text-text">
              {failed ? copy.errorTitle : copy.emptyTitle}
            </p>
            <p className="mt-3 max-w-[640px] text-[16px] leading-[1.5] text-text/70">
              {failed ? copy.errorBody : copy.emptyBody}
            </p>
            <Button href={routes.catalog} className="mt-8 h-[60px] w-[309px] px-0">
              {copy.emptyCta}
            </Button>
          </div>
        ) : (
          <div className="flex gap-5">
            {items.map((product) => (
              <div key={product.id} className="w-[467px] shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </Layer>
    </>
  );
}

export function HomeCatalogRailMobile() {
  const locale = useLocale();
  const { copy, filters } = homeT(locale);
  const routes = useLocalizedRoutes();
  const { data, loading, error } = useProducts();
  const items = data.slice(0, MOBILE_COUNT);
  const empty = !loading && !error && items.length === 0;
  const failed = !loading && Boolean(error);
  const cardY = [4883, 5403, 5923] as const;

  return (
    <>
      <Layer x={20} y={4782} w={320} h={26} z={2}>
        <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
          {copy.catalogTitle}
        </h2>
      </Layer>
      <div className="absolute left-5 top-[4828px] z-[2] flex h-[35px] items-center gap-[7px]">
        {filters.map((chip) => {
          const filled = chip.type === "course";
          return (
            <a
              key={chip.type}
              href={catalogFilterHref(chip.type === "peek" ? "peek" : chip.type, locale)}
              className={[
                "inline-flex h-[35px] items-center justify-center rounded-[40px] px-[11px] text-[10px] leading-normal",
                filled
                  ? "bg-[image:var(--brand-gradient)] text-white"
                  : "border border-accent-orange text-accent-orange",
              ].join(" ")}
            >
              {chip.label}
            </a>
          );
        })}
      </div>

      {loading
        ? cardY.map((y) => (
            <Layer key={y} x={20} y={y} w={320} h={500} z={2} className="overflow-hidden rounded-[10px] bg-light-gray">
              <ProductCardSkeleton />
            </Layer>
          ))
        : empty || failed
          ? (
            <Layer
              x={20}
              y={4883}
              w={320}
              h={500}
              z={2}
              className="flex flex-col items-start justify-center rounded-[10px] bg-light-gray p-5"
            >
              <p className="text-[16px] font-medium leading-[1.3] text-text">
                {failed ? copy.errorTitle : copy.emptyTitle}
              </p>
              <p className="mt-3 text-[13px] leading-[1.5] text-text/70">
                {failed ? copy.errorBody : copy.emptyBody}
              </p>
              <Button href={routes.catalog} className="mt-6 h-[50px] w-full px-0 text-[13px]">
                {copy.emptyCta}
              </Button>
            </Layer>
            )
          : items.map((product, i) => (
              <Layer key={product.id} x={20} y={cardY[i] ?? 4883} w={320} h={500} z={2}>
                <ProductCard product={product} />
              </Layer>
            ))}

      {!loading && !empty && !failed ? (
        <Layer x={50} y={6443} w={259} h={50} z={3}>
          <Button href={routes.catalog} className="h-[50px] w-[259px] px-0 text-[13px]">
            {copy.showMore}
          </Button>
        </Layer>
      ) : null}
    </>
  );
}
