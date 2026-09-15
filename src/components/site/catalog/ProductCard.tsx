"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { catalogCardAssets } from "@/components/site/catalog/assets";
import {
  catalogTypeLabel,
  formatAccessLabel,
  formatDurationClock,
  lessonNoun,
  parseDifficulty,
  skillIconSrc,
  typeBadgeIcon,
} from "@/components/site/catalog/display";
import { productAssets } from "@/components/site/product/assets";
import { Button } from "@/components/site/ui/Button";
import { CatalogPrice } from "@/components/site/ui/CatalogPrice";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import { rememberReturnTo } from "@/lib/catalog/return-to";
import type { Product } from "@/lib/catalog/types";

type ProductCardProps = {
  product: Product;
  onAdd?: (product: Product) => void;
  adding?: boolean;
  inCart?: boolean;
};

/** Column count follows the grid width, not the viewport — 3-up only when ~467px cards still fit. */
export function CatalogProductGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["@container", className].filter(Boolean).join(" ")}>
      <div className="grid grid-cols-1 items-stretch justify-items-center gap-5 @[640px]:grid-cols-2 @[1140px]:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

/**
 * Public product card. Wave 2B restyles 1:1 to Figma `677:819` / `676:510`.
 * Keep this export signature stable.
 */
export function ProductCard({
  product,
  onAdd,
  adding = false,
  inCart = false,
}: ProductCardProps) {
  const routes = useLocalizedRoutes();
  const href = routes.product(product.id);
  const compact = product.type === "research";

  return (
    <article
      className="@container group flex h-full w-full min-w-0 max-w-[467px] flex-col overflow-hidden rounded-[20px] bg-light-gray transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(76,13,50,0.08)] max-[600px]:rounded-[10px]"
      onClick={rememberReturnTo}
    >
      {compact ? (
        <CompactBody
          product={product}
          href={href}
          onAdd={onAdd}
          adding={adding}
          inCart={inCart}
        />
      ) : (
        <CoverBody
          product={product}
          href={href}
          onAdd={onAdd}
          adding={adding}
          inCart={inCart}
        />
      )}
    </article>
  );
}

