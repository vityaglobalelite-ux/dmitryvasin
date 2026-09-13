"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { catalogFilterHref } from "@/components/site/catalog/display";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeCategories, homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const photos = {
  catLifehack: homeAssets.catLifehack,
  catLesson: homeAssets.catLesson,
  catCourse: homeAssets.catCourse,
  catResearch: homeAssets.catResearch,
} as const;

const desktopCards = [
  { x: 241, y: 3188, photoX: 281, photoY: 3134, photoW: 256, photoH: 256, textX: 261, textY: 3369, textH: 135, btnX: 261 },
  { x: 605, y: 3188, photoX: 645, photoY: 3187, photoW: 221, photoH: 221, textX: 627, textY: 3369, textH: 111, btnX: 625 },
  { x: 970, y: 3188, photoX: 1040, photoY: 3167, photoW: 190, photoH: 190, textX: 990, textY: 3369, textH: 135, btnX: 990 },
  { x: 1334, y: 3188, photoX: 1418, photoY: 3177, photoW: 162, photoH: 163, textX: 1358, textY: 3369, textH: 135, btnX: 1354 },
] as const;

export function HomeCategoriesDesktop() {
  const locale = useLocale();
  const { copy, categories } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <>
      <img
        src={homeAssets.quoteOpen}
        alt=""
        width={102}
        height={102}
        className="absolute left-[240px] top-[3044px] z-[1] size-[102px]"
      />
      <Layer x={242} y={2966} w={839} h={55} z={2}>
        <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {copy.requestTitleLead}
          <span className="font-bold">{copy.requestTitleEm}</span>
        </h2>
      </Layer>
      <Layer x={360} y={3052} w={974} h={87} z={2}>
        {ru ? (
          <p className="text-[24px] font-medium leading-[1.2] text-text">
            {"И\u00a0иногда достаточно простого "}
            <span className="font-bold">{copy.lifehackWord}</span>
            {" или\u00a0тематического "}
            <span className="font-bold">{copy.lessonWord}</span>
            {","}
            <br />
            {
              "чтобы\u00a0иначе увидеть и\u00a0попрактиковать движение. А\u00a0иногда\u00a0— погрузиться"
            }
            <br />
            {"в\u00a0тему целиком и\u00a0исследовать её\u00a0шаг за\u00a0шагом через\u00a0"}
            <span className="font-bold">{copy.courseWord}</span>
            {" или\u00a0"}
            <span className="font-bold">{copy.researchWord}</span>
          </p>
        ) : (
          <p className="text-[24px] font-medium leading-[1.2] text-text">
            {copy.requestBodyLead}
            <span className="font-bold">{copy.lifehackWord}</span>
            {copy.requestBodyMid}
            <span className="font-bold">{copy.lessonWord}</span>
            {copy.requestBodyMid2}
            <span className="font-bold">{copy.courseWord}</span>
            {copy.requestBodyOr}
            <span className="font-bold">{copy.researchWord}</span>
          </p>
        )}
      </Layer>
      <img
        src={homeAssets.quoteClose}
        alt=""
        width={35}
        height={35}
        className="absolute left-[1402px] top-[3099px] z-[1] size-[35px]"
      />

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
            <img
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
              <h3 className="text-[24px] font-medium leading-[1.2] text-text">
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
            <Layer x={box.btnX} y={3522} w={304} h={60} z={3}>
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
        y={3622}
        w={1437}
        h={224}
        z={2}
        className="overflow-hidden rounded-[30px] bg-[image:var(--brand-gradient)] p-10"
      >
        <img
          src={homeAssets.percent3d}
          alt=""
          width={341}
          height={341}
          className="pointer-events-none absolute left-[1143px] top-[-33px] h-[341px] w-[341px] object-contain"
        />
        <div className="relative z-[1] flex h-full items-end justify-between">
          <div className="max-w-[662px]">
            {ru ? (
              <FigLines
                lines={homeDesktopBreaks.extraLead}
                className="w-[662px] text-[24px] font-medium leading-[1.2] text-white"
              />
            ) : (
              <p className="text-[24px] font-medium leading-[1.2] text-white">
                {copy.extraLead}
              </p>
            )}
            <div className="mt-5 flex items-center gap-5">
              <img
                src={homeAssets.iconDiscount}
                alt=""
                width={58}
                height={58}
                className="size-[58px]"
              />
              {ru ? (
                <FigLines
                  lines={homeDesktopBreaks.extraGain}
                  className="w-[526px] text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-white"
                />
              ) : (
                <p className="max-w-[526px] text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-white">
                  {copy.extraGain}
                </p>
              )}
            </div>
          </div>
          <Button href={routes.catalog} className="h-[60px] w-[309px] shrink-0 px-0">
            {copy.chooseVideos}
          </Button>
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
        <img
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
                И{"\u00a0"}иногда достаточно простого{" "}
                <span className="font-semibold">лайфхака</span>
              </span>
              <br />
              <span className="whitespace-nowrap">
                или{"\u00a0"}тематического{" "}
                <span className="font-semibold">урока</span>, чтобы{"\u00a0"}иначе увидеть
              </span>
              <br />
              <span className="whitespace-nowrap">
                и{"\u00a0"}попрактиковать движение. А{"\u00a0"}иногда{"\u00a0"}—
              </span>
              <br />
              <span className="whitespace-nowrap">
                погрузиться в{"\u00a0"}тему целиком и{"\u00a0"}исследовать
              </span>
              <br />
              <span className="whitespace-nowrap">
                её{"\u00a0"}шаг за{"\u00a0"}шагом через{"\u00a0"}
                <span className="font-semibold">курс</span> или{"\u00a0"}
                <span className="font-semibold">исследование</span>.
              </span>
            </p>
          </div>
        ) : (
          <div className="flex w-full shrink-0 flex-col gap-[10px]">
            <h2 className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
              {copy.requestTitleLead}
              <span className="font-bold">{copy.requestTitleEm}</span>
            </h2>
            <p className="text-[13px] leading-[1.5] text-text">
              {copy.requestBodyLead}
              <span className="font-semibold">{copy.lifehackWord}</span>
              {copy.requestBodyMid}
              <span className="font-semibold">{copy.lessonWord}</span>
              {copy.requestBodyMid2}
              <span className="font-semibold">{copy.courseWord}</span>
              {copy.requestBodyOr}
              <span className="font-semibold">{copy.researchWord}</span>
            </p>
          </div>
        )}
        <img
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
            <img
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
        className="overflow-hidden rounded-[10px] bg-[image:var(--brand-gradient)] p-[15px]"
      >
        <img
          src={homeAssets.percent3d}
          alt=""
          width={180}
          height={180}
          className="pointer-events-none absolute -right-8 top-8 h-[180px] w-[180px] object-contain opacity-80"
        />
        {ru ? (
          <FigLines
            lines={homeMobileBreaks.extraLead}
            className="relative z-[1] text-[13px] leading-[1.5] text-white"
          />
        ) : (
          <p className="relative z-[1] text-[13px] leading-[1.5] text-white">
            {copy.extraLead}
          </p>
        )}
        <div className="relative z-[1] mt-16 flex items-center gap-2.5">
          <img
            src={homeAssets.iconDiscount}
            alt=""
            width={40}
            height={40}
            className="size-10"
          />
          {ru ? (
            <FigLines
              lines={homeMobileBreaks.extraGain}
              className="text-[16px] font-medium leading-[1.3] text-white"
            />
          ) : (
            <p className="text-[16px] font-medium leading-[1.3] text-white">
              {copy.extraGain}
            </p>
          )}
        </div>
        <Button
          href={routes.catalog}
          className="relative z-[1] mt-6 h-[50px] w-full px-0 text-[13px]"
        >
          {copy.chooseVideos}
        </Button>
      </Layer>
    </>
  );
}
