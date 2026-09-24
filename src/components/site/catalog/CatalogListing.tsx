"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CatalogEmpty } from "@/components/site/catalog/CatalogEmpty";
import {
  CatalogProductGrid,
  ProductCard,
} from "@/components/site/catalog/ProductCard";
import {
  CATALOG_FILTERS,
  catalogFilterHref,
  catalogFilterLabel,
  parseProductType,
} from "@/components/site/catalog/display";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import { Button, siteFocusRing } from "@/components/site/ui/Button";
import { SiteTrail } from "@/components/site/SiteTrail";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { useProducts } from "@/lib/catalog/hooks";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";
import { isStorefrontListingProduct } from "@/lib/catalog/bundles";
import type { Product, ProductType } from "@/lib/catalog/types";

const SKELETON_COUNT = 6;

export function CatalogListing() {
  return (
    <Suspense fallback={<CatalogFrame loading />}>
      <CatalogListingGate />
    </Suspense>
  );
}

function CatalogListingGate() {
  const [retryKey, setRetryKey] = useState(0);
  return (
    <CatalogQuery key={retryKey} onRetry={() => setRetryKey((key) => key + 1)} />
  );
}

function CatalogQuery({ onRetry }: { onRetry: () => void }) {
  const searchParams = useSearchParams();
  const type = parseProductType(searchParams.get("type"));
  const locale = useLocale();
  const products = useProducts({ type, locale });
  const addToCart = useAddToCart();
  const inCartIds = useCartProductIds();
  const listing = useMemo(
    () => products.data.filter(isStorefrontListingProduct),
    [products.data],
  );

  return (
    <>
      <CatalogFrame
        type={type}
        loading={products.loading}
        error={products.error}
        products={listing}
        pendingId={addToCart.pendingId}
        inCartIds={inCartIds}
        onAdd={(product) => {
          void addToCart.add(product);
        }}
        onRetry={onRetry}
      />
      <WholesaleModal open={addToCart.modalOpen} onClose={addToCart.closeModal} />
    </>
  );
}

function CatalogFrame({
  type,
  loading = false,
  error = null,
  products = [],
  pendingId = null,
  inCartIds,
  onAdd,
  onRetry,
}: {
  type?: ProductType;
  loading?: boolean;
  error?: Error | null;
  products?: Product[];
  pendingId?: string | null;
  inCartIds?: ReadonlySet<string>;
  onAdd?: (product: Product) => void;
  onRetry?: () => void;
}) {
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] py-16 max-[600px]:px-5 max-[600px]:py-10">
      <header className="flex flex-col gap-10 max-[600px]:gap-5">
        <SiteTrail
          crumbs={[
            { href: routes.home, label: copy.nav.home },
            { label: copy.nav.catalog },
          ]}
        />
        <h1 className="max-w-[833px] text-[50px] font-medium leading-[55px] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:leading-[1.1] max-[600px]:tracking-[-0.72px]">
          {copy.pages.catalog}
        </h1>
      </header>
      <CatalogFilters type={type} />
      {loading ? (
        <CatalogProductGrid className="mt-10">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </CatalogProductGrid>
      ) : error ? (
        <CatalogEmpty
          title={copy.catalog.errorTitle}
          body={copy.catalog.errorBody}
          action={
            <Button type="button" onClick={onRetry}>
              {copy.catalog.retry}
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <CatalogEmptyState type={type} />
      ) : (
        <CatalogProductGrid className="mt-10">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              adding={pendingId === product.id}
              inCart={inCartIds?.has(product.id)}
            />
          ))}
        </CatalogProductGrid>
      )}
    </main>
  );
}

function CatalogEmptyState({ type }: { type?: ProductType }) {
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  const locale = useLocale();

  if (type === "lifehack") {
    return (
      <CatalogEmpty
        kicker={catalogFilterLabel("lifehack", locale)}
        title={copy.catalog.emptyLifehackTitle}
        body={copy.catalog.emptyLifehackBody}
        action={
          <Button href={routes.catalog} variant="secondary">
            {copy.catalog.allProducts}
          </Button>
        }
      />
    );
  }

  if (type === "lesson") {
    return (
      <CatalogEmpty
        kicker={catalogFilterLabel("lesson", locale)}
        title={copy.catalog.emptyLessonTitle}
        body={copy.catalog.emptyLessonBody}
        action={
          <Button href={routes.catalog} variant="secondary">
            {copy.catalog.allProducts}
          </Button>
        }
      />
    );
  }

  return (
    <CatalogEmpty
      kicker={type ? catalogFilterLabel(type, locale) : undefined}
      title={type ? copy.catalog.emptyFilterTitle : copy.catalog.emptyTitle}
      body={type ? copy.catalog.emptyFilterBody : copy.catalog.emptyBody}
      action={
        type ? (
          <Button href={routes.catalog} variant="secondary">
            {copy.catalog.allProducts}
          </Button>
        ) : (
          <Button href={routes.home} variant="secondary">
            {copy.catalog.toHome}
          </Button>
        )
      }
    />
  );
}

function CatalogFilters({ type }: { type?: ProductType }) {
  const copy = useCatalogT();
  const locale = useLocale();

  return (
    <nav
      aria-label={copy.catalog.filterAria}
      className="mt-8 flex flex-wrap items-center gap-5 max-[600px]:mt-5 max-[600px]:gap-2.5"
    >
      <FilterChip href={catalogFilterHref(undefined, locale)} active={!type} label={copy.catalog.all} />
      {CATALOG_FILTERS.map((chip) => (
        <FilterChip
          key={chip}
          href={catalogFilterHref(chip, locale)}
          active={type === chip}
          label={catalogFilterLabel(chip, locale)}
        />
      ))}
    </nav>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={[
        "inline-flex items-center justify-center rounded-[40px] px-10 py-5 text-[24px] font-medium leading-[1.2] transition-[filter,transform] duration-200 ease-out max-[600px]:rounded-[30px] max-[600px]:px-5 max-[600px]:py-3 max-[600px]:text-[16px]",
        "hover:brightness-105 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
        siteFocusRing,
        active
          ? "bg-[image:var(--brand-gradient)] text-white"
          : "border border-accent-orange text-accent-orange",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
