"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { cartAssets } from "@/components/site/cart/assets";
import { cartT } from "@/components/site/cart/copy";
import {
  catalogTypeLabel,
  formatCatalogPrice,
  typeBadgeIcon,
} from "@/components/site/catalog/display";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { productCopy } from "@/lib/catalog/locale";
import {
  useLocale,
  useLocalizedRoutes,
} from "@/lib/catalog/locale-context";
import type { CartItem, Product } from "@/lib/catalog/types";
import type { CartTotals } from "@/components/site/cart/totals";
import { discountedPriceMinor } from "@/components/site/cart/totals";

export function CartBreadcrumb({
  checkout = false,
}: {
  checkout?: boolean;
}) {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <nav
      aria-label={copy.breadcrumbCart}
      className="flex items-center gap-5 text-[14px] leading-normal max-[600px]:gap-2.5 max-[600px]:text-[10px] max-[600px]:leading-[1.5]"
    >
      <Link
        href={routes.home}
        className="text-text/50 transition-opacity hover:opacity-80"
      >
        {copy.breadcrumbHome}
      </Link>
      <img
        src={cartAssets.breadcrumb}
        alt=""
        width={18}
        height={7}
        className="h-[7px] w-[18px] opacity-70"
      />
      {checkout ? (
        <>
          <Link
            href={routes.cart}
            className="text-text/50 transition-opacity hover:opacity-80"
          >
            {copy.breadcrumbCart}
          </Link>
          <img
            src={cartAssets.breadcrumb}
            alt=""
            width={18}
            height={7}
            className="h-[7px] w-[18px] opacity-70"
          />
          <span className="text-text">{copy.breadcrumbCheckout}</span>
        </>
      ) : (
        <span className="text-text">{copy.breadcrumbCart}</span>
      )}
    </nav>
  );
}

export function CartBackLink() {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <Button
      href={routes.catalog}
      variant="secondary"
      className="gap-2.5 px-10 max-[600px]:h-auto max-[600px]:gap-2.5 max-[600px]:px-5 max-[600px]:py-2.5 max-[600px]:text-[11px] max-[600px]:font-normal max-[600px]:leading-[1.5]"
    >
      <img
        src={cartAssets.back}
        alt=""
        width={11}
        height={7}
        className="h-[10px] w-[5px] -rotate-90 max-[600px]:h-2.5 max-[600px]:w-[5px]"
      />
      <span className="hidden min-[601px]:inline">{copy.backDesktop}</span>
      <span className="min-[601px]:hidden">{copy.backMobile}</span>
    </Button>
  );
}

