"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ProductCard } from "@/components/site/catalog/ProductCard";
import { catalogFilterHref } from "@/components/site/catalog/display";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import { Layer } from "@/components/site/home/HomeFrame";
import { Button, siteFocusRing } from "@/components/site/ui/Button";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { homeT } from "@/lib/catalog/home-copy";
import { useProducts } from "@/lib/catalog/hooks";
import { useCatalogT, useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";
import type { Product, ProductType } from "@/lib/catalog/types";

const DESKTOP_COUNT = 3;
const MOBILE_COUNT = 3;
const SWAP_MS = 180;

const homeCatalogFilterTypes = ["lifehack", "lesson", "course", "peek"] as const;
type HomeFilter = (typeof homeCatalogFilterTypes)[number];
const DEFAULT_FILTER: HomeFilter = "course";

function isHomeFilter(type: ProductType): type is HomeFilter {
  return (homeCatalogFilterTypes as readonly string[]).includes(type);
}

function useHomeCatalogRail(count: number) {
  const locale = useLocale();
  const { copy, filters, emptyFilter: emptyFilterCopy } = homeT(locale);
  const catalogCopy = useCatalogT();
  const routes = useLocalizedRoutes();
  const { data, loading, error } = useProducts({ locale });
  const addToCart = useAddToCart();
  const inCartIds = useCartProductIds();
  const [selectedType, setSelectedType] = useState<HomeFilter>(DEFAULT_FILTER);
  const [displayedType, setDisplayedType] = useState<HomeFilter>(DEFAULT_FILTER);
  const [cardsVisible, setCardsVisible] = useState(true);
  const swapTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (swapTimer.current !== undefined) window.clearTimeout(swapTimer.current);
    };
  }, []);

  const selectType = (type: HomeFilter) => {
    if (type === selectedType) return;
    setSelectedType(type);
    setCardsVisible(false);
    if (swapTimer.current !== undefined) window.clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setDisplayedType(type);
      setCardsVisible(true);
    }, SWAP_MS);
  };

  const items = useMemo(
    () => data.filter((product) => product.type === displayedType).slice(0, count),
    [count, data, displayedType],
  );

  const failed = !loading && Boolean(error);
  const emptyCatalog = !loading && !error && data.length === 0;
  const emptyFilter = !loading && !error && data.length > 0 && items.length === 0;

  const onAdd = (product: Product) => {
    void addToCart.add(product.id);
  };

  return {
    copy,
    catalogCopy,
    filters,
    emptyFilterCopy,
    locale,
    routes,
    loading,
    failed,
    emptyCatalog,
    emptyFilter,
    items,
    selectedType,
    displayedType,
    selectType,
    cardsVisible,
    onAdd,
    pendingId: addToCart.pendingId,
    inCartIds,
    modalOpen: addToCart.modalOpen,
    closeModal: addToCart.closeModal,
  };
}

