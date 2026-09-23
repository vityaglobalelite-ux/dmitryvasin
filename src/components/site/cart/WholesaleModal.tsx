"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { cartAssets } from "@/components/site/cart/assets";
import { cartModalTier, cartT } from "@/components/site/cart/copy";
import { Button } from "@/components/site/ui/Button";
import { stripLocalePrefix } from "@/lib/catalog/locale";
import { getWholesaleTiers } from "@/lib/catalog/repo/settings";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { WholesaleTier } from "@/lib/catalog/types";
import { lockPageScroll } from "@/lib/scroll-lock";

type WholesaleModalProps = {
  open: boolean;
  onClose: () => void;
};

const CLOSE_MS = 240;

export function WholesaleModal({ open, onClose }: WholesaleModalProps) {
  const [tiers, setTiers] = useState<WholesaleTier[] | null>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const locale = useLocale();
  const copy = cartT(locale);
  const routes = useLocalizedRoutes();
  const pathname = usePathname() ?? "/";
  const onCatalog = stripLocalePrefix(pathname).startsWith("/catalog/");

  useEffect(() => {
    setHost(document.body);
  }, []);

  useEffect(() => {
    if (open) {
      setShown(true);
      setClosing(false);
      return;
    }
    if (!shown) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setShown(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, shown]);

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
    if (!shown || closing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const releaseScroll = lockPageScroll();
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      releaseScroll();
    };
  }, [shown, closing, onClose]);

  if (!shown || !host) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(37,37,37,0.48)] p-5 backdrop-blur-[6px] ${
        closing ? "auth-backdrop-out" : "auth-backdrop-in"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="wholesale-modal-title"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[520px] overflow-hidden rounded-[30px] bg-white p-10 shadow-[0_24px_80px_rgba(76,13,50,0.18)] max-[600px]:rounded-[20px] max-[600px]:p-5 ${
          closing ? "auth-panel-out" : "auth-panel-in"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={copy.modalClose}
          className="absolute right-5 top-5 grid size-8 place-items-center rounded-full transition-opacity hover:opacity-70 max-[600px]:right-3 max-[600px]:top-3"
        >
          <img
            src={cartAssets.remove}
            alt=""
            width={16}
            height={16}
            className="size-4"
          />
        </button>

        <div className="flex flex-col items-start gap-5">
          <span className="relative block size-[58px] overflow-hidden rounded-full bg-[image:var(--brand-gradient)] max-[600px]:size-10">
            <img
              src={cartAssets.graph}
              alt=""
              width={58}
              height={58}
              className="size-full"
            />
          </span>
          <h2
            id="wholesale-modal-title"
            className="max-w-[456px] bg-[image:var(--brand-gradient)] bg-clip-text text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-transparent max-[600px]:text-[20px] max-[600px]:tracking-[-0.4px]"
          >
            {copy.modalTitle}
          </h2>
          <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
            {copy.modalBody}
          </p>
          {tiers === null ? (
            <div className="flex w-full flex-col gap-2" aria-hidden>
              {Array.from({ length: 3 }, (_, index) => (
                <div
                  key={index}
                  className="h-[50px] rounded-[16px] bg-light-gray max-[600px]:h-11"
                />
              ))}
            </div>
          ) : tiers.length > 0 ? (
            <ul className="flex w-full flex-col gap-2">
              {tiers.map((tier) => (
                <li
                  key={`${tier.minQty}-${tier.percent}`}
                  className="flex items-center justify-between gap-4 rounded-[16px] bg-light-gray px-5 py-3.5 max-[600px]:px-4 max-[600px]:py-2.5"
                >
                  <span className="text-[16px] font-medium leading-[1.3] text-text-dark max-[600px]:text-[13px]">
                    {cartModalTier(locale, tier.minQty, tier.percent)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          {onCatalog ? (
            <Button type="button" onClick={onClose} className="mt-2 w-full">
              {copy.modalContinue}
            </Button>
          ) : (
            <Button href={routes.catalog} className="mt-2 w-full">
              {copy.chooseVideos}
            </Button>
          )}
        </div>
      </div>
    </div>,
    host,
  );
}
