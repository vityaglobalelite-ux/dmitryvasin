"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

export function HomeHowToDesktop() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";
  const steps = ru
    ? ([
        homeDesktopBreaks.how1,
        homeDesktopBreaks.how2,
        homeDesktopBreaks.how3,
      ] as const)
    : ([copy.how1, copy.how2, copy.how3] as const);

  return (
    <>
      <Layer
        x={239.91}
        y={5004}
        w={1440}
        h={682}
        z={1}
        className="overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]"
      />
      <img
        src={`${homeAssets.macbook}?v=alpha`}
        alt=""
        width={841}
        height={830}
        className="pointer-events-none absolute left-[219.86px] top-[4951px] z-[2] h-[829.6px] w-[841.41px] max-w-none"
      />
      <Layer
        x={299.91}
        y={5526.18}
        w={400}
        h={100}
        z={8}
        className="flex items-center gap-[15px] rounded-[20px] border border-white bg-white/20 px-2.5 py-5 backdrop-blur-[12px]"
      >
        <img
          src={homeAssets.iconAccess}
          alt=""
          width={58}
          height={58}
          className="size-[58px]"
        />
        {ru ? (
          <FigLines
            lines={homeDesktopBreaks.howAccess}
            className="w-[305px] text-[24px] font-medium leading-[1.2] text-white"
          />
        ) : (
          <p className="text-[24px] font-medium leading-[1.2] text-white">
            {copy.howAccess}
          </p>
        )}
      </Layer>
      <Layer x={965.91} y={5054.18} w={688} h={110} z={8}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeDesktopBreaks.howTitle}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white"
          />
        ) : (
          <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white">
            {copy.howTitle}
          </h2>
        )}
      </Layer>
      <Layer x={965.91} y={5194.18} w={654} h={372} z={8} className="flex flex-col gap-2.5">
        {steps.map((text, index) => (
          <div
            key={index}
            className="flex gap-[30px] rounded-[30px] bg-light-gray p-[30px]"
          >
            <span className="flex size-[50px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[24px] font-medium text-white">
              {index + 1}
            </span>
            {typeof text === "string" ? (
              <p className="text-[16px] leading-[1.5] text-text">{text}</p>
            ) : (
              <FigLines
                lines={text}
                className={`text-[16px] leading-[1.5] text-text ${index === 0 ? "w-[400px]" : "w-[514px]"}`}
              />
            )}
          </div>
        ))}
      </Layer>
      <Layer x={982.91} y={5596.18} w={628} h={30} z={8} className="flex items-center gap-2.5">
        <img
          src={homeAssets.iconSupport}
          alt=""
          width={30}
          height={30}
          className="size-[30px] shrink-0"
        />
        <a
          href={routes.accountSupport}
          className="whitespace-nowrap text-[24px] font-medium leading-[1.2] text-white transition-opacity hover:opacity-80"
        >
          {copy.howSupport}
        </a>
      </Layer>
    </>
  );
}

export function HomeHowToMobile() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";
  const steps = ru
    ? ([
        homeMobileBreaks.how1,
        homeMobileBreaks.how2,
        homeMobileBreaks.how3,
      ] as const)
    : ([copy.how1, copy.how2, copy.how3] as const);

  return (
    <>
      <Layer
        x={20}
        y={6573}
        w={320}
        h={828}
        z={1}
        className="overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)]"
      />
      <Layer x={35} y={6588} w={290} h={462} z={8}>
        {ru ? (
          <FigLines
            as="h2"
            lines={homeMobileBreaks.howTitle}
            className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-white"
          />
        ) : (
          <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-white">
            {copy.howTitle}
          </h2>
        )}
        <ol className="mt-[20px] flex flex-col gap-2.5">
          {steps.map((text, index) => (
            <li
              key={index}
              className="flex gap-[10px] rounded-[10px] bg-light-gray p-[15px]"
            >
              <span className="flex size-[35px] shrink-0 items-center justify-center rounded-full bg-[image:var(--brand-gradient)] text-[16px] font-medium text-white">
                {index + 1}
              </span>
              {typeof text === "string" ? (
                <p className="text-[13px] leading-[1.5] text-text">{text}</p>
              ) : (
                <FigLines
                  lines={text}
                  className="text-[13px] leading-[1.5] text-text"
                />
              )}
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-start gap-2.5 text-[13px] leading-[1.5] text-white">
          <img
            src={homeAssets.iconSupport}
            alt=""
            width={30}
            height={30}
            className="size-[30px] shrink-0"
          />
          <a href={routes.accountSupport} className="transition-opacity hover:opacity-80">
            {ru ? (
              <FigLines
                lines={homeMobileBreaks.howSupport}
                className="text-[13px] leading-[1.5] text-white"
              />
            ) : (
              copy.howSupport
            )}
          </a>
        </div>
      </Layer>
      <img
        src={`${homeAssets.macbook}?v=alpha`}
        alt=""
        width={320}
        height={315}
        className="pointer-events-none absolute left-5 top-[7065px] z-[2] h-[315px] w-[320px] object-contain"
      />
      <Layer
        x={35}
        y={7314}
        w={290}
        h={72}
        z={8}
        className="flex items-center gap-[10px] rounded-[10px] border border-white bg-white/20 px-4 py-[16px] backdrop-blur-[12px]"
      >
        <img
          src={homeAssets.iconAccess}
          alt=""
          width={35}
          height={35}
          className="size-[35px]"
        />
        {ru ? (
          <FigLines
            lines={homeMobileBreaks.howAccess}
            className="text-[13px] font-medium leading-[1.5] text-white"
          />
        ) : (
          <p className="text-[13px] font-medium leading-[1.5] text-white">
            {copy.howAccess}
          </p>
        )}
      </Layer>
    </>
  );
}
