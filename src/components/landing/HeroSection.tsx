"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { assets } from "@/lib/assets";
import { heroAchievements, heroFeatures, navLinks } from "@/lib/site-data";

function HeroStar() {
  return (
    <svg
      aria-hidden
      width={27}
      height={27}
      viewBox="0 0 42 42"
      fill="none"
      className="shrink-0 animate-[spin_10s_linear_infinite]"
    >
      <path
        d="M21 1.44077L26.203 15.5016L26.2828 15.7172L26.4984 15.797L40.5592 21L26.4984 26.203L26.2828 26.2828L26.203 26.4984L21 40.5592L15.797 26.4984L15.7172 26.2828L15.5016 26.203L1.44077 21L15.5016 15.797L15.7172 15.7172L15.797 15.5016L21 1.44077Z"
        stroke="#EB0B0B"
        strokeWidth={1.5}
      />
    </svg>
  );
}

const ACHIEVEMENTS_TRANSITION_MS = 500;

function HeroNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="relative z-20 flex items-center justify-between pt-3 md:justify-start md:gap-8 md:pt-4">
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-base text-white transition hover:text-[#eb0b0b]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="ml-auto flex h-7 w-7 flex-col justify-between md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="block h-[3px] w-full bg-[#eb0b0b]"
              style={
                i === 1 || i === 2
                  ? { width: "80%", marginLeft: "20%" }
                  : undefined
              }
            />
          ))}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            className="absolute inset-0 bg-[#090808]/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Закрыть меню"
          />
          <aside className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-[#090808] p-8">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="mb-10 self-end text-white"
              aria-label="Закрыть"
            >
              ✕
            </button>
            <ul className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </>
  );
}

