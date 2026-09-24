"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { HomeImg } from "@/components/site/home/HomeImg";
import { Button } from "@/components/site/ui/Button";
import { catalogFilterHref } from "@/components/site/catalog/display";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeCategories, homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const extraGainEn = [
  "And the more you choose,",
  "the greater your benefit!",
] as const;

const photos = {
  catLifehack: homeAssets.catLifehack,
  catLesson: homeAssets.catLesson,
  catCourse: homeAssets.catCourse,
  catResearch: homeAssets.catResearch,
} as const;

const desktopCards = [
  { x: 241, y: 3802, photoX: 281, photoY: 3748, photoW: 256, photoH: 256, textX: 261, textY: 3983, textH: 135, btnX: 261 },
  { x: 605, y: 3802, photoX: 645, photoY: 3801, photoW: 221, photoH: 221, textX: 627, textY: 3983, textH: 111, btnX: 625 },
  { x: 970, y: 3802, photoX: 1040, photoY: 3781, photoW: 190, photoH: 190, textX: 990, textY: 3983, textH: 135, btnX: 990 },
  { x: 1334, y: 3802, photoX: 1418, photoY: 3791, photoW: 162, photoH: 163, textX: 1358, textY: 3983, textH: 135, btnX: 1354 },
] as const;

