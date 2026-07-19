"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { landingAssets } from "@/lib/landing-assets";
import {
  programMonths,
  skills,
  type LessonNode,
} from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";
import { useProgramTail } from "@/lib/program-tail";
import {
  cancelSmoothScroll,
  getSectionScrollTop,
  smoothScrollToId,
  smoothScrollToY,
} from "@/lib/smooth-scroll";

/** Figma top of next band after program accordion */
const NEXT_BAND_TOP = { mobile: 8652, desktop: 7750 } as const;
const NEXT_BAND_GAP = 40;

/* Figma: y 5613..7649 — «Ваш маршрут на 90 дней» */

const TAB_EASE =
  "transition-[background,color,border-color,box-shadow,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]";
const MONTH_FADE_MS = 280;

function staggerStyle(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}

const MONTH_EASE_OUT = "cubic-bezier(0.4, 0, 1, 1)";
const MONTH_EASE_IN = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Fade-out → swap month → fade-in. Tabs update immediately. */
function useProgramMonth() {
  const [tabIdx, setTabIdx] = useState(0);
  const [viewIdx, setViewIdx] = useState(0);
  const [openLesson, setOpenLesson] = useState<number | null>(0);
  const [flashLesson, setFlashLesson] = useState<number | null>(null);
  const [panelShown, setPanelShown] = useState(true);
  const timers = useRef<number[]>([]);
  const lessonEls = useRef(new Map<number, HTMLElement>());
  const boardEl = useRef<HTMLElement | null>(null);
  const scrollToken = useRef(0);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const setLessonEl = useCallback((i: number, el: HTMLElement | null) => {
    if (el) lessonEls.current.set(i, el);
    else lessonEls.current.delete(i);
  }, []);

  const scrollToLesson = useCallback((i: number) => {
    const token = ++scrollToken.current;
    const run = () => {
      if (token !== scrollToken.current) return;
      const el =
        lessonEls.current.get(i) ??
        document.querySelector<HTMLElement>(`[data-program-lesson="${i}"]`);
      if (!el) return;
      void smoothScrollToY(getSectionScrollTop(el));
    };
    // Wait for accordion open + layout paint under CSS zoom
    window.requestAnimationFrame(() => {
      window.setTimeout(run, 120);
    });
  }, []);

  const selectLessonFromMap = useCallback(
    (i: number) => {
      setOpenLesson(i);
      setFlashLesson(i);
      scrollToLesson(i);
      const clearId = window.setTimeout(() => {
        setFlashLesson((cur) => (cur === i ? null : cur));
      }, 1200);
      timers.current.push(clearId);
    },
    [scrollToLesson],
  );

  /** Close lesson + scroll back to the route map */
  const returnToProgram = useCallback(() => {
    scrollToken.current += 1;
    cancelSmoothScroll();
    setOpenLesson(null);

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const board =
          boardEl.current ??
          document.querySelector<HTMLElement>("[data-program-board]");
        if (board) {
          void smoothScrollToY(getSectionScrollTop(board));
          return;
        }
        void smoothScrollToId("program", { updateHash: false });
      }, 100);
    });
  }, []);

  const selectMonth = useCallback(
    (i: number) => {
      if (i === tabIdx) return;
      clearTimers();
      setTabIdx(i);
      setPanelShown(false);
      setFlashLesson(null);

      const swapId = window.setTimeout(() => {
        setViewIdx(i);
        setOpenLesson(0);
        const showId = window.setTimeout(() => setPanelShown(true), 32);
        timers.current.push(showId);
      }, MONTH_FADE_MS);
      timers.current.push(swapId);
    },
    [tabIdx, clearTimers],
  );

  /* Inline styles: reliable under FigCanvas CSS zoom (class-only was too easy to miss). */
  const panelStyle: CSSProperties = {
    opacity: panelShown ? 1 : 0,
    transform: panelShown ? "translate3d(0, 0, 0)" : "translate3d(0, 28px, 0)",
    transition: panelShown
      ? `opacity 0.48s ${MONTH_EASE_IN}, transform 0.48s ${MONTH_EASE_IN}`
      : `opacity 0.28s ${MONTH_EASE_OUT}, transform 0.28s ${MONTH_EASE_OUT}`,
    pointerEvents: panelShown ? "auto" : "none",
    willChange: "opacity, transform",
  };

  return {
    tabIdx,
    viewIdx,
    openLesson,
    setOpenLesson,
    flashLesson,
    selectLessonFromMap,
    returnToProgram,
    setLessonEl,
    boardEl,
    selectMonth,
    panelStyle,
    panelShown,
  };
}

