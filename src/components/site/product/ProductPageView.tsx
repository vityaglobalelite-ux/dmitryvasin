"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "next/navigation";
import { WholesaleModal } from "@/components/site/cart/WholesaleModal";
import {
  CatalogProductGrid,
  ProductCard,
} from "@/components/site/catalog/ProductCard";
import { catalogCardAssets } from "@/components/site/catalog/assets";
import {
  catalogTypeLabel,
  formatAccessLabel,
  formatDurationClock,
  lessonNoun,
  parseDifficulty,
} from "@/components/site/catalog/display";
import { ProductCardSkeleton } from "@/components/site/ui/Skeleton";
import { Button } from "@/components/site/ui/Button";
import { CatalogPrice } from "@/components/site/ui/CatalogPrice";
import { CoverStage } from "@/components/site/product/CoverStage";
import { formatPeekUnlockDate, productUi } from "@/components/site/product/copy";
import { productAssets } from "@/components/site/product/assets";
import { ProductProof } from "@/components/site/product/ProductProof";
import {
  hasShopPrice,
  ProductProgram,
  type ProductCartApi,
} from "@/components/site/product/ProductProgram";
import {
  ProductHeroWash,
  ProductNotFound,
  ProductSkeleton,
} from "@/components/site/product/ProductStates";
import { SiteTrail } from "@/components/site/SiteTrail";
import { isPeekWatchable } from "@/lib/catalog/access";
import {
  POSTURE_COURSE_BLOCK1_ID,
  POSTURE_COURSE_BLOCK2_ID,
} from "@/lib/catalog/ids";
import { useAuthUser, useProduct, useProducts } from "@/lib/catalog/hooks";
import { catalogT } from "@/lib/catalog/i18n";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { getPublishedProduct } from "@/lib/catalog/repo/products";
import { scrollWindowToTop } from "@/lib/catalog/scroll-top";
import { SKILL_LABELS, type SkillKey } from "@/lib/catalog/skills";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import {
  isHomeHref,
  useCatalogReturnHref,
} from "@/lib/catalog/return-to";
import { useAddToCart, useCartProductIds } from "@/lib/catalog/use-add-to-cart";
import type { Locale, Product, ProductType } from "@/lib/catalog/types";

const SKILL_ICON: Record<SkillKey, string> = {
  awareness: catalogCardAssets.skillAwareness,
  technique: catalogCardAssets.skillTechnique,
  variability: catalogCardAssets.skillVariability,
  interaction: catalogCardAssets.skillInteraction,
  musicality: catalogCardAssets.skillMusicality,
};

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

function coverList(product: Product): string[] {
  if (product.coverUrls.length > 0) return product.coverUrls;
  if (product.coverUrl) return [product.coverUrl];
  return [];
}

function siblingBlockId(productId: string): string | null {
  if (productId === POSTURE_COURSE_BLOCK1_ID) return POSTURE_COURSE_BLOCK2_ID;
  if (productId === POSTURE_COURSE_BLOCK2_ID) return POSTURE_COURSE_BLOCK1_ID;
  return null;
}

