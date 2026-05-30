"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { assets } from "@/lib/assets";
import { heroAchievements, heroFeatures } from "@/lib/site-data";

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

export function HeroSection() {
  const [showAchievements, setShowAchievements] = useState(false);
  const [isOverlayElevated, setIsOverlayElevated] = useState(false);
  const elevateTimeoutRef = useRef<number | null>(null);

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
    <section className="relative bg-[#090808] pb-16 pt-0 md:pb-20">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-full md:w-[58%] lg:w-[54%]">
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
        <div className="grid items-stretch gap-10 md:grid-cols-2 md:gap-6">
          <div className="relative z-20 flex flex-col pt-24 md:pt-28 lg:pt-32">
            <h1 className="w-fit max-w-none whitespace-nowrap bg-[#eb0b0b] px-2 py-1 text-[clamp(1rem,2.4vw,2.5rem)] font-black uppercase leading-none text-white">
              СМОТРИ. ПОВТОРЯЙ. ТАНЦУЙ!
            </h1>

            <p className="mt-4 whitespace-nowrap text-[clamp(0.65rem,1.5vw,1.25rem)] font-black uppercase leading-none tracking-tight text-white">
              Аргентинское танго простым и доступным языком
            </p>

            <ul className="mt-6 space-y-3 md:space-y-4">
              {heroFeatures.map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <HeroStar />
                  <span className="text-lg leading-snug text-white">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hidden min-h-0 flex-1 md:block" aria-hidden />

            <div className="relative mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 md:mt-0 md:mb-[calc(min(100%,460px)*941/628*0.18)]">
              <Link
                href="#laifhack"
                className="btn-primary inline-flex h-[75px] w-full shrink-0 items-center justify-center rounded-full px-10 text-lg font-medium uppercase sm:w-auto sm:min-w-[220px]"
              >
                лайфхаки
              </Link>

              <svg
                aria-hidden
                viewBox="0 0 136 76"
                className="pointer-events-none absolute left-[170px] top-[-22px] hidden h-[64px] w-[116px] text-white opacity-50 sm:block"
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

              <div className="min-w-0 max-w-md sm:flex-1 sm:max-w-lg">
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
            className={`relative mx-auto flex h-full w-full max-w-[460px] flex-col overflow-visible ${
              isOverlayElevated ? "z-50" : "z-10"
            }`}
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
              width={628}
              height={941}
              className="relative z-0 h-auto w-full"
              priority
              sizes="(max-width: 768px) 460px, 460px"
            />

            <div className="pointer-events-none absolute bottom-[22%] left-1/2 z-10 w-[calc(100%-5.5rem)] max-w-[310px] -translate-x-1/2 rounded-[15px] bg-gradient-to-b from-[#181616]/75 from-[54%] to-[#eb0b0b]/70 p-4 shadow-[0_4px_8px_rgba(9,8,8,0.6)] backdrop-blur-[2px] md:p-5">
              <p className="text-lg font-semibold uppercase text-white">
                Дмитрий Васин
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Чемпион Мира, Учитель Чемпионов России и Европы, Финалист
                проекта «Новые танцы» на ТНТ, Хореограф: «Танцы» на ТНТ»
              </p>
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
