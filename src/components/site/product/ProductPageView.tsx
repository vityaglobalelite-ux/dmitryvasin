"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useId, useMemo, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import {
  CatalogProductGrid,
  ProductCard,
} from "@/components/site/catalog/ProductCard";
import {
  catalogTypeLabel,
  formatAccessLabel,
  formatDurationClock,
  lessonNoun,
} from "@/components/site/catalog/display";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { Button } from "@/components/site/ui/Button";
import { productAssets } from "@/components/site/product/assets";
import {
  ProductHeroWash,
  ProductNotFound,
  ProductSkeleton,
} from "@/components/site/product/ProductStates";
import { SiteTrail } from "@/components/site/SiteTrail";
import { formatDuration, formatPriceMinor } from "@/lib/catalog/format";
import { useAuthUser, useProduct, useProducts } from "@/lib/catalog/hooks";
import { catalogT } from "@/lib/catalog/i18n";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import {
  isHomeHref,
  useCatalogReturnHref,
} from "@/lib/catalog/return-to";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";
import type { Locale, Product, ProductType } from "@/lib/catalog/types";

const SKILL_ICONS = [productAssets.brain, productAssets.foot] as const;

type LayoutKind = "course" | "lesson" | "peek";

function layoutOf(type: ProductType): LayoutKind {
  if (type === "course") return "course";
  if (type === "peek") return "peek";
  return "lesson";
}

function paramId(value: string | string[] | undefined): string | null {
  if (typeof value !== "string") return null;
  if (!value || value === CATALOG_STATIC_PARAM_STUB) return null;
  return value;
}

function formatClock(durationSec: number, locale: Locale): string {
  return formatDurationClock(durationSec, locale) ?? `0:00 ${catalogT(locale).product.durationMin}`;
}

function formatAccess(days: number, compact: boolean, locale: Locale): string {
  const t = catalogT(locale);
  if (days <= 0) return compact ? t.product.access : t.product.accessUnlimited;
  return formatAccessLabel(days, compact ? "overlay" : "chip", locale) ?? t.product.access;
}

function lessonLabel(count: number, locale: Locale): string {
  return `${count} ${lessonNoun(count, locale)}`;
}

function programLines(program: string | undefined): string[] {
  if (!program) return [];
  return program
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProductPageView() {
  const params = useParams<{ id: string }>();
  const id = paramId(params.id);
  const productQuery = useProduct(id);
  const auth = useAuthUser();

  if (!id) return <ProductNotFound />;
  if (productQuery.loading) return <ProductSkeleton />;
  if (productQuery.error || !productQuery.data) return <ProductNotFound />;

  return (
    <ProductLoaded
      key={productQuery.data.id}
      product={productQuery.data}
      authReady={!auth.loading}
    />
  );
}

function ProductLoaded({
  product,
  authReady,
}: {
  product: Product;
  authReady: boolean;
}) {
  const locale = useLocale();
  const copy = productCopy(product, locale);
  const layout = layoutOf(product.type);
  const descriptionId = useId();
  const programId = useId();
  const blurb = copy.short || copy.description;
  const program = programLines(copy.program);
  const showProgram = layout === "course" && (program.length > 0 || Boolean(product.lessonCount));
  const showDescription =
    layout === "peek"
      ? Boolean(copy.description)
      : layout !== "course" &&
        Boolean(copy.description) &&
        copy.description !== copy.short;
  const cart = useProductCart(product.id, authReady);

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-white">
      <WholesaleModal open={cart.modalOpen} onClose={cart.closeModal} />
      <ProductHeroWash />
      <article className="relative mx-auto w-full max-w-[1440px] px-[12.5%] pb-24 pt-16 max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
        <ProductHero
          product={product}
          title={copy.title}
          blurb={blurb}
          layout={layout}
          cart={cart}
          onScrollProgram={
            showProgram
              ? () => document.getElementById(programId)?.scrollIntoView({ behavior: "smooth", block: "start" })
              : undefined
          }
          onScrollDescription={
            showDescription
              ? () =>
                  document
                    .getElementById(descriptionId)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
              : undefined
          }
        />

        {showProgram ? (
          <ProductProgram
            id={programId}
            product={product}
            lines={program}
            cart={cart}
          />
        ) : null}

        {showDescription ? (
          <ProductDescription id={descriptionId} title={copy.title} body={copy.description} />
        ) : null}

        <RelatedProducts
          currentId={product.id}
          pendingId={cart.pendingId}
          onAdd={(item) => {
            void cart.add(item.id);
          }}
        />
      </article>
    </main>
  );
}

