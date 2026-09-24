"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CART_CHANGED_EVENT,
} from "@/lib/catalog/use-add-to-cart";
import {
  adoptGuest,
  bundleCapProducts,
  ensureGuestCart,
  getCartSnapshot,
  requestServerCart,
  showCartNotice,
  stageRemove,
  useCartSnapshot,
} from "@/lib/catalog/cart-membership";
import { useAuthUser } from "@/lib/catalog/hooks";
import { getWholesaleTiers } from "@/lib/catalog/repo/settings";
import type { Product, WholesaleTier } from "@/lib/catalog/types";
import { computeCartTotals } from "@/components/site/cart/totals";
import { useCatalogCurrency } from "@/lib/catalog/currency-context";

export function useCart() {
  const auth = useAuthUser();
  const { currency } = useCatalogCurrency();
  const snap = useCartSnapshot();
  const [tiers, setTiers] = useState<WholesaleTier[]>([]);
  const [extras, setExtras] = useState<Product[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const userId = auth.data?.id ?? null;

  useEffect(() => {
    if (auth.loading) return;
    let cancelled = false;

    void getWholesaleTiers()
      .then((next) => {
        if (!cancelled) setTiers(next);
      })
      .catch(() => {
        if (!cancelled) setTiers([]);
      });

    if (!userId) adoptGuest();
    const load = userId ? requestServerCart(userId) : ensureGuestCart();

    void load
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        if (getCartSnapshot().items.length === 0) {
          setError(caught instanceof Error ? caught : new Error("cart"));
        } else {
          showCartNotice();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [auth.loading, userId]);

  useEffect(() => {
    const onChange = () => {
      if (auth.loading) return;
      const reload = userId
        ? requestServerCart(userId, true)
        : ensureGuestCart();
      void reload.catch(() => {
        /* keep the lines already on screen */
      });
    };
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(CART_CHANGED_EVENT, onChange);
  }, [auth.loading, userId]);

  const orderKey = snap.ordered.join("\n");

  useEffect(() => {
    let cancelled = false;
    void bundleCapProducts(getCartSnapshot().items).then((next) => {
      if (!cancelled) setExtras(next);
    });
    return () => {
      cancelled = true;
    };
  }, [orderKey]);

  const reload = useCallback(() => {
    if (auth.loading) return;
    setError(null);
    if (!userId) adoptGuest();
    const load = userId ? requestServerCart(userId, true) : ensureGuestCart();
    void load.catch((caught: unknown) => {
      if (getCartSnapshot().items.length === 0) {
        setError(caught instanceof Error ? caught : new Error("cart"));
      } else {
        showCartNotice();
      }
    });
  }, [auth.loading, userId]);

  const remove = useCallback(
    (productId: string) => {
      stageRemove(productId, userId);
    },
    [userId],
  );

  const known = snap.items.some((item) => item.product);
  const loading =
    !error &&
    (auth.loading ||
      (!snap.idsReady && !known) ||
      (snap.idsReady &&
        !snap.itemsHydrated &&
        snap.items.length > 0 &&
        !known));

  return {
    items: snap.items,
    tiers,
    totals: computeCartTotals(snap.items, tiers, currency, extras),
    loading,
    error,
    signedIn: Boolean(auth.data),
    remove,
    reload,
  };
}