export function WholesaleBanner({
  cta = "desktop",
}: {
  cta?: "desktop" | "always";
}) {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <div
      className={[
        "flex w-full items-center justify-between gap-5 rounded-[20px] bg-[image:var(--brand-gradient)] p-5 max-[600px]:gap-2.5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]",
        cta === "always"
          ? "max-[600px]:flex-col max-[600px]:items-stretch"
          : "",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-5 max-[600px]:gap-2.5">
        <img
          src={cartAssets.graph}
          alt=""
          width={58}
          height={58}
          className="size-[58px] shrink-0 max-[600px]:size-10"
        />
        <p className="min-w-0 text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-white max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:tracking-normal">
          <span className="max-[600px]:hidden">{copy.bannerDesktop}</span>
          <span className="hidden max-[600px]:inline">{copy.bannerMobile}</span>
        </p>
      </div>
      <Button
        href={routes.catalog}
        className={[
          "h-[60px] shrink-0 px-10 max-[600px]:h-[50px] max-[600px]:w-full max-[600px]:text-[13px] max-[600px]:font-medium",
          cta === "desktop" ? "max-[600px]:hidden" : "",
        ].join(" ")}
      >
        {copy.chooseVideos}
      </Button>
    </div>
  );
}

export function CartLine({
  item,
  percent,
  onRemove,
}: {
  item: CartItem;
  percent: number;
  onRemove: (productId: string) => void;
}) {
  const locale = useLocale();
  const product = item.product;
  if (!product) return null;
  const title = productCopy(product, locale).title;
  const original = formatCatalogPrice(product.priceMinor, product.currency);
  const sale =
    percent > 0
      ? formatCatalogPrice(
          discountedPriceMinor(product.priceMinor, percent),
          product.currency,
        )
      : original;

  return (
    <article className="flex w-full items-start justify-between gap-6 max-[600px]:flex-col max-[600px]:gap-5">
      <div className="flex min-w-0 items-center gap-5 max-[600px]:w-full max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-5">
        <div className="flex items-start justify-between gap-4 max-[600px]:w-full">
          <LineCover product={product} title={title} />
          <RemoveControl
            className="hidden max-[600px]:inline-flex"
            onClick={() => onRemove(item.productId)}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-[30px] max-[600px]:gap-2.5">
          <div className="flex flex-col gap-2.5 max-[600px]:flex-col-reverse">
            <h3 className="max-w-[285px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:max-w-none max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
              {title}
            </h3>
            <TypeChip type={product.type} />
          </div>
          <div className="hidden max-[600px]:flex max-[600px]:items-center max-[600px]:gap-2.5">
            <LinePrices original={original} sale={sale} discounted={percent > 0} />
          </div>
        </div>
      </div>
      <div className="flex h-[162px] w-[118px] shrink-0 flex-col items-end justify-between max-[600px]:hidden">
        <LinePrices original={original} sale={sale} discounted={percent > 0} align="end" />
        <RemoveControl onClick={() => onRemove(item.productId)} />
      </div>
    </article>
  );
}

function LineCover({ product, title }: { product: Product; title: string }) {
  return (
    <div className="relative h-[162px] w-[236px] shrink-0 overflow-hidden rounded-[20px] bg-white max-[600px]:h-[72px] max-[600px]:w-[104px] max-[600px]:rounded-[10px]">
      {product.coverUrl ? (
        <img
          src={product.coverUrl}
          alt={title}
          width={236}
          height={162}
          className="size-full object-cover"
        />
      ) : null}
    </div>
  );
}

function TypeChip({ type }: { type: Product["type"] }) {
  const locale = useLocale();
  const icon = typeBadgeIcon(type);
  return (
    <span className="inline-flex h-[45px] w-fit items-center gap-2.5 rounded-[30px] bg-white px-5 py-2.5 max-[600px]:h-[22px] max-[600px]:gap-1.5 max-[600px]:px-1.5 max-[600px]:py-0">
      {icon ? (
        <img
          src={icon}
          alt=""
          width={25}
          height={25}
          className="size-[25px] object-cover max-[600px]:size-4"
        />
      ) : null}
      <span className="text-[14px] font-medium leading-normal text-text-dark max-[600px]:text-[10px]">
        {catalogTypeLabel(type, locale)}
      </span>
    </span>
  );
}

function LinePrices({
  original,
  sale,
  discounted,
  align = "start",
}: {
  original: string;
  sale: string;
  discounted: boolean;
  align?: "start" | "end";
}) {
  return (
    <div
      className={[
        "flex flex-col gap-2.5 whitespace-nowrap max-[600px]:flex-row max-[600px]:items-center max-[600px]:gap-2.5",
        align === "end" ? "items-end" : "items-start",
      ].join(" ")}
    >
      {discounted ? (
        <p className="text-[24px] font-medium leading-[1.2] text-text/60 line-through max-[600px]:text-[13px]">
          {original}
        </p>
      ) : null}
      <p className="bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent max-[600px]:text-[24px]">
        {sale}
      </p>
    </div>
  );
}

function RemoveControl({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  const copy = cartT(useLocale());
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 text-[16px] font-medium leading-[1.2] text-text underline decoration-solid underline-offset-2 transition-opacity hover:opacity-70 max-[600px]:text-[13px] max-[600px]:font-normal max-[600px]:leading-[1.5] max-[600px]:no-underline",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {copy.remove}
      <img
        src={cartAssets.remove}
        alt=""
        width={16}
        height={16}
        className="size-4"
      />
    </button>
  );
}

export function TotalsCard({
  totals,
  children,
}: {
  totals: CartTotals;
  children: ReactNode;
}) {
  const copy = cartT(useLocale());
  const money = (minor: number) =>
    formatCatalogPrice(minor, totals.currency);

  return (
    <aside className="flex w-full flex-col gap-[31px] rounded-[30px] bg-[image:var(--brand-gradient)] p-10 text-white max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      <h2 className="text-[30px] font-medium leading-[1.2] max-[600px]:text-[20px] max-[600px]:leading-[1.3]">
        {copy.totalsTitle}
      </h2>
      <div className="flex flex-col gap-2.5">
        <TotalsRow label={copy.subtotal} value={money(totals.subtotalMinor)} />
        <TotalsRow label={copy.discount} value={money(totals.discountMinor)} />
      </div>
      <div className="h-px w-full bg-white/50" />
      <div className="flex items-center justify-between gap-4">
        <p className="text-[24px] font-medium leading-[1.2] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
          {copy.payable}
        </p>
        <p className="text-[50px] font-bold leading-[1.1] tracking-[-1.5px] max-[600px]:text-[24px] max-[600px]:font-semibold max-[600px]:tracking-[-0.72px]">
          {money(totals.payableMinor)}
        </p>
      </div>
      {children}
    </aside>
  );
}

function TotalsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[16px] font-medium leading-[1.3] max-[600px]:text-[13px] max-[600px]:font-normal max-[600px]:leading-[1.5]">
        {label}
      </p>
      <p className="text-[24px] font-semibold leading-[1.2] max-[600px]:text-[16px] max-[600px]:font-medium max-[600px]:leading-[1.3]">
        {value}
      </p>
    </div>
  );
}

export function CartLinesSkeleton() {
  return (
    <div className="flex flex-col gap-[30px] max-[600px]:gap-5" aria-hidden>
      <CartLineSkeleton />
      <div className="h-px w-full bg-[#ececec]" />
      <CartLineSkeleton />
    </div>
  );
}

function CartLineSkeleton() {
  return (
    <div className="flex items-start justify-between gap-6 max-[600px]:flex-col">
      <div className="flex items-center gap-5 max-[600px]:w-full max-[600px]:flex-col max-[600px]:items-stretch">
        <Skeleton className="h-[162px] w-[236px] rounded-[20px] max-[600px]:h-[72px] max-[600px]:w-[104px] max-[600px]:rounded-[10px]" />
        <div className="flex flex-col gap-[30px] max-[600px]:gap-2.5">
          <Skeleton className="h-[58px] w-[285px] max-[600px]:h-10 max-[600px]:w-full" />
          <Skeleton className="h-[45px] w-[110px] rounded-[30px] max-[600px]:h-[22px] max-[600px]:w-[72px]" />
        </div>
      </div>
      <div className="flex h-[162px] flex-col items-end justify-between max-[600px]:h-auto max-[600px]:w-full max-[600px]:flex-row">
        <Skeleton className="h-9 w-[118px]" />
        <Skeleton className="h-5 w-[84px]" />
      </div>
    </div>
  );
}

export function CartPanel({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-[30px] rounded-[30px] bg-light-gray p-10 max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      {children}
    </section>
  );
}

export function CartMessage({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <h2 className="text-[24px] font-medium leading-[1.2] text-text-dark max-[600px]:text-[20px]">
        {title}
      </h2>
      <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
        {body}
      </p>
      <div className="mt-2">{action}</div>
    </div>
  );
}
