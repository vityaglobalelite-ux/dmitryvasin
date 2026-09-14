"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthEntryChip } from "@/components/site/auth/AuthModal";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { CartCount } from "@/components/site/cart/CartCount";
import { NotificationBell } from "@/components/site/notifications/NotificationBell";
import { LangDesktop, LangMobile } from "@/components/site/SiteLangSwitcher";

function CartMark({ className }: { className?: string }) {
  return (
    <span
      className={["relative block size-[35px] max-[600px]:size-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={siteAssets.cartCircle}
        alt=""
        width={35}
        height={35}
        className="absolute inset-0 size-full"
      />
      <img
        src={siteAssets.cartBody}
        alt=""
        width={18}
        height={12}
        className="absolute left-[8px] top-[10px] h-3 w-[18px] max-[600px]:left-[7px] max-[600px]:top-[9px]"
      />
      <img
        src={siteAssets.cartWheel}
        alt=""
        width={3}
        height={3}
        className="absolute left-[11px] top-[24px] size-[3px] max-[600px]:left-[10px] max-[600px]:top-[22px]"
      />
      <img
        src={siteAssets.cartWheel}
        alt=""
        width={3}
        height={3}
        className="absolute left-[21px] top-[24px] size-[3px] max-[600px]:left-[19px] max-[600px]:top-[22px]"
      />
    </span>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();

  const navItems = [
    { href: routes.catalog, label: copy.nav.catalog },
    { href: routes.accountSupport, label: copy.nav.support },
    { href: `${routes.home}#reviews`, label: copy.nav.reviews },
    { href: `${routes.home}#contacts`, label: copy.nav.contacts },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="flex h-[50px] items-center justify-between border-b border-[#ececec] px-[12.5%] max-[600px]:h-auto max-[600px]:border-b-0 max-[600px]:px-5 max-[600px]:pt-2.5">
        <nav
          className="hidden items-center gap-7 text-[16px] leading-normal text-text min-[601px]:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-opacity duration-150 hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5 max-[600px]:w-full max-[600px]:gap-3">
          <div className="max-[600px]:mr-auto min-[601px]:order-2">
            <AuthEntryChip />
          </div>
          <div className="hidden min-[601px]:order-1 min-[601px]:block">
            <LangDesktop />
          </div>
          <div className="hidden max-[600px]:block">
            <LangMobile />
          </div>
          <div className="relative flex items-center gap-3 min-[601px]:order-3">
            <NotificationBell />
            <Link
              href={routes.cart}
              className="relative transition-transform duration-150 hover:scale-[1.04] active:scale-95"
              aria-label={copy.nav.cart}
            >
              <CartMark />
              <CartCount />
            </Link>
          </div>
          <button
            type="button"
            className="relative hidden size-8 max-[600px]:block"
            aria-expanded={open}
            aria-label={open ? copy.nav.closeMenu : copy.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <img
              src={siteAssets.menuCircle}
              alt=""
              width={32}
              height={32}
              className="absolute inset-0 size-8"
            />
            <span className="absolute inset-x-[8px] top-[11px] flex h-[10px] flex-col justify-between">
              <span
                className={`block h-0.5 rounded-[10px] bg-white transition-transform ${open ? "translate-y-[4px] rotate-45" : ""}`}
              />
              <span
                className={`block h-0.5 rounded-[10px] bg-white transition-opacity ${open ? "opacity-0" : ""}`}
              />
              <span
                className={`block h-0.5 rounded-[10px] bg-white transition-transform ${open ? "-translate-y-[4px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="hidden flex-col gap-4 bg-white px-5 pb-5 pt-4 max-[600px]:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[16px] text-text transition-opacity hover:opacity-70"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
