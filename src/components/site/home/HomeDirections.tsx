"use client";

import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";

const photos = {
  dirAwareness: homeAssets.dirAwareness,
  dirTechnique: homeAssets.dirTechnique,
  dirMusicality: homeAssets.dirMusicality,
  dirInteraction: homeAssets.dirInteraction,
  dirVariation: homeAssets.dirVariation,
} as const;

function DirectionCard({
  title,
  text,
  photo,
  align = "left",
}: {
  title: string;
  text: string;
  photo: string;
  align?: "left" | "right";
}) {
  return (
    <article
      className={[
        "relative min-h-[171px] overflow-hidden rounded-[20px] bg-light-gray p-[30px] max-[600px]:min-h-[121px] max-[600px]:p-[15px]",
        align === "right" ? "pr-[150px] max-[600px]:pr-[110px]" : "pr-[150px] max-[600px]:pr-[110px]",
      ].join(" ")}
    >
      <h3 className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {title}
      </h3>
      <p className="mt-2.5 max-w-[253px] text-[16px] leading-[1.5] text-text max-[600px]:mt-2 max-[600px]:max-w-[210px] max-[600px]:text-[13px]">
        {text}
      </p>
      <img
        src={photo}
        alt=""
        width={132}
        height={160}
        className="pointer-events-none absolute bottom-2 right-2 h-[142px] w-[124px] object-contain max-[600px]:h-[99px] max-[600px]:w-[92px]"
      />
    </article>
  );
}

export function HomeDirections() {
  const locale = useLocale();
  const { copy, directions } = homeT(locale);
  const routes = useLocalizedRoutes();
  const left = directions.slice(0, 2);
  const right = directions.slice(2);

  return (
    <section className="relative mt-[72px] overflow-hidden pb-10 max-[600px]:mt-10">
      <img
        src={homeAssets.heroBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
      <HomePad className="relative z-[1]">
        <div className="grid items-start gap-x-6 gap-y-8 min-[601px]:grid-cols-[minmax(0,392px)_minmax(0,1fr)_minmax(0,392px)]">
          <div className="flex flex-col gap-6 max-[600px]:order-1">
            <div>
              <h2 className="max-w-[588px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
                {copy.directionsTitle}
              </h2>
              <p className="mt-5 max-w-[519px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:mt-3 max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
                {copy.directionsSub}
              </p>
            </div>
            {left.map((item) => (
              <DirectionCard
                key={item.title}
                title={item.title}
                text={item.text}
                photo={photos[item.photo]}
              />
            ))}
          </div>

          <div className="relative mx-auto flex w-full max-w-[520px] flex-col items-center max-[600px]:order-3">
            <img
              src={homeAssets.directionsDmitry}
              alt={copy.teacherName}
              width={460}
              height={620}
              className="h-auto w-full max-w-[460px] object-contain object-top max-[600px]:max-w-[360px]"
            />
            <div className="absolute left-1/2 top-[14%] w-[min(409px,100%)] -translate-x-[8%] rounded-[20px] bg-[image:var(--brand-gradient)] p-[30px] max-[600px]:static max-[600px]:mt-4 max-[600px]:w-full max-[600px]:translate-x-0 max-[600px]:p-[15px]">
              <p className="text-[24px] font-semibold leading-[1.2] text-white max-[600px]:text-[16px]">
                {copy.teacherName}
              </p>
              <p className="mt-2.5 flex items-start gap-2.5 text-[16px] leading-[1.5] text-white max-[600px]:text-[13px]">
                <img
                  src={homeAssets.iconTrophy}
                  alt=""
                  width={21}
                  height={21}
                  className="mt-0.5 size-[21px] max-[600px]:size-[18px]"
                />
                {copy.teacherTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 max-[600px]:order-2">
            {right.map((item) => (
              <DirectionCard
                key={item.title}
                title={item.title}
                text={item.text}
                photo={photos[item.photo]}
                align="right"
              />
            ))}
          </div>
        </div>

        <div className="mt-10 max-[600px]:mt-6">
          <Button href={routes.catalog} className="w-[309px] px-0 max-[600px]:w-[260px]">
            {copy.chooseVideos}
          </Button>
        </div>
      </HomePad>
    </section>
  );
}
