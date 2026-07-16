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
        {/* дуги слева/центре */}
        <img
          src={landingAssets.hero.swirl}
          alt=""
          className="pointer-events-none absolute left-[-156px] top-[-15px] h-[788px] w-[1100px] max-w-none object-cover object-left"
        />
        {/* справа персик со мягким горизонтальным fade — без жёсткой вертикали */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-[520px]"
          style={{
            background:
              "linear-gradient(90deg, rgba(239,185,145,0) 0%, rgba(239,185,145,0.55) 38%, #efb991 72%)",
          }}
        />
      </div>

      {/* белая дуга с точками — ЗА человеком */}
      <img
        src={landingAssets.hero.arcLine}
        alt=""
        className="pointer-events-none absolute left-[1312px] top-[112px] z-[1] h-[686px] w-[138px]"
      />

      {/* Дмитрий: без fade/mask, поверх фона и дуги */}
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

      <p className="absolute left-[553px] top-[344px] z-[3] w-[427px] text-[24px] font-semibold leading-[32px] text-white">
        Готовы по-новому прочувствовать и понять свой танец?
      </p>

      <div className="absolute left-[302px] top-[464px] z-[1] h-[273px] w-[532px] overflow-hidden rounded-[30px] bg-white shadow-[0px_4px_24px_rgba(0,0,0,0.08)]">
        <img
          src={landingAssets.hero.promoDecor}
          alt=""
          className="pointer-events-none absolute right-0 top-0 h-full"
        />
      </div>
      <p className="absolute left-[332px] top-[488px] z-[4] w-[479px] text-[24px] font-semibold leading-[32px] text-text-dark">
        Приглашаю вас провести следующие 3 месяца вместе со мной.
      </p>
      <p className="absolute left-[332px] top-[562px] z-[4] w-[387px] text-[14px] leading-[21px] text-text opacity-70">
        Настало время поделиться тем, что обычно остаётся между преподавателем
        и учеником.
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
