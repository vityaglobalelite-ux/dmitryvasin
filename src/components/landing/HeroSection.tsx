"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
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

export function HeroSection() {
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#090808] pb-16 pt-24 md:pb-20 md:pt-28">
      <div className="pointer-events-none absolute right-0 top-[50%] bottom-0 w-full md:top-0 md:w-[58%] lg:w-[54%]">
        <Image
          src={assets.heroPortrait}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 58vw"
          priority
        />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#090808] via-[#090808]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#090808] to-transparent md:h-36" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#090808]/70 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-6">
          <div className="relative z-20">
            <h1 className="inline-block whitespace-nowrap bg-[#eb0b0b] px-2 py-1 text-[clamp(1rem,2.4vw,2.5rem)] font-black uppercase leading-none text-white">
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

            <div className="relative mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="#laifhack"
                className="btn-primary inline-flex h-[75px] w-full shrink-0 items-center justify-center rounded-full px-10 text-lg font-medium uppercase sm:w-auto sm:min-w-[220px]"
              >
                лайфхаки
              </Link>

              <svg
                aria-hidden
                viewBox="0 0 136 76"
                className="pointer-events-none absolute left-[170px] top-[-22px] hidden h-[64px] w-[116px] text-white/70 sm:block"
                fill="none"
              >
                <path
                  d="M128 28C98 -6 49 2 34 54"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M34 54L36 39M34 54L49 50"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
            className="relative z-10 mx-auto w-full max-w-[460px]"
            onMouseEnter={() => setShowAchievements(true)}
            onMouseLeave={() => setShowAchievements(false)}
            onClick={() => setShowAchievements((value) => !value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setShowAchievements((value) => !value);
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
              className="relative h-auto w-full"
              priority
              sizes="(max-width: 768px) 460px, 460px"
            />

            <div
              className={`absolute left-1/2 w-[calc(100%-1rem)] max-w-[362px] -translate-x-1/2 rounded-[15px] bg-white p-5 text-[#090808] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-all duration-300 ${
                showAchievements
                  ? "pointer-events-auto bottom-[22%] z-20 scale-100 opacity-100"
                  : "pointer-events-none bottom-[24%] z-0 scale-95 opacity-0"
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

            <div
              className={`absolute bottom-[18%] left-1/2 w-[calc(100%-2rem)] max-w-[362px] -translate-x-1/2 rounded-[15px] bg-gradient-to-b from-[#181616] from-[54%] to-[#eb0b0b] p-5 shadow-[0_4px_8px_rgba(9,8,8,1)] transition-opacity duration-300 ${
                showAchievements ? "opacity-0" : "opacity-100"
              }`}
            >
              <p className="text-lg font-semibold uppercase text-white">
                Дмитрий Васин
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/90">
                Чемпион Мира, Учитель Чемпионов России и Европы, Финалист
                проекта «Новые танцы» на ТНТ, Хореограф: «Танцы» на ТНТ»
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
