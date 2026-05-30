import Image from "next/image";
import Link from "next/link";
import { assets } from "@/lib/assets";
import { heroAchievements, heroFeatures } from "@/lib/site-data";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#090808] pb-16 pt-24 md:pb-20 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
      >
        <Image
          src={assets.heroPortrait}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="relative z-10">
            <h1 className="text-4xl font-black uppercase leading-tight text-white md:text-6xl">
              <span className="bg-[#eb0b0b] px-1">СМОТРИ.</span>
              <br />
              <span className="bg-[#eb0b0b] px-1">ПОВТОРЯЙ.</span>
              <br />
              <span className="bg-[#eb0b0b] px-1">ТАНЦУЙ!</span>
            </h1>

            <p className="mt-6 text-xl font-black uppercase leading-snug text-white md:text-2xl">
              Аргентинское танго простым и доступным языком
            </p>

            <ul className="mt-6 space-y-3 md:space-y-4">
              {heroFeatures.map((text) => (
                <li key={text} className="flex items-start gap-3">
                  <Image
                    src={assets.heroStar}
                    alt=""
                    width={27}
                    height={27}
                    className="mt-1 shrink-0 animate-[spin_10s_linear_infinite]"
                  />
                  <span className="text-lg leading-snug text-white">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-6">
              <Link
                href="#laifhack"
                className="btn-primary inline-flex h-[75px] w-full max-w-[300px] items-center justify-center rounded-full text-lg font-medium uppercase"
              >
                лайфхаки
              </Link>

              <p className="max-w-md text-sm leading-relaxed text-white md:text-base">
                Открывай и{" "}
                <span className="bg-[#da0d0d] px-1">смотри прямо сейчас</span>{" "}
                бесплатные видеоуроки, чтобы еще больше прокачать в танго
                технику, музыкальность, вариативность и взаимодействие
              </p>
            </div>

            <ul className="mt-8 hidden space-y-2 md:block">
              {heroAchievements.map((text) => (
                <li key={text} className="flex items-start gap-2 text-sm text-white/90">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#eb0b0b]" />
                  {text}
                </li>
              ))}
              <li className="pt-2 text-base font-semibold text-white">
                В танго с 2006 года
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[340px] md:max-w-[400px]">
            <Image
              src={assets.heroBadge}
              alt="Дмитрий Васин"
              width={628}
              height={941}
              className="relative h-auto w-full"
              priority
              sizes="(max-width: 768px) 340px, 400px"
            />
            <div className="absolute bottom-[18%] left-1/2 w-[calc(100%-2rem)] max-w-[362px] -translate-x-1/2 rounded-[15px] bg-gradient-to-b from-[#181616] from-[54%] to-[#eb0b0b] p-5 shadow-[0_4px_8px_rgba(9,8,8,1)]">
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

        <ul className="mt-10 space-y-2 md:hidden">
          {heroAchievements.map((text) => (
            <li key={text} className="flex items-start gap-2 text-sm text-white/90">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#eb0b0b]" />
              {text}
            </li>
          ))}
          <li className="pt-2 text-base font-semibold text-white">
            В танго с 2006 года
          </li>
        </ul>
      </div>
    </section>
  );
}
