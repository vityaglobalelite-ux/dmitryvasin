"use client";

import { FigLines, Layer } from "@/components/site/home/HomeFrame";
import { HomeImg } from "@/components/site/home/HomeImg";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeDesktopBreaks, homeMobileBreaks, homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { Locale } from "@/lib/catalog/types";

const avatars = {
  avatarKirill: homeAssets.avatarKirill,
  avatarYulia: homeAssets.avatarYulia,
  avatarEkaterina: homeAssets.avatarEkaterina,
} as const;

const reviewShotsRu = {
  shot35: homeAssets.shot35,
  shot36: homeAssets.shot36,
  shot37: homeAssets.shot37,
  shot38: homeAssets.shot38,
  shot39: homeAssets.shot39,
  shot40: homeAssets.shot40,
  shot41: homeAssets.shot41,
  shot42: homeAssets.shot42,
  shot43: homeAssets.shot43,
  shot44: homeAssets.shot44,
  shot45: homeAssets.shot45,
} as const;

const reviewShotsEn = {
  shot35: homeAssets.shot35En,
  shot36: homeAssets.shot36En,
  shot37: homeAssets.shot37En,
  shot38: homeAssets.shot38En,
  shot39: homeAssets.shot39En,
  shot40: homeAssets.shot40En,
  shot41: homeAssets.shot41En,
  shot42: homeAssets.shot42En,
  shot43: homeAssets.shot43En,
  shot44: homeAssets.shot44En,
  shot45: homeAssets.shot45En,
} as const;

function reviewShots(locale: Locale) {
  if (locale !== "en") return reviewShotsRu;
  return {
    shot35: `${reviewShotsEn.shot35}?v=sharp`,
    shot36: `${reviewShotsEn.shot36}?v=sharp`,
    shot37: `${reviewShotsEn.shot37}?v=sharp`,
    shot38: `${reviewShotsEn.shot38}?v=sharp`,
    shot39: `${reviewShotsEn.shot39}?v=sharp`,
    shot40: `${reviewShotsEn.shot40}?v=sharp`,
    shot41: `${reviewShotsEn.shot41}?v=sharp`,
    shot42: `${reviewShotsEn.shot42}?v=sharp`,
    shot43: `${reviewShotsEn.shot43}?v=sharp`,
    shot44: `${reviewShotsEn.shot44}?v=sharp`,
    shot45: `${reviewShotsEn.shot45}?v=sharp`,
  };
}

type ReviewItem = ReturnType<typeof homeT>["reviews"][number];

function ReviewCard({
  name,
  role,
  quote,
  avatar,
  compact,
}: ReviewItem & { compact?: boolean }) {
  return (
    <article
      className={
        compact
          ? "flex w-[290px] shrink-0 flex-col items-start gap-[30px] self-stretch rounded-[10px] bg-light-gray p-[15px]"
          : "flex w-[467px] shrink-0 flex-col self-stretch rounded-[30px] bg-light-gray px-[30px] pb-8 pt-[30px]"
      }
    >
      <HomeImg
        src={avatars[avatar]}
        alt=""
        width={compact ? 60 : 206}
        height={compact ? 60 : 206}
        className={compact ? "size-[60px] shrink-0 rounded-full object-cover" : "size-[206px] rounded-full object-cover"}
      />
      {compact ? (
        <div className="flex w-full flex-col gap-2.5 text-text">
          <h3 className="text-[16px] font-medium leading-[1.3]">{name}</h3>
          <p className="text-[13px] leading-[1.5] text-text/60">{role}</p>
        </div>
      ) : (
        <>
          <h3 className="mt-[30px] text-[24px] font-medium leading-[1.2] text-text">{name}</h3>
          <p className="mt-2.5 text-[14px] leading-[1.5] text-text/60">{role}</p>
        </>
      )}
      <p className={compact ? "text-[13px] leading-[1.5] text-text" : "mt-[30px] flex-1 text-[16px] leading-[1.5] text-text"}>
        {compact ? "„" : "“"}
        {quote}
      </p>
    </article>
  );
}

