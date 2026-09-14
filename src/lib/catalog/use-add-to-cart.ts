"use client";

import { useCallback, useEffect, useState } from "react";
import { addGuestItem, getGuestCart } from "@/lib/catalog/cart";
import { useAuthUser } from "@/lib/catalog/hooks";
import { listCartItems, upsertCartItem } from "@/lib/catalog/repo/cart";

export const CART_CHANGED_EVENT = "catalog:cart-changed";

const WHOLESALE_SEEN_KEY = "catalog.wholesale-modal.seen.v1";

let wholesaleSeenMemory = false;

export type CartChangedDetail = {
  added?: string;
  removed?: string;
};

export function emitCartChanged(detail?: CartChangedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CartChangedDetail>(CART_CHANGED_EVENT, { detail }));
}

export function hasSeenWholesaleModal(): boolean {
  if (wholesaleSeenMemory) return true;
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(WHOLESALE_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markWholesaleModalSeen(): void {
  wholesaleSeenMemory = true;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WHOLESALE_SEEN_KEY, "1");
  } catch {
    /* private mode — memory flag still blocks this tab */
  }
}

export type AddToCartResult = "added" | "exists" | "error";

export function useCartProductIds(): Set<string> {
  const { data: user, loading: authLoading } = useAuthUser();
  const [ids, setIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    return new Set(getGuestCart().map((item) => item.productId));
  });

  const refresh = useCallback(async () => {
    if (authLoading) return;
    try {
      const items = user ? await listCartItems() : getGuestCart();
      setIds(new Set(items.map((item) => item.productId)));
    } catch {
      setIds(new Set(getGuestCart().map((item) => item.productId)));
    }
  }, [authLoading, user]);

  useEffect(() => {
    void refresh();
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<CartChangedDetail>).detail;
      if (detail?.added) {
        setIds((current) => {
          if (current.has(detail.added!)) return current;
          const next = new Set(current);
          next.add(detail.added!);
          return next;
        });
      }
      if (detail?.removed) {
        setIds((current) => {
          if (!current.has(detail.removed!)) return current;
          const next = new Set(current);
          next.delete(detail.removed!);
          return next;
        });
      }
      void refresh();
    };
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return ids;
}

export function useAddToCart() {
  const { data: user, loading: authLoading } = useAuthUser();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const add = useCallback(
    async (productId: string): Promise<AddToCartResult> => {
      if (pendingId) return "error";
      setPendingId(productId);
      try {
        const existing = user ? await listCartItems() : getGuestCart();
        if (existing.some((item) => item.productId === productId)) {
          emitCartChanged({ added: productId });
          return "exists";
        }
        if (user) {
          await upsertCartItem(productId, 1);
        } else {
          addGuestItem(productId);
        }
        emitCartChanged({ added: productId });
        if (!hasSeenWholesaleModal()) {
          markWholesaleModalSeen();
          setModalOpen(true);
        }
        return "added";
      } catch {
        const guest = getGuestCart();
        if (!guest.some((item) => item.productId === productId)) {
          addGuestItem(productId);
          emitCartChanged({ added: productId });
          if (!hasSeenWholesaleModal()) {
            markWholesaleModalSeen();
            setModalOpen(true);
          }
          return "added";
        }
        emitCartChanged({ added: productId });
        return "exists";
      } finally {
        setPendingId(null);
      }
    },
    [pendingId, user],
  );

  return {
    add,
    pendingId,
    ready: !authLoading,
    modalOpen,
    closeModal: () => {
      markWholesaleModalSeen();
      setModalOpen(false);
    },
  };
}