function CoverBody({
  product,
  href,
  onAdd,
  adding,
  inCart,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
  adding: boolean;
  inCart: boolean;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const copy = productCopy(product, locale);
  const coverAlt = copy.title || t.pages.product;
  const duration =
    product.type === "course" && product.lessonCount
      ? `${product.lessonCount} ${lessonNoun(product.lessonCount, locale)}`
      : formatDurationClock(product.durationSec, locale);
  const access = formatAccessLabel(product.accessDays, "overlay", locale);

  return (
    <>
      <Link href={href} className="relative block h-[263px] shrink-0 overflow-hidden rounded-[20px] bg-light-gray max-[600px]:h-[180px] max-[600px]:rounded-[10px]">
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={coverAlt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 600px) 320px, 467px"
            loading="lazy"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap gap-[9px] p-[10px] max-[600px]:gap-1.5 max-[600px]:p-2">
          <TypeBadge type={product.type} />
          {duration ? <OverlayChip>{duration}</OverlayChip> : null}
          {access ? <OverlayChip dim>{access}</OverlayChip> : null}
        </div>
      </Link>
      <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 max-[600px]:p-[15px]">
        <MetaRow product={product} />
        <Link href={href} className="flex min-h-0 flex-1 flex-col gap-2.5">
          <h2 className="line-clamp-2 min-h-[calc(1.2em*2)] overflow-hidden break-words text-[24px] font-medium leading-[1.2] text-black transition-opacity duration-150 group-hover:opacity-90 max-[600px]:min-h-[calc(1.3em*2)] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copy.title}
          </h2>
          <p className="line-clamp-5 min-h-[calc(1.5em*5)] overflow-hidden break-words text-[16px] leading-[1.5] text-text max-[600px]:min-h-[calc(20px*5)] max-[600px]:text-[13px] max-[600px]:leading-5">
            {copy.short}
          </p>
        </Link>
        <PriceRow
          product={product}
          href={href}
          onAdd={onAdd}
          adding={adding}
          inCart={inCart}
        />
      </div>
    </>
  );
}

function CompactBody({
  product,
  href,
  onAdd,
  adding,
  inCart,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
  adding: boolean;
  inCart: boolean;
}) {
  const locale = useLocale();
  const t = useCatalogT();
  const copy = productCopy(product, locale);
  const coverAlt = copy.title || t.pages.product;
  const access = formatAccessLabel(product.accessDays, "chip", locale);

  return (
    <div className="flex flex-1 flex-col gap-5 p-5 max-[600px]:gap-3 max-[600px]:p-[15px]">
      <div className="flex flex-wrap items-center gap-[9px]">
        <TypeBadge type={product.type} />
        {access ? (
          <span className="inline-flex h-[34px] items-center justify-center rounded-[20px] bg-white px-2.5 text-[12px] font-medium leading-[1.2] text-black">
            {access}
          </span>
        ) : null}
      </div>
      <Link href={href} className="flex items-start gap-5">
        <span
          className="flex size-[60px] shrink-0 items-center justify-center overflow-hidden rounded-[30px] border border-accent-red bg-[image:var(--brand-gradient)]"
        >
          {product.coverUrl ? (
            <img
              src={product.coverUrl}
              alt={coverAlt}
              width={60}
              height={60}
              loading="lazy"
              decoding="async"
              className="size-[60px] object-cover"
            />
          ) : null}
        </span>
        <h2 className="min-h-[calc(1.2em*2)] min-w-0 flex-1 line-clamp-2 overflow-hidden break-words text-[24px] font-medium leading-[1.2] text-text-dark max-[600px]:min-h-[calc(1.3em*2)] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
          {copy.title}
        </h2>
      </Link>
      <p className="line-clamp-5 min-h-[calc(1.5em*5)] overflow-hidden break-words text-[16px] leading-[1.5] text-text-dark max-[600px]:min-h-[calc(20px*5)] max-[600px]:text-[13px] max-[600px]:leading-5">
        {copy.short}
      </p>
      <MetaRow product={product} />
      <PriceRow
        product={product}
        href={href}
        onAdd={onAdd}
        adding={adding}
        inCart={inCart}
      />
    </div>
  );
}

function TypeBadge({ type }: { type: Product["type"] }) {
  const locale = useLocale();
  const icon = typeBadgeIcon(type);
  return (
    <span className="inline-flex h-[34px] items-center gap-1.5 rounded-[30px] bg-white p-2.5">
      {icon ? (
        <img
          src={icon}
          alt=""
          width={25}
          height={25}
          className="size-[25px] object-cover"
        />
      ) : null}
      <span className="text-[12px] font-medium leading-normal text-text-dark">
        {catalogTypeLabel(type, locale)}
      </span>
    </span>
  );
}

function OverlayChip({
  children,
  dim = false,
}: {
  children: string;
  dim?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex h-[34px] items-center justify-center rounded-[20px] px-2.5 text-[12px] font-medium leading-[1.2] text-white backdrop-blur-[12px]",
        dim
          ? "border border-white/50 bg-black/20"
          : "border border-white/60 bg-black/20",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function MetaRow({ product }: { product: Product }) {
  const t = useCatalogT();
  const skills = product.skills.filter(Boolean).slice(0, 2);
  const difficulty = parseDifficulty(product.level);

  return (
    <div className="flex w-full items-center gap-3.5 max-[600px]:gap-1.5">
      {skills.map((skill) => {
        const icon = skillIconSrc(skill);
        return (
          <span
            key={skill}
            title={skill}
            className="inline-flex min-w-0 items-center gap-1.5 rounded-[10px] bg-white p-2.5 max-[600px]:h-6 max-[600px]:gap-1 max-[600px]:rounded-[6px] max-[600px]:px-1.5 max-[600px]:py-1"
          >
            {icon ? (
              <img src={icon} alt="" width={20} height={20} className="size-5 shrink-0 max-[600px]:size-4" />
            ) : null}
            <span className="min-w-0 truncate text-[14px] font-medium leading-normal text-text-dark max-[600px]:text-[13px]">
              {skill}
            </span>
          </span>
        );
      })}
      <span className="inline-flex shrink-0 items-center gap-1.5 max-[600px]:gap-1">
        <span className="text-[14px] font-medium leading-normal text-text-dark max-[600px]:text-[13px]">
          {t.catalog.difficulty}
        </span>
        <img
          src={catalogCardAssets.difficulty[difficulty]}
          alt=""
          width={72}
          height={18}
          className="h-[18px] w-[72px] max-[600px]:h-3.5 max-[600px]:w-14"
        />
      </span>
    </div>
  );
}

function PriceRow({
  product,
  href,
  onAdd,
  adding,
  inCart,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
  adding: boolean;
  inCart: boolean;
}) {
  const t = useCatalogT();
  return (
    <div className="mt-auto flex flex-nowrap items-end justify-between gap-2.5">
      <div className="flex w-max max-w-full shrink-0 flex-col gap-[3px]">
        <p className="text-[14px] font-semibold uppercase leading-[1.5] text-text/60">
          {t.catalog.cost}
        </p>
        <p className="w-max whitespace-nowrap bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent @max-[466px]:text-[22px] max-[600px]:text-[22px]">
          <CatalogPrice product={product} />
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5 @max-[466px]:gap-2 max-[600px]:gap-2">
        <Button
          href={href}
          variant="secondary"
          className="shrink-0 @max-[466px]:h-[50px] @max-[466px]:px-4 @max-[466px]:text-[13px] max-[600px]:h-[50px] max-[600px]:px-4 max-[600px]:text-[13px]"
        >
          {t.catalog.details}
        </Button>
        <CartButton product={product} onAdd={onAdd} adding={adding} inCart={inCart} />
      </div>
    </div>
  );
}

function CartButton({
  product,
  onAdd,
  adding,
  inCart,
}: {
  product: Product;
  onAdd?: (product: Product) => void;
  adding: boolean;
  inCart: boolean;
}) {
  const t = useCatalogT();
  const routes = useLocalizedRoutes();
  const frame =
    "size-[60px] shrink-0 rounded-full transition-[transform,opacity] duration-200 ease-out hover:scale-105 active:scale-95 @max-[466px]:size-[50px] max-[600px]:size-[50px]";

  if (inCart) {
    return (
      <Link
        href={routes.cart}
        aria-label={t.product.inCart}
        className={`${frame} grid place-items-center bg-[image:var(--brand-gradient)]`}
      >
        <img
          src={productAssets.checkWhite}
          alt=""
          width={17}
          height={17}
          className="size-[17px]"
        />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAdd?.(product)}
      disabled={!onAdd || adding}
      aria-label={t.catalog.addToCart}
      aria-busy={adding}
      className={`${frame} disabled:pointer-events-none disabled:opacity-50`}
    >
      <img
        src={catalogCardAssets.cartAdd}
        alt=""
        width={60}
        height={60}
        className="size-[60px] @max-[466px]:size-[50px] max-[600px]:size-[50px]"
      />
    </button>
  );
}
