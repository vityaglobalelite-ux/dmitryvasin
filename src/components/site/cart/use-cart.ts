"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGuestCart, mergeGuestCartOnLogin, removeGuestItem } from "@/lib/catalog/cart";
import { useAuthUser } from "@/lib/catalog/hooks";
import { listCartItems, removeCartItem } from "@/lib/catalog/repo/cart";
import { listPublishedProducts } from "@/lib/catalog/repo/products";
import { getWholesaleTiers } from "@/lib/catalog/repo/settings";
import {
  CART_CHANGED_EVENT,
  emitCartChanged,
} from "@/lib/catalog/use-add-to-cart";
import type { AuthUser, CartItem, WholesaleTier } from "@/lib/catalog/types";
import { computeCartTotals } from "@/components/site/cart/totals";
import { useCatalogCurrency } from "@/lib/catalog/currency-context";

async function hydrateGuestItems(items: CartItem[]): Promise<CartItem[]> {
  if (items.length === 0) return [];
  const unique = new Map<string, CartItem>();
  for (const item of items) {
    if (!unique.has(item.productId)) unique.set(item.productId, { ...item, qty: 1 });
  }
  const products = await listPublishedProducts();
  const byId = new Map(products.map((product) => [product.id, product]));
  const hydrated: CartItem[] = [];
  for (const item of unique.values()) {
    const product = byId.get(item.productId);
    if (!product) continue;
    hydrated.push({ ...item, qty: 1, product });
  }
  return hydrated;
}

async function readCart(
  user: AuthUser | null,
  mergedRef: { current: boolean },
): Promise<{ items: CartItem[]; tiers: WholesaleTier[] }> {
  const tiers = await getWholesaleTiers().catch(() => [] as WholesaleTier[]);
  if (user) {
    if (!mergedRef.current) {
      mergedRef.current = true;
      try {
        const guestHadItems = getGuestCart().length > 0;
        await mergeGuestCartOnLogin();
        if (guestHadItems) emitCartChanged();
      } catch {
        mergedRef.current = false;
      }
    }
    const serverItems = await listCartItems();
    return {
      tiers,
      items: serverItems.map((item) => ({ ...item, qty: 1 })),
    };
  }
  mergedRef.current = false;
  return { tiers, items: await hydrateGuestItems(getGuestCart()) };
}

export function useCart() {
  const auth = useAuthUser();
  const { currency } = useCatalogCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [tiers, setTiers] = useState<WholesaleTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mergedRef = useRef(false);

  const apply = useCallback((next: { items: CartItem[]; tiers: WholesaleTier[] }) => {
    setTiers(next.tiers);
    setItems(next.items);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (auth.loading) return;
    let cancelled = false;
    readCart(auth.data, mergedRef)
      .then((next) => {
        if (!cancelled) apply(next);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setItems([]);
        setError(caught instanceof Error ? caught : new Error("cart"));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apply, auth.data, auth.loading]);

  useEffect(() => {
    const onChange = () => {
      if (auth.loading) return;
      void readCart(auth.data, mergedRef)
        .then(apply)
        .catch(() => {
          /* keep current rows; user can retry */
        });
    };
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [apply, auth.data, auth.loading]);

  const reload = useCallback(() => {
    if (auth.loading) return;
    setLoading(true);
    setError(null);
    void readCart(auth.data, mergedRef)
      .then(apply)
      .catch((caught: unknown) => {
        setItems([]);
        setError(caught instanceof Error ? caught : new Error("cart"));
        setLoading(false);
      });
  }, [apply, auth.data, auth.loading]);

  const remove = useCallback(
    async (productId: string) => {
      if (auth.data) {
        await removeCartItem(productId);
      } else {
        removeGuestItem(productId);
      }
      emitCartChanged({ removed: productId });
      setItems((current) => current.filter((item) => item.productId !== productId));
    },
    [auth.data],
  );

  return {
    items,
    tiers,
    totals: computeCartTotals(items, tiers, currency),
    loading: loading || auth.loading,
    error,
    signedIn: Boolean(auth.data),
    remove,
    reload,
  };
}
