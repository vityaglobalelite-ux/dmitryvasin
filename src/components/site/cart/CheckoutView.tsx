"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CartBackLink,
  CartBreadcrumb,
  CartLine,
  CartLinesSkeleton,
  CartMessage,
  CartPanel,
  TotalsCard,
  cartColumnsClassName,
} from "@/components/site/cart/CartPieces";
import { cartT } from "@/components/site/cart/copy";
import { useCart } from "@/components/site/cart/use-cart";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { useAuthModal } from "@/components/site/auth/AuthModal";
import { listMyOrders } from "@/lib/catalog/repo/orders";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import {
  CatalogCheckoutError,
  clearPendingCheckoutOrderId,
  readPendingCheckoutOrderId,
  rememberPendingCheckoutOrderId,
  startCatalogCheckout,
} from "@/lib/catalog/stripe-checkout";
import type { Order } from "@/lib/catalog/types";

const PROCESS_POLL_MS = 2000;
const PROCESS_TIMEOUT_MS = 90_000;

export function CheckoutView() {
  const cart = useCart();
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  const searchParams = useSearchParams();
  const processing = useCheckoutProcessing(searchParams);

  const showCart =
    !processing.active ||
    processing.phase === "timeout" ||
    processing.phase === "error";

  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-16 max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
      <header className="flex flex-col gap-10 max-[600px]:gap-2.5">
        <CartBreadcrumb checkout />
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-6">
            <h1 className="min-w-0 text-[55px] font-medium leading-[1.1] tracking-[-1.65px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
              {copy.checkoutTitle}
            </h1>
            <CartBackLink />
          </div>
          <p className="max-w-[702px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:max-w-[246px] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
            {copy.checkoutSubtitle}
          </p>
        </div>
      </header>

      {processing.active ? (
        <CheckoutProcessingPanel processing={processing} />
      ) : null}

      {showCart ? (
        <div className={cartColumnsClassName}>
          <CartPanel>
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
            ) : cart.items.length === 0 ? (
              <CartMessage
                title={copy.checkoutEmptyTitle}
                body={copy.checkoutEmptyBody}
                action={
                  <Button href={routes.catalog}>{copy.chooseVideos}</Button>
                }
              />
            ) : (
              cart.items.map((item, index) => (
                <Fragment key={item.productId}>
                  {index > 0 ? <div className="h-px w-full bg-[#d9d9d9]" /> : null}
                  <CartLine
                    item={item}
                    percent={cart.totals.percent}
                    onRemove={(id) => {
                      void cart.remove(id);
                    }}
                  />
                </Fragment>
              ))
            )}
          </CartPanel>

          <div className="flex w-full flex-col gap-5">
            {cart.loading || cart.items.length > 0 ? <PayMethodCard /> : null}
            <TotalsCard totals={cart.totals}>
              <CheckoutPayButton
                signedIn={cart.signedIn}
                disabled={cart.loading || cart.items.length === 0}
              />
            </TotalsCard>
          </div>
        </div>
      ) : null}
    </main>
  );
}

type ProcessingPhase = "polling" | "confirmed" | "timeout" | "error";

type CheckoutProcessingState = {
  active: boolean;
  phase: ProcessingPhase;
  error: string | null;
  reload: () => void;
};

function useCheckoutProcessing(
  searchParams: ReturnType<typeof useSearchParams>,
): CheckoutProcessingState {
  const sessionId = searchParams.get("session_id");
  const checkoutFlag = searchParams.get("checkout");

  const shouldProcess = useMemo(() => {
    if (searchParams.has("paid")) return false;
    if (sessionId?.trim()) return true;
    if (checkoutFlag === "1") return true;
    return false;
  }, [checkoutFlag, searchParams, sessionId]);

  const [phase, setPhase] = useState<ProcessingPhase>("polling");
  const [error, setError] = useState<string | null>(null);
  const [pollToken, setPollToken] = useState(0);

  const reload = useCallback(() => {
    setError(null);
    setPhase("polling");
    setPollToken((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!shouldProcess) return;

    let cancelled = false;
    const startedAt = Date.now();

    setPhase("polling");
    setError(null);

    const tick = async () => {
      try {
        const orders = await listMyOrders();
        if (cancelled) return;

        const paid = findConfirmedPaidOrder(orders, {
          sessionId,
          pendingOrderId: readPendingCheckoutOrderId(),
        });

        if (paid) {
          clearPendingCheckoutOrderId();
          setPhase("confirmed");
          return;
        }

        if (Date.now() - startedAt >= PROCESS_TIMEOUT_MS) {
          setPhase("timeout");
          return;
        }
      } catch (err: unknown) {
        if (cancelled) return;
        setPhase("error");
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось проверить статус заказа.",
        );
        return;
      }

      if (!cancelled && Date.now() - startedAt < PROCESS_TIMEOUT_MS) {
        window.setTimeout(() => void tick(), PROCESS_POLL_MS);
      } else if (!cancelled) {
        setPhase("timeout");
      }
    };

    void tick();

    return () => {
      cancelled = true;
    };
  }, [pollToken, sessionId, shouldProcess]);

  return {
    active: shouldProcess,
    phase: shouldProcess ? phase : "polling",
    error,
    reload,
  };
}

