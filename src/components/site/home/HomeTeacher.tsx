"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale } from "@/lib/catalog/locale-context";

export function HomeTeacherDesktop() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const ru = locale === "ru";

  return (
    <>
      <Layer
        x={236}
        y={789}
        w={1440}
        h={553}
        z={10}
        className="overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]"
      />
      <Layer x={278} y={830} w={834} h={220} z={12}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeDesktopBreaks.approach}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white"
          />
        ) : (
          <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white">
            {copy.approach}
          </h2>
        )}
      </Layer>
      <Layer
        x={276}
        y={1190}
        w={488}
        h={112}
        z={12}
        className="flex items-center overflow-hidden rounded-[20px] bg-white py-5 pl-[100px] pr-5 shadow-[0_4px_21.5px_rgba(0,0,0,0.09)]"
      >
        {ru ? (
          <p className="w-[368px] text-[16px] leading-[1.5] text-text">
            {homeDesktopBreaks.people[0]}
            <br />
            <span className="font-semibold">
              {homeDesktopBreaks.people[1]}
              <br />
              {homeDesktopBreaks.people[2]}
            </span>
          </p>
        ) : (
          <p className="text-[16px] leading-[1.5] text-text">
            {copy.peopleLead}
            <span className="font-semibold">{copy.peopleRest}</span>
          </p>
        )}
      </Layer>
      <img
        src={`${homeAssets.idea}?v=alpha`}
        alt=""
        width={83}
        height={112}
        className="absolute left-[276px] top-[1190px] z-[13] h-[112px] w-[83px]"
      />
      <div className="pointer-events-none absolute left-[1017px] top-[738px] z-[14] h-[604px] w-[611px] overflow-hidden">
        <img
          src={homeAssets.teacher}
          alt=""
          className="absolute top-[-27.91%] left-[-16.57%] h-[214.99%] w-[141.81%] max-w-none"
        />
      </div>
    </>
  );
}

export function HomeTeacherMobile() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const ru = locale === "ru";

  return (
    <>
      <Layer
        x={20}
        y={636}
        w={321}
        h={738}
        z={10}
        className="overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)]"
      />
      <Layer x={35} y={651} w={290} h={278} z={12}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeMobileBreaks.approach}
            className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-white"
          />
        ) : (
          <h2 className="text-[24px] font-medium leading-[1.3] tracking-[-0.72px] text-white">
            {copy.approach}
          </h2>
        )}
      </Layer>
      <Layer
        x={35}
        y={949}
        w={290}
        h={90}
        z={12}
        className="rounded-[10px] bg-white py-[15px] pl-[14px] pr-[82px] shadow-[0_4px_21.5px_rgba(0,0,0,0.09)]"
      >
        {ru ? (
          <p className="text-[13px] leading-[1.5] text-text">
            {homeMobileBreaks.people[0]}
            <br />
            <span className="font-semibold">
              {homeMobileBreaks.people[1]}
              <br />
              {homeMobileBreaks.people[2]}
            </span>
          </p>
        ) : (
          <p className="text-[13px] leading-[1.5] text-text">
            {copy.peopleLead}
            <span className="font-semibold">{copy.peopleRest}</span>
          </p>
        )}
      </Layer>
      <img
        src={`${homeAssets.idea}?v=alpha`}
        alt=""
        width={67}
        height={90}
        className="absolute left-[276px] top-[949px] z-[13] h-[90px] w-[67px]"
      />
      <img
        src={homeAssets.teacherMobile}
        alt=""
        width={320}
        height={316}
        className="pointer-events-none absolute left-5 top-[1058px] z-[14] h-[316px] w-[320px] object-cover object-top"
      />
    </>
  );
}