function HeroStickyTitle() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const flowTitleRef = useRef<HTMLHeadingElement>(null);
  const overlayTitleRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const phaseRef = useRef<"idle" | "to-center" | "centered" | "to-flow">("idle");
  const animRef = useRef({ start: 0, fromX: 0, fromY: 0 });
  const blurRef = useRef(false);
  const isActiveRef = useRef(false);
  const isElevatedRef = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const [titleSize, setTitleSize] = useState({ width: 0, height: 0 });

  const titleClassName =
    "w-fit max-w-none whitespace-nowrap bg-[#eb0b0b] px-2 py-1 text-[clamp(1rem,2.4vw,2.5rem)] font-black uppercase leading-none text-white";

  const PINNED_TOP = 12;
  const ANIM_MS = 380;
  const UNPIN_AT = 10;

  const blurHeight =
    titleSize.height > 0 ? PINNED_TOP + titleSize.height + 8 : 0;

  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

  const getCenterPos = (width: number) => ({
    x: window.innerWidth / 2 - width / 2,
    y: PINNED_TOP,
  });

  const applyOverlayPos = (x: number, y: number) => {
    posRef.current = { x, y };
    const el = overlayTitleRef.current;
    if (el) {
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    }
  };

  const setBlur = (next: boolean) => {
    if (blurRef.current === next) return;
    blurRef.current = next;
    setShowBlur(next);
  };

  const setActive = (next: boolean) => {
    if (isActiveRef.current === next) return;
    isActiveRef.current = next;
    setIsActive(next);
  };

  const setElevated = (next: boolean) => {
    if (isElevatedRef.current === next) return;
    isElevatedRef.current = next;
    setIsElevated(next);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const title = flowTitleRef.current;
    if (!title) return;

    const updateSize = () => {
      setTitleSize({ width: title.offsetWidth, height: title.offsetHeight });
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(title);

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const title = flowTitleRef.current;
    if (!sentinel || !title) return;

    const getFlowPos = () => {
      const rect = title.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width };
    };

    const startToCenter = (now: number) => {
      const flow = getFlowPos();
      phaseRef.current = "to-center";
      animRef.current = { start: now, fromX: flow.x, fromY: flow.y };
      applyOverlayPos(flow.x, flow.y);
      setActive(true);
      setElevated(false);
      setBlur(true);
    };

    const startToFlow = (now: number) => {
      phaseRef.current = "to-flow";
      animRef.current = {
        start: now,
        fromX: posRef.current.x,
        fromY: posRef.current.y,
      };
      setActive(true);
      setElevated(false);
      setBlur(false);
    };

    const finishIdle = () => {
      phaseRef.current = "idle";
      setActive(false);
      setElevated(false);
      setBlur(false);
    };

    const shouldPin = () => sentinel.getBoundingClientRect().top <= 0;

    const tick = (now: number) => {
      const sentinelTop = sentinel.getBoundingClientRect().top;
      const flow = getFlowPos();
      const center = getCenterPos(flow.width);
      let phase = phaseRef.current;

      if (phase === "idle" && shouldPin()) {
        startToCenter(now);
        phase = "to-center";
      } else if (
        (phase === "centered" || phase === "to-center") &&
        sentinelTop > UNPIN_AT
      ) {
        startToFlow(now);
        phase = "to-flow";
      } else if (phase === "to-flow" && shouldPin()) {
        startToCenter(now);
        phase = "to-center";
      }

      if (phase === "to-center") {
        const t = Math.min(1, (now - animRef.current.start) / ANIM_MS);
        const eased = easeOutCubic(t);
        applyOverlayPos(
          lerp(animRef.current.fromX, center.x, eased),
          lerp(animRef.current.fromY, center.y, eased),
        );
        setElevated(t >= 1);
        if (t >= 1) {
          phaseRef.current = "centered";
          applyOverlayPos(center.x, center.y);
          setElevated(true);
        }
      } else if (phase === "centered") {
        applyOverlayPos(center.x, center.y);
        setElevated(true);
      } else if (phase === "to-flow") {
        const t = Math.min(1, (now - animRef.current.start) / ANIM_MS);
        const eased = easeOutCubic(t);
        applyOverlayPos(
          lerp(animRef.current.fromX, flow.x, eased),
          lerp(animRef.current.fromY, flow.y, eased),
        );
        if (t >= 1) {
          if (shouldPin()) {
            startToCenter(now);
          } else {
            applyOverlayPos(flow.x, flow.y);
            finishIdle();
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const pinnedOverlay = mounted ? (
    <>
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-x-0 top-0 z-[100] ${
          showBlur ? "opacity-100" : "opacity-0"
        }`}
        style={{
          height: blurHeight > 0 ? blurHeight : PINNED_TOP + 48,
        }}
      >
        <div className="absolute inset-0 bg-[#090808]/45 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090808]/80 to-transparent" />
      </div>
      <div
        ref={overlayTitleRef}
        className={`pointer-events-none fixed ${isActive ? "z-[101]" : "z-20"}`}
        style={{
          left: posRef.current.x,
          top: posRef.current.y,
          opacity: isActive ? 1 : 0,
          visibility: isActive ? "visible" : "hidden",
        }}
      >
        <h1 className={titleClassName} aria-hidden>
          СМОТРИ. ПОВТОРЯЙ. ТАНЦУЙ!
        </h1>
      </div>
    </>
  ) : null;

  return (
    <div className="relative py-2">
      <div
        ref={sentinelRef}
        className="pointer-events-none absolute top-0 h-px w-full"
        aria-hidden
      />

      <div style={{ minHeight: titleSize.height || undefined }}>
        <h1
          ref={flowTitleRef}
          className={`${titleClassName} relative z-20 ${
            isActive ? "invisible" : ""
          }`}
        >
          СМОТРИ. ПОВТОРЯЙ. ТАНЦУЙ!
        </h1>
      </div>

      {pinnedOverlay ? createPortal(pinnedOverlay, document.body) : null}
    </div>
  );
}

export function HeroSection() {
  const [showAchievements, setShowAchievements] = useState(false);
  const [isOverlayElevated, setIsOverlayElevated] = useState(false);
  const [bgHeight, setBgHeight] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const photoColumnRef = useRef<HTMLDivElement>(null);
  const elevateTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const photoColumn = photoColumnRef.current;
    if (!section || !photoColumn) return;

    const syncBgHeight = () => {
      const sectionTop = section.getBoundingClientRect().top;
      const photoBottom = photoColumn.getBoundingClientRect().bottom;
      setBgHeight(Math.max(0, photoBottom - sectionTop));
    };

    syncBgHeight();

    const resizeObserver = new ResizeObserver(syncBgHeight);
    resizeObserver.observe(section);
    resizeObserver.observe(photoColumn);

    window.addEventListener("resize", syncBgHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncBgHeight);
    };
  }, []);

  const openAchievements = () => {
    if (elevateTimeoutRef.current !== null) {
      window.clearTimeout(elevateTimeoutRef.current);
      elevateTimeoutRef.current = null;
    }

    setIsOverlayElevated(true);
    setShowAchievements(true);
  };

  const closeAchievements = () => {
    setShowAchievements(false);
    elevateTimeoutRef.current = window.setTimeout(() => {
      setIsOverlayElevated(false);
      elevateTimeoutRef.current = null;
    }, ACHIEVEMENTS_TRANSITION_MS);
  };

  const toggleAchievements = () => {
    if (showAchievements) {
      closeAchievements();
      return;
    }

    openAchievements();
  };

  return (
    <section ref={sectionRef} className="relative bg-[#090808] pb-16 pt-0 md:pb-20">
      <div
        className={`pointer-events-none absolute right-0 w-full md:w-[58%] lg:w-[54%] ${
          bgHeight === null ? "inset-y-0" : "top-0"
        }`}
        style={bgHeight !== null ? { height: bgHeight } : undefined}
      >
        <Image
          src={assets.heroPortrait}
          alt=""
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 58vw"
          priority
        />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#090808] via-[#090808]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090808] to-transparent md:h-36" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6">
        <HeroNav />

        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-6">
          <div className="relative z-20 flex flex-col pt-4 md:h-[78%] md:justify-end md:pt-0">
            <HeroStickyTitle />

            <p className="mt-4 whitespace-nowrap text-[clamp(0.65rem,1.5vw,1.25rem)] font-black uppercase leading-none tracking-tight text-white">
              Аргентинское танго простым и доступным языком
            </p>

            <ul className="mt-6 space-y-3 md:space-y-4 sm:mb-8 md:mb-10">
              {heroFeatures.map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <HeroStar />
                  <span className="text-lg leading-snug text-white">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hidden min-h-0 flex-1 max-md:block" aria-hidden />

            <div className="relative mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 sm:pt-6 md:mt-0 md:pt-8">
              <Link
                href="#laifhack"
                className="btn-primary relative z-10 inline-flex h-[75px] w-full shrink-0 items-center justify-center rounded-full px-10 text-lg font-medium uppercase sm:w-auto sm:min-w-[220px]"
              >
                лайфхаки
              </Link>

              <svg
                aria-hidden
                viewBox="0 0 136 76"
                className="pointer-events-none absolute left-[170px] top-[-10px] z-20 hidden h-[58px] w-[116px] text-white opacity-50 sm:block"
                fill="none"
              >
                <defs>
                  <marker
                    id="hero-cta-arrowhead"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="10"
                    markerHeight="10"
                    orient="auto"
                    markerUnits="userSpaceOnUse"
                  >
                    <path d="M0 1 L9 5 L0 9 Z" fill="currentColor" />
                  </marker>
                </defs>
                <path
                  d="M128 28C98 -6 49 2 38 52"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  markerEnd="url(#hero-cta-arrowhead)"
                />
              </svg>

              <div className="relative z-0 min-w-0 max-w-md sm:flex-1 sm:max-w-lg">
                <p className="text-sm leading-relaxed text-white sm:text-base">
                  Открывай и{" "}
                  <span className="bg-[#da0d0d] px-1">смотри прямо сейчас</span>{" "}
                  бесплатные видеоуроки, чтобы еще больше прокачать в танго
                  технику, музыкальность, вариативность и взаимодействие
                </p>
              </div>
            </div>
          </div>

          <div
            ref={photoColumnRef}
            className={`relative mx-auto flex h-full w-full max-w-[540px] -translate-y-10 flex-col overflow-visible md:max-w-[580px] md:-translate-y-16 lg:max-w-[620px] ${
              isOverlayElevated ? "z-50" : "z-10"
            }`}
          >
            <div
              className="relative aspect-[1680/2518] w-full overflow-visible"
              onMouseEnter={openAchievements}
              onMouseLeave={closeAchievements}
              onClick={toggleAchievements}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  toggleAchievements();
                }
              }}
              role="button"
              tabIndex={0}
              aria-expanded={showAchievements}
              aria-label="Дмитрий Васин — показать достижения"
            >
              <Image
                src={assets.heroBadge}
                alt="Дмитрий Васин"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 540px, 620px"
              />

              <div className="pointer-events-auto absolute bottom-[14%] left-1/2 z-10 w-[calc(100%-6.5rem)] max-w-[280px] -translate-x-1/2 select-text rounded-[15px] bg-gradient-to-b from-[#181616]/55 from-[54%] to-[#eb0b0b]/45 p-4 text-center shadow-[0_4px_8px_rgba(9,8,8,0.35)] backdrop-blur-[2px] md:bottom-[15%] md:max-w-[290px] md:p-5">
                <p className="text-lg font-semibold uppercase text-white">
                  Дмитрий Васин
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/90">
                  Чемпион Мира, Учитель Чемпионов России и Европы, Финалист
                  проекта «Новые танцы» на ТНТ, Хореограф: «Танцы» на ТНТ»
                </p>
              </div>
            </div>

            <div
              className={`absolute bottom-[28%] right-[68%] z-50 w-[min(420px,calc(100%+18rem))] max-w-[420px] rounded-[15px] bg-white p-5 text-[#090808] shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-opacity duration-500 ease-in-out ${
                showAchievements
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ul className="space-y-2 text-sm leading-snug md:text-base">
                {heroAchievements.map((item) => (
                  <li key={item.parts.map((part) => part.bold ?? part.text).join("")}>
                    {item.parts.map((part) =>
                      "bold" in part && part.bold ? (
                        <strong key={part.bold} className="font-bold">
                          {part.bold}
                        </strong>
                      ) : (
                        <span key={part.text}>{part.text}</span>
                      ),
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-base font-bold">В танго с 2006 года</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