function findConfirmedPaidOrder(
  orders: Order[],
  ctx: { sessionId: string | null; pendingOrderId: string | null },
): Order | null {
  for (const order of orders) {
    if (order.status !== "paid") continue;
    if (ctx.sessionId && order.stripeSessionId === ctx.sessionId) {
      return order;
    }
    if (ctx.pendingOrderId && order.id === ctx.pendingOrderId) {
      return order;
    }
  }
  return null;
}

function CheckoutProcessingPanel({
  processing,
}: {
  processing: CheckoutProcessingState;
}) {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  if (processing.phase === "polling") {
    return (
      <section className="mt-10 rounded-[30px] bg-light-gray p-10 max-[600px]:mt-8 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
        <h2 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
          {copy.checkoutProcessingTitle}
        </h2>
        <p className="mt-4 max-w-[640px] text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
          {copy.checkoutProcessingBody}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Skeleton className="h-4 w-full max-w-[420px] rounded-full" />
          <Skeleton className="h-4 w-[85%] max-w-[360px] rounded-full" />
        </div>
      </section>
    );
  }

  if (processing.phase === "confirmed") {
    return (
      <section className="mt-10 max-[600px]:mt-8">
        <CartMessage
          title={copy.checkoutConfirmedTitle}
          body={copy.checkoutConfirmedBody}
          action={
            <Button href={routes.account}>{copy.checkoutConfirmedCta}</Button>
          }
        />
      </section>
    );
  }

  if (processing.phase === "timeout") {
    return (
      <section className="mt-10 max-[600px]:mt-8">
        <CartMessage
          title={copy.checkoutProcessingTimeoutTitle}
          body={copy.checkoutProcessingTimeoutBody}
          action={
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button type="button" onClick={processing.reload}>
                {copy.checkoutProcessingRetry}
              </Button>
              <Button href={routes.accountOrders} variant="secondary">
                {copy.checkoutConfirmedCta}
              </Button>
            </div>
          }
        />
      </section>
    );
  }

  return (
    <section className="mt-10 max-[600px]:mt-8">
      <CartMessage
        title={copy.errorTitle}
        body={processing.error ?? copy.errorBody}
        action={
          <Button type="button" onClick={processing.reload}>
            {copy.retry}
          </Button>
        }
      />
    </section>
  );
}

function PayMethodCard() {
  const copy = cartT(useLocale());
  return (
    <section className="rounded-[30px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
      <h2 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {copy.payMethodLabel}
      </h2>
      <div
        className="mt-5 flex items-center gap-3 rounded-[20px] border border-plum bg-white px-5 py-4 max-[600px]:rounded-[10px] max-[600px]:px-4 max-[600px]:py-3"
        role="radio"
        aria-checked="true"
      >
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-plum"
          aria-hidden
        >
          <span className="size-2.5 rounded-full bg-plum" />
        </span>
        <p className="text-[16px] font-medium leading-normal text-text-dark max-[600px]:text-[13px]">
          {copy.payMethodCard}
        </p>
      </div>
    </section>
  );
}

function CheckoutPayButton({
  signedIn,
  disabled,
}: {
  signedIn: boolean;
  disabled: boolean;
}) {
  const copy = cartT(useLocale());
  const routes = useLocalizedRoutes();
  const { openAuth } = useAuthModal();
  const [pending, setPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const className =
    "h-[60px] w-full p-2.5 max-[600px]:h-[50px] max-[600px]:text-[13px]";

  const handlePay = useCallback(async () => {
    setPayError(null);
    setPending(true);
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const successUrl = `${origin}${routes.checkout}?checkout=1`;
      const cancelUrl = `${origin}${routes.checkout}`;

      const result = await startCatalogCheckout({ successUrl, cancelUrl });
      if (result.orderId) {
        rememberPendingCheckoutOrderId(result.orderId);
      }
      window.location.assign(result.url);
    } catch (err: unknown) {
      if (err instanceof CatalogCheckoutError) {
        setPayError(err.message);
      } else if (err instanceof Error) {
        setPayError(err.message);
      } else {
        setPayError(copy.payErrorFallback);
      }
      setPending(false);
    }
  }, [copy.payErrorFallback, routes.checkout]);

  if (disabled) {
    return (
      <Button type="button" disabled className={className}>
        {signedIn ? copy.paySigned : copy.checkoutGuest}
      </Button>
    );
  }

  if (!signedIn) {
    return (
      <Button
        type="button"
        className={className}
        onClick={() => openAuth("login")}
      >
        {copy.checkoutGuest}
      </Button>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {payError ? (
        <p className="text-center text-[13px] leading-[1.4] text-[#b42318]" role="alert">
          {payError}
        </p>
      ) : null}
      <Button
        type="button"
        className={className}
        disabled={pending}
        aria-busy={pending}
        onClick={() => void handlePay()}
      >
        {pending ? copy.payPending : copy.paySigned}
      </Button>
    </div>
  );
}
