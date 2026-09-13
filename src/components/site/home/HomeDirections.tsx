"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import {
  homeDirections,
  homeDirectionsSubLines,
  homeDirectionsTitleLines,
  homeT,
} from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const photos = {
  dirAwareness: homeAssets.dirAwareness,
  dirTechnique: homeAssets.dirTechnique,
  dirMusicality: homeAssets.dirMusicality,
  dirInteraction: homeAssets.dirInteraction,
  dirVariation: homeAssets.dirVariation,
} as const;

export function HomeDirectionsDesktop() {
  const locale = useLocale();
  const { copy, directions } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <>
      <img
        src={homeAssets.heroBg}
        alt=""
        className="pointer-events-none absolute left-0 top-[1644px] z-0 h-[1120px] w-[1920px] object-cover"
      />

      <Layer x={240} y={1522} w={588} h={298} z={2}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeDirectionsTitleLines}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text"
          />
        ) : (
          <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
            {copy.directionsTitle}
          </h2>
        )}
        {ru ? (
          <FigLines
            lines={homeDirectionsSubLines}
            className="mt-5 w-[519px] text-[24px] font-medium leading-[1.2] text-text"
          />
        ) : (
          <p className="mt-5 max-w-[519px] text-[24px] font-medium leading-[1.2] text-text">
            {copy.directionsSub}
          </p>
        )}
      </Layer>

      <div className="pointer-events-none absolute left-[481px] top-[1518px] z-[5] h-[1246px] w-[915px] overflow-hidden">
        <img
          src={`${homeAssets.directionsDmitry}?v=raw`}
          alt={copy.teacherName}
          width={1536}
          height={2302}
          className="absolute left-[0.59%] top-0 h-[108.75%] w-[98.81%] max-w-none"
        />
      </div>

      <Layer
        x={1092}
        y={1697}
        w={409}
        h={123}
        z={6}
        className="rounded-[20px] bg-[image:var(--brand-gradient)] p-[30px]"
      >
        <p className="text-[24px] font-semibold leading-[1.2] text-white">
          {copy.teacherName}
        </p>
        <p className="mt-2.5 flex items-center gap-[10px] text-[16px] leading-[1.5] text-white">
          <img
            src={homeAssets.iconTrophy}
            alt=""
            width={21}
            height={21}
            className="size-[21px]"
          />
          {copy.teacherTitle}
        </p>
      </Layer>

      <Layer
        x={270}
        y={1917}
        w={392}
        h={171}
        z={2}
        className="rounded-[20px] bg-light-gray p-[30px]"
      >
        <h3 className="text-[24px] font-medium leading-[1.2] text-text">
          {directions[0].title}
        </h3>
        {ru ? (
          <FigLines
            lines={homeDirections[0].textLines}
            className="mt-[10px] w-[210px] text-[16px] leading-[1.5] text-text"
          />
        ) : (
          <p className="mt-[10px] max-w-[210px] text-[16px] leading-[1.5] text-text">
            {directions[0].text}
          </p>
        )}
      </Layer>
      <img
        src={`${photos.dirAwareness}?v=fig`}
        alt=""
        width={127}
        height={170}
        className="pointer-events-none absolute left-[535px] top-[1918px] z-[3] h-[170px] w-[127px] max-w-none"
      />

      <Layer
        x={242}
        y={2182}
        w={392}
        h={195}
        z={2}
        className="rounded-[20px] bg-light-gray p-[30px]"
      >
        <h3 className="text-[24px] font-medium leading-[1.2] text-text">
          {directions[1].title}
        </h3>
        {ru ? (
          <FigLines
            lines={homeDirections[1].textLines}
            className="mt-[10px] w-[234px] text-[16px] leading-[1.5] text-text"
          />
        ) : (
          <p className="mt-[10px] max-w-[234px] text-[16px] leading-[1.5] text-text">
            {directions[1].text}
          </p>
        )}
      </Layer>
      <img
        src={`${photos.dirTechnique}?v=fig`}
        alt=""
        width={127}
        height={170}
        className="pointer-events-none absolute left-[507px] top-[2200px] z-[3] h-[170px] w-[127px] max-w-none"
      />

      <Layer
        x={1217}
        y={1921}
        w={392}
        h={195}
        z={2}
        className="rounded-[20px] bg-light-gray p-[30px]"
      >
        <h3 className="text-[24px] font-medium leading-[1.2] text-text">
          {directions[2].title}
        </h3>
        {ru ? (
          <FigLines
            lines={homeDirections[2].textLines}
            className="mt-[10px] w-[228px] text-[16px] leading-[1.5] text-text"
          />
        ) : (
          <p className="mt-[10px] max-w-[228px] text-[16px] leading-[1.5] text-text">
            {directions[2].text}
          </p>
        )}
      </Layer>
      <img
        src={`${photos.dirMusicality}?v=fig`}
        alt=""
        width={153}
        height={195}
        className="pointer-events-none absolute left-[1456px] top-[1921px] z-[3] h-[195px] w-[153px] max-w-none"
      />

      <Layer
        x={1210}
        y={2206}
        w={392}
        h={195}
        z={2}
        className="rounded-[20px] bg-light-gray p-[30px]"
      >
        <h3 className="text-[24px] font-medium leading-[1.2] text-text">
          {directions[3].title}
        </h3>
        {ru ? (
          <FigLines
            lines={homeDirections[3].textLines}
            className="mt-[10px] w-[231px] text-[16px] leading-[1.5] text-text"
          />
        ) : (
          <p className="mt-[10px] max-w-[231px] text-[16px] leading-[1.5] text-text">
            {directions[3].text}
          </p>
        )}
      </Layer>
      <img
        src={`${photos.dirInteraction}?v=fig`}
        alt=""
        width={153}
        height={195}
        className="pointer-events-none absolute left-[1449px] top-[2206px] z-[3] h-[195px] w-[153px] max-w-none"
      />

      <Layer
        x={1288}
        y={2459}
        w={392}
        h={195}
        z={2}
        className="rounded-[20px] bg-light-gray p-[30px]"
      >
        <h3 className="text-[24px] font-medium leading-[1.2] text-text">
          {directions[4].title}
        </h3>
        {ru ? (
          <FigLines
            lines={homeDirections[4].textLines}
            className="mt-[10px] w-[253px] text-[16px] leading-[1.5] text-text"
          />
        ) : (
          <p className="mt-[10px] max-w-[253px] text-[16px] leading-[1.5] text-text">
            {directions[4].text}
          </p>
        )}
      </Layer>
      <img
        src={`${photos.dirVariation}?v=fig`}
        alt=""
        width={132}
        height={195}
        className="pointer-events-none absolute left-[1548px] top-[2459px] z-[3] h-[195px] w-[132px] max-w-none"
      />

      <Layer x={240} y={2591} w={309} h={60} z={7}>
        <Button href={routes.catalog} className="h-[60px] w-[309px] px-0">
          {copy.chooseVideos}
        </Button>
      </Layer>
    </>
  );
}

