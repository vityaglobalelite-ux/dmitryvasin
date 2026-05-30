"use client";

import Image from "next/image";
import { useState } from "react";
import { lifehacks } from "@/lib/site-data";
import { VideoModal } from "./VideoModal";

export function LifehacksSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? lifehacks[activeIndex] : null;

  return (
    <section id="laifhack" className="bg-[#090808] py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2 className="text-center text-4xl font-black uppercase text-white md:text-6xl">
          <span className="bg-[#eb0b0b] px-2">4 бесплатных лайфхака</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white md:text-2xl">
          Нажимай «Смотреть» прямо сейчас и прокачай в танго ↓
        </p>
        <p className="mt-2 text-center text-sm text-white/60 md:hidden">
          Листай →
        </p>
      </div>

      <div className="mt-10 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max gap-5 px-4 md:px-[max(1.5rem,calc((100vw-1200px)/2))]">
          {lifehacks.map((item, index) => (
            <article
              key={item.id}
              className="group w-[260px] shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-[#181616]/90 to-[#eb0b0b]/60 p-1 shadow-lg transition hover:scale-[1.03]"
            >
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={260}
                  height={179}
                  className="h-[179px] w-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-3xl font-black uppercase text-white">
                  <span className="bg-[#eb0b0b] px-1">{item.title}</span>
                </h3>
                <p className="mt-3 min-h-[84px] text-base text-white/90">
                  {item.description}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="mt-4 inline-flex min-h-[53px] w-full items-center justify-center rounded-2xl bg-gradient-to-t from-[#181616] to-[#eb0b0b] text-base capitalize text-white transition hover:brightness-110"
                >
                  смотреть
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {active && (
        <VideoModal
          open={activeIndex !== null}
          onClose={() => setActiveIndex(null)}
          title={active.popupTitle}
          description={active.popupText}
          videoSrc={active.video}
          poster={active.image}
        />
      )}
    </section>
  );
}
