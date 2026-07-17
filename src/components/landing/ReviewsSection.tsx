"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { landingAssets } from "@/lib/landing-assets";
import { reviews } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

type Review = (typeof reviews)[number];

/* Figma: Rectangle 40 (0,12784,1920x1020) light-gray + collage + CTA */

const a = landingAssets;

type CollageItem = {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Figma image crop class when not object-cover fill */
  imgClass?: string;
};

const collage: CollageItem[] = [
  {
    src: a.collage[0],
    x: 240,
    y: 12969,
    w: 345,
    h: 632,
    imgClass: "absolute left-[-0.02%] top-[-7.21%] h-[118.36%] w-[100.03%] max-w-none",
  },
  { src: a.collageExtra[0], x: 605, y: 12969, w: 345, h: 73 },
  { src: a.collageExtra[1], x: 605, y: 13062, w: 345, h: 156 },
  {
    src: a.collage[2],
    x: 605,
    y: 13238,
    w: 345,
    h: 180,
    imgClass:
      "absolute left-[-0.14%] top-[-1.7%] h-[100.62%] w-[101.01%] max-w-none",
  },
  {
    src: a.collage[4],
    x: 605,
    y: 13438,
    w: 344,
    h: 106,
    imgClass:
      "absolute left-[-0.23%] top-[-2.83%] h-[102.83%] w-[100.46%] max-w-none",
  },
  {
    src: a.collage[1],
    x: 970,
    y: 12969,
    w: 345,
    h: 265,
    imgClass: "absolute left-[-0.15%] top-0 h-full w-[100.02%] max-w-none",
  },
  {
    src: a.collage[6],
    x: 970,
    y: 13254,
    w: 345,
    h: 98,
    imgClass:
      "absolute left-[-0.52%] top-[-1.02%] h-[102%] w-[101.05%] max-w-none",
  },
  {
    src: a.collage[7],
    x: 970,
    y: 13372,
    w: 345,
    h: 222,
    imgClass:
      "absolute left-[-0.43%] top-[-0.39%] h-[100.79%] w-[100.72%] max-w-none",
  },
  { src: a.collage[3], x: 1335, y: 12969, w: 345, h: 173 },
  { src: a.collage[5], x: 1335, y: 13162, w: 345, h: 309 },
  {
    src: a.collage[8],
    x: 1335,
    y: 13491,
    w: 343,
    h: 82,
    imgClass:
      "absolute left-[-0.44%] top-[-0.41%] h-[100.82%] w-[100.58%] max-w-none",
  },
];

const cardX = [240, 726, 1214];

type MobileCollageTile = {
  src: string;
  w: number;
  h: number;
  imgClass?: string;
};

/**
 * Mobile reviews collage — horizontal scroll (4 cols).
 * 1) Instagram DM (Figma image 37)
 * 2) peek / first scroll: Светлана + Artem stack (Figma 290:* + collage)
 * 3–4) further chats on scroll (Галина, Александр, …)
 */
const mobileCollageColumns: { tiles: MobileCollageTile[]; gap: number }[] = [
  {
    gap: 0,
    tiles: [
      {
        src: a.collageMobile.image37,
        w: 290,
        h: 531,
      },
    ],
  },
  {
    gap: 10,
    tiles: [
      { src: a.collageMobile.image35, w: 290, h: 61 },
      { src: a.collageMobile.image36, w: 290, h: 131 },
      {
        src: a.collage[2],
        w: 290,
        h: 151,
        imgClass:
          "absolute left-[-0.14%] top-[-1.7%] h-[100.62%] w-[101.01%] max-w-none",
      },
      {
        src: a.collage[4],
        w: 290,
        h: 89,
        imgClass:
          "absolute left-[-0.23%] top-[-2.83%] h-[102.83%] w-[100.46%] max-w-none",
      },
    ],
  },
  {
    gap: 10,
    tiles: [
      {
        src: a.collage[1],
        w: 290,
        h: 265,
        imgClass: "absolute left-[-0.15%] top-0 h-full w-[100.02%] max-w-none",
      },
      {
        src: a.collage[6],
        w: 290,
        h: 98,
        imgClass:
          "absolute left-[-0.52%] top-[-1.02%] h-[102%] w-[101.05%] max-w-none",
      },
      {
        src: a.collage[7],
        w: 290,
        h: 148,
        imgClass:
          "absolute left-[-0.43%] top-[-0.39%] h-[100.79%] w-[100.72%] max-w-none",
      },
    ],
  },
  {
    gap: 10,
    tiles: [
      { src: a.collage[3], w: 290, h: 173 },
      { src: a.collage[5], w: 290, h: 258 },
      {
        src: a.collage[8],
        w: 290,
        h: 80,
        imgClass:
          "absolute left-[-0.44%] top-[-0.41%] h-[100.82%] w-[100.58%] max-w-none",
      },
    ],
  },
];

