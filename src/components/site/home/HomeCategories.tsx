"use client";

import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";

const photos = {
  catLifehack: homeAssets.catLifehack,
  catLesson: homeAssets.catLesson,
  catCourse: homeAssets.catCourse,
  catResearch: homeAssets.catResearch,
} as const;

export function HomeCategories() {
  const locale = useLocale();
  const { copy, categories } = homeT(locale);
  const routes = useLocalizedRoutes();
  return (
    <section className="pb-4 pt-16 max-[600px]:pt-10">
      <HomePad>
        <div className="relative mb-8 max-w-[839px] max-[600px]:mb-6">
          <img
            src={homeAssets.quoteOpen}
            alt=""
            width={102}
            height={102}
            className="absolute -left-1 -top-3 size-[102px] max-[600px]:size-[60px]"
          />
          <h2 className="relative pl-[110px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:pl-[72px] max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
            {copy.requestTitleLead}
            <span className="font-bold">{copy.requestTitleEm}</span>
          </h2>
        </div>
        <p className="mb-10 max-w-[974px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:mb-6 max-[600px]:text-[13px] max-[600px]:font-normal max-[600px]:leading-[1.5]">
          {copy.requestBodyLead}
          <span className="font-bold">{copy.lifehackWord}</span>
          {copy.requestBodyMid}
          <span className="font-bold">{copy.lessonWord}</span>
          {copy.requestBodyMid2}
          <span className="font-bold">{copy.courseWord}</span>
          {copy.requestBodyOr}
          <span className="font-bold">{copy.researchWord}</span>
        </p>
        <img
          src={homeAssets.quoteClose}
          alt=""
          width={35}
          height={35}
          className="mb-8 ml-auto hidden size-[35px] min-[601px]:block"
        />

        <div className="grid grid-cols-1 gap-5 min-[900px]:grid-cols-2 min-[1440px]:grid-cols-4">
          {categories.map((cat) => (
            <article
              key={cat.type}
              className="flex flex-col rounded-[30px] bg-light-gray p-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]"
            >
              <img
                src={photos[cat.photo]}
                alt=""
                width={256}
                height={256}
                className="mx-auto h-[160px] w-auto object-contain max-[600px]:mx-0 max-[600px]:h-[87px]"
              />
              <h3 className="mt-4 text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
                {cat.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
                {cat.text}
              </p>
              <Button
                href={`${routes.catalog}?type=${cat.type}`}
                className="mt-5 w-full px-0"
              >
                {copy.choose}
              </Button>
            </article>
          ))}
        </div>

        <div className="relative mt-8 overflow-hidden rounded-[30px] bg-[image:var(--brand-gradient)] p-10 max-[600px]:mt-5 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
          <img
            src={homeAssets.percent3d}
            alt=""
            width={340}
            height={340}
            className="pointer-events-none absolute -right-6 -top-8 h-[280px] w-[280px] object-contain opacity-90 max-[600px]:-right-10 max-[600px]:top-16 max-[600px]:h-[220px] max-[600px]:w-[220px] max-[600px]:opacity-80"
          />
          <div className="relative z-[1] flex flex-wrap items-end justify-between gap-8 max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:gap-20">
            <div className="max-w-[662px]">
              <p className="text-[24px] font-medium leading-[1.2] text-white max-[600px]:text-[13px] max-[600px]:font-normal max-[600px]:leading-[1.5]">
                {copy.extraLead}
              </p>
              <div className="mt-5 flex items-center gap-5 max-[600px]:mt-20 max-[600px]:gap-2.5">
                <img
                  src={homeAssets.iconDiscount}
                  alt=""
                  width={58}
                  height={58}
                  className="size-[58px] max-[600px]:size-10"
                />
                <p className="max-w-[526px] text-[30px] font-medium leading-[1.1] tracking-[-0.9px] text-white max-[600px]:text-[16px] max-[600px]:leading-[1.3] max-[600px]:tracking-normal">
                  {copy.extraGain}
                </p>
              </div>
            </div>
            <Button
              href={routes.catalog}
              className="w-[309px] shrink-0 px-0 max-[600px]:w-full"
            >
              {copy.chooseVideos}
            </Button>
          </div>
        </div>
      </HomePad>
    </section>
  );
}
