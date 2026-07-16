"use client";

import { useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { programMonths, skills } from "@/lib/landing-data";

/* Figma: y 5613..7649 — «Ваш маршрут на 90 дней» */

const TOP = 5613;
const y = (abs: number) => abs - TOP;

const nodePositions = [
  { x: 270, y: 6124, w: 116 },
  { x: 394, y: 6012, w: 121 },
  { x: 528, y: 6074, w: 112 },
  { x: 647.5, y: 5958, w: 130 },
  { x: 776, y: 6032, w: 130 },
  { x: 899.5, y: 5928, w: 145 },
  { x: 1033.5, y: 6031, w: 130 },
  { x: 1154, y: 5907, w: 127 },
];

const tabX = [240, 726, 1212];

export function ProgramSection() {
  const [monthIdx, setMonthIdx] = useState(0);
  const [openLesson, setOpenLesson] = useState<number | null>(0);
  const month = programMonths[monthIdx];

  return (
    <section
      id="program"
      className="absolute left-0 w-[1920px]"
      style={{ top: TOP, height: 7649 - TOP }}
    >
      <h2 className="h-section absolute left-[660px] top-0 w-[601px] text-center">
        Ваш маршрут на 90 дней
      </h2>

      {programMonths.map((m, i) => {
        const active = i === monthIdx;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => {
              setMonthIdx(i);
              setOpenLesson(null);
            }}
            className={`absolute h-[69px] w-[467px] rounded-[40px] text-[24px] font-medium leading-[29px] transition ${
              active
                ? "bg-[image:var(--brand-gradient)] text-white"
                : "border border-accent-orange bg-white text-accent-orange hover:bg-accent-orange/5"
            }`}
            style={{ left: tabX[i], top: y(5708) }}
          >
            {m.label}
          </button>
        );
      })}

      {/* route board */}
      <div
        className="absolute rounded-[20px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]"
        style={{ left: 240, top: y(5817), width: 1075, height: 466 }}
      >
        <h3 className="absolute left-[30px] top-[30px] text-[28px] font-semibold leading-[40px] text-text-dark">
          {month.programTitle}
        </h3>

        <div className="absolute left-[30px] top-[78px] flex w-[317px] items-start gap-[10px]">
          <img
            src={landingAssets.misc.hintCursorBg}
            alt=""
            className="mt-[4px] size-[34px]"
          />
          <p className="w-[273px] text-[14px] leading-[21px] text-text opacity-70">
            Кликайте на уроки, чтобы посмотреть подробную программу
          </p>
        </div>

        <img
          src={landingAssets.misc.routeCurve}
          alt=""
          className="pointer-events-none absolute left-[82px] top-[120px] h-[214px] w-[908px]"
        />

        <img
          src={landingAssets.misc.cursorIcon}
          alt=""
          className="pointer-events-none absolute left-[42px] top-[212px] size-[81px] object-contain"
        />

        <img
          src={landingAssets.misc.stickerGroup}
          alt=""
          className="pointer-events-none absolute left-[945px] top-[6px] h-[81px] w-[83px] object-contain"
        />

        {month.nodes.map((node, i) => {
          const pos = nodePositions[i];
          if (!pos) return null;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setOpenLesson(i)}
              className="group absolute flex flex-col items-center text-center"
              style={{ left: pos.x - 240, top: pos.y - 5817, width: pos.w }}
            >
              <img
                src={
                  landingAssets.lessonThumbs[
                    i % landingAssets.lessonThumbs.length
                  ]
                }
                alt=""
                className="size-[60px] rounded-full object-cover shadow-md transition group-hover:scale-105"
              />
              <span className="mt-[10px] text-[13px] font-medium leading-[16px] text-text-dark">
                {node.title}
              </span>
              <span className="mt-[6px] flex flex-col items-center gap-[4px]">
                {node.skills.map((s) => (
                  <span
                    key={s.label}
                    className="whitespace-nowrap rounded-full border border-[#e3e3e6] bg-white px-[10px] py-[3px] text-[10px] leading-[13px] text-text"
                  >
                    {s.label}: +{s.delta}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* result card */}
      <div
        className="absolute rounded-[20px] bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]"
        style={{ left: 1334, top: y(5817), width: 345, height: 466 }}
      >
        <p className="absolute left-[22px] top-[24px] text-[24px] font-medium leading-[29px] text-text-dark">
          Результат программы
        </p>
        <p className="absolute left-[22px] top-[57px] text-[16px] leading-[24px] text-text opacity-60">
          Прогресс по итогам всех уроков
        </p>
        <div className="absolute left-[22px] top-[101px] flex w-[301px] flex-col gap-[18px]">
          {skills.map((s) => {
            const filled = month.progress[s.key];
            return (
              <div key={s.key}>
                <div className="flex items-center gap-[10px]">
                  <img src={s.icon} alt="" className="size-[22px]" />
                  <span className="text-[14px] leading-[19px] text-text">
                    {s.label}
                  </span>
                </div>
                <div className="mt-[9px] flex gap-[5px]">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-[22px] w-[10.3px] rounded-[3px]"
                      style={{
                        background:
                          i < filled ? "var(--brand-gradient)" : "#eeeeee",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* accordion */}
      <div
        className="absolute flex w-[1440px] flex-col gap-[10px]"
        style={{ left: 240, top: y(6303) }}
      >
        {month.lessons.map((lesson, i) => {
          const isOpen = openLesson === i;
          return (
            <article
              key={lesson.id}
              className="w-full rounded-[16px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <button
                type="button"
                onClick={() => setOpenLesson(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-[30px] py-[18px] text-left"
              >
                <span>
                  <span className="block text-[14px] font-semibold uppercase tracking-[0.5px] text-accent-red">
                    {lesson.number}
                  </span>
                  <span className="mt-[6px] block text-[24px] font-medium leading-[29px] text-text-dark">
                    {lesson.title}
                  </span>
                </span>
                <span
                  className={`text-[14px] text-accent-red transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isOpen && lesson.body && (
                <div className="px-[30px] pb-[30px]">
                  <div className="h-px w-full bg-[#ececef]" />
                  <div className="mt-[20px] inline-flex h-[40px] items-center gap-[10px] rounded-[10px] bg-light-gray px-[10px]">
                    <img
                      src={lesson.directionIcon}
                      alt=""
                      className="size-[20px]"
                    />
                    <span className="pr-[6px] text-[14px] leading-[19px] text-text">
                      {lesson.direction}
                    </span>
                  </div>
                  <p className="mt-[24px] w-[930px] whitespace-pre-wrap text-[16px] leading-[24px] text-text">
                    {lesson.body}
                  </p>
                  <div className="mt-[20px] w-[349px] rounded-[20px] bg-light-gray p-[20px]">
                    <p className="text-[16px] font-semibold leading-[24px] text-text">
                      Что исследуем:
                    </p>
                    <p className="mt-[4px] text-[14px] leading-[20px] text-text">
                      {lesson.explore.map((e) => (
                        <span key={e} className="block">
                          • {e};
                        </span>
                      ))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenLesson(null)}
                    className="mt-[20px] flex items-center gap-[10px] text-[16px] font-medium text-accent-orange underline"
                  >
                    Вернуться к программе
                    <img
                      src={landingAssets.icons.arrowUp}
                      alt=""
                      className="h-[7px] w-[14px]"
                    />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
