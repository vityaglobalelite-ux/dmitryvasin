"use client";

import { useEffect, useState } from "react";
import { cartAssets } from "@/components/site/cart/assets";
import { cartModalTier, cartT } from "@/components/site/cart/copy";
import { Button } from "@/components/site/ui/Button";
import { getWholesaleTiers } from "@/lib/catalog/repo/settings";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { WholesaleTier } from "@/lib/catalog/types";

type WholesaleModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WholesaleModal({ open, onClose }: WholesaleModalProps) {
  const [tiers, setTiers] = useState<WholesaleTier[]>([]);
  const locale = useLocale();
  const copy = cartT(locale);
  const routes = useLocalizedRoutes();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getWholesaleTiers()
      .then((next) => {
        if (!cancelled) setTiers([...next].sort((a, b) => a.minQty - b.minQty));
      })
      .catch(() => {
        if (!cancelled) setTiers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(37,37,37,0.45)] p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] overflow-hidden rounded-[30px] bg-white p-10 shadow-[0_24px_80px_rgba(76,13,50,0.18)] max-[600px]:rounded-[20px] max-[600px]:p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex items-center gap-1 text-[16px] font-medium text-text transition-opacity hover:opacity-70 max-[600px]:right-3 max-[600px]:top-3 max-[600px]:text-[13px]"
        >
          {copy.modalClose}
          <img
            src={cartAssets.remove}
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
        </button>

        <div className="flex flex-col items-start gap-5">
          <img
            src={cartAssets.graph}
            alt=""
            width={58}
            height={58}
            className="size-[58px] max-[600px]:size-10"
          />
          <h2
            id="wholesale-modal-title"
            className="max-w-[456px] bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-transparent max-[600px]:text-[20px] max-[600px]:tracking-[-0.4px]"
          >
            {copy.modalTitle}
          </h2>
          <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
            {copy.modalBody}
          </p>
          {tiers.length > 0 ? (
            <ul className="flex w-full flex-col gap-2">
              {tiers.map((tier) => (
                <li
                  key={`${tier.minQty}-${tier.percent}`}
                  className="rounded-[16px] bg-light-gray px-5 py-3 text-[16px] font-medium leading-[1.3] text-text-dark max-[600px]:px-4 max-[600px]:py-2.5 max-[600px]:text-[13px]"
                >
                  {cartModalTier(locale, tier.minQty, tier.percent)}
                </li>
              ))}
            </ul>
          ) : null}
          <Button href={routes.catalog} className="mt-2 w-full">
            {copy.chooseVideos}
          </Button>
        </div>
      </div>
    </div>
  );
}