function ProductHero({
  product,
  title,
  blurb,
  layout,
  cart,
  onScrollProgram,
  onScrollDescription,
}: {
  product: Product;
  title: string;
  blurb: string;
  layout: LayoutKind;
  cart: ProductCart;
  onScrollProgram?: () => void;
  onScrollDescription?: () => void;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const typeIcon =
    product.type === "peek" ? productAssets.typePeek : productAssets.typeBadge;
  const secondary =
    layout === "course" && onScrollProgram
      ? { label: t.product.viewProgram, onClick: onScrollProgram }
      : layout === "peek" && onScrollDescription
        ? { label: t.product.viewDescription, onClick: onScrollDescription }
        : undefined;

  return (
    <div className="grid items-start gap-x-[8%] gap-y-10 min-[601px]:grid-cols-[minmax(0,588px)_minmax(0,710px)] min-[601px]:justify-between">
      <div className="flex flex-col gap-10 max-[600px]:gap-5">
        <ProductBackNav title={title} />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2.5 max-[600px]:gap-1.5">
            <MetaChip>
              <img
                src={typeIcon}
                alt=""
                width={25}
                height={25}
                className="size-[25px] rounded-full object-cover max-[600px]:size-4"
              />
              <span>{catalogTypeLabel(product.type, locale)}</span>
            </MetaChip>
            {layout === "course" && product.lessonCount ? (
              <MetaChip>
                <img
                  src={productAssets.video}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 max-[600px]:size-4"
                />
                <span>{lessonLabel(product.lessonCount, locale)}</span>
              </MetaChip>
            ) : null}
            {layout !== "course" && product.durationSec > 0 ? (
              <MetaChip>
                <img
                  src={productAssets.time}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 max-[600px]:size-4"
                />
                <span>{formatClock(product.durationSec, locale)}</span>
              </MetaChip>
            ) : null}
            {product.accessDays > 0 ? (
              <MetaChip>
                <img
                  src={productAssets.calendar}
                  alt=""
                  width={24}
                  height={24}
                  className="size-6 max-[600px]:size-4"
                />
                <span className="min-[601px]:hidden">
                  {formatAccess(product.accessDays, true, locale)}
                </span>
                <span className="max-[600px]:hidden">
                  {formatAccess(product.accessDays, false, locale)}
                </span>
              </MetaChip>
            ) : null}
          </div>

          <h1 className="text-[55px] font-medium leading-[1.1] tracking-[-1.65px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
            {layout === "course" ? <CourseTitle title={title} /> : title}
          </h1>

          {blurb ? (
            <p className="max-w-[577px] text-[16px] leading-[1.5] text-text max-[600px]:leading-[1.3]">
              {blurb}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative h-[564px] w-full overflow-hidden rounded-[20px] bg-light-gray max-[600px]:h-[180px] max-[600px]:rounded-[10px] min-[601px]:row-span-2">
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 600px) 320px, 710px"
            unoptimized
            priority
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-10 max-[600px]:gap-5">
        <div className="flex flex-col gap-2.5">
          {product.level ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-medium text-[#1a1a1a] max-[600px]:text-[10px]">
                {t.product.difficulty}
              </span>
              <img
                src={productAssets.stars}
                alt=""
                width={72}
                height={18}
                className="h-[18px] w-[72px] max-[600px]:h-3.5 max-[600px]:w-14"
              />
              <span className="text-[14px] font-medium text-[#1a1a1a]/70 max-[600px]:text-[10px]">
                {product.level}
              </span>
            </div>
          ) : null}
          {product.skills.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3.5 max-[600px]:gap-1">
              {product.skills.map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="inline-flex items-center gap-2.5 rounded-[10px] bg-white p-2.5 text-[14px] font-medium text-[#1a1a1a] max-[600px]:gap-1.5 max-[600px]:px-1.5 max-[600px]:py-1 max-[600px]:text-[10px]"
                >
                  <img
                    src={SKILL_ICONS[index % SKILL_ICONS.length]}
                    alt=""
                    width={20}
                    height={20}
                    className="size-5 max-[600px]:size-4"
                  />
                  {skill}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <BuyRow product={product} cart={cart} secondary={secondary} />
      </div>
    </div>
  );
}

function ProductBackNav({ title }: { title: string }) {
  const t = useCatalogT();
  const routes = useLocalizedRoutes();
  const backHref = useCatalogReturnHref(routes.catalog);
  const backDesktop = isHomeHref(backHref)
    ? t.product.backToHome
    : t.product.backToCatalog;

  return (
    <SiteTrail
      backHref={backHref}
      backDesktop={backDesktop}
      crumbs={[
        { href: routes.home, label: t.nav.home },
        { label: title },
      ]}
    />
  );
}

function CourseTitle({ title }: { title: string }) {
  const parts = title.trim().split(/\s+/);
  if (parts.length < 3) return title;
  const head = parts.slice(0, -3).join(" ");
  const tail = parts.slice(-3).join(" ");
  return (
    <>
      {head ? `${head} ` : null}
      <span className="bg-[image:var(--brand-gradient)] bg-clip-text font-bold text-transparent">
        {tail}
      </span>
    </>
  );
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-[45px] items-center gap-2.5 rounded-[30px] bg-light-gray px-5 text-[14px] font-medium text-[#1a1a1a] max-[600px]:h-6 max-[600px]:gap-1.5 max-[600px]:bg-white max-[600px]:px-2.5 max-[600px]:text-[10px]">
      {children}
    </span>
  );
}

type ProductCart = {
  added: boolean;
  pending: boolean;
  pendingId: string | null;
  ready: boolean;
  buy: () => Promise<void>;
  add: (productId: string) => Promise<void>;
  modalOpen: boolean;
  closeModal: () => void;
};

function useProductCart(
  productId: string,
  authReady: boolean,
): ProductCart {
  const addToCart = useAddToCart();
  const inCartIds = useCartProductIds();
  const added = inCartIds.has(productId);

  const add = useCallback(
    async (id: string) => {
      if (addToCart.pendingId || !authReady) return;
      await addToCart.add(id);
    },
    [addToCart, authReady],
  );

  const buy = useCallback(async () => {
    await add(productId);
  }, [add, productId]);

  return {
    added,
    pending: addToCart.pendingId === productId,
    pendingId: addToCart.pendingId,
    ready: authReady && addToCart.ready,
    buy,
    add,
    modalOpen: addToCart.modalOpen,
    closeModal: addToCart.closeModal,
  };
}

function BuyRow({
  product,
  cart,
  secondary,
  variant = "hero",
}: {
  product: Product;
  cart: ProductCart;
  secondary?: { label: string; onClick: () => void };
  variant?: "hero" | "bundle";
}) {
  const t = useCatalogT();
  const routes = useLocalizedRoutes();
  const label =
    variant === "bundle"
      ? cart.added
        ? t.product.inCart
        : t.product.buyCourse
      : cart.added
        ? t.product.inCart
        : t.product.addToCart;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-10 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5">
        {variant === "hero" ? (
          <div className="flex min-w-[118px] flex-col gap-2">
            <p className="text-[14px] font-semibold uppercase leading-[1.5] text-[rgba(37,37,37,0.6)] max-[600px]:text-[13px]">
              {t.product.cost}
            </p>
            <p className="bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent max-[600px]:text-[24px]">
              {formatPriceMinor(product.priceMinor, product.currency)}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-5 max-[600px]:gap-2.5">
          {cart.added ? (
            <Button
              href={routes.cart}
              className="gap-2.5 max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
            >
              {label}
              <img
                src={productAssets.checkWhite}
                alt=""
                width={17}
                height={17}
                className="size-[17px]"
              />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                void cart.buy();
              }}
              disabled={!cart.ready || cart.pending}
              className="gap-2.5 max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
            >
              {label}
              <img
                src={productAssets.cart}
                alt=""
                width={27}
                height={26}
                className="h-[26px] w-[27px] max-[600px]:h-4 max-[600px]:w-[17px]"
              />
            </Button>
          )}
          {secondary ? (
            <Button
              type="button"
              variant="secondary"
              onClick={secondary.onClick}
              className="max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
            >
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </div>
      <p aria-live="polite" className="min-h-[1.5em] text-[14px] leading-[1.5] text-text/70">
        {cart.added ? (
          <Link
            href={routes.cart}
            className="font-medium text-plum underline decoration-plum/30 underline-offset-4 transition-opacity hover:opacity-80"
          >
            {t.product.addedOpenCart}
          </Link>
        ) : null}
      </p>
    </div>
  );
}

function ProductProgram({
  id,
  product,
  lines,
  cart,
}: {
  id: string;
  product: Product;
  lines: string[];
  cart: ProductCart;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  return (
    <section id={id} className="mt-[100px] scroll-mt-24 max-[600px]:mt-10">
      <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {t.product.programTitle}
      </h2>
      <p className="mt-5 max-w-[702px] text-[24px] leading-[1.2] text-text max-[600px]:mt-2.5 max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {product.lessonCount ? lessonLabel(product.lessonCount, locale) : t.product.courseContents}
        {product.durationSec > 0 ? ` · ${formatDuration(product.durationSec, locale)}` : ""}
      </p>

      {lines.length > 0 ? (
        <div className="mt-10 rounded-[30px] bg-light-gray p-10 max-[600px]:mt-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red max-[600px]:text-[13px]">
            {t.product.lessons}
          </p>
          <ol className="mt-5 flex flex-col gap-0.5">
            {lines.map((line, index) => (
              <li
                key={`${index}-${line.slice(0, 24)}`}
                className="flex items-start gap-2.5 rounded-[10px] bg-white p-2.5 text-[16px] leading-normal text-text max-[600px]:text-[13px]"
              >
                <span className="mt-0.5 flex size-[17px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[12px] font-semibold text-white">
                  {index + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="mt-10 overflow-hidden rounded-[30px] bg-[image:var(--brand-gradient)] p-10 max-[600px]:mt-5 max-[600px]:rounded-[10px] max-[600px]:p-5">
        <div className="flex flex-wrap items-stretch justify-between gap-8">
          <div className="flex min-w-[240px] flex-1 flex-col justify-between gap-8">
            <h3 className="max-w-[485px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
              {t.product.buyBundle}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {product.lessonCount ? (
                <span className="inline-flex items-center gap-2.5 rounded-[30px] border border-white/50 px-[15px] py-2.5 text-[16px] text-white max-[600px]:text-[13px]">
                  <img
                    src={productAssets.checkWhite}
                    alt=""
                    width={17}
                    height={17}
                    className="size-[17px]"
                  />
                  {lessonLabel(product.lessonCount, locale)}
                </span>
              ) : null}
              {product.accessDays > 0 ? (
                <span className="inline-flex items-center gap-2.5 rounded-[30px] border border-white/50 px-[15px] py-2.5 text-[16px] text-white max-[600px]:text-[13px]">
                  <img
                    src={productAssets.checkWhite}
                    alt=""
                    width={17}
                    height={17}
                    className="size-[17px]"
                  />
                  {formatAccess(product.accessDays, false, locale).replace(
                    new RegExp(`^${t.product.access}:\\s`),
                    `${t.product.access} `,
                  )}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex w-full max-w-[405px] flex-col justify-between gap-6 rounded-[20px] bg-white p-5">
            <p className="bg-[image:var(--brand-gradient)] bg-clip-text text-[50px] font-bold leading-[1.2] text-transparent max-[600px]:text-[32px]">
              {formatPriceMinor(product.priceMinor, product.currency)}
            </p>
            <BuyRow product={product} cart={cart} variant="bundle" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductDescription({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  const t = useCatalogT();
  return (
    <section
      id={id}
      className="mt-[100px] scroll-mt-24 rounded-[30px] bg-light-gray p-10 max-[600px]:mt-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]"
    >
      <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {t.product.descriptionTitle}
      </h2>
      <p className="mt-8 whitespace-pre-wrap text-[16px] leading-[1.5] text-[#1a1a1a] max-[600px]:mt-5 max-[600px]:text-[13px]">
        {body}
      </p>
      <p className="sr-only">{title}</p>
    </section>
  );
}

function RelatedProducts({
  currentId,
  onAdd,
  pendingId = null,
}: {
  currentId: string;
  onAdd?: (product: Product) => void;
  pendingId?: string | null;
}) {
  const t = useCatalogT();
  const inCartIds = useCartProductIds();
  const { data, loading } = useProducts();
  const related = useMemo(
    () => data.filter((item) => item.id !== currentId).slice(0, 3),
    [currentId, data],
  );

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-[100px] max-[600px]:mt-10">
      <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {t.product.related}
      </h2>
      <CatalogProductGrid className="mt-10 max-[600px]:mt-5">
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onAdd={onAdd}
                adding={pendingId === item.id}
                inCart={inCartIds.has(item.id)}
              />
            ))}
      </CatalogProductGrid>
    </section>
  );
}
