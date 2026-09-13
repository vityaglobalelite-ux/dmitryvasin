"use client";

import { useRef, useState } from "react";
import { Layer } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const avatars = {
  avatarKirill: homeAssets.avatarKirill,
  avatarYulia: homeAssets.avatarYulia,
  avatarEkaterina: homeAssets.avatarEkaterina,
} as const;

type ReviewItem = ReturnType<typeof homeT>["reviews"][number];

function ReviewCard({
  name,
  role,
  quote,
  avatar,
  compact,
}: ReviewItem & { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const { copy } = homeT(useLocale());

  return (
    <article
      className={
        compact
          ? "flex h-full flex-col rounded-[10px] bg-white p-[15px]"
          : "flex h-full flex-col rounded-[30px] bg-white px-[30px] pb-8 pt-[30px]"
      }
    >
      <img
        src={avatars[avatar]}
        alt=""
        width={compact ? 60 : 206}
        height={compact ? 60 : 206}
        className={compact ? "size-[60px] rounded-full object-cover" : "size-[206px] rounded-full object-cover"}
      />
      <h3
        className={
          compact
            ? "mt-[30px] text-[16px] font-medium leading-[1.3] text-text"
            : "mt-[30px] text-[24px] font-medium leading-[1.2] text-text"
        }
      >
        {name}
      </h3>
      <p className={compact ? "mt-2.5 text-[13px] leading-[1.5] text-text/60" : "mt-2.5 text-[14px] leading-[1.5] text-text/60"}>
        {role}
      </p>
      <p
        className={[
          compact
            ? "mt-6 text-[13px] leading-[1.5] text-text"
            : "mt-[30px] text-[16px] leading-[1.5] text-text",
          open ? "" : "line-clamp-6",
        ].join(" ")}
      >
        “{quote}
      </p>
      <button
        type="button"
        className={
          compact
            ? "mt-2.5 self-start text-[13px] font-medium leading-[1.5] text-accent-orange underline underline-offset-2"
            : "mt-2.5 self-start text-[16px] font-medium leading-[1.5] text-accent-orange underline underline-offset-2 transition-opacity hover:opacity-70"
        }
        onClick={() => setOpen((v) => !v)}
      >
        {open ? copy.readLess : copy.readMore}
      </button>
    </article>
  );
}

export function HomeReviewsDesktop() {
  const { copy, reviews } = homeT(useLocale());
  const routes = useLocalizedRoutes();
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * 487, behavior: "smooth" });
  };

  return (
    <>
      <Layer x={0} y={6328} w={1920} h={1020} z={0} className="bg-light-gray" />
      <Layer x={829} y={6427} w={459} h={55} z={2}>
        <h2
          id="reviews"
          className="text-center text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text"
        >
          {copy.reviewsTitle}
        </h2>
      </Layer>

      <img
        src={homeAssets.shot37}
        alt=""
        className="absolute left-[339px] top-[6522px] z-[1] h-[632px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot35}
        alt=""
        className="absolute left-[704px] top-[6522px] z-[1] h-[73px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot36}
        alt=""
        className="absolute left-[704px] top-[6615px] z-[1] h-[156px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot39}
        alt=""
        className="absolute left-[704px] top-[6791px] z-[1] h-[180px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot41}
        alt=""
        className="absolute left-[704px] top-[6991px] z-[1] h-[106px] w-[344px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot38}
        alt=""
        className="absolute left-[1069px] top-[6522px] z-[1] h-[265px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot43}
        alt=""
        className="absolute left-[1069px] top-[6807px] z-[1] h-[98px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot44}
        alt=""
        className="absolute left-[1069px] top-[6925px] z-[1] h-[222px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot40}
        alt=""
        className="absolute left-[1434px] top-[6522px] z-[1] h-[173px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot42}
        alt=""
        className="absolute left-[1434px] top-[6715px] z-[1] h-[309px] w-[345px] rounded-[10px] object-cover"
      />
      <img
        src={homeAssets.shot45}
        alt=""
        className="absolute left-[1434px] top-[7044px] z-[1] h-[82px] w-[343px] rounded-[10px] object-cover"
      />

      <Layer x={806} y={7189} w={309} h={60} z={3}>
        <Button href={routes.catalog} className="h-[60px] w-[309px] px-0">
          {copy.chooseVideos}
        </Button>
      </Layer>

      <Layer x={240} y={7467} w={1057} h={159} z={2}>
        <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text">
          {copy.reviewsResults}
        </p>
        <p className="mt-5 text-[24px] font-medium leading-[1.2] text-text">
          {copy.reviewsHint}
        </p>
      </Layer>
      <button
        type="button"
        className="absolute left-[1620px] top-[7576px] z-[3] size-[50px] transition-transform hover:scale-105 active:scale-95"
        aria-label="Предыдущие отзывы"
        onClick={() => scrollBy(-1)}
      >
        <img
          src={homeAssets.arrowReviews}
          alt=""
          width={50}
          height={50}
          className="size-[50px] -scale-x-100"
        />
      </button>
      <button
        type="button"
        className="absolute left-[1680px] top-[7576px] z-[3] size-[50px] transition-transform hover:scale-105 active:scale-95"
        aria-label="Следующие отзывы"
        onClick={() => scrollBy(1)}
      >
        <img
          src={homeAssets.arrowReviews}
          alt=""
          width={50}
          height={50}
          className="size-[50px]"
        />
      </button>

      <div
        ref={scroller}
        className="absolute left-[240px] top-[7666px] z-[2] flex w-[1440px] gap-5 overflow-hidden"
      >
        {reviews.map((review) => (
          <div key={review.name} className="h-[614px] w-[467px] shrink-0">
            <ReviewCard {...review} />
          </div>
        ))}
      </div>
    </>
  );
}