export function HomeCategoriesDesktop() {
  const locale = useLocale();
  const { copy, categories } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <>
      <Layer x={242} y={2994} w={425} h={220} z={2}>
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {copy.requestTitleLead}
          <span className="font-bold">{copy.requestTitleEm}</span>
          {copy.requestTitleMid}
          <span className="font-bold">{copy.requestTitleGoal}</span>.
        </h2>
      </Layer>
      <div className="absolute left-[848px] top-[2994px] z-[2] flex w-[832px] flex-col gap-[30px] rounded-[30px] bg-light-gray p-[30px]">
        <div className="flex w-full items-start justify-between">
          <HomeImg
            src={homeAssets.requestPortrait}
            alt=""
            width={120}
            height={120}
            className="size-[120px] rounded-full object-cover"
          />
          <HomeImg
            src={homeAssets.quoteClose}
            alt=""
            width={35}
            height={35}
            className="size-[35px]"
          />
        </div>
        <div className="w-[705px] text-[24px] font-medium leading-[1.2] text-text">
          <p>
            {ru ? "Одни ищут простые " : copy.requestBodyLead}
            <span className="font-bold">{copy.lifehackWord}</span>
            {ru ? " или тематические " : copy.requestBodyMid}
            <span className="font-bold">{copy.lessonWord}</span>
            {ru
              ? ", чтобы по-новому увидеть и попрактиковать движение."
              : copy.requestOneTail}
          </p>
          <p className="mt-[29px]">
            {ru
              ? "А другие хотят погрузиться в тему целиком и исследовать её шаг за шагом через "
              : copy.requestTwoLead}
            <span className="font-bold">{copy.courseWord}</span>
            {copy.requestBodyOr}
            <span className="font-bold">{copy.peekWord}</span>.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute left-[469px] top-[3114px] z-[4] flex h-[422px] w-[458px] items-center justify-center">
        <HomeImg
          src={homeAssets.requestCurve}
          alt=""
          width={426}
          height={201}
          className="h-[201px] w-[426px] -rotate-[38.33deg]"
        />
      </div>
      <HomeImg
        src={`${homeAssets.requestChat}?v=clear`}
        alt=""
        width={218}
        height={218}
        className="pointer-events-none absolute left-[454px] top-[3165px] z-[5] size-[218px]"
      />
      <Layer
        x={413}
        y={3549}
        w={1095}
        h={214}
        z={2}
        className="flex flex-col items-center gap-5 text-center"
      >
        <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {copy.developed}
        </p>
        <p className="text-[24px] font-medium leading-[1.2] text-text">
          {copy.variantsLead}
          <span className="font-bold">{copy.variantsEm}</span>
          {copy.variantsTail}
        </p>
      </Layer>

      {categories.map((cat, i) => {
        const box = desktopCards[i];
        return (
          <div key={cat.type}>
            <Layer
              x={box.x}
              y={box.y}
              w={344}
              h={414}
              z={1}
              className="rounded-[30px] bg-light-gray"
            />
            <HomeImg
              src={photos[cat.photo]}
              alt=""
              width={box.photoW}
              height={box.photoH}
              className="pointer-events-none absolute z-[2] object-contain"
              style={{
                left: box.photoX,
                top: box.photoY,
                width: box.photoW,
                height: box.photoH,
              }}
            />
            <Layer x={box.textX} y={box.textY} w={i === 3 ? 316 : 307} h={box.textH} z={2}>
              <h3 className="w-full text-[24px] font-medium leading-[1.2] text-text">
                {cat.title}
              </h3>
              {ru ? (
                <FigLines
                  lines={homeCategories[i].textLines}
                  className={`mt-[10px] text-[16px] leading-[1.5] text-text ${i === 3 ? "w-[303px]" : "w-full"}`}
                />
              ) : (
                <p className="mt-[10px] text-[16px] leading-[1.5] text-text">{cat.text}</p>
              )}
            </Layer>
            <Layer x={box.btnX} y={4136} w={304} h={60} z={3}>
              <Button
                href={catalogFilterHref(cat.type, locale)}
                className="h-[60px] w-[304px] px-0"
              >
                {copy.choose}
              </Button>
            </Layer>
          </div>
        );
      })}

      <Layer
        x={241}
        y={4236}
        w={1437}
        h={280}
        z={2}
        className="overflow-hidden rounded-[30px] bg-[image:var(--brand-gradient)] px-10"
      >
        <HomeImg
          src={homeAssets.percent3d}
          alt=""
          width={380}
          height={380}
          className="pointer-events-none absolute -right-20 top-1/2 h-[360px] w-[360px] -translate-y-1/2 object-contain"
        />
        <div className="relative z-[1] flex h-full flex-col justify-center">
          {ru ? (
            <FigLines
              lines={homeDesktopBreaks.extraLead}
              className="text-[24px] font-medium leading-[1.2] text-white/95"
            />
          ) : (
            <p className="max-w-[820px] text-[24px] font-medium leading-[1.2] text-white/95">
              {copy.extraLead}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between gap-8">
            <div className="flex min-w-0 items-center gap-4">
              <HomeImg
                src={homeAssets.iconDiscount}
                alt=""
                width={80}
                height={80}
                className="size-20 shrink-0"
              />
              <FigLines
                lines={ru ? homeDesktopBreaks.extraGain : extraGainEn}
                className="text-[56px] font-semibold leading-[1.12] tracking-[-0.2px] text-white"
              />
            </div>
            <Button
              href={routes.catalog}
              className="h-[80px] w-[400px] shrink-0 px-8 text-[18px]"
            >
              {copy.chooseVideos}
            </Button>
          </div>
        </div>
      </Layer>
    </>
  );
}

export function HomeCategoriesMobile() {
  const locale = useLocale();
  const { copy, categories } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";
  const cardY = [3158, 3476, 3774, 4092] as const;
  const cardH = [298, 278, 298, 318] as const;
  const photoCrop = [
    { width: 165.65, height: 165.65, left: -35.59, top: -36.24 },
    { width: 130.23, height: 130.23, left: -21.8, top: -12.96 },
    { width: 110.2, height: 110.2, left: -7.54, top: -11.02 },
    { width: 110.11, height: 110.79, left: -10.88, top: -12.23 },
  ] as const;

  return (
    <>
      <Layer
        x={20}
        y={2836}
        w={320}
        h={282}
        z={2}
        className="flex flex-col gap-5 leading-[0]"
      >
        <HomeImg
          src={homeAssets.quoteOpen}
          alt=""
          width={60}
          height={60}
          className="size-[60px] shrink-0"
        />
        {ru ? (
          <div className="flex w-full shrink-0 flex-col gap-[10px]">
            <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
              <span className="whitespace-nowrap">{homeMobileBreaks.requestTitle[0]}</span>
              <br />
              <span className="whitespace-nowrap font-bold">
                {homeMobileBreaks.requestTitle[1]}
              </span>
            </h2>
            <p className="w-[319px] text-[13px] leading-[1.5] text-text">
              <span className="whitespace-nowrap">
                Одни ищут простые <span className="font-semibold">лайфхаки</span> или
              </span>
              <br />
              <span className="whitespace-nowrap">
                тематические <span className="font-semibold">уроки</span>, чтобы по-новому
              </span>
              <br />
              <span className="whitespace-nowrap">увидеть и попрактиковать движение.</span>
              <br />
              <span className="whitespace-nowrap">
                А другие хотят шаг за шагом через
              </span>
              <br />
              <span className="whitespace-nowrap">
                <span className="font-semibold">курсы</span> или{" "}
                <span className="font-semibold">уроки-«подсмотры»</span>.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex w-full shrink-0 flex-col gap-[10px]">
            <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
              {copy.requestTitleLead}
              <span className="font-bold">{copy.requestTitleEm}</span>
              {copy.requestTitleMid}
              <span className="font-bold">{copy.requestTitleGoal}</span>
            </h2>
            <p className="text-[13px] leading-[1.5] text-text">
              {copy.requestBodyLead}
              <span className="font-semibold">{copy.lifehackWord}</span>
              {copy.requestBodyMid}
              <span className="font-semibold">{copy.lessonWord}</span>
              {copy.requestBodyMid2}
              <span className="font-semibold">{copy.courseWord}</span>
              {copy.requestBodyOr}
              <span className="font-semibold">{copy.peekWord}</span>.
            </p>
          </div>
        )}
        <HomeImg
          src={homeAssets.quoteClose}
          alt=""
          width={20}
          height={20}
          className="size-5 shrink-0"
        />
      </Layer>

      {categories.map((cat, i) => (
        <Layer
          key={cat.type}
          x={20}
          y={cardY[i]}
          w={320}
          h={cardH[i]}
          z={1}
          className="rounded-[10px] bg-light-gray p-[15px]"
        >
          <div className="relative h-[87px] w-[99px]">
            <HomeImg
              src={photos[cat.photo]}
              alt=""
              className="absolute max-w-none"
              style={photoCrop[i]}
            />
          </div>
          <h3 className="mt-[20px] text-[16px] font-medium leading-[1.3] text-text">
            {cat.title}
          </h3>
          {ru ? (
            <FigLines
              lines={homeMobileBreaks.catTexts[i]}
              className="mt-[10px] text-[13px] leading-[1.5] text-text"
            />
          ) : (
            <p className="mt-[10px] text-[13px] leading-[1.5] text-text">{cat.text}</p>
          )}
          <Button
            href={catalogFilterHref(cat.type, locale)}
            className="mt-[20px] h-[50px] w-[259px] px-0 text-[13px]"
          >
            {copy.choose}
          </Button>
        </Layer>
      ))}

      <Layer
        x={20}
        y={4430}
        w={320}
        h={272}
        z={2}
        className="overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)] p-4"
      >
        <div className="relative z-[1] flex h-full flex-col">
          {ru ? (
            <FigLines
              lines={homeMobileBreaks.extraLead}
              className="text-[13px] leading-[1.45] text-white"
            />
          ) : (
            <p className="text-[13px] leading-[1.45] text-white">{copy.extraLead}</p>
          )}
          <div className="relative min-h-[64px] flex-1">
            <HomeImg
              src={homeAssets.percent3d}
              alt=""
              width={80}
              height={80}
              className="pointer-events-none absolute bottom-2 right-0 h-16 w-16 object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <HomeImg
                src={homeAssets.iconDiscount}
                alt=""
                width={28}
                height={28}
                className="size-7 shrink-0"
              />
              <FigLines
                lines={ru ? homeMobileBreaks.extraGain : extraGainEn}
                className="text-[17px] font-semibold leading-[1.15] tracking-[-0.15px] text-white"
              />
            </div>
            <Button
              href={routes.catalog}
              className="mt-3 h-[52px] w-full px-3 text-[14px]"
            >
              {copy.chooseVideos}
            </Button>
          </div>
        </div>
      </Layer>
    </>
  );
}
