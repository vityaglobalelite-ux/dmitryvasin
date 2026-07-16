import { landingAssets } from "@/lib/landing-assets";

/* Figma: y 4277..5523 — тёмный блок «5 направлений исследования» */

const cards = [
  {
    title: "Осознавание",
    x: 270,
    y: 4676,
    w: 392,
    h: 171,
    textW: 210,
    text: "Учимся замечать не только результат, но и то, как он возникает.",
  },
  {
    title: "Техника",
    x: 242,
    y: 4941,
    w: 392,
    h: 195,
    textW: 234,
    text: "Разбираемся, почему одни движения получаются легко, а другие требуют лишних усилий",
  },
  {
    title: "Музыкальность",
    x: 1217,
    y: 4558,
    w: 392,
    h: 195,
    textW: 228,
    text: "Уходим от привычных музыкальных решений и ищем новые способы взаимодействия с музыкой.",
  },
  {
    title: "Взаимодействие",
    x: 1210,
    y: 4843,
    w: 392,
    h: 195,
    textW: 231,
    text: "Ищем более понятные, точные и комфортные способы взаимодействия в паре.",
  },
  {
    title: "Вариативность",
    x: 1288,
    y: 5096,
    w: 392,
    h: 195,
    textW: 253,
    text: "Постепенно обнаруживаем, что вариантов продолжения движения гораздо больше, чем кажется на первый взгляд.",
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
      <div className="absolute left-0 top-[4403px] h-[1120px] w-[1920px] overflow-hidden bg-[#1a1a1a]">
        <img
          src={landingAssets.backgrounds.directionsFull}
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <img
        src={landingAssets.photos.dmitryDirectionsFull}
        alt="Дмитрий Васин"
        className="absolute left-[481px] top-[4277px] h-[1246px] w-[915px] object-contain object-bottom"
      />

      <h2 className="h-section absolute left-[242px] top-[4448px] w-[395px] !text-white">
        5 направлений исследования
      </h2>

      {cards.map((c) => (
        <div
          key={c.title}
          className="absolute rounded-[20px] bg-light-gray p-[30px]"
          style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
        >
          <h3 className="w-[332px] text-[24px] font-medium leading-[29px] text-text-dark">
            {c.title}
          </h3>
          <p
            className="mt-[10px] text-[16px] leading-[24px] text-text"
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
          className="pointer-events-none absolute object-contain"
          style={{ left: il.x, top: il.y, width: il.w, height: il.h }}
        />
      ))}
    </>
  );
}
