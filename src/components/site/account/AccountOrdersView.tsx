"use client";

import Link from "next/link";
import {
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { accountT } from "@/components/site/account/copy";
import { remainingAccess } from "@/components/site/account/remaining";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { catalogTypeLabel } from "@/components/site/catalog/display";
import { isAccessActive } from "@/lib/catalog/access";
import { formatPriceMinor } from "@/lib/catalog/format";
import { useMyAccess, useMyOrders } from "@/lib/catalog/hooks-account";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { Access, Currency, Order, OrderItem } from "@/lib/catalog/types";

export function AccountOrdersView() {
  const gate = useAccountGate();
  const orders = useMyOrders();
  const access = useMyAccess();
  const copy = accountT(useLocale());
  const routes = useLocalizedRoutes();

  if (gate.pending) {
    return <AccountShellSkeleton variant="rows" />;
  }

  const paid = orders.data.filter((order) => order.status === "paid");
  const accessByProduct = new Map(
    access.data.map((row) => [row.productId, row] as const),
  );

  return (
    <AccountShell email={gate.user?.email} active="orders">
      <div className="flex flex-col gap-5">
        <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
          {copy.ordersTitle}
        </h1>

        {orders.loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[108px] w-full rounded-[20px]" />
            ))}
          </div>
        ) : orders.error ? (
          <div className="max-w-[640px] rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
            <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
              {copy.ordersErrorTitle}
            </p>
            <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {copy.errorBody}
            </p>
            <Button type="button" className="mt-8" onClick={() => orders.reload()}>
              {copy.retry}
            </Button>
          </div>
        ) : paid.length === 0 ? (
          <div className="max-w-[640px] rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
            <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
              {copy.ordersEmptyTitle}
            </p>
            <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {copy.ordersEmptyBody}
            </p>
            <Button href={routes.catalog} className="mt-8">
              {copy.catalogCta}
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {paid.map((order) => (
              <OrderBlock
                key={order.id}
                order={order}
                accessByProduct={accessByProduct}
              />
            ))}
          </ul>
        )}
      </div>
    </AccountShell>
  );
}

function OrderBlock({
  order,
  accessByProduct,
}: {
  order: Order;
  accessByProduct: Map<string, Access>;
}) {
  return (
    <li className="rounded-[20px] bg-light-gray p-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[13px] leading-[1.5] text-text/60 [font-variant-numeric:tabular-nums]">
          {formatOrderDate(order.createdAt)}
        </p>
        <p className="text-[16px] font-semibold leading-[1.2] text-text">
          {formatPriceMinor(order.totalMinor, order.currency)}
        </p>
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {order.items.map((item) => (
          <OrderLine
            key={`${order.id}-${item.productId}`}
            item={item}
            currency={order.currency}
            access={accessByProduct.get(item.productId)}
          />
        ))}
      </ul>
    </li>
  );
}

function OrderLine({
  item,
  currency,
  access,
}: {
  item: OrderItem;
  currency: Currency;
  access?: Access;
}) {
  const locale = useLocale();
  const copy = accountT(locale);
  const routes = useLocalizedRoutes();
  const product = access?.product;
  const typeLabel = product ? catalogTypeLabel(product.type, locale) : null;
  const remaining = access ? remainingAccess(access, new Date(), locale) : null;
  const active = access ? isAccessActive(access) : false;
  const href = product
    ? active
      ? product.type === "course"
        ? routes.accountCourse(product.id)
        : routes.accountWatch(product.id)
      : routes.accountExpired
    : routes.product(item.productId);

  return (
    <li className="flex flex-col gap-1.5">
      <Link
        href={href}
        className="text-[16px] font-medium leading-[1.3] text-text transition-opacity duration-150 hover:opacity-80"
      >
        {item.titleSnapshot}
      </Link>
      <p className="flex min-h-5 flex-wrap gap-x-3 gap-y-1 text-[13px] leading-[1.5] text-text/70">
        {typeLabel ? <span>{typeLabel}</span> : null}
        <span>{formatPriceMinor(item.priceMinor, currency)}</span>
        <span>{copy.orderPaid}</span>
        {remaining ? (
          <span className="[font-variant-numeric:tabular-nums]">
            {remaining.expired ? copy.expired : remaining.label}
          </span>
        ) : null}
      </p>
    </li>
  );
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
