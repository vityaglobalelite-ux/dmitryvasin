"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ProductCard } from "@/components/site/catalog/ProductCard";
import {
  catalogFilterHref,
  catalogFilterLabel,
  parseProductType,
} from "@/components/site/catalog/display";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import { Button } from "@/components/site/ui/Button";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { useProducts } from "@/lib/catalog/hooks";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { listPublishedProducts } from "@/lib/catalog/repo/products";
import { useAddToCart } from "@/lib/catalog/use-add-to-cart";
import type { Product, ProductType } from "@/lib/catalog/types";

const GRID_CLASS =
  "mt-10 grid grid-cols-1 items-stretch justify-items-center gap-5 min-[900px]:grid-cols-2 min-[1440px]:grid-cols-3";

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
  const products = useProducts(type ? { type } : {});
  const addToCart = useAddToCart();
  const [presentTypes, setPresentTypes] = useState<Set<ProductType>>(
    () => new Set(),
  );

  useEffect(() => {
    let cancelled = false;
    listPublishedProducts()
      .then((all) => {
        if (!cancelled) {
          setPresentTypes(new Set(all.map((product) => product.type)));
        }
      })
      .catch(() => {
        /* chips stay on the four base types until inventory arrives */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const extraTypes = useMemo(() => {
    const next = new Set(presentTypes);
    for (const product of products.data) next.add(product.type);
    if (type === "research" || type === "peek") next.add(type);
    return next;
  }, [presentTypes, products.data, type]);

  return (
    <>
      <CatalogFrame
        type={type}
        extraTypes={extraTypes}
        loading={products.loading}
        error={products.error}
        products={products.data}
        pendingId={addToCart.pendingId}
        onAdd={(product) => {
          void addToCart.add(product.id);
        }}
        onRetry={onRetry}
      />
      <WholesaleModal open={addToCart.modalOpen} onClose={addToCart.closeModal} />
    </>
  );
}

function CatalogFrame({
  type,
  extraTypes,
  loading = false,
  error = null,
  products = [],
  pendingId = null,
  onAdd,
  onRetry,
}: {
  type?: ProductType;
  extraTypes?: Set<ProductType>;
  loading?: boolean;
  error?: Error | null;
  products?: Product[];
  pendingId?: string | null;
  onAdd?: (product: Product) => void;
  onRetry?: () => void;
}) {
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] py-16 max-[600px]:px-5 max-[600px]:py-10">
      <h1 className="max-w-[833px] text-[50px] font-medium leading-[55px] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:leading-[1.1] max-[600px]:tracking-[-0.72px]">
        {copy.pages.catalog}
      </h1>
      <CatalogFilters type={type} extraTypes={extraTypes} />
      {loading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <CatalogMessage
          title={copy.catalog.errorTitle}
          body={copy.catalog.errorBody}
          action={
            <Button type="button" onClick={onRetry}>
              {copy.catalog.retry}
            </Button>
          }
        />
      ) : products.length === 0 ? (
        <CatalogMessage
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
      ) : (
        <div className={GRID_CLASS}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              adding={pendingId === product.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function CatalogFilters({
  type,
  extraTypes,
}: {
  type?: ProductType;
  extraTypes?: Set<ProductType>;
}) {
  const copy = useCatalogT();
  const locale = useLocale();
  const extras: ProductType[] = (["research", "peek"] as const).filter(
    (chip) => extraTypes?.has(chip) || type === chip,
  );
  const base: ProductType[] = ["lifehack", "lesson", "course", "extra"];

  return (
    <nav
      aria-label={copy.catalog.filterAria}
      className="mt-8 flex flex-wrap items-center gap-5 max-[600px]:mt-5 max-[600px]:gap-2.5"
    >
      <FilterChip href={catalogFilterHref(undefined, locale)} active={!type} label={copy.catalog.all} />
      {base.map((chip) => (
        <FilterChip
          key={chip}
          href={catalogFilterHref(chip, locale)}
          active={type === chip}
          label={catalogFilterLabel(chip, locale)}
        />
      ))}
      {extras.map((chip) => (
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
        "hover:brightness-105 active:scale-[0.98]",
        active
          ? "bg-[image:var(--brand-gradient)] text-white"
          : "border border-accent-orange text-accent-orange",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function CatalogMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <section className="mt-10 max-w-[640px] rounded-[20px] bg-light-gray px-8 py-10 max-[600px]:px-5 max-[600px]:py-8">
      <h2 className="text-[24px] font-medium leading-[1.2] text-text-dark max-[600px]:text-[20px]">
        {title}
      </h2>
      <p className="mt-3 text-[16px] leading-[1.5] text-text max-[600px]:text-[14px]">
        {body}
      </p>
      <div className="mt-8">{action}</div>
    </section>
  );
}
