"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { HomeImg } from "@/components/site/home/HomeImg";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

export function HomeSupportDesktop() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <Layer
      x={240}
      y={6559}
      w={1440}
      h={330}
      z={2}
      className="overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)]"
    >
      <div className="absolute left-[60px] top-[60px] w-[934px]">
        {ru ? (
          <FigLines
            as="h2"
            lines={homeDesktopBreaks.supportTitle}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray"
          />
        ) : (
          <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray">
            {copy.supportTitle}
          </h2>
        )}
        <Button href={routes.accountSupport} className="mt-[40px] h-[60px] w-[259px] px-0">
          {copy.supportCta}
        </Button>
      </div>
      <HomeImg
        src={homeAssets.question}
        alt=""
        width={318}
        height={330}
        className="pointer-events-none absolute left-[1122px] top-0 h-[330px] w-[318px] object-contain"
      />
    </Layer>
  );
}

export function HomeSupportMobile() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <>
      <Layer
        x={20}
        y={7481}
        w={320}
        h={351}
        z={2}
        className="overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)]"
      >
        {ru ? (
          <FigLines
            as="h2"
            lines={homeMobileBreaks.supportTitle}
            className="absolute left-[15px] top-5 w-[290px] text-[24px] font-medium leading-[1.2] text-white"
          />
        ) : (
          <h2 className="absolute left-[15px] top-5 w-[290px] text-[24px] font-medium leading-[1.2] text-white">
            {copy.supportTitle}
          </h2>
        )}
        <Button
          href={routes.accountSupport}
          className="absolute left-[15px] top-[138px] h-[50px] w-[259px] px-0 text-[13px] whitespace-nowrap"
        >
          {copy.supportCta}
        </Button>
        <HomeImg
          src={homeAssets.question}
          alt=""
          width={209}
          height={146}
          className="pointer-events-none absolute left-[112px] top-[205px] h-[146px] w-[209px] object-contain"
        />
      </Layer>
    </>
  );
}
