"use client";

import Image from "next/image";
import Link from "next/link";
import { catalogCardAssets } from "@/components/site/catalog/assets";
import {
  catalogTypeLabel,
  formatAccessLabel,
  formatCatalogPrice,
  formatDurationClock,
  lessonNoun,
  parseDifficulty,
  skillIconSrc,
  typeBadgeIcon,
} from "@/components/site/catalog/display";
import { Button } from "@/components/site/ui/Button";
import { productCopy } from "@/lib/catalog/locale";
import {
  useCatalogT,
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import type { Product } from "@/lib/catalog/types";

type ProductCardProps = {
  product: Product;
  onAdd?: (product: Product) => void;
};

/**
 * Public product card. Wave 2B restyles 1:1 to Figma `677:819` / `676:510`.
 * Keep this export signature stable.
 */
export function ProductCard({ product, onAdd }: ProductCardProps) {
  const routes = useLocalizedRoutes();
  const href = routes.product(product.id);
  const compact = product.type === "research";

  return (
    <article className="group flex w-full max-w-[467px] flex-col overflow-hidden rounded-[20px] bg-light-gray transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(76,13,50,0.08)]">
      {compact ? (
        <CompactBody product={product} href={href} onAdd={onAdd} />
      ) : (
        <CoverBody product={product} href={href} onAdd={onAdd} />
      )}
    </article>
  );
}

function CoverBody({
  product,
  href,
  onAdd,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
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
      <Link href={href} className="relative block h-[263px] overflow-hidden rounded-[20px] bg-light-gray max-[600px]:h-[180px]">
        {product.coverUrl ? (
          <Image
            src={product.coverUrl}
            alt={coverAlt}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 600px) 320px, 467px"
            unoptimized
          />
        ) : null}
        <div className="absolute inset-x-0 top-0 z-10 flex flex-wrap gap-[9px] p-[10px] max-[600px]:gap-1.5 max-[600px]:p-2">
          <TypeBadge type={product.type} />
          {duration ? <OverlayChip>{duration}</OverlayChip> : null}
          {access ? <OverlayChip dim>{access}</OverlayChip> : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-5 p-5 max-[600px]:gap-3 max-[600px]:p-[15px]">
        <MetaRow product={product} />
        <Link href={href} className="flex flex-col gap-2.5">
          <h2 className="text-[24px] font-medium leading-[1.2] text-black transition-opacity duration-150 group-hover:opacity-90 max-[600px]:text-[20px]">
            {copy.title}
          </h2>
          {copy.short ? (
            <p className="line-clamp-3 text-[16px] leading-[1.5] text-text max-[600px]:text-[14px]">
              {copy.short}
            </p>
          ) : null}
        </Link>
        <PriceRow product={product} href={href} onAdd={onAdd} />
      </div>
    </>
  );
}

function CompactBody({
  product,
  href,
  onAdd,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
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
              className="size-full object-cover"
            />
          ) : null}
        </span>
        <h2 className="min-w-0 flex-1 text-[24px] font-medium leading-[1.2] text-text-dark max-[600px]:text-[20px]">
          {copy.title}
        </h2>
      </Link>
      {copy.short ? (
        <Link href={href}>
          <p className="line-clamp-4 text-[16px] leading-[1.5] text-text-dark max-[600px]:text-[14px]">
            {copy.short}
          </p>
        </Link>
      ) : null}
      <MetaRow product={product} />
      <PriceRow product={product} href={href} onAdd={onAdd} />
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
    <div className="flex flex-wrap items-center gap-3.5">
      {skills.map((skill) => {
        const icon = skillIconSrc(skill);
        return (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-white p-2.5"
          >
            {icon ? (
              <img src={icon} alt="" width={20} height={20} className="size-5" />
            ) : null}
            <span className="text-[14px] font-medium leading-normal text-text-dark">
              {skill}
            </span>
          </span>
        );
      })}
      <span className="inline-flex items-center gap-1.5">
        <span className="text-[14px] font-medium leading-normal text-text-dark">
          {t.catalog.difficulty}
        </span>
        <img
          src={catalogCardAssets.difficulty[difficulty]}
          alt=""
          width={72}
          height={18}
          className="h-[18px] w-[72px]"
        />
      </span>
    </div>
  );
}

function PriceRow({
  product,
  href,
  onAdd,
}: {
  product: Product;
  href: string;
  onAdd?: (product: Product) => void;
}) {
  const t = useCatalogT();
  return (
    <div className="mt-auto flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-[3px]">
        <p className="text-[14px] font-semibold uppercase leading-[1.5] text-text/60">
          {t.catalog.cost}
        </p>
        <p className="bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent max-[600px]:text-[24px]">
          {formatCatalogPrice(product.priceMinor, product.currency)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <Button href={href} variant="secondary" className="max-[600px]:px-6">
          {t.catalog.details}
        </Button>
        {onAdd ? (
          <button
            type="button"
            onClick={() => onAdd(product)}
            aria-label={t.catalog.addToCart}
            className="size-[60px] shrink-0 rounded-full transition-transform duration-200 ease-out hover:scale-105 active:scale-95 max-[600px]:size-[50px]"
          >
            <img
              src={catalogCardAssets.cartAdd}
              alt=""
              width={60}
              height={60}
              className="size-full"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}
