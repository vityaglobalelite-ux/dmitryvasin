"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { addGuestItem, getGuestCart } from "@/lib/catalog/cart";
import { isPostureBundleBlock } from "@/lib/catalog/bundles";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import { useAuthUser } from "@/lib/catalog/hooks";
import { CartBundleConflictError, listCartItems, upsertCartItem } from "@/lib/catalog/repo/cart";

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

const NO_IDS = new Set<string>();

/* Guest cart lives in localStorage — an external store. The snapshot is
   reused while the stored ids are unchanged, as useSyncExternalStore needs. */
let guestIdsSnapshot: { key: string; ids: Set<string> } | null = null;

function readGuestIds(): Set<string> {
  const list = getGuestCart().map((item) => item.productId);
  const key = list.join("\n");
  if (guestIdsSnapshot?.key !== key) {
    guestIdsSnapshot = { key, ids: new Set(list) };
  }
  return guestIdsSnapshot.ids;
}

function subscribeCartChanges(onChange: (event: Event) => void): () => void {
  window.addEventListener(CART_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function withId(ids: Set<string>, id: string, present: boolean): Set<string> {
  if (ids.has(id) === present) return ids;
  const next = new Set(ids);
  if (present) next.add(id);
  else next.delete(id);
  return next;
}

export function useCartProductIds(): Set<string> {
  const { data: user, loading: authLoading } = useAuthUser();
  const userId = user?.id ?? null;
  // Empty on the server and during hydration, so the markup matches.
  const guestIds = useSyncExternalStore(subscribeCartChanges, readGuestIds, () => NO_IDS);
  const [server, setServer] = useState<{ userId: string; ids: Set<string> } | null>(null);

  useEffect(() => {
    if (authLoading || !userId) return;
    let cancelled = false;
    let latest = 0;

    const load = async () => {
      const run = ++latest;
      try {
        const items = await listCartItems();
        // Only the newest response for this user may land.
        if (cancelled || run !== latest) return;
        setServer({ userId, ids: new Set(items.map((item) => item.productId)) });
      } catch {
        /* Keep what is shown; the next cart change retries. */
      }
    };

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<CartChangedDetail>).detail;
      if (detail?.added || detail?.removed) {
        setServer((prev) => {
          if (prev?.userId !== userId) return prev;
          let ids = prev.ids;
          if (detail.added) ids = withId(ids, detail.added, true);
          if (detail.removed) ids = withId(ids, detail.removed, false);
          return ids === prev.ids ? prev : { userId, ids };
        });
      }
      void load();
    };

    void load();
    const unsubscribe = subscribeCartChanges(onChange);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authLoading, userId]);

  if (userId && server?.userId === userId) return server.ids;
  return guestIds;
}

export function useAddToCart() {
  const { data: user, loading: authLoading } = useAuthUser();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingRef = useRef<string | null>(null);

  const add = useCallback(
    async (productId: string): Promise<AddToCartResult> => {
      if (pendingRef.current) return "error";
      pendingRef.current = productId;
      setPendingId(productId);
      try {
        const existing = user ? await listCartItems() : getGuestCart();
        if (existing.some((item) => item.productId === productId)) {
          emitCartChanged({ added: productId });
          return "exists";
        }
        if (
          isPostureBundleBlock(productId) &&
          existing.some((item) => item.productId === POSTURE_BUNDLE.fullId)
        ) {
          return "error";
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
      } catch (caught) {
        if (user) return "error";
        if (caught instanceof CartBundleConflictError) {
          return "error";
        }
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
        pendingRef.current = null;
        setPendingId(null);
      }
    },
    [user],
  );

  const closeModal = useCallback(() => {
    markWholesaleModalSeen();
    setModalOpen(false);
  }, []);

  return {
    add,
    pendingId,
    ready: !authLoading,
    modalOpen,
    closeModal,
  };
}
