"use client";

import { useState } from "react";
import { Logo } from "@/components/landing/Logo";
import { landingAssets } from "@/lib/landing-assets";
import { useIsMobile } from "@/lib/landing-mode";

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

const allNav = [...nav.left, ...nav.right];

/* Figma: Rect26 (242,113,1440×684); Dmitry (788,86,760×711) */
const DMITRY_TOP = 86;
const DMITRY_H = 711;

function HeroMobile() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="absolute left-0 top-0 h-[980px] w-[360px]">
      {/* Nav 257:2466 — 20,10,320×46 */}
      <header className="absolute left-[20px] top-[10px] z-20 flex h-[46px] w-[320px] items-center rounded-[20px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.15)]">
        <div className="absolute left-[10px] top-[12px]">
          <Logo size="mobile" />
        </div>
        <button
          type="button"
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="absolute right-[10px] top-[7px] flex size-[32px] items-center justify-center rounded-full"
          style={{
            backgroundImage:
              "linear-gradient(98.43deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
          }}
        >
          <span className="flex w-[16px] flex-col gap-[2px]">
            <span className="h-[2px] w-full rounded-full bg-white" />
            <span className="h-[2px] w-full rounded-full bg-white" />
            <span className="h-[2px] w-full rounded-full bg-white" />
          </span>
        </button>
      </header>

      {menuOpen ? (
        <nav className="absolute left-[20px] top-[64px] z-30 flex w-[320px] flex-col gap-[16px] rounded-[20px] bg-white p-[20px] shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
          {allNav.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-[16px] leading-[21px] text-text hover:text-accent-red"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      ) : null}

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
            href="#tariffs"
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
    <section className="absolute left-0 top-0 h-[900px] w-[1920px]">
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
        href="#tariffs"
        className="btn-primary absolute left-[332px] top-[647px] z-[4]"
      >
        Присоединиться
      </a>
      <a
        href="#tariffs"
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