function HomeFilterChip({
  label,
  selected,
  onSelect,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={[
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-[filter,transform] duration-200 ease-out",
        "hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
        siteFocusRing,
        compact
          ? "h-[35px] shrink-0 rounded-[40px] px-[11px] text-[10px] leading-normal"
          : "h-[69px] rounded-[40px] px-10 text-[24px] leading-[1.2]",
        selected
          ? "bg-[image:var(--brand-gradient)] text-white"
          : "border border-accent-orange bg-transparent text-accent-orange",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function HomeCatalogRailDesktop() {
  const rail = useHomeCatalogRail(DESKTOP_COUNT);

  return (
    <>
      <Layer x={242} y={4660} w={833} h={55} z={2}>
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {rail.copy.catalogTitle}
        </h2>
      </Layer>
      <div
        className="absolute left-[242px] top-[4735px] z-[2] flex h-[69px] items-center gap-5"
        role="tablist"
        aria-label={rail.catalogCopy.catalog.filterAria}
      >
        {rail.filters.map((chip) => (
          <HomeFilterChip
            key={chip.type}
            label={chip.label}
            selected={rail.selectedType === chip.type}
            onSelect={() => {
              if (isHomeFilter(chip.type)) rail.selectType(chip.type);
            }}
          />
        ))}
      </div>

      <Layer x={239} y={4844} w={1441} h={631} z={2}>
        {rail.loading ? (
          <div className="flex h-full gap-5" aria-busy="true">
            {Array.from({ length: DESKTOP_COUNT }, (_, i) => (
              <div key={i} className="h-full w-[467px] overflow-hidden rounded-[20px] bg-light-gray">
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        ) : rail.emptyCatalog || rail.failed ? (
          <RailMessage
            title={rail.failed ? rail.copy.errorTitle : rail.copy.emptyTitle}
            body={rail.failed ? rail.copy.errorBody : rail.copy.emptyBody}
            action={
              <Button href={rail.routes.catalog} className="mt-8 h-[60px] w-[309px] px-0">
                {rail.copy.emptyCta}
              </Button>
            }
          />
        ) : rail.emptyFilter ? (
          <div
            className={[
              "flex h-full gap-5 transition-[opacity,transform] duration-200 ease-out",
              rail.cardsVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            ].join(" ")}
          >
            {Array.from({ length: DESKTOP_COUNT }, (_, i) => (
              <div key={`empty-${rail.displayedType}-${i}`} className="h-full w-[467px] shrink-0">
                <EmptyRailCard
                  featured={i === 0}
                  title={rail.emptyFilterCopy[rail.displayedType].title}
                  body={rail.emptyFilterCopy[rail.displayedType].body}
                  cta={rail.copy.emptyFilterCta}
                  href={rail.routes.catalog}
                />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={[
              "flex h-full gap-5 transition-[opacity,transform] duration-200 ease-out",
              rail.cardsVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            ].join(" ")}
          >
            {rail.items.map((product) => (
              <div key={product.id} className="h-full w-[467px] shrink-0">
                <ProductCard
                  product={product}
                  onAdd={rail.onAdd}
                  adding={rail.pendingId === product.id}
                  inCart={rail.inCartIds.has(product.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Layer>
      <WholesaleModal open={rail.modalOpen} onClose={rail.closeModal} />
    </>
  );
}

export function HomeCatalogRailMobile() {
  const rail = useHomeCatalogRail(MOBILE_COUNT);
  const cardY = [4883, 5403, 5923] as const;

  return (
    <>
      <Layer x={20} y={4782} w={320} h={26} z={2}>
        <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
          {rail.copy.catalogTitle}
        </h2>
      </Layer>
      <div
        className="absolute left-5 top-[4828px] z-[2] flex h-[35px] w-[320px] items-center gap-[7px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={rail.catalogCopy.catalog.filterAria}
      >
        {rail.filters.map((chip) => (
          <HomeFilterChip
            key={chip.type}
            label={chip.label}
            selected={rail.selectedType === chip.type}
            onSelect={() => {
              if (isHomeFilter(chip.type)) rail.selectType(chip.type);
            }}
            compact
          />
        ))}
      </div>

      {rail.loading
        ? cardY.map((y) => (
            <Layer key={y} x={20} y={y} w={320} h={500} z={2} className="overflow-hidden rounded-[10px] bg-light-gray">
              <ProductCardSkeleton />
            </Layer>
          ))
        : rail.emptyCatalog || rail.failed
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
                {rail.failed ? rail.copy.errorTitle : rail.copy.emptyTitle}
              </p>
              <p className="mt-3 text-[13px] leading-[1.5] text-text/70">
                {rail.failed ? rail.copy.errorBody : rail.copy.emptyBody}
              </p>
              <Button href={rail.routes.catalog} className="mt-6 h-[50px] w-full px-0 text-[13px]">
                {rail.copy.emptyCta}
              </Button>
            </Layer>
            )
          : rail.emptyFilter
            ? cardY.map((y, i) => (
                <Layer
                  key={`empty-${rail.displayedType}-${y}`}
                  x={20}
                  y={y}
                  w={320}
                  h={500}
                  z={2}
                  className={[
                    "transition-[opacity,transform] duration-200 ease-out",
                    rail.cardsVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                  ].join(" ")}
                >
                  <EmptyRailCard
                    featured={i === 0}
                    compact
                    title={rail.emptyFilterCopy[rail.displayedType].title}
                    body={rail.emptyFilterCopy[rail.displayedType].body}
                    cta={rail.copy.emptyFilterCta}
                    href={rail.routes.catalog}
                  />
                </Layer>
              ))
            : rail.items.map((product, i) => (
                <Layer
                  key={`${rail.displayedType}-${product.id}`}
                  x={20}
                  y={cardY[i] ?? 4883}
                  w={320}
                  h={500}
                  z={2}
                  className={[
                    "transition-[opacity,transform] duration-200 ease-out",
                    rail.cardsVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                  ].join(" ")}
                >
                  <ProductCard
                    product={product}
                    onAdd={rail.onAdd}
                    adding={rail.pendingId === product.id}
                    inCart={rail.inCartIds.has(product.id)}
                  />
                </Layer>
              ))}

      {!rail.loading && !rail.emptyCatalog && !rail.failed ? (
        <Layer x={50} y={6443} w={259} h={50} z={3}>
          <Button
            href={catalogFilterHref(rail.selectedType, rail.locale)}
            className="h-[50px] w-[259px] px-0 text-[13px]"
          >
            {rail.copy.showMore}
          </Button>
        </Layer>
      ) : null}
      <WholesaleModal open={rail.modalOpen} onClose={rail.closeModal} />
    </>
  );
}

function EmptyRailCard({
  featured,
  title,
  body,
  cta,
  href,
  compact = false,
}: {
  featured: boolean;
  title: string;
  body: string;
  cta: string;
  href: string;
  compact?: boolean;
}) {
  return (
    <article
      className={[
        "flex h-full w-full flex-col overflow-hidden bg-light-gray",
        compact ? "rounded-[10px]" : "rounded-[20px]",
      ].join(" ")}
      aria-hidden={!featured}
      {...(featured ? { role: "status" as const } : {})}
    >
      <div
        aria-hidden
        className={
          compact
            ? "h-[180px] w-full shrink-0 border-b border-black/[0.04]"
            : "h-[263px] w-full shrink-0 border-b border-black/[0.04]"
        }
      />
      {featured ? (
        <div
          className={[
            "flex flex-1 flex-col justify-end",
            compact ? "p-[15px]" : "p-10",
          ].join(" ")}
        >
          <p
            className={
              compact
                ? "text-[16px] font-medium leading-[1.3] text-text"
                : "text-[24px] font-medium leading-[1.2] text-text"
            }
          >
            {title}
          </p>
          <p
            className={
              compact
                ? "mt-2.5 text-[13px] leading-[1.5] text-text/70"
                : "mt-4 max-w-[360px] text-[16px] leading-[1.5] text-text/70"
            }
          >
            {body}
          </p>
          <Button
            href={href}
            className={
              compact
                ? "mt-5 h-[50px] w-full px-0 text-[13px]"
                : "mt-8 h-[60px] w-[309px] px-0"
            }
          >
            {cta}
          </Button>
        </div>
      ) : (
        <div className="flex-1" />
      )}
    </article>
  );
}

function RailMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-start justify-center rounded-[20px] bg-light-gray p-10">
      <p className="text-[24px] font-medium leading-[1.2] text-text">{title}</p>
      <p className="mt-3 max-w-[640px] text-[16px] leading-[1.5] text-text/70">{body}</p>
      {action}
    </div>
  );
}