export function HomeReviewsMobile() {
  const { copy, reviews } = homeT(useLocale());
  const routes = useLocalizedRoutes();

  return (
    <>
      <Layer x={0} y={7892} w={360} h={817} z={0} className="bg-light-gray" />
      <Layer x={20} y={7952} w={221} h={26} z={2}>
        <h2
          id="reviews"
          className="text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text"
        >
          {copy.reviewsTitle}
        </h2>
      </Layer>
      <Layer x={20} y={7988} w={298} h={40} z={2} className="flex items-center gap-2.5">
        <span className="inline-flex size-[34px] items-center justify-center rounded-[17px] bg-white">
          <img src={homeAssets.iconSwipe} alt="" width={16} height={16} className="size-4" />
        </span>
        <p className="text-[13px] leading-[1.5] text-text-dark">{copy.reviewsSwipe}</p>
      </Layer>

      <div className="absolute left-5 top-[8048px] z-[1] flex w-[320px] gap-5 overflow-x-auto">
        <img
          src={homeAssets.shot37}
          alt=""
          className="h-[531px] w-[290px] shrink-0 rounded-[5px] object-cover"
        />
        <div className="flex w-[290px] shrink-0 flex-col gap-[10px]">
          <img src={homeAssets.shot35} alt="" className="h-[61px] rounded-[5px] object-cover" />
          <img src={homeAssets.shot36} alt="" className="h-[131px] rounded-[5px] object-cover" />
          <img src={homeAssets.shot39} alt="" className="h-[151px] rounded-[5px] object-cover" />
          <img src={homeAssets.shot41} alt="" className="h-[89px] rounded-[5px] object-cover" />
        </div>
      </div>

      <Layer x={51} y={8599} w={259} h={50} z={3}>
        <Button href={routes.catalog} className="h-[50px] w-[259px] px-0 text-[13px]">
          {copy.joinNow}
        </Button>
      </Layer>

      <Layer x={20} y={8769} w={320} h={164} z={2}>
        <p className="text-[24px] font-medium leading-[1.3] tracking-[-0.72px] text-text">
          {copy.reviewsResults}
        </p>
        <div className="mt-5 flex items-center gap-2.5">
          <span className="inline-flex size-[34px] items-center justify-center rounded-[17px] bg-white">
            <img src={homeAssets.iconSwipe} alt="" width={16} height={16} className="size-4" />
          </span>
          <p className="text-[13px] leading-[1.5] text-text-dark">{copy.reviewsSwipe}</p>
        </div>
      </Layer>

      <div className="absolute left-5 top-[8953px] z-[2] flex w-[320px] gap-5 overflow-x-auto">
        {reviews.map((review) => (
          <div key={review.name} className="h-[492px] w-[290px] shrink-0">
            <ReviewCard {...review} compact />
          </div>
        ))}
      </div>
    </>
  );
}
