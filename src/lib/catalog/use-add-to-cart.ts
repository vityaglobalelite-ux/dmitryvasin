"use client";

import { useCallback, useState } from "react";
import { addGuestItem, getGuestCart } from "@/lib/catalog/cart";
import { useAuthUser } from "@/lib/catalog/hooks";
import { listCartItems, upsertCartItem } from "@/lib/catalog/repo/cart";

export const CART_CHANGED_EVENT = "catalog:cart-changed";

export function emitCartChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export type AddToCartResult = "added" | "exists" | "error";

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
          return "exists";
        }
        const wasEmpty = existing.length === 0;
        if (user) {
          await upsertCartItem(productId, 1);
        } else {
          addGuestItem(productId);
        }
        emitCartChanged();
        if (wasEmpty) setModalOpen(true);
        return "added";
      } catch {
        const guest = getGuestCart();
        const wasEmpty = guest.length === 0;
        if (!guest.some((item) => item.productId === productId)) {
          addGuestItem(productId);
          emitCartChanged();
          if (wasEmpty) setModalOpen(true);
          return "added";
        }
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
    closeModal: () => setModalOpen(false),
  };
}