export function HomeReviewsDesktop() {
  const locale = useLocale();
  const { copy, reviews } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";
  const shots = reviewShots(locale);

  return (
    <>
      <Layer x={0} y={6999} w={1920} h={1020} z={0} className="bg-light-gray" />
      <Layer x={360} y={7098} w={1200} h={55} z={2}>
        <h2
          id="reviews"
          className="text-center text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text"
        >
          {copy.reviewsTitle}
        </h2>
      </Layer>

      <HomeImg
        src={shots.shot37}
        alt=""
        className="absolute left-[339px] top-[7193px] z-[1] h-[632px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot35}
        alt=""
        className="absolute left-[704px] top-[7193px] z-[1] h-[73px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot36}
        alt=""
        className="absolute left-[704px] top-[7286px] z-[1] h-[156px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot39}
        alt=""
        className="absolute left-[704px] top-[7462px] z-[1] h-[180px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot41}
        alt=""
        className="absolute left-[704px] top-[7662px] z-[1] h-[106px] w-[344px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot38}
        alt=""
        className="absolute left-[1069px] top-[7193px] z-[1] h-[265px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot43}
        alt=""
        className="absolute left-[1069px] top-[7478px] z-[1] h-[98px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot44}
        alt=""
        className="absolute left-[1069px] top-[7596px] z-[1] h-[222px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot40}
        alt=""
        className="absolute left-[1434px] top-[7193px] z-[1] h-[173px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot42}
        alt=""
        className="absolute left-[1434px] top-[7386px] z-[1] h-[309px] w-[345px] rounded-[10px] object-cover"
      />
      <HomeImg
        src={shots.shot45}
        alt=""
        className="absolute left-[1434px] top-[7715px] z-[1] h-[82px] w-[343px] rounded-[10px] object-cover"
      />

      <Layer x={806} y={7860} w={309} h={60} z={3}>
        <Button href={routes.catalog} className="h-[60px] w-[309px] px-0">
          {copy.chooseVideos}
        </Button>
      </Layer>

      <Layer x={240} y={8138} w={1057} h={159} z={2}>
        {ru ? (
          <FigLines
            lines={homeDesktopBreaks.reviewsResults}
            className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text"
          />
        ) : (
          <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
            {copy.reviewsResults}
          </p>
        )}
      </Layer>

      <div className="absolute left-[240px] top-[8337px] z-[2] flex w-[1440px] items-stretch gap-5">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </div>
    </>
  );
}

export function HomeReviewsMobile() {
  const locale = useLocale();
  const { copy, reviews } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";
  const shots = reviewShots(locale);

  return (
    <>
      <Layer x={0} y={7892} w={360} h={817} z={0} className="bg-light-gray" />
      <Layer x={20} y={7952} w={320} h={26} z={2}>
        <h2
          id="reviews"
          className="whitespace-nowrap text-[17px] font-medium leading-[1.1] tracking-[-0.4px] text-text"
        >
          {copy.reviewsTitle}
        </h2>
      </Layer>
      <Layer x={20} y={7988} w={298} h={40} z={2} className="flex items-center gap-2.5">
        <span className="inline-flex size-[34px] items-center justify-center rounded-[17px] bg-white">
          <HomeImg src={homeAssets.iconSwipe} alt="" width={16} height={16} className="size-4" />
        </span>
        {ru ? (
          <FigLines
            lines={homeMobileBreaks.reviewsSwipe}
            className="text-[13px] leading-[1.5] text-text-dark"
          />
        ) : (
          <p className="text-[13px] leading-[1.5] text-text-dark">{copy.reviewsSwipe}</p>
        )}
      </Layer>

      <div className="absolute left-5 top-[8048px] z-[1] flex w-[320px] gap-5 overflow-x-auto">
        <HomeImg
          src={shots.shot37}
          alt=""
          className="h-[531px] w-[290px] shrink-0 rounded-[5px] object-cover"
        />
        <div className="flex w-[290px] shrink-0 flex-col gap-[10px]">
          <HomeImg src={shots.shot35} alt="" className="h-[61px] rounded-[5px] object-cover" />
          <HomeImg src={shots.shot36} alt="" className="h-[131px] rounded-[5px] object-cover" />
          <HomeImg src={shots.shot39} alt="" className="h-[151px] rounded-[5px] object-cover" />
          <HomeImg src={shots.shot41} alt="" className="h-[89px] rounded-[5px] object-cover" />
        </div>
      </div>

      <Layer x={51} y={8599} w={259} h={50} z={3}>
        <Button href={routes.catalog} className="h-[50px] w-[259px] px-0 text-[13px]">
          {copy.joinNow}
        </Button>
      </Layer>

      <Layer x={20} y={8769} w={320} h={164} z={2}>
        {ru ? (
          <FigLines
            lines={homeMobileBreaks.reviewsResults}
            className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text"
          />
        ) : (
          <p className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
            {copy.reviewsResults}
          </p>
        )}
      </Layer>

      <div className="absolute left-5 top-[8953px] z-[2] flex w-[320px] items-stretch gap-5 overflow-x-auto">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} compact />
        ))}
      </div>
    </>
  );
}