function SwipeHint({
  text,
  chipClass = "bg-light-gray",
}: {
  text: string;
  chipClass?: string;
}) {
  return (
    <div className="flex h-[40px] w-[298px] items-center gap-[10px]">
      <div
        className={`grid size-[34px] shrink-0 place-items-center rounded-[17px] ${chipClass}`}
      >
        <img
          src={landingAssets.icons.fingerSwipe}
          alt=""
          className="size-[16px]"
          width={16}
          height={16}
        />
      </div>
      <p className="w-[254px] text-[13px] font-normal leading-[1.5] text-[#1a1a1a]">
        {text}
      </p>
    </div>
  );
}

function ReviewReader({
  review,
  isMobile,
  onClose,
}: {
  review: Review;
  isMobile: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  const requestClose = () => {
    if (closing) return;
    setClosing(true);
  };

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setClosing(true);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!closing) return;
    const ms = isMobile ? 340 : 290;
    const t = window.setTimeout(onClose, ms);
    return () => window.clearTimeout(t);
  }, [closing, isMobile, onClose]);

  if (!mounted) return null;

  const backdropClass = closing ? "review-backdrop-out" : "review-backdrop-in";
  const panelClass = closing
    ? isMobile
      ? "review-sheet-out"
      : "review-modal-out"
    : isMobile
      ? "review-sheet-in"
      : "review-modal-in";

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] flex justify-center ${
        isMobile ? "items-end" : "items-center"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-reader-title"
    >
      <button
        type="button"
        aria-label="Закрыть"
        className={`${backdropClass} absolute inset-0 bg-[rgba(26,26,26,0.55)] backdrop-blur-[6px]`}
        onClick={requestClose}
      />

      <div
        className={
          isMobile
            ? `${panelClass} relative z-[1] flex max-h-[min(86vh,720px)] w-full flex-col rounded-t-[24px] bg-white shadow-[0_-12px_48px_rgba(0,0,0,0.18)]`
            : `${panelClass} absolute left-1/2 top-1/2 z-[1] flex max-h-[min(80vh,720px)] w-[min(560px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.22)]`
        }
      >
        {isMobile && (
          <div className="flex justify-center pt-[10px]">
            <span className="h-[4px] w-[40px] rounded-full bg-[#e5e5e8]" />
          </div>
        )}

        <div
          className={`flex items-start justify-between gap-[16px] ${
            isMobile ? "px-[20px] pt-[18px]" : "px-[32px] pt-[28px]"
          }`}
        >
          <div className="flex min-w-0 items-center gap-[14px]">
            <img
              src={review.photo}
              alt=""
              className={`shrink-0 rounded-full object-cover ${
                isMobile ? "size-[56px]" : "size-[72px]"
              }`}
              width={72}
              height={72}
            />
            <div className="min-w-0">
              <h3
                id="review-reader-title"
                className={`font-medium leading-[1.2] text-text ${
                  isMobile ? "text-[16px]" : "text-[22px]"
                }`}
              >
                {review.name}
              </h3>
              <p
                className={`mt-[6px] font-normal leading-[1.4] text-text/60 ${
                  isMobile ? "text-[12px]" : "text-[14px]"
                }`}
              >
                {review.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            aria-label="Закрыть отзыв"
            className="grid size-[36px] shrink-0 place-items-center rounded-full bg-light-gray text-[18px] leading-none text-text transition hover:bg-[#e8e8ec]"
          >
            ×
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto ${
            isMobile ? "px-[20px] py-[18px]" : "px-[32px] py-[24px]"
          }`}
        >
          <div
            className="mb-[14px] h-[3px] w-[48px] rounded-full"
            style={{ backgroundImage: "var(--brand-gradient)" }}
          />
          <blockquote
            className={`font-normal text-text ${
              isMobile
                ? "text-[15px] leading-[1.55]"
                : "text-[18px] leading-[1.5]"
            }`}
          >
            „{review.fullQuote}”
          </blockquote>
        </div>

        <div
          className={`border-t border-[#ececef] ${
            isMobile ? "px-[20px] py-[14px]" : "px-[32px] py-[18px]"
          }`}
        >
          <button
            type="button"
            onClick={requestClose}
            className={
              isMobile
                ? "btn-primary-mobile mx-auto w-full max-w-[320px]"
                : "btn-primary"
            }
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ReviewsMobile({ onReadMore }: { onReadMore: (review: Review) => void }) {
  return (
    <>
      {/* Rectangle 40 — 0,15473,360×817 */}
      <div className="absolute left-0 top-[15473px] h-[817px] w-[360px] bg-light-gray" />

      <h2 className="h-section-mobile absolute left-[20px] top-[15533px] z-[2] w-[221px]">
        Отзывы участников
      </h2>

      {/* Frame 2359 — swipe hint collage (on light-gray bg → white chip) */}
      <div className="absolute left-[20px] top-[15569px] z-[2]">
        <SwipeHint
          text="Листайте вправо-влево, чтобы посмотреть отзывы"
          chipClass="bg-white"
        />
      </div>

      {/* Collage horizontal scroll */}
      <div className="absolute left-0 top-[15629px] z-[2] w-[360px] overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-[20px] px-[20px]">
          {mobileCollageColumns.map((col, ci) => (
            <div
              key={ci}
              className="flex h-[531px] w-[290px] shrink-0 snap-start flex-col"
              style={{ gap: col.gap }}
            >
              {col.tiles.map((tile) => (
                <div
                  key={`${tile.src}-${tile.h}`}
                  className="relative overflow-hidden rounded-[5px]"
                  style={{ width: tile.w, height: tile.h }}
                >
                  <img
                    src={tile.src}
                    alt=""
                    className={
                      tile.imgClass ??
                      "absolute inset-0 size-full max-w-none object-cover"
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 325:9 Frame 2386 — 51,16180,259×50 */}
      <a
        href="#tariffs"
        className="btn-primary-mobile absolute left-[51px] top-[16180px] z-[2]"
        style={{ width: 259 }}
      >
        Присоединиться сейчас
      </a>

      {/* Frame 2131331417 — results + swipe */}
      <div className="absolute left-[20px] top-[16350px] z-[2] flex w-[320px] flex-col gap-[20px]">
        <p className="w-[320px] text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-text">
          А&nbsp;вот такие результаты получают ученики, работая со&nbsp;мной
          в&nbsp;онлайн и&nbsp;оффлайн.
        </p>
        <SwipeHint text="Листайте вправо-влево, чтобы посмотреть отзывы" />
      </div>

      {/* Review cards horizontal scroll */}
      <div className="absolute left-0 top-[16534px] z-[2] w-[360px] overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-[20px] px-[20px]">
          {reviews.map((review) => (
            <article
              key={review.name}
              className="flex h-[488px] w-[290px] shrink-0 snap-start flex-col gap-[30px] rounded-[10px] bg-light-gray p-[15px]"
            >
              <img
                src={review.photo}
                alt={review.name}
                className="size-[60px] shrink-0 rounded-full object-cover"
                width={60}
                height={60}
              />
              <div className="flex w-full flex-col gap-[10px] text-text">
                <h3 className="text-[16px] font-medium leading-[1.2]">
                  {review.name}
                </h3>
                <p className="text-[13px] font-normal leading-[1.5] opacity-60">
                  {review.role}
                </p>
              </div>
              <div className="flex min-h-0 w-full flex-1 flex-col gap-[10px]">
                <blockquote className="line-clamp-8 text-[13px] font-normal leading-[1.5] text-text">
                  „{review.quote}
                </blockquote>
                <button
                  type="button"
                  className="h-[20px] shrink-0 self-start text-[13px] font-normal leading-[1.5] text-accent-orange"
                  onClick={() => onReadMore(review)}
                >
                  Читать далее
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ReviewsDesktop({ onReadMore }: { onReadMore: (review: Review) => void }) {
  return (
    <>
      {/* Figma 249:1377 — светло-серый фон секции */}
      <div className="absolute left-0 top-[12784px] h-[1020px] w-[1920px] bg-light-gray" />

      <h2 className="h-section absolute left-[730px] top-[12874px] w-[459px] text-center">
        Отзывы участников
      </h2>

      {collage.map((c) => (
        <div
          key={`${c.src}-${c.x}-${c.y}`}
          className="pointer-events-none absolute overflow-hidden rounded-[10px]"
          style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
        >
          <img
            src={c.src}
            alt=""
            className={
              c.imgClass ??
              "absolute inset-0 size-full max-w-none object-cover"
            }
          />
        </div>
      ))}

      {/* Figma 347:1891 */}
      <a
        href="#tariffs"
        className="btn-primary absolute left-[831px] top-[13634px]"
      >
        Присоединиться сейчас
      </a>

      {/* Figma 249:1439 */}
      <div className="absolute left-[240px] top-[13914px] flex w-[1057px] flex-col gap-[20px] text-text">
        <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px]">
          А вот такие результаты получают ученики, работая со мной в онлайн и
          оффлайн.
        </p>
        <p className="text-[24px] font-medium leading-[1.2]">
          Листайте и читайте →
        </p>
      </div>

      {/* Figma 249:2041 / 249:2038 — градиентные стрелки */}
      <button
        type="button"
        aria-label="Предыдущий отзыв"
        className="absolute left-[1620px] top-[14023px] size-[50px]"
      >
        <img
          src={landingAssets.reviews.arrowPrev}
          alt=""
          className="size-full -scale-x-100"
          width={50}
          height={50}
        />
      </button>
      <button
        type="button"
        aria-label="Следующий отзыв"
        className="absolute left-[1680px] top-[14023px] size-[50px]"
      >
        <img
          src={landingAssets.reviews.arrowNext}
          alt=""
          className="size-full"
          width={50}
          height={50}
        />
      </button>

      {reviews.map((review, i) => (
        <article
          key={review.name}
          className="absolute flex h-[614px] w-[467px] flex-col gap-[30px] rounded-[30px] bg-light-gray px-[30px] pb-[30px] pt-[30px]"
          style={{ left: cardX[i], top: 14113 }}
        >
          <img
            src={review.photo}
            alt={review.name}
            className="size-[206px] shrink-0 rounded-full object-cover"
            width={206}
            height={206}
          />
          <div className="flex w-full flex-col gap-[10px] text-text">
            <h3 className="text-[24px] font-medium leading-[1.2]">
              {review.name}
            </h3>
            <p className="text-[14px] leading-[1.5] opacity-60">{review.role}</p>
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col gap-[10px]">
            <blockquote className="line-clamp-6 text-[16px] leading-[1.5] text-text">
              “{review.quote}
            </blockquote>
            <button
              type="button"
              className="h-[24px] shrink-0 self-start text-[16px] font-medium leading-[1.5] text-accent-orange underline"
              onClick={() => onReadMore(review)}
            >
              Читать далее
            </button>
          </div>
        </article>
      ))}
    </>
  );
}

export function ReviewsSection() {
  const isMobile = useIsMobile();
  const [activeReview, setActiveReview] = useState<Review | null>(null);

  return (
    <>
      {isMobile ? (
        <ReviewsMobile onReadMore={setActiveReview} />
      ) : (
        <ReviewsDesktop onReadMore={setActiveReview} />
      )}
      {activeReview && (
        <ReviewReader
          review={activeReview}
          isMobile={isMobile}
          onClose={() => setActiveReview(null)}
        />
      )}
    </>
  );
}
