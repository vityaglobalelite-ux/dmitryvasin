"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Logo } from "@/components/landing/Logo";
import { landingAssets } from "@/lib/landing-assets";
import { telegramBotUrl, telegramSupportBotUrl } from "@/lib/landing-data";
import { MOBILE_CANVAS, useIsMobile } from "@/lib/landing-mode";

const nav = {
  left: [
    { label: "О клубе", href: "#about" },
    { label: "Программа", href: "#program" },
  ],
  right: [
    { label: "Тарифы", href: "#tariffs" },
    { label: "Контакты", href: "#contacts" },
  ],
};

/* Figma 343:1854 — mobile menu open */
const mobileMenuLinks = [
  { label: "О клубе", href: "#about" },
  { label: "Маршрут исследования", href: "#program" },
  { label: "Тарифы", href: "#tariffs" },
  { label: "Отзывы", href: "#reviews" },
  { label: "Тех. поддержка", href: telegramSupportBotUrl },
  { label: "Контакты", href: "#contacts" },
] as const;

const MENU_CLOSE_MS = 260;

/* Figma: Rect26 (242,113,1440×684); Dmitry (788,86,760×711) */
const DMITRY_TOP = 86;
const DMITRY_H = 711;

function HeroMobile() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrolled, setScrolled] = useState(false);
  const menuVisible = menuOpen || closing;

  const openMenu = () => {
    setClosing(false);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    if (!menuOpen || closing) return;
    setClosing(true);
  };

  const toggleMenu = () => {
    if (menuOpen) closeMenu();
    else openMenu();
  };

  useEffect(() => {
    setMounted(true);
    const applyZoom = () => {
      const w =
        window.visualViewport?.width ?? document.documentElement.clientWidth;
      setZoom(w / MOBILE_CANVAS.w);
    };
    applyZoom();
    window.addEventListener("resize", applyZoom);
    window.visualViewport?.addEventListener("resize", applyZoom);
    return () => {
      window.removeEventListener("resize", applyZoom);
      window.visualViewport?.removeEventListener("resize", applyZoom);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!closing) return;
    const t = window.setTimeout(() => {
      setMenuOpen(false);
      setClosing(false);
    }, MENU_CLOSE_MS);
    return () => window.clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const stickyNav =
    mounted &&
    createPortal(
      <>
        {menuVisible ? (
          <button
            type="button"
            aria-label="Закрыть меню"
            className={`fixed inset-0 z-[99] bg-[rgba(0,0,0,0.2)] ${
              closing ? "mobile-menu-backdrop-out" : "mobile-menu-backdrop-in"
            }`}
            onClick={closeMenu}
          />
        ) : null}

        {/*
          Outside FigCanvas — full-bleed dock.
          Important: do NOT scale this shell with transform (iOS Telegram WKWebView
          leaves a gap above fixed+transform layers where page content peeks through).
          Use CSS zoom like FigCanvas, plus an unscaled white seal with upward bleed.
        */}
        {scrolled ? (
          <div
            aria-hidden
            className="mobile-nav-veil-in pointer-events-none fixed inset-x-0 top-0 z-[100] bg-white"
            style={{
              height: Math.ceil(56 * zoom) + 2,
              /* Solid white above the bar — covers Telegram iOS / rubber-band gaps */
              boxShadow: "0 -160px 0 160px #fff",
            }}
          />
        ) : null}

        <div
          className="fixed top-0 left-0 z-[100]"
          style={{
            width: MOBILE_CANVAS.w,
            zoom,
          }}
        >
          {scrolled ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0"
              style={{ top: -240, height: 296 }}
            >
              <div className="h-[276px] w-full bg-white" />
              <div
                className="h-[20px] w-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)",
                }}
              />
            </div>
          ) : null}

          {/* Nav 257:2466 — 20,10,320×46; open state Figma 343:1110 */}
          <header
            className={`absolute flex items-center bg-white transition-[left,top,width,height,border-radius,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              scrolled
                ? "mobile-nav-docked left-0 top-0 h-[56px] w-[360px] rounded-b-[22px] shadow-[0_6px_18px_rgba(0,0,0,0.04)]"
                : "left-[20px] top-[10px] h-[46px] w-[320px] rounded-[20px] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.15)]"
            }`}
          >
            <div
              className={`absolute transition-[left,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                scrolled ? "left-[20px] top-[17px]" : "left-[10px] top-[12px]"
              }`}
            >
              <Logo size="mobile" />
            </div>
            <button
              type="button"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
              onClick={toggleMenu}
              className={`absolute flex size-[32px] items-center justify-center rounded-full transition-[right,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                scrolled ? "right-[20px] top-[12px]" : "right-[10px] top-[7px]"
              }`}
              style={{
                backgroundImage:
                  "linear-gradient(98.43deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
              }}
            >
              <span className="relative size-[16px]">
                <span
                  className={`absolute left-0 top-[3px] h-[2px] w-full rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    menuOpen && !closing
                      ? "translate-y-[4px] rotate-45"
                      : ""
                  }`}
                />
                <span
                  className={`absolute left-0 top-[7px] h-[2px] w-full rounded-full bg-white transition-opacity duration-200 ${
                    menuOpen && !closing ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-[11px] h-[2px] w-full rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    menuOpen && !closing
                      ? "-translate-y-[4px] -rotate-45"
                      : ""
                  }`}
                />
              </span>
            </button>
          </header>

          {menuVisible ? (
            <nav
              className={`absolute left-[20px] top-[66px] z-40 flex w-[320px] flex-col items-stretch gap-[30px] rounded-[10px] bg-white p-[20px] shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] ${
                closing ? "mobile-menu-panel-out" : "mobile-menu-panel-in"
              }`}
              aria-label="Мобильное меню"
            >
              <div className="flex w-full flex-col items-stretch gap-[10px]">
                {mobileMenuLinks.map((l, i) => (
                  <div key={l.label} className="contents">
                    <a
                      href={l.href}
                      className="text-right text-[16px] font-normal leading-[normal] text-text"
                      onClick={closeMenu}
                      {...(l.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {l.label}
                    </a>
                    {i < mobileMenuLinks.length - 1 ? (
                      <div className="relative h-0 w-full shrink-0" aria-hidden>
                        <img
                          src={landingAssets.dividers.line}
                          alt=""
                          className="absolute inset-x-0 -top-px h-px w-full max-w-none"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <a
                href={telegramSupportBotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-mobile !w-full"
                onClick={closeMenu}
              >
                Написать в поддержку
              </a>
            </nav>
          ) : null}
        </div>
      </>,
      document.body,
    );

  return (
    <section
      className="absolute left-0 top-0 h-[980px] w-[360px]"
      data-eager-images
    >
      {stickyNav}

      {/*
        Stage 257:2482 — 19,76,321×843 r20
        Coords relative to stage. Person is BELOW white card (Figma y571+).
      */}
      <div
        className="absolute left-[19px] top-[76px] z-0 h-[843px] w-[321px] overflow-hidden rounded-[20px]"
        style={{
          backgroundImage:
            "linear-gradient(98.43deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        {/* Only Figma Vector 507 — one soft swoosh behind the person (page −107,566 → rel −126,490) */}
        <img
          src={`${landingAssets.hero.swirlMobile}`}
          alt=""
          className="pointer-events-none absolute left-[-126px] top-[490px] z-0 h-[266px] w-[510px] max-w-none"
        />

        {/* Titles + calendar + subtitle */}
        <p className="hero-display-mobile absolute left-[16px] top-[17px] z-[2]">
          90 дней
        </p>
        <p className="hero-display-mobile absolute left-[15px] top-[56px] z-[2]">
          Исследования
        </p>
        <p className="hero-display-mobile absolute left-[15px] top-[95px] z-[2]">
          танго
        </p>
        <img
          src={landingAssets.hero.calendarChipMobile}
          alt=""
          className="absolute left-[128px] top-[102px] z-[2] size-[30px]"
          width={30}
          height={30}
        />
        <p className="absolute left-[17px] top-[147px] z-[2] w-[265px] whitespace-pre-line text-[18px] font-normal leading-[24px] text-white">
          {`Готовы `}
          <span className="font-bold">{`по-новому
прочувствовать и понять`}</span>
          {`
свой танец?`}
        </p>

        {/*
          White card — overflow-hidden so orange glow cannot spill onto the person (that was the "fade").
          Figma Rect 25: page 35,327 → rel 16,251 / 290×244. Bottom edge = 495.
        */}
        <div className="absolute left-[16px] top-[251px] z-20 h-[244px] w-[290px] overflow-hidden rounded-[20px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
          <div
            className="pointer-events-none absolute left-[78px] top-[145px] size-[299px] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(224,76,41,0.45) 0%, rgba(239,185,145,0.2) 40%, rgba(224,76,41,0) 70%)",
            }}
          />
          <p className="absolute left-[15px] top-[15px] z-[1] w-[258px] whitespace-pre-line text-[18px] font-medium leading-[24px] text-text">
            {`Приглашаю вас провести
следующие 3 месяца
вместе со мной.`}
          </p>
          <p className="absolute left-[15px] top-[93px] z-[1] w-[249px] whitespace-pre-line text-[13px] font-medium leading-[17px] text-text">
            {`Настало время поделиться тем,
что обычно остаётся между
преподавателем и учеником.`}
          </p>
          <a
            href={telegramBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary-mobile absolute left-[15px] top-[164px] z-[1]"
          >
            Присоединиться
          </a>
        </div>

        {/*
          Person STRICTLY below white card.
          Figma Untitled-2 257:2514: page y590 → rel top 514 (card bottom is 495).
          No opacity / mask / fade.
        */}
        <img
          src={`${landingAssets.hero.dmitryMobile}`}
          alt="Дмитрий Васин"
          className="pointer-events-none absolute left-[-14px] top-[514px] z-10 h-[330px] w-[353px] max-w-none object-cover object-top"
        />
      </div>
    </section>
  );
}

function HeroDesktop() {
  return (
    <section
      className="absolute left-0 top-0 h-[900px] w-[1920px]"
      data-eager-images
    >
      <div className="absolute left-[242px] top-[113px] z-0 h-[684px] w-[1440px] overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]">
        <img
          src={landingAssets.hero.swirl}
          alt=""
          className="pointer-events-none absolute left-[-156px] top-[-15px] h-[788px] w-[1517px] max-w-none"
        />
        <img
          src={landingAssets.hero.glow}
          alt=""
          className="pointer-events-none absolute left-[658px] top-[-15px] h-[899px] w-[522px] max-w-none"
        />
        <svg
          className="pointer-events-none absolute left-[1071px] top-0 h-[684px] w-[369px]"
          viewBox="0 0 368.629 684"
          fill="none"
          aria-hidden
        >
          <path
            d="M328.629 0C350.72 5.37957e-06 368.629 17.9086 368.629 40V644C368.629 666.091 350.72 684 328.629 684H0C81.2328 593.24 130.629 473.389 130.629 342C130.629 210.611 81.2328 90.7596 0 0H328.629Z"
            fill="#E04C29"
            fillOpacity={0.4}
          />
        </svg>
      </div>

      <img
        src={landingAssets.hero.arcLine}
        alt=""
        className="pointer-events-none absolute left-[1312px] top-[112px] z-[1] h-[686px] w-[138px]"
      />

      <div
        className="pointer-events-none absolute left-[788px] z-[2] w-[760px] overflow-hidden"
        style={{ top: DMITRY_TOP, height: DMITRY_H }}
      >
        <img
          src={landingAssets.hero.dmitry}
          alt="Дмитрий Васин"
          className="absolute left-0 top-0 h-[711px] w-[760px] object-contain object-top"
        />
      </div>

      <img
        src={landingAssets.hero.calendarChip}
        alt=""
        className="absolute left-[296px] top-[179px] z-[3] size-[58px]"
        width={58}
        height={58}
      />
      <p className="hero-display absolute left-[369px] top-[160px] z-[3]">
        90 дней
      </p>
      <p className="hero-display absolute left-[296px] top-[244px] z-[3]">
        Исследования
      </p>
      <p className="hero-display absolute left-[296px] top-[327px] z-[3]">
        танго
      </p>

      <p className="absolute left-[553px] top-[344px] z-[3] w-[427px] whitespace-pre-line text-[24px] font-normal leading-[32px] text-white">
        {`Готовы `}
        <span className="font-bold">по-новому</span>
        {` прочувствовать\nи `}
        <span className="font-bold">понять</span>
        {` свой танец?`}
      </p>

      <div className="absolute left-[302px] top-[464px] z-[1] h-[273px] w-[532px] overflow-hidden rounded-[30px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
        <img
          src={landingAssets.hero.promoDecor}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full"
        />
      </div>
      <p className="absolute left-[332px] top-[488px] z-[4] w-[479px] text-[24px] font-medium leading-[32px] text-text-dark">
        Приглашаю вас&nbsp;провести следующие
        <br />
        <span className="font-bold">3 месяца вместе со&nbsp;мной.</span>
      </p>
      <p className="absolute left-[332px] top-[562px] z-[4] w-[387px] text-[16px] font-normal leading-[21px] text-text opacity-70">
        Настало время поделиться тем, что&nbsp;обычно
        <br />
        остаётся между преподавателем и&nbsp;учеником.
      </p>
      <a
        href={telegramBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary absolute left-[332px] top-[647px] z-[4]"
      >
        Присоединиться
      </a>
      <a
        href={telegramBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute left-[601px] top-[647px] z-[4] size-[60px]"
      >
        <img
          src={landingAssets.hero.arrowButton}
          alt=""
          className="size-full"
          width={60}
          height={60}
        />
      </a>

      {heroArcItems.map((item) => (
        <div
          key={item.label}
          className="absolute z-[4] flex flex-col items-center gap-[10px]"
          style={{ left: item.x, top: item.y, width: item.w }}
        >
          <img
            src={item.icon}
            alt=""
            className="size-[60px]"
            width={60}
            height={60}
          />
          <span className="text-center text-[14px] font-semibold leading-[19px] text-white">
            {item.label}
          </span>
        </div>
      ))}

      <header className="absolute left-[240px] top-[20px] z-10 flex h-[66px] w-[1440px] items-center rounded-[20px] bg-white px-[23px] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.15)]">
        <nav className="absolute left-[23px] top-[23px] flex gap-[28px] text-[16px] leading-[21px] text-text">
          {nav.left.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-accent-red">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Logo />
        </div>
        <nav className="absolute right-[32px] top-[22px] flex gap-[40px] text-[16px] leading-[21px] text-text">
          {nav.right.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-accent-red">
              {l.label}
            </a>
          ))}
        </nav>
      </header>
    </section>
  );
}

export function HeroSection() {
  const isMobile = useIsMobile();
  return isMobile ? <HeroMobile /> : <HeroDesktop />;
}

const heroArcItems = [
  {
    label: "Осознавание",
    icon: landingAssets.hero.iconAwareness,
    x: 1450,
    y: 166,
    w: 98,
  },
  {
    label: "Техника",
    icon: landingAssets.hero.iconTechnique,
    x: 1508,
    y: 288,
    w: 60,
  },
  {
    label: "Вариативность",
    icon: landingAssets.hero.iconVariability,
    x: 1496,
    y: 410,
    w: 107,
  },
  {
    label: "Взаимодействие",
    icon: landingAssets.hero.iconInteraction,
    x: 1478,
    y: 532,
    w: 120,
  },
  {
    label: "Музыкальность",
    icon: landingAssets.hero.iconMusicality,
    x: 1444,
    y: 654,
    w: 110,
  },
];
