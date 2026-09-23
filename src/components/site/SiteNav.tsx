"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import { usePathname } from "next/navigation";
import { AuthEntryChip } from "@/components/site/auth/AuthModal";
import { siteAssets } from "@/lib/catalog/assets";
import { SITE_CANVAS_WIDTH_VAR, SITE_MOBILE_MAX_WIDTH } from "@/lib/catalog/breakpoint";
import { stripLocalePrefix } from "@/lib/catalog/locale";
import { useCatalogT, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { useCatalogReturnHref } from "@/lib/catalog/return-to";
import {
  scrollToSiteSection,
  scrollToSiteTop,
  useHomeSection,
  type HomeSection,
} from "@/lib/catalog/section-scroll";
import { siteFocusRing } from "@/components/site/ui/Button";
import { CartCount } from "@/components/site/cart/CartCount";
import { NotificationBell } from "@/components/site/notifications/NotificationBell";
import { SupportNavLink } from "@/components/site/notifications/SupportNavLink";
import { LangDesktop, LangMobile } from "@/components/site/SiteLangSwitcher";

/** Same curve as the privateclub nav dock. */
const EASE_OUT = "ease-[cubic-bezier(0.22,1,0.36,1)]";
/** Matches `.mobile-menu-panel-out`. */
const MENU_CLOSE_MS = 260;
/** Home header picks up its surface once the hero starts moving. */
const HOME_SURFACE_SCROLL_Y = 8;
/** Page travel that dismisses the open phone menu. */
const MENU_SCROLL_DISMISS_PX = 10;

type NavKey = "home" | "catalog" | "support" | "reviews" | "contacts";

type NavItem = {
  key: NavKey;
  href: string;
  label: string;
  /** Home anchor — glides in place on the home page. */
  section?: HomeSection;
};

/**
 * home — pinned over the Figma canvas, surface appears on scroll;
 * product — scrolls away over the product hero;
 * page — sticky white bar.
 */
type HeaderVariant = "home" | "product" | "page";

const sectionNavKey: Record<HomeSection, NavKey> = {
  top: "home",
  reviews: "reviews",
  contacts: "contacts",
};

function pageNavKey(stripped: string): NavKey | null {
  if (stripped.startsWith("/catalog/") || stripped.startsWith("/product/")) {
    return "catalog";
  }
  if (stripped.startsWith("/support/")) return "support";
  return null;
}

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

function innerBackHref(
  pathname: string,
  routes: ReturnType<typeof useLocalizedRoutes>,
  productReturn: string,
): string | null {
  const stripped = stripLocalePrefix(pathname);
  if (stripped === "/") return null;
  if (stripped.startsWith("/product/")) return productReturn;
  if (stripped.startsWith("/catalog/")) return routes.home;
  if (stripped.startsWith("/support")) return routes.home;
  if (stripped.startsWith("/cart/") || stripped.startsWith("/checkout/")) {
    return routes.catalog;
  }
  return routes.home;
}

function useScrolledPast(y: number, enabled: boolean): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const update = () => setPast(window.scrollY > y);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      // Next visit starts clean — no stale surface flashing in and fading out
      setPast(false);
    };
  }, [enabled, y]);
  return enabled && past;
}

type SelectItem = (item: NavItem, event: MouseEvent<HTMLAnchorElement>) => void;

function NavItemLink({
  item,
  active,
  className,
  onSelect,
}: {
  item: NavItem;
  active: boolean;
  className: string;
  onSelect: SelectItem;
}) {
  if (item.key === "support") {
    return (
      <SupportNavLink
        href={item.href}
        label={item.label}
        className={className}
        current={active}
      />
    );
  }
  return (
    <Link
      href={item.href}
      scroll={item.section ? false : undefined}
      aria-current={
        active ? (item.section && item.section !== "top" ? "location" : "page") : undefined
      }
      className={className}
      onClick={(event) => onSelect(item, event)}
    >
      {item.label}
    </Link>
  );
}