export function HomeDirectionsMobile() {
  const locale = useLocale();
  const { copy, directions } = homeT(locale);
  const cardY = [1651, 1780, 1909, 2038, 2167] as const;
  const cardH = [121, 121, 121, 121, 141] as const;
  const keys = [
    "dirAwareness",
    "dirTechnique",
    "dirMusicality",
    "dirInteraction",
    "dirVariation",
  ] as const;

  return (
    <>
      <img
        src={homeAssets.heroBgMobile}
        alt=""
        className="pointer-events-none absolute left-0 top-[1483px] z-0 h-[1273px] w-[360px] object-cover"
      />
      <Layer x={21} y={1454} w={305} h={177} z={2}>
        <h2 className="text-[24px] font-medium leading-[1.3] tracking-[-0.72px] text-text">
          {copy.directionsTitle}
        </h2>
        <p className="mt-[10px] text-[16px] font-medium leading-[1.3] text-text">
          {copy.directionsSub}
        </p>
      </Layer>

      {directions.map((item, i) => (
        <Layer
          key={item.title}
          x={21}
          y={cardY[i]}
          w={320}
          h={cardH[i]}
          z={2}
          className="overflow-hidden rounded-[10px] bg-light-gray p-[15px] pr-[110px]"
        >
          <h3 className="text-[16px] font-medium leading-[1.3] text-text">
            {item.title}
          </h3>
          <p className="mt-[10px] max-w-[210px] text-[13px] leading-[1.5] text-text">
            {item.text}
          </p>
          <img
            src={photos[keys[i]]}
            alt=""
            className="pointer-events-none absolute right-2 top-2 h-[99px] w-[88px] object-contain"
          />
        </Layer>
      ))}

      <img
        src={homeAssets.directionsDmitry}
        alt={copy.teacherName}
        width={360}
        height={436}
        className="pointer-events-none absolute left-px top-[2320px] z-[1] h-[436px] w-[360px] object-cover object-top"
      />
      <Layer
        x={20}
        y={2615}
        w={320}
        h={81}
        z={3}
        className="rounded-[10px] bg-[image:var(--brand-gradient)] p-[15px]"
      >
        <p className="text-[16px] font-semibold leading-[1.3] text-white">
          {copy.teacherName}
        </p>
        <p className="mt-[10px] flex items-center gap-2.5 text-[13px] leading-[1.5] text-white">
          <img
            src={homeAssets.iconTrophy}
            alt=""
            width={18}
            height={18}
            className="size-[18px]"
          />
          {copy.teacherTitle}
        </p>
      </Layer>
    </>
  );
}
