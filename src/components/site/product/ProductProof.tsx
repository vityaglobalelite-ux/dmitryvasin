"use client";

import { HomeImg } from "@/components/site/home/HomeImg";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const avatars = {
  avatarKirill: homeAssets.avatarKirill,
  avatarYulia: homeAssets.avatarYulia,
  avatarEkaterina: homeAssets.avatarEkaterina,
} as const;

const gutter = "w-full px-[12.5%] max-[600px]:px-5";

type ReviewItem = ReturnType<typeof homeT>["reviews"][number];

export function ProductProof() {
  return (
    <div className="flex flex-col">
      <ProductSupportBanner />
      <ProductReviewsBand />
      <ProductResults />
    </div>
  );
}

function ProductSupportBanner() {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();

  return (
    <section className={`mx-auto mt-[100px] ${gutter} max-[600px]:mt-10`}>
      <div className="relative overflow-hidden rounded-[40px] bg-[image:var(--brand-gradient)] px-[60px] py-[60px] max-[600px]:rounded-[10px] max-[600px]:px-[15px] max-[600px]:py-5">
        <div className="relative z-[1] max-w-[934px]">
          <h2 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray max-[600px]:text-[24px] max-[600px]:leading-[1.2] max-[600px]:tracking-[-0.72px] max-[600px]:text-white">
            {copy.supportTitle}
          </h2>
          <Button
            href={routes.accountSupport}
            className="mt-10 h-[60px] w-[259px] px-0 max-[600px]:mt-5 max-[600px]:h-[50px] max-[600px]:text-[13px]"
          >
            {copy.supportCta}
          </Button>
        </div>
        <HomeImg
          src={homeAssets.question}
          alt=""
          width={318}
          height={330}
          className="pointer-events-none absolute right-0 top-0 h-full w-[318px] object-contain object-right max-[600px]:relative max-[600px]:right-auto max-[600px]:top-auto max-[600px]:mt-5 max-[600px]:ml-auto max-[600px]:h-[146px] max-[600px]:w-[209px]"
        />
      </div>
    </section>
  );
}

function ProductReviewsBand() {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();

  return (
    <section className="mt-[100px] bg-light-gray py-[100px] max-[600px]:mt-10 max-[600px]:py-10">
      <div className={`mx-auto ${gutter}`}>
        <h2
          id="reviews"
          className="text-center text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-left max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]"
        >
          {copy.reviewsTitle}
        </h2>
        <p className="mt-2.5 hidden items-center gap-2.5 text-[13px] leading-[1.5] text-text-dark max-[600px]:flex">
          <span className="inline-flex size-[34px] items-center justify-center rounded-full bg-white">
            <HomeImg src={homeAssets.iconSwipe} alt="" width={16} height={16} className="size-4" />
          </span>
          {copy.reviewsSwipe}
        </p>

        <div className="mt-10 grid grid-cols-4 gap-5 max-[1100px]:hidden">
          <HomeImg
            src={homeAssets.shot37}
            alt=""
            width={345}
            height={632}
            className="h-[632px] w-full rounded-[10px] object-cover"
          />
          <div className="flex flex-col gap-5">
            <Shot src={homeAssets.shot35} height={73} />
            <Shot src={homeAssets.shot36} height={156} />
            <Shot src={homeAssets.shot39} height={180} />
            <Shot src={homeAssets.shot41} height={106} />
          </div>
          <div className="flex flex-col gap-5">
            <Shot src={homeAssets.shot38} height={265} />
            <Shot src={homeAssets.shot43} height={98} />
            <Shot src={homeAssets.shot44} height={222} />
          </div>
          <div className="flex flex-col gap-5">
            <Shot src={homeAssets.shot40} height={173} />
            <Shot src={homeAssets.shot42} height={309} />
            <Shot src={homeAssets.shot45} height={82} />
          </div>
        </div>

        <div className="mt-5 hidden gap-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-[1100px]:flex [&::-webkit-scrollbar]:hidden">
          <HomeImg
            src={homeAssets.shot37}
            alt=""
            width={290}
            height={531}
            className="h-[531px] w-[290px] shrink-0 rounded-[10px] object-cover max-[600px]:rounded-[5px]"
          />
          <div className="flex w-[290px] shrink-0 flex-col gap-2.5">
            <Shot src={homeAssets.shot35} height={61} compact />
            <Shot src={homeAssets.shot36} height={131} compact />
            <Shot src={homeAssets.shot39} height={151} compact />
            <Shot src={homeAssets.shot41} height={89} compact />
          </div>
          <div className="flex w-[290px] shrink-0 flex-col gap-2.5">
            <Shot src={homeAssets.shot38} height={223} compact />
            <Shot src={homeAssets.shot43} height={82} compact />
            <Shot src={homeAssets.shot44} height={186} compact />
          </div>
        </div>

        <div className="mt-10 flex justify-center max-[600px]:mt-6">
          <Button
            href={routes.catalog}
            className="h-[60px] w-[309px] px-0 max-[600px]:h-[50px] max-[600px]:w-[259px] max-[600px]:text-[13px]"
          >
            <span className="max-[600px]:hidden">{copy.chooseVideos}</span>
            <span className="hidden max-[600px]:inline">{copy.joinNow}</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Shot({
  src,
  height,
  compact = false,
}: {
  src: string;
  height: number;
  compact?: boolean;
}) {
  return (
    <HomeImg
      src={src}
      alt=""
      width={compact ? 290 : 345}
      height={height}
      className={`w-full rounded-[10px] object-cover ${compact ? "max-[600px]:rounded-[5px]" : ""}`}
      style={{ height }}
    />
  );
}

function ProductResults() {
  const { copy, reviews } = homeT(useLocale());

  return (
    <section className={`mx-auto ${gutter} py-[100px] max-[600px]:py-10`}>
      <h2 className="max-w-[1057px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[24px] max-[600px]:tracking-[-0.72px]">
        {copy.reviewsResults}
      </h2>

      <div className="mt-10 grid grid-cols-3 gap-5 max-[900px]:hidden">
        {reviews.map((review) => (
          <ReviewCard key={review.name} {...review} />
        ))}
      </div>

      <div className="mt-5 hidden gap-5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] max-[900px]:flex [&::-webkit-scrollbar]:hidden">
        {reviews.map((review) => (
          <div key={review.name} className="w-[290px] shrink-0">
            <ReviewCard {...review} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

function ReviewCard({
  name,
  role,
  quote,
  avatar,
  compact,
}: ReviewItem & { compact?: boolean }) {
  const src = avatars[avatar];

  return (
    <article
      className={
        compact
          ? "flex w-full flex-col items-start gap-[30px] rounded-[10px] bg-light-gray p-[15px]"
          : "flex w-full min-w-0 flex-col rounded-[30px] bg-light-gray px-[30px] pb-8 pt-[30px]"
      }
    >
      <HomeImg
        src={src}
        alt=""
        width={compact ? 60 : 206}
        height={compact ? 60 : 206}
        className={
          compact
            ? "size-[60px] shrink-0 rounded-full object-cover"
            : "size-[206px] rounded-full object-cover"
        }
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
      <p
        className={
          compact
            ? "text-[13px] leading-[1.5] text-text"
            : "mt-[30px] text-[16px] leading-[1.5] text-text"
        }
      >
        {compact ? "„" : "“"}
        {quote}
      </p>
    </article>
  );
}
