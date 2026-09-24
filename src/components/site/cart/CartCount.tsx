"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cartT } from "@/components/site/cart/copy";
import {
  adoptGuest,
  dismissCartNotice,
  requestServerCart,
  useCartSnapshot,
} from "@/lib/catalog/cart-membership";
import { siteAssets } from "@/lib/catalog/assets";
import { useAuthUser } from "@/lib/catalog/hooks";
import { useLocale } from "@/lib/catalog/locale-context";

export function CartCount() {
  const { data: user, loading } = useAuthUser();
  const userId = user?.id ?? null;
  const snap = useCartSnapshot();
  const copy = cartT(useLocale());
  const count = snap.ordered.length;
  const previous = useRef(count);
  const settled = useRef(false);
  const [badgePop, setBadgePop] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!userId) {
      adoptGuest();
      return;
    }
    void requestServerCart(userId);
  }, [loading, userId]);

  useEffect(() => {
    if (loading || (userId && !snap.idsReady)) return;
    if (!settled.current) {
      settled.current = true;
      previous.current = count;
      return;
    }
    if (count > previous.current) {
      setBadgePop(true);
      const timer = window.setTimeout(() => setBadgePop(false), 420);
      previous.current = count;
      return () => window.clearTimeout(timer);
    }
    previous.current = count;
  }, [count, loading, snap.idsReady, userId]);

  const badge =
    count > 0 ? (
      <span
        className={[
          "pointer-events-none absolute -right-0.5 -top-0.5 grid size-3 place-items-center",
          badgePop ? "cart-badge-pop" : "",
        ].join(" ")}
      >
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
    ) : null;

  const notice =
    snap.notice && typeof document !== "undefined"
      ? createPortal(
          <button
            type="button"
            role="status"
            onClick={dismissCartNotice}
            className="cart-notice fixed bottom-6 left-1/2 z-[80] w-[min(calc(100vw-32px),420px)] -translate-x-1/2 rounded-[20px] bg-white px-5 py-4 text-left shadow-[0_16px_50px_rgba(26,26,26,0.16)]"
          >
            <span className="block text-[14px] font-medium leading-[1.45] text-text">
              {copy.syncFailed}
            </span>
          </button>,
          document.body,
        )
      : null;

  if (!badge && !notice) return null;
  return (
    <>
      {badge}
      {notice}
    </>
  );
}
