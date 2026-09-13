"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getGuestCart, mergeGuestCartOnLogin } from "@/lib/catalog/cart";
import { useAuthUser } from "@/lib/catalog/hooks";
import { siteAssets } from "@/lib/catalog/assets";
import { listCartItems } from "@/lib/catalog/repo/cart";
import {
  CART_CHANGED_EVENT,
  emitCartChanged,
} from "@/lib/catalog/use-add-to-cart";

export function CartCount() {
  const { data: user, loading } = useAuthUser();
  const [count, setCount] = useState(0);
  const mergedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (loading) return;
    try {
      if (user) {
        const items = await listCartItems();
        setCount(items.length);
      } else {
        setCount(getGuestCart().length);
      }
    } catch {
      setCount(getGuestCart().length);
    }
  }, [loading, user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (loading) return;
      if (user && !mergedRef.current) {
        mergedRef.current = true;
        try {
          const guestHadItems = getGuestCart().length > 0;
          await mergeGuestCartOnLogin();
          if (guestHadItems) emitCartChanged();
        } catch {
          mergedRef.current = false;
        }
      }
      if (!user) mergedRef.current = false;
      if (!cancelled) await refresh();
    })();
    const onChange = () => {
      void refresh();
    };
    window.addEventListener(CART_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CART_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [loading, refresh, user]);

  if (count <= 0) return null;

  return (
    <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid size-3 place-items-center">
      <img
        src={siteAssets.cartBadge}
        alt=""
        width={12}
        height={12}
        className="absolute inset-0 size-3"
      />
      <span className="relative font-bold text-[8px] leading-none text-white">
        {count > 9 ? "9+" : count}
      </span>
    </span>
  );
}
