"use client";

import { useCallback, useEffect, useState } from "react";
import {
  requestServerCart,
  stageAdd,
  useCartSnapshot,
} from "@/lib/catalog/cart-membership";
import { useAuthUser } from "@/lib/catalog/hooks";
import type { Product } from "@/lib/catalog/types";
import { getSession, isGuestUser, peekCachedAuthUser } from "@/lib/supabase/auth";

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

export function useCartProductIds(): ReadonlySet<string> {
  const { data: user, loading: authLoading } = useAuthUser();
  const userId = user?.id ?? null;
  const snap = useCartSnapshot();

  useEffect(() => {
    if (authLoading) return;
    if (!userId) return;
    void requestServerCart(userId);
  }, [authLoading, userId]);

  return snap.ids;
}

async function resolveUserId(
  hookUserId: string | null,
  authLoading: boolean,
): Promise<string | null> {
  const peeked = peekCachedAuthUser();
  if (peeked !== undefined) return peeked?.id ?? null;
  if (!authLoading) return hookUserId;
  const session = await getSession();
  if (!session?.user || isGuestUser(session.user)) return null;
  return session.user.id;
}

export function useAddToCart() {
  const { data: user, loading: authLoading } = useAuthUser();
  const [modalOpen, setModalOpen] = useState(false);

  const add = useCallback(
    async (target: string | Product): Promise<AddToCartResult> => {
      const product = typeof target === "string" ? undefined : target;
      const productId = typeof target === "string" ? target : target.id;
      const peeked = peekCachedAuthUser();
      const userId =
        peeked !== undefined
          ? (peeked?.id ?? null)
          : await resolveUserId(user?.id ?? null, authLoading);
      const outcome = stageAdd(productId, userId, product);
      if (outcome === "conflict") return "error";
      if (outcome !== "added") return outcome;
      if (!hasSeenWholesaleModal()) {
        markWholesaleModalSeen();
        setModalOpen(true);
      }
      return "added";
    },
    [authLoading, user?.id],
  );

  const closeModal = useCallback(() => {
    markWholesaleModalSeen();
    setModalOpen(false);
  }, []);

  return {
    add,
    pendingId: null as string | null,
    ready: !authLoading,
    modalOpen,
    closeModal,
  };
}