/** Desktop quick links with a pill that glides to the active one. */
function DesktopNav({
  items,
  activeKey,
  onSelect,
}: {
  items: readonly NavItem[];
  activeKey: NavKey | null;
  onSelect: SelectItem;
}) {
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef<{ x: number; w: number } | null>(null);
  const activeIndex = activeKey ? items.findIndex((item) => item.key === activeKey) : -1;

  useLayoutEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    const place = () => {
      const link =
        activeIndex >= 0
          ? nav.querySelectorAll<HTMLElement>(":scope > a")[activeIndex]
          : undefined;
      if (!link) {
        pill.style.opacity = "0";
        placed.current = null;
        return;
      }
      const x = link.offsetLeft;
      const w = link.offsetWidth;
      const prev = placed.current;
      if (prev && prev.x === x && prev.w === w) return;
      // First appearance fades in on the spot — it never slides from 0
      if (!prev) pill.style.transition = "none";
      pill.style.width = `${w}px`;
      pill.style.transform = `translateX(${x}px)`;
      if (!prev) {
        void pill.offsetWidth;
        pill.style.transition = "";
      }
      pill.style.opacity = "1";
      placed.current = { x, w };
    };

    place();
    // Web font swap / unread dot / locale change resize the links
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeIndex]);

  return (
    <nav
      ref={navRef}
      className="relative -ml-3 hidden items-center gap-1 text-[16px] leading-normal min-[601px]:flex"
      aria-label="Primary"
    >
      <span
        ref={pillRef}
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 rounded-full bg-plum/[0.07] opacity-0 ring-1 ring-plum/[0.05] transition-[transform,width,opacity] duration-500 ${EASE_OUT} motion-reduce:transition-none`}
      />
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <NavItemLink
            key={item.key}
            item={item}
            active={active}
            onSelect={onSelect}
            className={`relative rounded-full px-3 py-1.5 transition-[color,opacity] duration-200 ${
              active ? "text-plum" : "text-text hover:opacity-70"
            } ${siteFocusRing}`}
          />
        );
      })}
    </nav>
  );
}

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  const pathname = usePathname() ?? "/";
  const productReturn = useCatalogReturnHref(routes.catalog);
  const backHref = innerBackHref(pathname, routes, productReturn);
  const stripped = stripLocalePrefix(pathname);
  const variant: HeaderVariant =
    stripped === "/" ? "home" : stripped.startsWith("/product/") ? "product" : "page";
  const onHome = variant === "home";

  const homeSection = useHomeSection(onHome);
  const scrolled = useScrolledPast(HOME_SURFACE_SCROLL_Y, onHome);
  const activeKey = onHome ? sectionNavKey[homeSection] : pageNavKey(stripped);

  // Any navigation (links, browser back, locale switch) drops the menu at once
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
    setClosing(false);
  }

  const navItems: readonly NavItem[] = [
    { key: "home", href: routes.home, label: copy.nav.home, section: "top" },
    { key: "catalog", href: routes.catalog, label: copy.nav.catalog },
    { key: "support", href: routes.accountSupport, label: copy.nav.support },
    {
      key: "reviews",
      href: `${routes.home}#reviews`,
      label: copy.nav.reviews,
      section: "reviews",
    },
    {
      key: "contacts",
      href: `${routes.home}#contacts`,
      label: copy.nav.contacts,
      section: "contacts",
    },
  ];

  const menuVisible = menuOpen || closing;
  const menuActive = menuOpen && !closing;

  const openMenu = () => {
    setClosing(false);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (!menuOpen || closing) return;
    setClosing(true);
  };

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, MENU_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  /* No body scroll lock: modals own that, and two save/restore locks racing
     would leave the page frozen. Scrolling the page just dismisses the menu. */
  useEffect(() => {
    if (!menuActive) return;
    const openedAtY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAtY) > MENU_SCROLL_DISMISS_PX) setClosing(true);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
    };
    // The phone menu has no desktop counterpart — widening the window closes it
    const desktop = window.matchMedia(`(min-width: ${SITE_MOBILE_MAX_WIDTH + 1}px)`);
    const onDesktop = () => {
      if (desktop.matches) setClosing(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [menuActive]);

  /* Home anchors glide in place; from other pages the link navigates and
     useRouteScrollTop glides to the hash after arrival. */
  const onSelect: SelectItem = (item, event) => {
    if (!onHome || !item.section) return;
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    if (item.section === "top") void scrollToSiteTop();
    else void scrollToSiteSection(item.section);
  };

  /* Any press inside the header other than the burger itself (menu links,
     cart, language, sign-in) is a choice — the open menu gives way to it. */
  const onHeaderClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest("[data-menu-toggle]")) return;
    closeMenu();
  };

  const headerClass = {
    home: "pointer-events-none fixed inset-x-0 top-0 z-50",
    product: "relative z-50 border-b border-transparent bg-transparent max-[600px]:border-b-0",
    page: "sticky top-0 z-50 border-b border-[#ececec] bg-white max-[600px]:border-b-0",
  }[variant];

  const frameClass = onHome
    ? "mx-auto w-full px-[12.5%] pt-3 max-[600px]:px-5 max-[600px]:py-2.5"
    : "px-[12.5%] max-[600px]:px-5 max-[600px]:pt-2.5";

  const rowClass = onHome
    ? "pointer-events-auto relative flex h-[56px] items-center justify-between max-[600px]:h-8"
    : "relative flex h-[50px] items-center justify-between max-[600px]:h-auto";

  return (
    <>
      {menuVisible ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={copy.nav.closeMenu}
          className={`fixed inset-0 z-40 bg-black/20 min-[601px]:hidden ${
            closing ? "mobile-menu-backdrop-out" : "mobile-menu-backdrop-in"
          }`}
          onClick={closeMenu}
        />
      ) : null}

      <header data-site-header className={headerClass} onClickCapture={onHeaderClickCapture}>
        <div
          className={frameClass}
          style={onHome ? { maxWidth: `var(${SITE_CANVAS_WIDTH_VAR}, 100%)` } : undefined}
        >
          <div className={rowClass}>
            {onHome ? (
              <span
                aria-hidden
                className={`pointer-events-none absolute -inset-x-6 inset-y-0 rounded-[20px] shadow-[0_12px_40px_-12px_rgba(76,13,50,0.22)] ring-1 ring-plum/[0.06] backdrop-blur-xl backdrop-saturate-150 transition-[opacity,transform,background-color] duration-500 ${EASE_OUT} motion-reduce:transition-none max-[600px]:-inset-x-5 max-[600px]:-top-2.5 max-[600px]:-bottom-2.5 max-[600px]:origin-top max-[600px]:rounded-t-none max-[600px]:rounded-b-[20px] max-[600px]:ring-0 ${
                  // Opaque over the menu backdrop — translucency would pick up the dim
                  menuVisible ? "bg-white" : "bg-white/80"
                } ${
                  scrolled || menuVisible ? "scale-100 opacity-100" : "scale-[0.985] opacity-0"
                }`}
              />
            ) : null}

            <DesktopNav items={navItems} activeKey={activeKey} onSelect={onSelect} />

            <div className="relative flex items-center gap-5 max-[600px]:w-full max-[600px]:gap-3">
              {backHref ? (
                <Link
                  href={backHref}
                  className={`relative hidden size-8 shrink-0 items-center justify-center rounded-full transition-opacity duration-150 hover:opacity-70 max-[600px]:flex ${siteFocusRing}`}
                  aria-label={copy.nav.back}
                >
                  <span className="flex h-[11px] w-[7px] items-center justify-center" aria-hidden>
                    <img
                      src={siteAssets.back}
                      alt=""
                      width={11}
                      height={7}
                      className="h-[7px] w-[11px] -rotate-90"
                    />
                  </span>
                </Link>
              ) : null}
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
                  className={`relative rounded-full transition-transform duration-150 hover:scale-[1.04] active:scale-95 ${siteFocusRing}`}
                  aria-label={copy.nav.cart}
                >
                  <CartMark />
                  <CartCount />
                </Link>
              </div>
              <button
                type="button"
                data-menu-toggle
                className={`relative hidden size-8 rounded-full max-[600px]:block ${siteFocusRing}`}
                aria-expanded={menuActive}
                aria-label={menuActive ? copy.nav.closeMenu : copy.nav.menu}
                onClick={() => (menuActive ? closeMenu() : openMenu())}
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
                    className={`block h-0.5 rounded-[10px] bg-white transition-transform duration-300 ${EASE_OUT} ${menuActive ? "translate-y-[4px] rotate-45" : ""}`}
                  />
                  <span
                    className={`block h-0.5 rounded-[10px] bg-white transition-opacity duration-200 ${menuActive ? "opacity-0" : ""}`}
                  />
                  <span
                    className={`block h-0.5 rounded-[10px] bg-white transition-transform duration-300 ${EASE_OUT} ${menuActive ? "-translate-y-[4px] -rotate-45" : ""}`}
                  />
                </span>
              </button>
            </div>

            {menuVisible ? (
              <nav
                className={`absolute inset-x-0 top-full z-10 mt-2.5 flex flex-col gap-1 rounded-[16px] bg-white p-2 shadow-[0_12px_40px_-8px_rgba(76,13,50,0.22)] ring-1 ring-plum/[0.06] min-[601px]:hidden ${
                  closing ? "mobile-menu-panel-out" : "mobile-menu-panel-in"
                }`}
                aria-label="Primary"
              >
                {navItems.map((item) => {
                  const active = item.key === activeKey;
                  return (
                    <NavItemLink
                      key={item.key}
                      item={item}
                      active={active}
                      onSelect={onSelect}
                      className={`rounded-[12px] px-3 py-2.5 text-[16px] transition-colors duration-200 ${
                        active ? "bg-plum/[0.06] text-plum" : "text-text active:bg-plum/[0.04]"
                      } ${siteFocusRing}`}
                    />
                  );
                })}
              </nav>
            ) : null}
          </div>
        </div>
      </header>
    </>
  );
}