export function ProductPageView() {
  const params = useParams<{ id: string }>();
  const id = paramId(params.id);
  const locale = useLocale();
  const productQuery = useProduct(id, locale);
  const auth = useAuthUser();

  useLayoutEffect(() => {
    if (!id) return;
    scrollWindowToTop();
  }, [id, productQuery.loading]);

  if (!id) return <ProductNotFound />;
  if (productQuery.loading) return <ProductSkeleton />;
  if (productQuery.error || !productQuery.data) return <ProductNotFound />;

  return (
    <ProductLoaded
      key={`${productQuery.data.id}-${locale}`}
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
  const blurb =
    layout === "peek" ? copy.short : copy.short || copy.description;
  const peekWatchable = isPeekWatchable(product);
  const peekLocked = layout === "peek" && !peekWatchable;
  const unlockDate =
    peekLocked && product.availableAt
      ? formatPeekUnlockDate(product.availableAt, locale)
      : "";
  const showProgram = layout === "course";
  const showDescription =
    layout === "course"
      ? false
      : Boolean(copy.description) &&
        (layout === "peek" || copy.description !== copy.short);
  const cart = useProductCart(authReady);
  const neighbors = useBundleNeighbors(product, locale);
  const routes = useLocalizedRoutes();
  const parentHref =
    layout === "course" && neighbors.parent
      ? routes.product(neighbors.parent.id)
      : undefined;

  return (
    <main className="relative flex flex-1 flex-col overflow-x-clip bg-white [overflow-anchor:none]">
      <WholesaleModal open={cart.modalOpen} onClose={cart.closeModal} />
      <div className="relative">
        <ProductHeroWash />
        <div className="relative w-full px-[12.5%] pb-8 pt-16 max-[600px]:px-5 max-[600px]:pb-6 max-[600px]:pt-6">
          <ProductHero
            product={product}
            title={copy.title}
            blurb={blurb}
            layout={layout}
            cart={cart}
            peekLocked={peekLocked}
            unlockDate={unlockDate}
            parentHref={parentHref}
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
        </div>
      </div>
      <article className="relative w-full px-[12.5%] pb-0 max-[600px]:px-5">
        {showProgram ? (
          <ProductProgram
            id={programId}
            product={product}
            cart={cart}
            parent={neighbors.parent}
            children={neighbors.children}
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
      <ProductProof />
    </main>
  );
}

function ProductHero({
  product,
  title,
  blurb,
  layout,
  cart,
  peekLocked,
  unlockDate,
  parentHref,
  onScrollProgram,
  onScrollDescription,
}: {
  product: Product;
  title: string;
  blurb: string;
  layout: LayoutKind;
  cart: ProductCart;
  peekLocked: boolean;
  unlockDate: string;
  parentHref?: string;
  onScrollProgram?: () => void;
  onScrollDescription?: () => void;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const ui = productUi(locale);
  const typeIcon =
    product.type === "peek" ? productAssets.typePeek : productAssets.typeBadge;
  const secondary = parentHref
    ? { label: ui.viewFullCourse, href: parentHref }
    : layout === "course" && onScrollProgram
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

          {product.skills.length > 0 || product.level ? (
            <div className="flex flex-wrap items-center gap-3.5 max-[600px]:gap-1">
              {product.skills.map((skill) => (
                <SkillChip key={skill} skill={skill} locale={locale} />
              ))}
              {product.level ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[14px] font-medium text-[#1a1a1a] max-[600px]:text-[10px]">
                    {t.product.difficulty}
                  </span>
                  <img
                    src={catalogCardAssets.difficulty[parseDifficulty(product.level)]}
                    alt=""
                    width={72}
                    height={18}
                    className="h-[18px] w-[72px] max-[600px]:h-3.5 max-[600px]:w-14"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <CoverStage
        urls={coverList(product)}
        alt={title}
        locked={peekLocked}
        unlockDate={unlockDate}
      />

      <div className="flex flex-col gap-10 max-[600px]:gap-5">
        <BuyRow product={product} cart={cart} secondary={secondary} />
        {peekLocked && unlockDate ? (
          <p className="text-[14px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {ui.peekOpensNote.split("{date}")[0]}
            <strong className="font-bold text-text">{unlockDate}</strong>
            {ui.peekOpensNote.split("{date}")[1]}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SkillChip({ skill, locale }: { skill: SkillKey; locale: Locale }) {
  const label = SKILL_LABELS[locale][skill];
  const icon = SKILL_ICON[skill];
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-2.5 rounded-[10px] bg-white p-2.5 text-[14px] font-medium text-[#1a1a1a] max-[600px]:gap-1.5 max-[600px]:px-1.5 max-[600px]:py-1 max-[600px]:text-[10px]">
      {icon ? (
        <img
          src={icon}
          alt=""
          width={20}
          height={20}
          className="size-5 max-[600px]:size-4"
        />
      ) : null}
      {label}
    </span>
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
  const accent = title.match(/^(.*?)((?:без|without)\s+\S.*)$/i);
  if (accent && accent[1].trim()) {
    return (
      <>
        {accent[1]}
        <span className="bg-[image:var(--brand-gradient)] bg-clip-text font-bold text-transparent">
          {accent[2]}
        </span>
      </>
    );
  }
  const parts = title.trim().split(/\s+/);
  if (parts.length <= 4) return title;
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

type ProductCart = ProductCartApi & {
  pendingId: string | null;
  modalOpen: boolean;
  closeModal: () => void;
};

function useProductCart(authReady: boolean): ProductCart {
  const addToCart = useAddToCart();
  const inCartIds = useCartProductIds();

  const add = useCallback(
    async (id: string) => {
      if (addToCart.pendingId || !authReady) return;
      await addToCart.add(id);
    },
    [addToCart, authReady],
  );

  const isAdded = useCallback(
    (id: string) => inCartIds.has(id),
    [inCartIds],
  );

  const pendingFor = useCallback(
    (id: string) => addToCart.pendingId === id,
    [addToCart.pendingId],
  );

  return {
    add,
    isAdded,
    pendingFor,
    pendingId: addToCart.pendingId,
    ready: authReady && addToCart.ready,
    modalOpen: addToCart.modalOpen,
    closeModal: addToCart.closeModal,
  };
}

function useBundleNeighbors(product: Product, locale: Locale) {
  const [parent, setParent] = useState<Product | null>(null);
  const [children, setChildren] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;
    const sibling = siblingBlockId(product.id);
    const childIds = product.bundleChildIds;
    const ids = [
      product.bundleParentId,
      ...childIds,
      sibling,
    ].filter((id): id is string => Boolean(id) && id !== product.id);

    if (ids.length === 0) {
      setParent(null);
      setChildren([]);
      return;
    }

    void Promise.all(ids.map((id) => getPublishedProduct(id, locale))).then(
      (rows) => {
        if (cancelled) return;
        const byId = new Map(
          rows.filter((row): row is Product => Boolean(row)).map((row) => [row.id, row]),
        );
        setParent(product.bundleParentId ? byId.get(product.bundleParentId) ?? null : null);
        const childRows = childIds
          .map((id) => byId.get(id))
          .filter((row): row is Product => Boolean(row));
        if (sibling) {
          const extra = byId.get(sibling);
          if (extra && !childRows.some((row) => row.id === extra.id)) {
            childRows.push(extra);
          }
        }
        setChildren(childRows);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [locale, product.bundleChildIds, product.bundleParentId, product.id]);

  return { parent, children };
}

function BuyRow({
  product,
  cart,
  secondary,
}: {
  product: Product;
  cart: ProductCart;
  secondary?: { label: string; onClick?: () => void; href?: string };
}) {
  const t = useCatalogT();
  const routes = useLocalizedRoutes();
  const ui = productUi(useLocale());
  const priced = hasShopPrice(product);
  const added = cart.isAdded(product.id);
  const pending = cart.pendingFor(product.id);
  const label = added ? t.product.inCart : t.product.addToCart;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-10 max-[600px]:flex-col max-[600px]:items-start max-[600px]:gap-5">
        {priced ? (
          <div className="flex min-w-[118px] flex-col gap-2">
            <p className="text-[14px] font-semibold uppercase leading-[1.5] text-[rgba(37,37,37,0.6)] max-[600px]:text-[13px]">
              {t.product.cost}
            </p>
            <div className="bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent max-[600px]:text-[24px]">
              <CatalogPrice product={product} />
            </div>
          </div>
        ) : (
          <p className="text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {ui.priceLater}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-5 max-[600px]:gap-2.5">
          {priced ? (
            added ? (
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
                  void cart.add(product.id);
                }}
                disabled={!cart.ready || pending}
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
            )
          ) : null}
          {secondary?.href ? (
            <Button
              href={secondary.href}
              variant="secondary"
              className="max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
            >
              {secondary.label}
            </Button>
          ) : secondary?.onClick ? (
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
        {priced && added ? (
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
  const locale = useLocale();
  const inCartIds = useCartProductIds();
  const { data, loading } = useProducts({ locale });
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
