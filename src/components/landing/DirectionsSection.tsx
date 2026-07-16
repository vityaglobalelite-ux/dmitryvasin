import { landingAssets } from "@/lib/landing-assets";

/* Figma: y 4277..5523 — светлая секция «5 направлений исследования» */

const cards = [
  {
    title: "Осознавание",
    x: 270,
    y: 4676,
    w: 392,
    h: 171,
    textW: 210,
    text: `Учимся замечать не\u00a0только
результат, но\u00a0и\u00a0то, как\u00a0он
возникает.`,
  },
  {
    title: "Техника",
    x: 242,
    y: 4941,
    w: 392,
    h: 195,
    textW: 234,
    text: `Разбираемся, почему одни
движения получаются легко,
а\u00a0другие требуют лишних
усилий`,
  },
  {
    title: "Музыкальность",
    x: 1217,
    y: 4558,
    w: 392,
    h: 195,
    textW: 228,
    text: `Уходим от\u00a0привычных
музыкальных решений и
ищем новые способы
взаимодействия с\u00a0музыкой.`,
  },
  {
    title: "Взаимодействие",
    x: 1210,
    y: 4843,
    w: 392,
    h: 195,
    textW: 231,
    text: `Ищем более понятные,
точные и\u00a0комфортные
способы взаимодействия в
паре.`,
  },
  {
    title: "Вариативность",
    x: 1288,
    y: 5096,
    w: 392,
    h: 195,
    textW: 253,
    text: `Постепенно обнаруживаем,
что\u00a0вариантов продолжения
движения гораздо больше,
чем\u00a0кажется на\u00a0первый взгляд.`,
  },
];

const illustrations = [
  { src: landingAssets.direction3d[0], x: 535, y: 4677, w: 127, h: 170 },
  { src: landingAssets.direction3d[1], x: 507, y: 4959, w: 127, h: 170 },
  { src: landingAssets.direction3d[2], x: 1456, y: 4558, w: 153, h: 195 },
  { src: landingAssets.direction3d[3], x: 1449, y: 4843, w: 153, h: 195 },
  { src: landingAssets.direction3d[4], x: 1548, y: 5096, w: 132, h: 195 },
];

export function DirectionsSection() {
  return (
    <>
      {/* image 34 — fade только сверху фона; человек без mask, выше по z */}
      <div className="absolute left-0 top-[4403px] z-0 h-[1120px] w-[1920px] overflow-hidden bg-white">
        <img
          src={landingAssets.backgrounds.directionsFull}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-0% to-transparent to-[17.6%]" />
      </div>

      <img
        src={landingAssets.masks.directionsGlow}
        alt=""
        className="pointer-events-none absolute left-[683px] top-[4550px] z-[1] h-[972px] w-[460px] object-fill"
      />
      <img
        src={`${landingAssets.photos.dmitryDirectionsFull}?v=2`}
        alt="Дмитрий Васин"
        className="pointer-events-none absolute left-[481px] top-[4277px] z-[2] h-[1246px] w-[915px] object-contain object-top"
      />

      <h2 className="h-section absolute left-[242px] top-[4448px] z-[3] w-[395px] whitespace-pre">
        {`5 направлений
исследования`}
      </h2>

      {cards.map((c) => (
        <div
          key={c.title}
          className="absolute z-[3] flex flex-col gap-[10px] rounded-[20px] bg-light-gray p-[30px]"
          style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
        >
          <h3 className="text-[24px] font-medium leading-[1.2] text-text">
            {c.title}
          </h3>
          <p
            className="whitespace-pre text-[16px] font-normal leading-[1.5] text-text"
            style={{ width: c.textW }}
          >
            {c.text}
          </p>
        </div>
      ))}

      {illustrations.map((il) => (
        <img
          key={il.src}
          src={il.src}
          alt=""
          className="pointer-events-none absolute z-[4] object-contain"
          style={{ left: il.x, top: il.y, width: il.w, height: il.h }}
        />
      ))}
    </>
  );
}
