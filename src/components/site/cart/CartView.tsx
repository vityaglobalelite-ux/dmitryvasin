"use client";

import { Fragment } from "react";
import { cartAssets } from "@/components/site/cart/assets";
import {
  CartBackLink,
  CartBreadcrumb,
  CartLinesSkeleton,
  CartMessage,
  CartPanel,
  CartLine,
  TotalsCard,
  WholesaleBanner,
  cartColumnsClassName,
} from "@/components/site/cart/CartPieces";
import { cartT } from "@/components/site/cart/copy";
import { useCart } from "@/components/site/cart/use-cart";
import { Button } from "@/components/site/ui/Button";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

export function CartView() {
  const cart = useCart();
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  const checkoutLabel = cart.signedIn
    ? copy.checkoutSigned
    : copy.checkoutGuest;
  const empty = !cart.loading && !cart.error && cart.items.length === 0;

  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-16 max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
      <header className="flex flex-col gap-10 max-[600px]:gap-2.5">
        <CartBreadcrumb />
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-6">
            <h1 className="min-w-0 text-[55px] font-medium leading-[1.1] tracking-[-1.65px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
              {copy.title}
            </h1>
            <CartBackLink />
          </div>
          <p className="max-w-[702px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:max-w-[246px] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copy.subtitle}
          </p>
        </div>
      </header>

      <div className={cartColumnsClassName}>
        <CartPanel variant={empty ? "empty" : "default"}>
          {cart.loading ? (
            <CartLinesSkeleton />
          ) : cart.error ? (
            <CartMessage
              title={copy.errorTitle}
              body={copy.errorBody}
              action={
                <Button type="button" onClick={() => void cart.reload()}>
                  {copy.retry}
                </Button>
              }
            />
          ) : empty ? (
            <EmptyCart />
          ) : (
            <>
              <WholesaleBanner />
              {cart.items.map((item, index) => (
                <Fragment key={item.productId}>
                  {index > 0 ? (
                    <div className="h-px w-full bg-[#d9d9d9]" />
                  ) : null}
                  <CartLine
                    item={item}
                    percent={cart.totals.percent}
                    onRemove={(id) => {
                      void cart.remove(id);
                    }}
                  />
                </Fragment>
              ))}
            </>
          )}
        </CartPanel>

        <TotalsCard totals={cart.totals}>
          {empty ? (
            <Button
              type="button"
              disabled
              className="mt-auto h-[60px] w-full p-2.5 max-[600px]:h-[50px] max-[600px]:text-[13px]"
            >
              {checkoutLabel}
            </Button>
          ) : (
            <Button
              href={routes.checkout}
              className="mt-auto h-[60px] w-full p-2.5 max-[600px]:h-[50px] max-[600px]:text-[13px]"
            >
              {checkoutLabel}
            </Button>
          )}
        </TotalsCard>
      </div>
    </main>
  );
}

function EmptyCart() {
  const copy = cartT(useLocale());
  return (
    <>
      <div className="relative h-[125px] w-[104px] shrink-0 overflow-hidden max-[600px]:h-24 max-[600px]:w-20">
        <img
          src={cartAssets.empty}
          alt=""
          width={104}
          height={125}
          className="size-full object-contain"
        />
      </div>
      <div className="flex flex-col items-center gap-2.5 text-center">
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[30px] max-[600px]:tracking-[-0.9px]">
          {copy.emptyTitle}
        </h2>
        <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
          {copy.emptyBody}
        </p>
      </div>
      <WholesaleBanner cta="always" className="max-w-[842px]" />
    </>
  );
}
