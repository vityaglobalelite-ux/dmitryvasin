"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthEntryChip } from "@/components/site/auth/AuthModal";
import { CartCount } from "@/components/site/cart/CartCount";
import { LangDesktop, LangMobile } from "@/components/site/SiteLangSwitcher";
import { siteAssets } from "@/lib/catalog/assets";
import { clubPath } from "@/lib/club-config";
import { useCatalogT, useLocalizedRoutes } from "@/lib/catalog/locale-context";

function CartMark({ size = 35 }: { size?: 32 | 35 }) {
  const scale = size / 35;
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <img
        src={siteAssets.cartCircle}
        alt=""
        width={size}
        height={size}
        className="absolute inset-0 size-full"
      />
      <img
        src={siteAssets.cartBody}
        alt=""
        width={18}
        height={12}
        className="absolute h-3 w-[18px]"
        style={{ left: 8 * scale, top: 10 * scale }}
      />
      <img
        src={siteAssets.cartWheel}
        alt=""
        width={3}
        height={3}
        className="absolute size-[3px]"
        style={{ left: 11 * scale, top: 24 * scale }}
      />
      <img
        src={siteAssets.cartWheel}
        alt=""
        width={3}
        height={3}
        className="absolute size-[3px]"
        style={{ left: 21 * scale, top: 24 * scale }}
      />
    </span>
  );
}

function useHomeNav() {
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  return [
    { href: routes.catalog, label: copy.nav.catalog },
    { href: routes.accountSupport, label: copy.nav.support },
    { href: `${routes.home}#reviews`, label: copy.nav.reviews },
    { href: `${routes.home}#contacts`, label: copy.nav.contacts },
  ] as const;
}

export function HomeHeaderDesktop() {
  const items = useHomeNav();
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();

  return (
    <header className="absolute left-0 top-[15px] z-50 h-[50px] w-[1920px]">
      <nav
        className="absolute left-[240px] top-[10px] flex items-center gap-7 text-[16px] leading-normal text-text"
        aria-label="Primary"
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="transition-opacity duration-150 hover:opacity-70"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute right-[242px] top-0 flex h-[35px] items-center gap-5">
        <LangDesktop />
        <AuthEntryChip />
        <Link
          href={routes.cart}
          className="relative size-[35px] transition-transform duration-150 hover:scale-[1.04] active:scale-95"
          aria-label={copy.nav.cart}
        >
          <CartMark />
          <CartCount />
        </Link>
      </div>
    </header>
  );
}

export function HomeHeaderMobile() {
  const [open, setOpen] = useState(false);
  const items = useHomeNav();
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();

  return (
    <>
      <header className="absolute left-5 top-2.5 z-50 h-8 w-[320px]">
        <div className="absolute left-0 top-0">
          <AuthEntryChip compact />
        </div>
        <div className="absolute left-[185px] top-0 flex h-8 w-[45px] items-center justify-center">
          <LangMobile />
        </div>
        <Link
          href={routes.cart}
          className="absolute left-[240px] top-0 size-8 transition-transform duration-150 hover:scale-[1.04] active:scale-95"
          aria-label={copy.nav.cart}
        >
          <CartMark size={32} />
          <CartCount />
        </Link>
        <button
          type="button"
          className="absolute left-[288px] top-0 size-8"
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
          <span className="absolute inset-x-2 top-[11px] flex h-[10px] flex-col justify-between">
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
      </header>
      {open ? (
        <nav
          className="absolute left-5 top-[50px] z-50 flex w-[320px] flex-col gap-4 rounded-[16px] bg-white p-4 shadow-[0_8px_30px_rgba(76,13,50,0.12)]"
          aria-label="Primary"
        >
          {items.map((item) => (
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
    </>
  );
}

function Social({ size }: { size: 24 | 30 }) {
  const copy = useCatalogT();
  const wrap = size === 24 ? "size-10 rounded-3xl" : "size-[50px] rounded-[30px]";
  const items = [
    {
      href: "https://t.me/DmitryVasinTango",
      icon: siteAssets.telegram,
      label: copy.footer.telegram,
    },
    {
      href: "https://vk.ru/dmitryvasintango",
      icon: siteAssets.vk,
      label: copy.footer.vk,
    },
    {
      href: "mailto:Support@betango.dance",
      icon: siteAssets.mail,
      label: copy.footer.email,
    },
  ] as const;

  return (
    <>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-[image:var(--brand-gradient)] transition-transform duration-150 hover:scale-105 active:scale-95 ${wrap}`}
          aria-label={item.label}
          target={item.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={item.href.startsWith("mailto:") ? undefined : "noreferrer"}
        >
          <img
            src={`${item.icon}?v=fig`}
            alt=""
            width={size}
            height={size}
            className={size === 24 ? "size-6" : "size-[30px]"}
          />
        </a>
      ))}
    </>
  );
}

export function HomeFooterDesktop() {
  const copy = useCatalogT();
  const legal = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: clubPath("dmca-page"), label: copy.footer.dmca },
  ] as const;

  return (
    <footer
      id="contacts"
      className="absolute left-0 top-[8380px] z-20 h-[324px] w-[1920px] bg-light-gray"
    >
      <div className="absolute left-[241px] top-[100px] w-[520px] text-[16px] leading-[1.5] text-text">
        {copy.footer.rights.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="absolute left-[241px] top-[212px] text-[16px] leading-[1.5] text-text">
        {copy.footer.copyright}
      </p>
      <nav className="absolute left-[848px] top-[100px] flex w-[297px] flex-col gap-5 text-[16px] leading-[1.5] text-text">
        {legal.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="absolute left-[1510px] top-[100px] flex items-center gap-[10px]">
        <Social size={30} />
      </div>
    </footer>
  );
}

export function HomeFooterMobile() {
  const copy = useCatalogT();
  const legal = [
    { href: clubPath("privacy-policy"), label: copy.footer.privacy },
    { href: clubPath("subscription-agreement"), label: copy.footer.offer },
    { href: "#mailing-consent", label: copy.footer.mailing },
  ] as const;

  return (
    <footer
      id="contacts"
      className="absolute left-5 top-[9586px] z-20 flex w-[320px] flex-col gap-10"
    >
      <div className="flex items-center gap-2.5">
        <Social size={24} />
      </div>
      <p className="text-[12px] leading-[1.5] text-text">{copy.footer.metaBan}</p>
      <nav className="flex flex-col gap-2.5 text-[13px] leading-[1.5] text-text">
        {legal.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="text-[13px] leading-[1.5] text-text">
        {copy.footer.rights.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <p className="text-[13px] leading-[1.5] text-text">{copy.footer.copyright}</p>
    </footer>
  );
}