const TOP = 5613;
const y = (abs: number) => abs - TOP;

/**
 * Figma Vector 498 — path vertices (viewBox 910×216).
 * Curve on board: left 82, top 120, size 908×214.
 * Icons are centered on vertices so labels sit in zigzag pockets.
 */
const ROUTE = {
  left: 82,
  top: 120,
  w: 908,
  h: 214,
  viewW: 910,
  viewH: 216,
  icon: 60,
  /** Extra clearance below icon so copy never touches the stroke (scales with canvas zoom). */
  labelOffset: 16,
} as const;

const ROUTE_VERTICES = [
  [0.631, 214.721],
  [134.631, 105.721],
  [262.631, 169.721],
  [390.631, 47.721],
  [518.631, 126.721],
  [651.631, 19.721],
  [777.631, 126.721],
  [908.631, 0.721],
] as const;

/** Column widths from Figma frames 249:1588–1636 */
const NODE_COL_W = [116, 121, 112, 130, 130, 145, 130, 127] as const;

const desktopNodes = ROUTE_VERTICES.map(([vx, vy], i) => {
  const cx = ROUTE.left + (vx / ROUTE.viewW) * ROUTE.w;
  const cy = ROUTE.top + (vy / ROUTE.viewH) * ROUTE.h;
  const w = NODE_COL_W[i];
  return {
    left: cx - w / 2,
    top: cy - ROUTE.icon / 2,
    w,
  };
});

const BOARD_TOP = 5817;
const BOARD_H_MIN = 466;
const BOARD_PAD = 28;
const PILL_H = 23;
const STACK_GAP = 10;

/** Height of route board from node content — result card uses the same value */
function boardHeightFor(nodes: readonly LessonNode[]) {
  let maxBottom = 0;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const pos = desktopNodes[i];
    if (!node || !pos) continue;
    const label = node.routeTitle ?? node.title;
    const titleW = Math.max(72, (node.titleWidth ?? pos.w) - 10);
    const wrapLines = label.split("\n").reduce((acc, line) => {
      const chars = line.replace(/\u00a0/g, " ").length;
      const perLine = Math.max(8, Math.floor(titleW / 7));
      return acc + Math.max(1, Math.ceil(chars / perLine));
    }, 0);
    const titleH = wrapLines * 16;
    const labelBlock =
      titleH + node.skills.length * (PILL_H + STACK_GAP);
    const bottom =
      pos.top + ROUTE.icon + ROUTE.labelOffset + labelBlock;
    maxBottom = Math.max(maxBottom, bottom);
  }
  return Math.max(BOARD_H_MIN, Math.ceil(maxBottom + BOARD_PAD));
}

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

/**
 * Couple+bars only “doubles” from month 2 on (period edges):
 * M1: start = plain couple, end = 1 bar
 * M2: start = 1 bar, end = 2 bars
 * M3: start = 2 bars, end = 3 bars
 */
function routeSticker(monthIdx: number, which: "start" | "end") {
  if (monthIdx === 0) {
    return which === "start"
      ? landingAssets.misc.programStartCouple
      : landingAssets.misc.programStickerMobile;
  }
  if (monthIdx === 1) {
    return which === "start"
      ? landingAssets.programStickersMonth2.start
      : landingAssets.programStickersMonth2.end;
  }
  return which === "start"
    ? landingAssets.programStickersMonth2.end
    : landingAssets.programStickerMonth3;
}

