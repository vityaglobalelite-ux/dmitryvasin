"use client";

import { useRef, useState } from "react";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomePad } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";

const avatars = {
  avatarKirill: homeAssets.avatarKirill,
  avatarYulia: homeAssets.avatarYulia,
  avatarEkaterina: homeAssets.avatarEkaterina,
} as const;

type ReviewItem = ReturnType<typeof homeT>["reviews"][number];

function ReviewCard({ name, role, quote, avatar }: ReviewItem) {
  const [open, setOpen] = useState(false);
  const { copy } = homeT(useLocale());

  return (
    <article className="flex h-full min-w-[290px] shrink-0 flex-col rounded-[30px] bg-white px-[30px] pb-8 pt-[30px] shadow-[0_8px_40px_rgba(76,13,50,0.06)] max-[600px]:min-w-[290px] max-[600px]:rounded-[10px] max-[600px]:p-[15px] min-[601px]:w-[467px]">
      <img
        src={avatars[avatar]}
        alt=""
        width={206}
        height={206}
        className="size-[206px] rounded-full object-cover max-[600px]:size-[60px]"
      />
      <h3 className="mt-[30px] text-[24px] font-medium leading-[1.2] text-text max-[600px]:mt-[30px] max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {name}
      </h3>
      <p className="mt-2.5 text-[14px] leading-[1.5] text-text/60 max-[600px]:text-[13px]">
        {role}
      </p>
      <p
        className={[
          "mt-[30px] text-[16px] leading-[1.5] text-text max-[600px]:mt-6 max-[600px]:text-[13px]",
          open ? "" : "line-clamp-6",
        ].join(" ")}
      >
        “{quote}
      </p>
      <button
        type="button"
        className="mt-2.5 self-start text-[16px] font-medium leading-[1.5] text-accent-orange underline underline-offset-2 transition-opacity hover:opacity-70 max-[600px]:text-[13px]"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? copy.readLess : copy.readMore}
      </button>
    </article>
  );
}

export function HomeReviews() {
  const { copy, reviews } = homeT(useLocale());
  const routes = useLocalizedRoutes();
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section id="reviews" className="scroll-mt-[70px] bg-light-gray py-[100px] max-[600px]:py-10">
      <HomePad>
        <h2 className="text-center text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-left max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
          {copy.reviewsTitle}
        </h2>

        <div className="mt-6 hidden items-center gap-2.5 max-[600px]:flex">
          <span className="inline-flex size-[34px] items-center justify-center rounded-[17px] bg-white">
            <img
              src={homeAssets.iconSwipe}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </span>
          <p className="text-[13px] leading-[1.5] text-text-dark">
            {copy.reviewsSwipe}
          </p>
        </div>

        <div className="mt-8 hidden gap-5 overflow-x-auto pb-2 min-[601px]:grid min-[601px]:grid-cols-4 min-[601px]:overflow-visible">
          <img
            src={homeAssets.shot37}
            alt=""
            className="h-[632px] w-full rounded-[10px] object-cover max-[600px]:h-[531px] max-[600px]:min-w-[290px]"
          />
          <div className="flex flex-col gap-5">
            <img src={homeAssets.shot35} alt="" className="h-[73px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot36} alt="" className="h-[156px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot39} alt="" className="h-[180px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot41} alt="" className="h-[106px] w-full rounded-[10px] object-cover" />
          </div>
          <div className="flex flex-col gap-5">
            <img src={homeAssets.shot38} alt="" className="h-[265px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot43} alt="" className="h-[98px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot44} alt="" className="h-[222px] w-full rounded-[10px] object-cover" />
          </div>
          <div className="flex flex-col gap-5">
            <img src={homeAssets.shot40} alt="" className="h-[173px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot42} alt="" className="h-[309px] w-full rounded-[10px] object-cover" />
            <img src={homeAssets.shot45} alt="" className="h-[82px] w-full rounded-[10px] object-cover" />
          </div>
        </div>

        <div className="mt-6 flex gap-5 overflow-x-auto pb-2 min-[601px]:hidden">
          <img
            src={homeAssets.shot37}
            alt=""
            className="h-[531px] w-[290px] shrink-0 rounded-[5px] object-cover"
          />
          <div className="flex w-[290px] shrink-0 flex-col gap-2.5">
            <img src={homeAssets.shot35} alt="" className="h-[61px] rounded-[5px] object-cover" />
            <img src={homeAssets.shot36} alt="" className="h-[131px] rounded-[5px] object-cover" />
            <img src={homeAssets.shot39} alt="" className="h-[151px] rounded-[5px] object-cover" />
            <img src={homeAssets.shot41} alt="" className="h-[89px] rounded-[5px] object-cover" />
          </div>
        </div>

        <div className="mt-8 flex justify-center max-[600px]:mt-6">
          <Button href={routes.catalog} className="w-[309px] px-0 max-[600px]:w-[259px]">
            {copy.chooseVideos}
          </Button>
        </div>

        <div className="mt-16 flex items-end justify-between gap-8 max-[600px]:mt-10 max-[600px]:flex-col max-[600px]:items-start">
          <div className="max-w-[1057px]">
            <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
              {copy.reviewsResults}
            </p>
            <p className="mt-5 hidden text-[24px] font-medium leading-[1.2] text-text min-[601px]:block">
              {copy.reviewsHint}
            </p>
            <div className="mt-5 hidden items-center gap-2.5 max-[600px]:flex">
              <span className="inline-flex size-[34px] items-center justify-center rounded-[17px] bg-white">
                <img src={homeAssets.iconSwipe} alt="" width={16} height={16} className="size-4" />
              </span>
              <p className="text-[13px] leading-[1.5] text-text-dark">
                {copy.reviewsSwipe}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2.5 min-[601px]:flex">
            <button
              type="button"
              className="size-[50px] transition-transform hover:scale-105 active:scale-95"
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
              className="size-[50px] transition-transform hover:scale-105 active:scale-95"
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
          </div>
        </div>

        <div
          ref={scroller}
          className="mt-8 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory max-[600px]:mt-6"
        >
          {reviews.map((review) => (
            <div key={review.name} className="snap-start">
              <ReviewCard {...review} />
            </div>
          ))}
        </div>
      </HomePad>
    </section>
  );
}
