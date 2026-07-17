"use client";

import { landingAssets } from "@/lib/landing-assets";
import { useIsMobile } from "@/lib/landing-mode";

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

/** Figma Главная_360 — cards 284:4–284:16 */
const mobileCards = [
  {
    title: "Осознавание",
    y: 4602,
    h: 119,
    textW: 210,
    text: "Учимся замечать не\u00a0только результат, но\u00a0и\u00a0то, как\u00a0он\u00a0возникает.",
  },
  {
    title: "Техника",
    y: 4731,
    h: 119,
    textW: 234,
    text: "Разбираемся, почему одни движения получаются легко, а\u00a0другие требуют лишних усилий",
  },
  {
    title: "Музыкальность",
    y: 4860,
    h: 119,
    textW: 228,
    text: "Уходим от\u00a0привычных музыкальных решений и\u00a0ищем новые способы взаимодействия с\u00a0музыкой.",
  },
  {
    title: "Взаимодействие",
    y: 4989,
    h: 119,
    textW: 231,
    text: "Ищем более понятные, точные и\u00a0комфортные способы взаимодействия в\u00a0паре.",
  },
  {
    title: "Вариативность",
    y: 5118,
    h: 139,
    textW: 230,
    text: "Постепенно обнаруживаем, что\u00a0вариантов продолжения движения гораздо больше, чем\u00a0кажется на\u00a0первый взгляд.",
  },
];

/** Figma 325:26–325:35 — 3d frames on the right of each card */
const mobileIllustrations = [
  { src: landingAssets.direction3d[0], x: 251, y: 4602, w: 89, h: 119 },
  { src: landingAssets.direction3d[1], x: 251, y: 4731, w: 89, h: 119 },
  { src: landingAssets.direction3d[2], x: 247, y: 4860, w: 93, h: 119 },
  { src: landingAssets.direction3d[3], x: 247, y: 4989, w: 93, h: 119 },
  { src: landingAssets.direction3d[4], x: 245, y: 5118, w: 95, h: 140 },
];

function DirectionsMobile() {
  return (
    <>
      {/* image 34 — 0,4507,360×1200 */}
      <div className="absolute left-0 top-[4507px] z-0 h-[1200px] w-[360px] overflow-hidden bg-white">
        <img
          src={landingAssets.backgrounds.directionsFull}
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white from-0% to-transparent to-[12%]" />
      </div>

      {/* Vector 512 — absoluteTransform from Figma (reflection + rot, origin top-left) */}
      <img
        src={landingAssets.misc.arrowScribbleMobile}
        alt=""
        className="pointer-events-none absolute z-[1] origin-top-left"
        style={{
          left: 293.71,
          top: 4508.46,
          width: 142.76,
          height: 97.41,
          transform: "matrix(-0.62485, -0.78075, -0.78075, 0.62485, 0, 0)",
        }}
      />

      <h2 className="h-section-mobile absolute left-[20px] top-[4530px] z-[20] w-[217px]">
        5 направлений исследования
      </h2>

      {mobileCards.map((c) => (
        <div
          key={c.title}
          className="absolute left-[20px] z-[3] flex w-[320px] flex-col gap-[10px] rounded-[10px] bg-light-gray p-[15px]"
          style={{ top: c.y, height: c.h }}
        >
          <h3 className="text-[16px] font-medium leading-[1.2] text-text">
            {c.title}
          </h3>
          <p
            className="text-[13px] font-normal leading-[1.5] text-text"
            style={{ width: c.textW }}
          >
            {c.text}
          </p>
        </div>
      ))}

      {mobileIllustrations.map((il) => (
        <img
          key={il.src}
          src={il.src}
          alt=""
          className="pointer-events-none absolute z-[4] object-contain object-bottom"
          style={{ left: il.x, top: il.y, width: il.w, height: il.h }}
        />
      ))}

      {/* Group 2335 — 0,5271,360×436 — under the cards */}
      <div className="pointer-events-none absolute left-0 top-[5271px] z-[2] h-[436px] w-[360px] overflow-hidden">
        <img
          src={landingAssets.photos.dmitryDirectionsMobile}
          alt="Дмитрий Васин"
          className="absolute left-[-42px] top-0 h-[571px] w-[465px] max-w-none object-cover object-top"
        />
      </div>
    </>
  );
}

function DirectionsDesktop() {
  return (
    <>
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
      <div className="pointer-events-none absolute left-[481px] top-[4277px] z-[2] h-[1246px] w-[915px] overflow-hidden">
        <img
          src={landingAssets.photos.dmitryDirectionsFull}
          alt="Дмитрий Васин"
          className="absolute left-[0.59%] top-0 h-[108.75%] w-[98.81%] max-w-none"
        />
      </div>

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

export function DirectionsSection() {
  const isMobile = useIsMobile();
  return isMobile ? <DirectionsMobile /> : <DirectionsDesktop />;
}