function ProgramMobile() {
  const {
    tabIdx,
    viewIdx,
    openLesson,
    setOpenLesson,
    flashLesson,
    selectLessonFromMap,
    returnToProgram,
    setLessonEl,
    boardEl,
    selectMonth,
    panelStyle,
    panelShown,
  } = useProgramMonth();
  const { setShift } = useProgramTail();
  const accordionRef = useRef<HTMLDivElement>(null);
  const [accordionH, setAccordionH] = useState(0);
  const month = programMonths[viewIdx];
  const progressMonth = programMonths[tabIdx];
  const nodeIcons =
    viewIdx === 1
      ? landingAssets.programNodesMonth2
      : landingAssets.programNodesMobile;

  /* Extra board height when last node is tall — keep ~24px under badges */
  const lastNode = month.nodes[month.nodes.length - 1];
  const tallLast =
    !!lastNode &&
    (lastNode.skills.length >= 2 || lastNode.title.length > 28);
  const boardH = tallLast ? 1048 : 984;
  const boardAbsBottom = 5888 + boardH;
  const resultAbsTop = boardAbsBottom + 20;
  const accordionAbsTop = resultAbsTop + 425 + 20;

  useLayoutEffect(() => {
    const el = accordionRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      setAccordionH(h);
      const contentBottom = accordionAbsTop + h;
      setShift(contentBottom + NEXT_BAND_GAP - NEXT_BAND_TOP.mobile);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      setShift(0);
    };
  }, [accordionAbsTop, openLesson, viewIdx, panelShown, setShift]);

  const sectionH = Math.max(
    my(accordionAbsTop) + Math.max(accordionH, 1) + 24,
    my(accordionAbsTop) + 100,
  );

  return (
    <section
      id="program"
      className="program-layout-ease absolute left-0 w-[360px]"
      style={{ top: MOBILE_TOP, height: sectionH }}
    >
      {/* Gray only behind title → result card; not under empty accordion space */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-0 w-[360px] bg-light-gray"
        style={{ height: my(accordionAbsTop) }}
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
          const active = i === tabIdx;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMonth(i)}
              className={`flex h-[35px] w-[97px] shrink-0 items-center justify-center rounded-[40px] text-[13px] font-normal leading-[1.5] ${TAB_EASE} ${
                active
                  ? "border border-transparent bg-[image:var(--brand-gradient)] text-white"
                  : "border border-accent-orange bg-white text-accent-orange"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Group 2338 — 20,5888 */}
      <div
        ref={(el) => {
          boardEl.current = el;
        }}
        data-program-board
        className="program-layout-ease absolute left-[20px] z-[1] rounded-[10px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]"
        style={{ top: my(5888), width: 320, height: boardH }}
      >
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

        {/* Vector 498 — dashed path under nodes */}
        <img
          src={landingAssets.misc.routeCurveMobile}
          alt=""
          className="pointer-events-none absolute left-[72px] top-[174px] z-0 h-[636px] w-[162px]"
        />

        <div className="absolute inset-0" style={panelStyle}>
          <h3 className="absolute left-[15px] top-[16px] text-[18px] font-medium leading-[1.2] text-[#1a1a1a]">
            {month.programTitle}
          </h3>

          <img
            src={routeSticker(viewIdx, "start")}
            alt=""
            className="pointer-events-none absolute left-[50px] top-[98px] size-[45px] object-contain"
          />

          {month.nodes.map((node, i) => {
            const pos = mobileNodePositions[i];
            if (!pos) return null;
            const icon =
              ("icon" in node && node.icon) ||
              nodeIcons[i % nodeIcons.length];
            const label = node.routeTitle ?? node.title;
            const titleW = Math.max(72, (node.titleWidth ?? pos.w) - 8);
            const isActive = openLesson === i;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => selectLessonFromMap(i)}
                className={`absolute z-[1] flex flex-col items-center text-center transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isActive ? "program-node-active" : ""
                }`}
                style={{ left: pos.left, top: pos.top, width: pos.w }}
              >
                <img
                  src={icon}
                  alt=""
                  className="size-[45px] shrink-0 object-contain transition duration-300"
                />
                <span className="mt-[12px] flex flex-col items-center gap-[8px]">
                  <span
                    className="whitespace-pre-line text-[12px] font-semibold leading-[16px] text-text"
                    style={{ width: titleW }}
                  >
                    {label}
                  </span>
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

          <img
            src={routeSticker(viewIdx, "end")}
            alt=""
            className="pointer-events-none absolute bottom-[24px] left-[209px] z-0 h-[46px] w-[47px] object-contain"
          />
        </div>
      </div>

      {/* 286:308 — result card */}
      <div
        className="program-layout-ease absolute left-[20px] rounded-[20px] bg-white p-[15px] shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]"
        style={{ top: my(resultAbsTop), width: 320, height: 425 }}
      >
        <p className="text-[16px] font-medium leading-[1.2] text-text-dark">
          Результат программы
        </p>
        <p className="mt-[4px] text-[13px] font-normal leading-[1.5] text-[#888888]">
          Прогресс по итогам всех уроков
        </p>
        <div className="mt-[19px] flex flex-col gap-[18px]">
          {skills.map((s) => {
            const filled = progressMonth.progress[s.key];
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
                      className="relative h-[22px] w-[9.75px] overflow-hidden rounded-[3px] bg-[#eeeeee]"
                    >
                      <span
                        className="program-progress-fill absolute inset-0 rounded-[3px]"
                        style={{
                          ...staggerStyle(i),
                          background: "var(--brand-gradient)",
                          opacity: i < filled ? 1 : 0,
                        }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 286:525 — accordion under result card (height follows open lesson) */}
      <div
        ref={accordionRef}
        className="absolute left-[20px] z-[1] flex w-[320px] flex-col gap-[10px]"
        style={{
          ...panelStyle,
          top: my(accordionAbsTop),
          transition: `${panelStyle.transition}, top 0.5s ${MONTH_EASE_IN}`,
        }}
      >
        {month.lessons.map((lesson, i) => {
          const isOpen = openLesson === i;
          return (
            <article
              key={lesson.id}
              ref={(el) => setLessonEl(i, el)}
              data-program-lesson={i}
              className={`w-full rounded-[10px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${
                flashLesson === i ? "program-lesson-flash" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenLesson(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-[16px] p-[15px] text-left"
                aria-expanded={isOpen}
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
                <div className="program-lesson-enter px-[15px] pb-[15px]">
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
                    onClick={returnToProgram}
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
  const {
    tabIdx,
    viewIdx,
    openLesson,
    setOpenLesson,
    flashLesson,
    selectLessonFromMap,
    returnToProgram,
    setLessonEl,
    boardEl,
    selectMonth,
    panelStyle,
    panelShown,
  } = useProgramMonth();
  const { setShift } = useProgramTail();
  const accordionRef = useRef<HTMLDivElement>(null);
  const [accordionH, setAccordionH] = useState(0);
  const month = programMonths[viewIdx];
  const progressMonth = programMonths[tabIdx];
  const boardH = boardHeightFor(month.nodes);
  const accordionTop = BOARD_TOP + boardH + 20;

  useLayoutEffect(() => {
    const el = accordionRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      setAccordionH(h);
      const contentBottom = accordionTop + h;
      setShift(contentBottom + NEXT_BAND_GAP - NEXT_BAND_TOP.desktop);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      setShift(0);
    };
  }, [accordionTop, openLesson, viewIdx, panelShown, setShift]);

  const sectionH = y(accordionTop) + Math.max(accordionH, 1) + 40;

  return (
    <section
      id="program"
      className="program-layout-ease absolute left-0 w-[1920px]"
      style={{ top: TOP, height: sectionH }}
    >
      <h2 className="h-section absolute left-[660px] top-0 w-[601px] text-center">
        Ваш маршрут на 90 дней
      </h2>

      {programMonths.map((m, i) => {
        const active = i === tabIdx;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMonth(i)}
            className={`absolute h-[69px] w-[467px] rounded-[40px] text-[24px] font-medium leading-[29px] ${TAB_EASE} ${
              active
                ? "border border-transparent bg-[image:var(--brand-gradient)] text-white"
                : "border border-accent-orange bg-white text-accent-orange hover:bg-accent-orange/5"
            }`}
            style={{ left: tabX[i], top: y(5708) }}
          >
            {m.label}
          </button>
        );
      })}

      {/* route board — height follows node stack; result card matches */}
      <div
        ref={(el) => {
          boardEl.current = el;
        }}
        data-program-board
        className="program-layout-ease absolute overflow-visible rounded-[20px] bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]"
        style={{ left: 240, top: y(BOARD_TOP), width: 1075, height: boardH }}
      >
        {/* Figma 333:602 — hint stays static */}
        <div className="absolute left-[30px] top-[78px] z-[2] flex w-[317px] items-center gap-[10px]">
          <img
            src={landingAssets.misc.hintCursorBg}
            alt=""
            className="size-[34px] shrink-0"
          />
          <p className="w-[273px] text-[14px] font-normal leading-[1.5] text-[#1a1a1a]">
            Кликайте на&nbsp;уроки, чтобы&nbsp;посмотреть подробную программу
          </p>
        </div>

        <svg
          className="pointer-events-none absolute"
          style={{
            left: ROUTE.left,
            top: ROUTE.top,
            width: ROUTE.w,
            height: ROUTE.h,
          }}
          viewBox={`0 0 ${ROUTE.viewW} ${ROUTE.viewH}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path
            d="M0.630981 214.721L134.631 105.721L262.631 169.721L390.631 47.7207L518.631 126.721L651.631 19.7207L777.631 126.721L908.631 0.720703"
            stroke="#EFB991"
            strokeWidth="2"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="absolute inset-0" style={panelStyle}>
          {/* Figma 333:403 — Bold 30 / #1a1a1a */}
          <h3 className="absolute left-[30px] top-[30px] text-[30px] font-bold leading-normal text-[#1a1a1a]">
            {month.programTitle}
          </h3>

          <img
            src={routeSticker(viewIdx, "start")}
            alt=""
            className="pointer-events-none absolute left-[48px] top-[212px] h-[81px] w-[83px] object-contain"
          />
          <img
            src={routeSticker(viewIdx, "end")}
            alt=""
            className="pointer-events-none absolute left-[932px] top-[7px] h-[81px] w-[83px] object-contain"
          />

          {month.nodes.map((node, i) => {
            const pos = desktopNodes[i];
            if (!pos) return null;
            const customIcon = "icon" in node ? node.icon : undefined;
            const icon =
              customIcon ||
              landingAssets.programNodesMobile[
                i % landingAssets.programNodesMobile.length
              ];
            const label = node.routeTitle ?? node.title;
            /* Slightly tighter than Figma box — Involve metrics + zoom stay clear of stroke */
            const titleW = Math.max(72, (node.titleWidth ?? pos.w) - 10);
            const isActive = openLesson === i;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => selectLessonFromMap(i)}
                className={`group absolute z-[1] flex flex-col items-center text-center ${
                  isActive ? "program-node-active" : ""
                }`}
                style={{ left: pos.left, top: pos.top, width: pos.w }}
              >
                <img
                  src={icon}
                  alt=""
                  className="size-[60px] shrink-0 object-contain transition duration-300 group-hover:scale-105"
                />
                <span
                  className="flex flex-col items-center gap-[10px]"
                  style={{ marginTop: ROUTE.labelOffset }}
                >
                  <span
                    className="whitespace-pre-line text-[12px] font-semibold leading-[16px] text-text"
                    style={{ width: titleW }}
                  >
                    {label}
                  </span>
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
        </div>
      </div>

      {/* result card — same height as route board */}
      <div
        className="program-layout-ease absolute rounded-[20px] bg-white shadow-[0px_4px_12px_0px_rgba(0,0,0,0.08)]"
        style={{
          left: 1334,
          top: y(BOARD_TOP),
          width: 345,
          height: boardH,
        }}
      >
        <p className="absolute left-[22px] top-[24px] text-[24px] font-medium leading-[29px] text-text-dark">
          Результат программы
        </p>
        <p className="absolute left-[22px] top-[57px] text-[16px] font-normal leading-[1.5] text-[#888888]">
          Прогресс по итогам всех уроков
        </p>
        <div className="absolute left-[22px] top-[101px] flex w-[301px] flex-col gap-[18px]">
          {skills.map((s) => {
            const filled = progressMonth.progress[s.key];
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
                      className="relative h-[22px] w-[10.3px] overflow-hidden rounded-[3px] bg-[#eeeeee]"
                    >
                      <span
                        className="program-progress-fill absolute inset-0 rounded-[3px]"
                        style={{
                          ...staggerStyle(i),
                          background: "var(--brand-gradient)",
                          opacity: i < filled ? 1 : 0,
                        }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accordion under route board */}
      <div
        ref={accordionRef}
        className="absolute flex w-[1440px] flex-col gap-[10px]"
        style={{
          ...panelStyle,
          left: 240,
          top: y(accordionTop),
          transition: `${panelStyle.transition}, top 0.5s ${MONTH_EASE_IN}`,
        }}
      >
        {month.lessons.map((lesson, i) => {
          const isOpen = openLesson === i;
          return (
            <article
              key={lesson.id}
              ref={(el) => setLessonEl(i, el)}
              data-program-lesson={i}
              className={`w-full rounded-[16px] bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${
                flashLesson === i ? "program-lesson-flash" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenLesson(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-[30px] py-[18px] text-left"
                aria-expanded={isOpen}
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
                <div className="program-lesson-enter px-[30px] pb-[30px]">
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
                    onClick={returnToProgram}
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
