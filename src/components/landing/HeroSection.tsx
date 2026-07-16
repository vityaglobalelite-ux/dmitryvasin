import { Logo } from "@/components/landing/Logo";
import { landingAssets } from "@/lib/landing-assets";

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

/* Figma: Rect26 (242,113,1440×684); Dmitry (788,86,760×711) */
const DMITRY_TOP = 86;
const DMITRY_H = 711;

export function HeroSection() {
  return (
    <section className="absolute left-0 top-0 h-[900px] w-[1920px]">
      <div className="absolute left-[242px] top-[113px] z-0 h-[684px] w-[1440px] overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]">
        {/* 249:1407 — мягкие белые дуги */}
        <img
          src={landingAssets.hero.swirl}
          alt=""
          className="pointer-events-none absolute left-[-156px] top-[-15px] h-[788px] w-[1517px] max-w-none"
        />
        {/* 249:1404 — тёплое свечение за человеком */}
        <img
          src={landingAssets.hero.glow}
          alt=""
          className="pointer-events-none absolute left-[658px] top-[-15px] h-[899px] w-[522px] max-w-none"
        />
        {/* 249:1458 — Subtract fill #E04C29 / 40% (inline: img не даёт opacity надёжно) */}
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

      {/* белая дуга с точками — ЗА человеком */}
      <img
        src={landingAssets.hero.arcLine}
        alt=""
        className="pointer-events-none absolute left-[1312px] top-[112px] z-[1] h-[686px] w-[138px]"
      />

      {/* Дмитрий: без fade/mask, поверх фона и Subtract */}
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
      {/* Involve Bold 80 / tracking -2.4 / uppercase */}
      <p className="hero-display absolute left-[369px] top-[160px] z-[3]">
        90 дней
      </p>
      <p className="hero-display absolute left-[296px] top-[244px] z-[3]">
        Исследования
      </p>
      <p className="hero-display absolute left-[296px] top-[327px] z-[3]">
        танго
      </p>

      {/* 249:1442 — Regular + Bold на отдельных словах, переносы как в макете */}
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
      {/* 249:1448 — Medium 24 / h64 = ровно 2 строки, без наезда на 249:1447 */}
      <p className="absolute left-[332px] top-[488px] z-[4] w-[479px] text-[24px] font-medium leading-[32px] text-text-dark">
        Приглашаю вас&nbsp;провести следующие
        <br />
        <span className="font-bold">3 месяца вместе со&nbsp;мной.</span>
      </p>
      {/* 249:1447 — Regular 16 */}
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
