import { landingAssets } from "@/lib/landing-assets";
import { heroDirections } from "@/lib/landing-data";

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

/* Figma: nav Rect24 (240,20,1440x66); hero Rect26 (242,113,1440x684) */
export function HeroSection() {
  return (
    <section className="absolute left-0 top-0 h-[900px] w-[1920px]">
      {/* decorative swirl behind everything */}
      <img
        src={landingAssets.hero.swirl}
        alt=""
        className="pointer-events-none absolute left-[86px] top-[98px] h-[788px] w-[1517px]"
      />

      {/* gradient card */}
      <div className="absolute left-[242px] top-[113px] h-[684px] w-[1440px] overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]">
        {/* white arc on the right */}
        <img
          src={landingAssets.hero.arcShape}
          alt=""
          className="absolute right-0 top-0 h-[684px] w-auto"
        />
      </div>

      {/* Dmitry photo (788,86,760x711) */}
      <img
        src={landingAssets.hero.dmitry}
        alt="Дмитрий Васин"
        className="absolute left-[788px] top-[86px] h-[711px] w-[760px] object-contain object-bottom"
      />

      {/* arc line with dots (1312,112,138x686) */}
      <img
        src={landingAssets.hero.arcLine}
        alt=""
        className="pointer-events-none absolute left-[1312px] top-[112px] h-[686px] w-[138px]"
      />

      {/* headline */}
      <div className="absolute left-[296px] top-[179px] flex items-center gap-[15px]">
        <span className="grid size-[58px] place-items-center rounded-full bg-white">
          <img src={landingAssets.icons.calendar} alt="" className="size-6" />
        </span>
        <span className="hero-display">90 дней</span>
      </div>
      <p className="hero-display absolute left-[296px] top-[244px]">
        Исследования
      </p>
      <p className="hero-display absolute left-[296px] top-[327px]">танго</p>

      <p className="absolute left-[553px] top-[344px] w-[427px] text-[24px] font-semibold leading-[32px] text-white">
        Готовы по-новому прочувствовать и понять свой танец?
      </p>

      {/* promo white card (302,464,532x273) */}
      <div className="absolute left-[302px] top-[464px] h-[273px] w-[532px] overflow-hidden rounded-[30px] bg-white">
        <img
          src={landingAssets.hero.promoDecor}
          alt=""
          className="pointer-events-none absolute -right-0 top-0 h-full"
        />
      </div>
      <p className="absolute left-[332px] top-[488px] w-[479px] text-[24px] font-semibold leading-[32px] text-text-dark">
        Приглашаю вас провести следующие 3 месяца вместе со мной.
      </p>
      <p className="absolute left-[332px] top-[562px] w-[387px] text-[14px] leading-[21px] text-text opacity-70">
        Настало время поделиться тем, что обычно остаётся между преподавателем
        и учеником.
      </p>
      <a
        href="#tariffs"
        className="absolute left-[332px] top-[647px] flex h-[60px] w-[259px] items-center justify-center rounded-[60px] bg-gradient-to-r from-[#9e151e] to-[#4c0d32] text-[16px] font-semibold text-white"
      >
        Присоединиться
      </a>
      <a
        href="#tariffs"
        className="absolute left-[601px] top-[647px] grid size-[60px] place-items-center rounded-full bg-gradient-to-r from-[#9e151e] to-[#4c0d32]"
      >
        <img src={landingAssets.hero.arrowButton} alt="" className="size-[10px]" />
      </a>

      {/* five directions along the arc */}
      {heroArcItems.map((item) => (
        <div
          key={item.label}
          className="absolute flex flex-col items-center gap-[10px]"
          style={{ left: item.x, top: item.y, width: item.w }}
        >
          <span className="grid size-[60px] place-items-center rounded-full bg-white/15 backdrop-blur-sm">
            <img src={item.icon} alt="" className="size-[28px]" />
          </span>
          <span className="text-center text-[14px] leading-[19px] text-white">
            {item.label}
          </span>
        </div>
      ))}

      {/* nav (240,20,1440x66) */}
      <header className="absolute left-[240px] top-[20px] flex h-[66px] w-[1440px] items-center rounded-[60px] bg-white px-[23px]">
        <nav className="flex gap-[28px] text-[16px] leading-[21px] text-text">
          {nav.left.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-accent-red">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[24px] leading-none tracking-tight text-text-dark">
          <span className="font-medium">Смотри.</span>{" "}
          <span className="font-bold italic text-accent-red">Повторяй.</span>{" "}
          <span className="font-semibold">Танцуй!</span>
        </div>
        <nav className="ml-auto flex gap-[40px] text-[16px] leading-[21px] text-text">
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

/* Figma frames 2373–2377 */
const heroArcItems = [
  { label: "Осознавание", icon: heroDirections[0].icon, x: 1450, y: 166, w: 98 },
  { label: "Техника", icon: heroDirections[1].icon, x: 1508, y: 288, w: 60 },
  { label: "Вариативность", icon: heroDirections[2].icon, x: 1496, y: 410, w: 107 },
  { label: "Взаимодействие", icon: heroDirections[3].icon, x: 1478, y: 532, w: 120 },
  { label: "Музыкальность", icon: heroDirections[4].icon, x: 1444, y: 654, w: 110 },
];
