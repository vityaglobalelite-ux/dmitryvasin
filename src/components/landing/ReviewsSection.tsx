"use client";

import { useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { reviews } from "@/lib/landing-data";

/* Figma: Rectangle 40 (0,12784,1920x1020 тёмный) + коллаж + карточки отзывов */

const a = landingAssets;
const collage = [
  { src: a.collage[0], x: 240, y: 12969, w: 345, h: 632 },
  { src: a.collageExtra[0], x: 605, y: 12969, w: 345, h: 73 },
  { src: a.collageExtra[1], x: 605, y: 13062, w: 345, h: 156 },
  { src: a.collage[2], x: 605, y: 13238, w: 345, h: 180 },
  { src: a.collage[4], x: 605, y: 13438, w: 344, h: 106 },
  { src: a.collage[1], x: 970, y: 12969, w: 345, h: 265 },
  { src: a.collage[6], x: 970, y: 13254, w: 345, h: 98 },
  { src: a.collage[7], x: 970, y: 13372, w: 345, h: 222 },
  { src: a.collage[3], x: 1335, y: 12969, w: 345, h: 173 },
  { src: a.collage[5], x: 1335, y: 13162, w: 345, h: 309 },
  { src: a.collage[8], x: 1335, y: 13491, w: 343, h: 82 },
];

const cardX = [240, 726, 1214];

export function ReviewsSection() {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  return (
    <>
      {/* dark background */}
      <div className="absolute left-0 top-[12784px] h-[1020px] w-[1920px] bg-[#1a1a1a]" />

      <h2 className="h-section absolute left-[730px] top-[12874px] w-[459px] text-center !text-white">
        Отзывы участников
      </h2>

      {collage.map((c) => (
        <img
          key={c.src}
          src={c.src}
          alt=""
          className="absolute rounded-[10px] object-cover"
          style={{ left: c.x, top: c.y, width: c.w, height: c.h }}
        />
      ))}

      {/* CTA внутри тёмного блока (831,13634) */}
      <a href="#tariffs" className="btn-primary absolute left-[831px] top-[13634px]">
        Присоединиться сейчас
      </a>

      {/* subheading (240,13914,1057x159) */}
      <div className="absolute left-[240px] top-[13914px] w-[1057px]">
        <p className="h-section">
          А вот такие результаты получают ученики, работая со мной в онлайн
          и оффлайн.
        </p>
        <p className="mt-[20px] text-[20px] leading-[29px] text-text">
          Листайте и читайте →
        </p>
      </div>

      {/* carousel arrows (…,14023) */}
      <div className="absolute left-[1560px] top-[14023px] flex gap-[10px]">
        <span className="grid size-[50px] place-items-center rounded-full bg-light-gray text-text">
          ←
        </span>
        <span className="grid size-[50px] place-items-center rounded-full bg-[image:var(--brand-gradient)] text-white">
          →
        </span>
      </div>

      {/* review cards (…,14113,467x614) */}
      {reviews.map((review, i) => {
        const isExpanded = expanded[i];
        const text = isExpanded ? review.fullQuote : review.quote;
        return (
          <article
            key={review.name}
            className="absolute h-[614px] w-[467px] rounded-[30px] bg-light-gray"
            style={{ left: cardX[i], top: 14113 }}
          >
            <img
              src={review.photo}
              alt={review.name}
              className="absolute left-[30px] top-[30px] size-[206px] rounded-full object-cover"
            />
            <div className="absolute left-[30px] top-[266px] w-[407px]">
              <h3 className="text-[24px] font-semibold leading-[29px] text-text-dark">
                {review.name}
              </h3>
              <p className="mt-[10px] text-[14px] leading-[21px] text-text opacity-60">
                {review.role}
              </p>
            </div>
            <div
              className="absolute left-[30px] w-[407px]"
              style={{ top: i === 0 ? 398 : 356 }}
            >
              <blockquote className="text-[16px] leading-[24px] text-text">
                “{text}
              </blockquote>
              <button
                type="button"
                className="mt-[10px] text-[16px] font-medium text-accent-orange underline"
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
