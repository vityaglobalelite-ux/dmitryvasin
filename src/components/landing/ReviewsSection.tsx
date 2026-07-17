"use client";

import { useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { reviews } from "@/lib/landing-data";

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

export function ReviewsSection() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

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

      {reviews.map((review, i) => {
        const isExpanded = expanded[i];
        const text = isExpanded ? review.fullQuote : review.quote;
        return (
          <article
            key={review.name}
            className="absolute flex h-[614px] w-[467px] flex-col gap-[30px] rounded-[30px] bg-light-gray px-[30px] pt-[30px]"
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
            <div className="flex w-full flex-col gap-[10px]">
              <blockquote className="text-[16px] leading-[1.5] text-text">
                “{text}
              </blockquote>
              <button
                type="button"
                className="h-[24px] self-start text-[16px] font-medium leading-[1.5] text-accent-orange underline"
                onClick={() =>
                  setExpanded((prev) => ({ ...prev, [i]: !prev[i] }))
                }
              >
                {isExpanded ? "Свернуть" : "Читать далее"}
              </button>
            </div>
          </article>
        );
      })}
    </>
  );
}
