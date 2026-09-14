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

export const cartColumnsClassName =
  "mt-[60px] grid w-full grid-cols-1 items-start gap-5 min-[1200px]:grid-cols-[minmax(0,1fr)_minmax(280px,467px)] max-[600px]:mt-8";

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
        className="text-text/50 underline-offset-4 transition-[color,opacity] hover:text-text hover:underline"
      >
        {copy.breadcrumbHome}
      </Link>
      <img
        src={cartAssets.breadcrumb}
        alt=""
        width={18}
        height={7}
        className="h-[7px] w-[18px] shrink-0 opacity-70"
      />
      {checkout ? (
        <>
          <Link
            href={routes.cart}
            className="text-text/50 underline-offset-4 transition-[color,opacity] hover:text-text hover:underline"
          >
            {copy.breadcrumbCart}
          </Link>
          <img
            src={cartAssets.breadcrumb}
            alt=""
            width={18}
            height={7}
            className="h-[7px] w-[18px] shrink-0 opacity-70"
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
      className="shrink-0 gap-2.5 px-10 max-[600px]:h-auto max-[600px]:gap-2.5 max-[600px]:px-5 max-[600px]:py-2.5 max-[600px]:text-[11px] max-[600px]:font-normal max-[600px]:leading-[1.5]"
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
  className,
}: {
  cta?: "desktop" | "always";
  className?: string;
}) {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <div
      className={[
        "flex w-full items-center justify-between gap-5 rounded-[20px] bg-[image:var(--brand-gradient)] p-5 max-[600px]:gap-2.5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]",
        cta === "always"
          ? "max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-2.5"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 items-center gap-5 max-[600px]:gap-2.5">
        <img
          src={cartAssets.graph}
          alt=""
          width={58}
          height={58}
          className="size-[58px] shrink-0 max-[600px]:size-10"
        />
        <p className="min-w-0 max-w-[456px] text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-white max-[600px]:max-w-none max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:tracking-normal">
          <span className="max-[600px]:hidden">{copy.bannerDesktop}</span>
          <span className="hidden max-[600px]:inline">{copy.bannerMobile}</span>
        </p>
      </div>
      <Button
        href={routes.catalog}
        className={[
          "h-[60px] shrink-0 px-10 max-[600px]:h-[50px] max-[600px]:w-full max-[600px]:text-[13px] max-[600px]:font-medium",
          cta === "desktop" ? "max-[899px]:hidden" : "",
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
  const copy = cartT(locale);
  const product = item.product;
  const remove = () => onRemove(item.productId);

  if (!product) {
    return (
      <article className="flex w-full items-center justify-between gap-5">
        <h3 className="text-[16px] font-medium leading-[1.3] text-text min-[900px]:text-[24px] min-[900px]:leading-[1.2]">
          {copy.unavailableTitle}
        </h3>
        <RemoveControl onClick={remove} />
      </article>
    );
  }

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
    <article className="grid w-full min-w-0 grid-cols-[auto_1fr] gap-x-5 gap-y-5 min-[900px]:min-h-[162px] min-[900px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[900px]:grid-rows-[auto_1fr] min-[900px]:gap-y-0">
      <LineCover
        product={product}
        title={title}
        className="col-start-1 row-start-1 min-[900px]:row-span-2 min-[900px]:self-center"
      />
      <RemoveControl
        onClick={remove}
        className="col-start-2 row-start-1 self-start justify-self-end min-[900px]:col-start-3 min-[900px]:row-start-2 min-[900px]:self-end"
      />
      <div className="col-span-2 col-start-1 row-start-2 flex flex-col gap-2.5 min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:max-w-[285px] min-[900px]:justify-center min-[900px]:gap-[30px] min-[900px]:self-center">
        <h3 className="order-2 text-[16px] font-medium leading-[1.3] text-text min-[900px]:order-1 min-[900px]:text-[24px] min-[900px]:leading-[1.2]">
          {title}
        </h3>
        <TypeChip type={product.type} className="order-1 min-[900px]:order-2" />
      </div>
      <LinePrices
        original={original}
        sale={sale}
        discounted={percent > 0}
        className="col-span-2 col-start-1 row-start-3 min-[900px]:col-span-1 min-[900px]:col-start-3 min-[900px]:row-start-1 min-[900px]:justify-self-end min-[900px]:self-start"
      />
    </article>
  );
}

function LineCover({
  product,
  title,
  className,
}: {
  product: Product;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative h-[72px] w-[104px] shrink-0 overflow-hidden rounded-[10px] bg-white min-[900px]:h-[162px] min-[900px]:w-[236px] min-[900px]:rounded-[20px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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

function TypeChip({
  type,
  className,
}: {
  type: Product["type"];
  className?: string;
}) {
  const locale = useLocale();
  const icon = typeBadgeIcon(type);
  return (
    <span
      className={[
        "inline-flex h-[22px] w-fit items-center gap-1.5 rounded-[30px] bg-white px-1.5 min-[900px]:h-[45px] min-[900px]:gap-2.5 min-[900px]:px-5 min-[900px]:py-2.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? (
        <img
          src={icon}
          alt=""
          width={25}
          height={25}
          className="size-4 object-cover min-[900px]:size-[25px]"
        />
      ) : null}
      <span className="text-[10px] font-medium leading-normal text-text-dark min-[900px]:text-[14px]">
        {catalogTypeLabel(type, locale)}
      </span>
    </span>
  );
}

function LinePrices({
  original,
  sale,
  discounted,
  className,
}: {
  original: string;
  sale: string;
  discounted: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        "flex flex-row items-center gap-2.5 whitespace-nowrap min-[900px]:flex-col min-[900px]:items-end",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {discounted ? (
        <p className="text-[13px] font-medium leading-[1.2] text-text/60 line-through min-[900px]:text-[24px]">
          {original}
        </p>
      ) : null}
      <p className="bg-[image:var(--brand-gradient)] bg-clip-text text-[24px] font-bold leading-[1.2] text-transparent min-[900px]:text-[30px]">
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
        "inline-flex shrink-0 items-center gap-1 text-[13px] font-normal leading-[1.5] text-text transition-opacity hover:opacity-70 min-[900px]:text-[16px] min-[900px]:font-medium min-[900px]:leading-[1.2] min-[900px]:underline min-[900px]:decoration-solid min-[900px]:underline-offset-2",
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
    <aside className="flex w-full flex-col gap-[31px] rounded-[30px] bg-[image:var(--brand-gradient)] p-10 text-white min-[1200px]:min-h-[463px] max-[600px]:gap-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
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
    <div className="grid w-full grid-cols-[auto_1fr] gap-x-5 gap-y-5 min-[900px]:min-h-[162px] min-[900px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[900px]:grid-rows-[auto_1fr] min-[900px]:gap-y-0">
      <Skeleton className="col-start-1 row-start-1 h-[72px] w-[104px] rounded-[10px] min-[900px]:row-span-2 min-[900px]:h-[162px] min-[900px]:w-[236px] min-[900px]:self-center min-[900px]:rounded-[20px]" />
      <Skeleton className="col-start-2 row-start-1 h-5 w-[72px] justify-self-end min-[900px]:col-start-3 min-[900px]:row-start-2 min-[900px]:self-end" />
      <div className="col-span-2 col-start-1 row-start-2 flex flex-col gap-2.5 min-[900px]:col-span-1 min-[900px]:col-start-2 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:max-w-[285px] min-[900px]:justify-center min-[900px]:gap-[30px] min-[900px]:self-center">
        <Skeleton className="order-2 h-10 w-full min-[900px]:order-1 min-[900px]:h-[58px]" />
        <Skeleton className="order-1 h-[22px] w-[72px] rounded-[30px] min-[900px]:order-2 min-[900px]:h-[45px] min-[900px]:w-[110px]" />
      </div>
      <Skeleton className="col-span-2 col-start-1 row-start-3 h-7 w-[100px] min-[900px]:col-span-1 min-[900px]:col-start-3 min-[900px]:row-start-1 min-[900px]:h-9 min-[900px]:w-[118px] min-[900px]:justify-self-end" />
    </div>
  );
}

export function CartPanel({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "empty";
}) {
  return (
    <section
      className={[
        "flex min-w-0 w-full flex-col rounded-[30px] bg-light-gray max-[600px]:rounded-[10px]",
        variant === "empty"
          ? "min-[1200px]:min-h-[463px] items-center justify-center gap-10 px-[55px] py-[30px] max-[600px]:gap-5 max-[600px]:p-[15px]"
          : "gap-[30px] p-10 max-[600px]:gap-5 max-[600px]:p-[15px]",
      ].join(" ")}
    >
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
