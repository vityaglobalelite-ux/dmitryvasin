"use client";

import { useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { programMonths, skills } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

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

/**
 * Figma Group 2338 — board @ 20,5888.
 * Node frames 286:597–645 absolute → board-relative.
 */
const mobileNodePositions = [
  { left: 15, top: 153, w: 116 }, // 35,6041
  { left: 172, top: 212, w: 121 }, // 192,6100
  { left: 15, top: 321, w: 112 }, // 35,6209
  { left: 168, top: 405, w: 130 }, // 188,6293
  { left: 15, top: 499, w: 130 }, // 35,6387
  { left: 160, top: 608, w: 145 }, // 180,6496
  { left: 15, top: 677, w: 130 }, // 35,6565
  { left: 169, top: 786, w: 127 }, // 189,6674
];

const MOBILE_TOP = 5767;
const my = (abs: number) => abs - MOBILE_TOP;

function ProgramMobile() {
  const [monthIdx, setMonthIdx] = useState(0);
  const [openLesson, setOpenLesson] = useState<number | null>(0);
  const month = programMonths[monthIdx];
  const nodeIcons = landingAssets.programNodesMobile;

  return (
    <section
      id="program"
      className="absolute left-0 w-[360px]"
      style={{ top: MOBILE_TOP, height: 8592 - MOBILE_TOP }}
    >
      {/* Gray only behind title → result card; not under empty accordion space */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-0 w-[360px] bg-light-gray"
        style={{ height: my(7337) }}
      />

      <h2 className="h-section-mobile absolute left-[20px] top-0 z-[1] w-[289px]">
        Ваш маршрут на 90 дней
      </h2>

      {/* Month tabs — 20,5813 */}
      <div
        className="absolute left-[20px] z-[1] flex h-[35px] w-[319px] items-center gap-[14px]"
        style={{ top: my(5813) }}
      >
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
              className={`flex h-[35px] w-[97px] shrink-0 items-center justify-center rounded-[40px] text-[13px] font-normal leading-[1.5] transition ${
                active
                  ? "bg-[image:var(--brand-gradient)] text-white"
                  : "border border-accent-orange bg-white text-accent-orange"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Group 2338 — 20,5888,320×984 */}
      <div
        className="absolute left-[20px] z-[1] rounded-[10px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]"
        style={{ top: my(5888), width: 320, height: 984 }}
      >
        <h3 className="absolute left-[15px] top-[16px] text-[18px] font-medium leading-[1.2] text-[#1a1a1a]">
          {month.programTitle}
        </h3>

        <div className="absolute left-[15px] top-[48px] flex w-[298px] items-center gap-[10px]">
          <img
            src={landingAssets.misc.hintCursorBgMobile}
            alt=""
            className="size-[34px] shrink-0 object-contain"
          />
          <p className="w-[254px] text-[13px] font-normal leading-[1.5] text-[#1a1a1a]">
            Кликайте на&nbsp;уроки, чтобы&nbsp;посмотреть подробную программу
          </p>
        </div>

        {/* image 29 — start couple */}
        <img
          src={landingAssets.misc.programStartCouple}
          alt=""
          className="pointer-events-none absolute left-[50px] top-[98px] size-[45px] object-cover"
        />

        {/* Vector 498 — dashed path under nodes */}
        <img
          src={landingAssets.misc.routeCurveMobile}
          alt=""
          className="pointer-events-none absolute left-[72px] top-[174px] z-0 h-[636px] w-[162px]"
        />

        {month.nodes.map((node, i) => {
          const pos = mobileNodePositions[i];
          if (!pos) return null;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setOpenLesson(i)}
              className="absolute z-[1] flex flex-col items-center gap-[10px] text-center"
              style={{ left: pos.left, top: pos.top, width: pos.w }}
            >
              <img
                src={nodeIcons[i % nodeIcons.length]}
                alt=""
                className="size-[45px] shrink-0 object-contain"
              />
              <span className="text-[12px] font-semibold leading-[1.3] text-text">
                {node.title}
              </span>
              <span className="flex w-full flex-col items-center gap-[4px]">
                {node.skills.map((s) => (
                  <span
                    key={s.label}
                    className="whitespace-nowrap rounded-[20px] border border-[rgba(224,76,41,0.22)] bg-[rgba(224,76,41,0.12)] px-[10px] py-[4px] text-[11px] font-bold leading-[13px] text-[#c2461e]"
                  >
                    {s.label}: +{s.delta}
                  </span>
                ))}
              </span>
            </button>
          );
        })}

        {/* Group 2341 — bottom sticker 229,6806 → 209,918 */}
        <img
          src={landingAssets.misc.programStickerMobile}
          alt=""
          className="pointer-events-none absolute left-[209px] top-[918px] z-[1] h-[46px] w-[47px] object-contain"
        />
      </div>

      {/* 286:308 — result card */}
      <div
        className="absolute left-[20px] rounded-[20px] bg-white p-[15px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]"
        style={{ top: my(6892), width: 320, height: 425 }}
      >
        <p className="text-[16px] font-medium leading-[1.2] text-text-dark">
          Результат программы
        </p>
        <p className="mt-[4px] text-[13px] font-normal leading-[1.5] text-[#888888]">
          Прогресс по итогам всех уроков
        </p>
        <div className="mt-[19px] flex flex-col gap-[18px]">
          {skills.map((s) => {
            const filled = month.progress[s.key];
            return (
              <div key={s.key}>
                <div className="flex items-center gap-[10px]">
                  <img src={s.icon} alt="" className="size-[16px]" />
                  <span className="text-[13px] font-normal leading-[20px] text-text">
                    {s.label}
                  </span>
                </div>
                <div className="mt-[10px] flex gap-[5px]">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-[22px] w-[9.75px] rounded-[3px]"
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

      {/* 286:525 — accordion; pack to bottom of Figma band when collapsed
          so there’s no huge empty gap after the last lesson */}
      <div
        className="absolute left-[20px] z-[1] flex w-[320px] flex-col justify-end gap-[10px]"
        style={{ top: my(7337), minHeight: 8592 - 7337 }}
      >
        {month.lessons.map((lesson, i) => {
          const isOpen = openLesson === i;
          return (
            <article
              key={lesson.id}
              className="w-full overflow-hidden rounded-[10px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <button
                type="button"
                onClick={() => setOpenLesson(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-[16px] p-[15px] text-left"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[12px] font-semibold uppercase leading-[1.1] text-accent-red">
                    {lesson.number}
                  </span>
                  <span className="mt-[6px] block text-[16px] font-medium leading-[1.2] text-text-dark">
                    {lesson.title}
                  </span>
                </span>
                <span
                  className={`flex size-[34px] shrink-0 items-center justify-center rounded-[17px] bg-light-gray text-[13px] text-accent-red transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </button>

              {isOpen && lesson.body && (
                <div className="px-[15px] pb-[15px]">
                  <div className="h-px w-full bg-[#ececef]" />
                  <div className="mt-[10px] inline-flex h-[40px] items-center gap-[10px] rounded-[10px] bg-light-gray p-[10px]">
                    <img
                      src={lesson.directionIcon}
                      alt=""
                      className="size-[20px]"
                    />
                    <span className="pr-[6px] text-[12px] font-bold leading-none text-text">
                      {lesson.direction}
                    </span>
                  </div>
                  <p className="mt-[10px] w-[290px] whitespace-pre-wrap text-[13px] font-normal leading-[1.5] text-text">
                    {lesson.body}
                  </p>
                  <div className="mt-[10px] w-[291px] rounded-[20px] bg-light-gray p-[20px]">
                    <p className="text-[13px] font-normal leading-[1.5] text-text">
                      Что исследуем:
                    </p>
                    <p className="text-[13px] font-normal leading-[1.5] text-text">
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
                    className="mt-[10px] flex items-center gap-[10px] text-[13px] font-normal text-accent-orange"
                  >
                    Вернуться к программе
                    <img
                      src={landingAssets.icons.arrowUp}
                      alt=""
                      className="h-[5px] w-[10px]"
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

function ProgramDesktop() {
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

export function ProgramSection() {
  const isMobile = useIsMobile();
  return isMobile ? <ProgramMobile /> : <ProgramDesktop />;
}
