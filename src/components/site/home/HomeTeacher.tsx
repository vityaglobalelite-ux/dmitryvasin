"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { HomeImg } from "@/components/site/home/HomeImg";
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
      <Layer x={278} y={830} w={834} h={168} z={12}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeDesktopBreaks.approach}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white"
          />
        ) : (
          <h2 className="text-[46px] font-medium leading-[1.1] tracking-[-1.2px] text-white">
            {copy.approach}
          </h2>
        )}
      </Layer>
      <Layer x={278} y={1012} w={720} h={96} z={12}>
        {ru ? (
          <FigLines
            lines={homeDesktopBreaks.systemBody}
            className="text-[20px] font-medium leading-[1.4] text-white/95"
          />
        ) : (
          <p className="max-w-[640px] text-[20px] font-medium leading-[1.4] text-white/95">
            {copy.approachMethod}
          </p>
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
      <HomeImg
        src={`${homeAssets.idea}?v=alpha`}
        alt=""
        width={83}
        height={112}
        className="absolute left-[276px] top-[1190px] z-[13] h-[112px] w-[83px]"
      />
      <div className="pointer-events-none absolute left-[1017px] top-[738px] z-[14] h-[604px] w-[611px] overflow-hidden">
        <HomeImg
          eager
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
        className="overflow-hidden rounded-[20px]"
        style={{
          backgroundImage:
            "linear-gradient(99.61deg, rgb(219, 12, 37) 2.6%, rgb(224, 76, 41) 36.63%, rgb(239, 185, 145) 105.73%)",
        }}
      >
        <div className="absolute left-0 top-[422px] h-[316px] w-[320px] overflow-hidden">
          <HomeImg
            src={`${homeAssets.teacher}?v=knockout`}
            alt=""
            className="absolute top-[-27.91%] left-[-16.57%] h-[214.99%] w-[141.81%] max-w-none"
          />
        </div>
      </Layer>
      <Layer
        x={35}
        y={651}
        w={290}
        z={12}
        className="flex flex-col gap-[20px] leading-[0]"
      >
        <div className="flex w-full shrink-0 flex-col gap-[17px] font-medium text-white">
          {ru ? (
            <>
              <FigLines
                as="h2"
                lines={homeMobileBreaks.approach}
                className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-white"
              />
              <FigLines
                lines={homeMobileBreaks.approachMethod}
                className="text-[16px] font-medium leading-[1.3] text-white"
              />
            </>
          ) : (
            <>
              <h2 className="w-full text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-white">
                {copy.approach}
              </h2>
              <p className="w-full text-[16px] font-medium leading-[1.3] text-white">
                {copy.approachMethod}
              </p>
            </>
          )}
        </div>
        <div className="relative min-h-[108px] w-[290px] shrink-0">
          <div className="flex min-h-[108px] w-[290px] items-center rounded-[10px] bg-white py-[14px] pl-[14px] pr-[58px] shadow-[0_4px_21.5px_rgba(0,0,0,0.09)]">
            {ru ? (
              <p className="text-[13px] leading-[1.45] text-text">
                {homeMobileBreaks.people[0]}
                <br />
                <span className="font-semibold">
                  {homeMobileBreaks.people[1]}
                  <br />
                  {homeMobileBreaks.people[2]}
                  <br />
                  {homeMobileBreaks.people[3]}
                </span>
              </p>
            ) : (
              <p className="text-[13px] leading-[1.45] text-text">
                {copy.peopleLead}
                <span className="font-semibold">{copy.peopleRest}</span>
              </p>
            )}
          </div>
          <HomeImg
            src={`${homeAssets.idea}?v=alpha`}
            alt=""
            width={67}
            height={90}
            className="absolute right-0 top-1/2 z-[1] h-[90px] w-[67px] -translate-y-1/2"
          />
        </div>
      </Layer>
    </>
  );
}
