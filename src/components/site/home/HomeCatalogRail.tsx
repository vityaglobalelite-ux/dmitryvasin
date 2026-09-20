"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ProductCard } from "@/components/site/catalog/ProductCard";
import { catalogFilterHref } from "@/components/site/catalog/display";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import { Layer } from "@/components/site/home/HomeFrame";
import { Button, siteFocusRing } from "@/components/site/ui/Button";
import { siteAssets } from "@/lib/catalog/assets";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { homeT } from "@/lib/catalog/home-copy";
import { isStorefrontListingProduct } from "@/lib/catalog/bundles";
import { useProducts } from "@/lib/catalog/hooks";
import { useCatalogT, useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";
import type { Product, ProductType } from "@/lib/catalog/types";

const DESKTOP_COUNT = 3;
const MOBILE_COUNT = 3;
const SWAP_MS = 180;
const MOBILE_RAIL_Y = 4883;
/** Figma: first card top (4883) → see-all bottom (6444+22). */
const MOBILE_RAIL_RESERVED_H = 6466 - MOBILE_RAIL_Y;

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
    () =>
      data
        .filter((product) => product.type === displayedType)
        .filter(isStorefrontListingProduct)
        .slice(0, count),
    [count, data, displayedType],
  );

  const failed = !loading && Boolean(error);
  const emptyCatalog = !loading && !error && data.length === 0;
  const emptyFilter = !loading && !error && data.length > 0 && items.length === 0;

  const onAdd = (product: Product) => {
    void addToCart.add(product.id);
  };

  const seeAllFilterLabel =
    filters.find((chip) => chip.type === selectedType)?.label ?? "";

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
    seeAllHref: catalogFilterHref(selectedType, locale),
    seeAllFilterLabel,
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

function CatalogSeeAll({
  href,
  label,
  filterLabel,
  compact = false,
}: {
  href: string;
  label: string;
  filterLabel: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={filterLabel ? `${label}, ${filterLabel}` : label}
      className={[
        "group inline-flex items-center whitespace-nowrap font-medium text-text",
        "rounded-[4px] py-3.5 -my-3.5 transition-opacity duration-200 ease-out hover:opacity-70",
        "motion-reduce:transition-none",
        siteFocusRing,
        compact ? "gap-2 text-[16px] leading-none" : "gap-3 text-[20px] leading-none",
      ].join(" ")}
    >
      {label}
      <img
        src={siteAssets.breadcrumb}
        alt=""
        width={19}
        height={7}
        aria-hidden
        className="h-[7px] w-[18px] shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </Link>
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
      <Layer
        x={1360}
        y={4660}
        w={320}
        h={55}
        z={3}
        className="flex items-end justify-end pb-[7px]"
      >
        <CatalogSeeAll
          href={rail.seeAllHref}
          label={rail.copy.seeAll}
          filterLabel={rail.seeAllFilterLabel}
        />
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
              rail.items.length < DESKTOP_COUNT ? "justify-center" : "",
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

export function HomeCatalogRailMobile({
  onRailShift,
}: {
  onRailShift?: (shift: number) => void;
}) {
  const rail = useHomeCatalogRail(MOBILE_COUNT);
  const stackRef = useRef<HTMLDivElement>(null);
  const showSeeAll = !rail.emptyCatalog && !rail.failed;

  useLayoutEffect(() => {
    if (!onRailShift) return;
    const el = stackRef.current;
    if (!el) return;
    const publish = () => {
      onRailShift(MOBILE_RAIL_RESERVED_H - el.offsetHeight);
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    onRailShift,
    rail.loading,
    rail.emptyCatalog,
    rail.failed,
    rail.emptyFilter,
    rail.items,
    rail.displayedType,
  ]);

  useLayoutEffect(() => {
    return () => onRailShift?.(0);
  }, [onRailShift]);

  let stack: ReactNode;
  if (rail.loading) {
    stack = Array.from({ length: MOBILE_COUNT }, (_, i) => (
      <div
        key={i}
        className="h-[500px] overflow-hidden rounded-[10px] bg-light-gray"
      >
        <ProductCardSkeleton />
      </div>
    ));
  } else if (rail.emptyCatalog || rail.failed) {
    stack = (
      <div className="flex min-h-[500px] flex-col items-start justify-center rounded-[10px] bg-light-gray p-5">
        <p className="text-[16px] font-medium leading-[1.3] text-text">
          {rail.failed ? rail.copy.errorTitle : rail.copy.emptyTitle}
        </p>
        <p className="mt-3 text-[13px] leading-[1.5] text-text/70">
          {rail.failed ? rail.copy.errorBody : rail.copy.emptyBody}
        </p>
        <Button href={rail.routes.catalog} className="mt-6 h-[50px] w-full px-0 text-[13px]">
          {rail.copy.emptyCta}
        </Button>
      </div>
    );
  } else if (rail.emptyFilter) {
    stack = Array.from({ length: MOBILE_COUNT }, (_, i) => (
      <div key={`empty-${rail.displayedType}-${i}`} className="h-[500px]">
        <EmptyRailCard
          featured={i === 0}
          compact
          title={rail.emptyFilterCopy[rail.displayedType].title}
          body={rail.emptyFilterCopy[rail.displayedType].body}
          cta={rail.copy.emptyFilterCta}
          href={rail.routes.catalog}
        />
      </div>
    ));
  } else {
    stack = rail.items.map((product) => (
      <ProductCard
        key={`${rail.displayedType}-${product.id}`}
        product={product}
        onAdd={rail.onAdd}
        adding={rail.pendingId === product.id}
        inCart={rail.inCartIds.has(product.id)}
      />
    ));
  }

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

      <Layer x={20} y={MOBILE_RAIL_Y} w={320} z={2}>
        <div
          ref={stackRef}
          className={[
            "flex flex-col gap-5 transition-[opacity,transform] duration-200 ease-out",
            rail.cardsVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          ].join(" ")}
        >
          {stack}
          {showSeeAll ? (
            <div className="flex h-[22px] items-center justify-end">
              <CatalogSeeAll
                href={rail.seeAllHref}
                label={rail.copy.seeAll}
                filterLabel={rail.seeAllFilterLabel}
                compact
              />
            </div>
          ) : null}
        </div>
      </Layer>
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
