"use client";

import { useEffect, useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { countdownTarget } from "@/lib/landing-data";

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* Figma: Rectangle 41 (242,11114,1440x330) + CTA 255:2456 + mockup 255:2451 */
export function CountdownSection() {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    const tick = () => setTime(getTimeLeft(countdownTarget));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const display = time
    ? `${pad(time.days)}:${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`
    : "00:00:00:00";

  return (
    <>
      <div
        className="absolute left-[242px] top-[11114px] h-[330px] w-[1440px] overflow-hidden rounded-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(149.52deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        {/* Figma 255:2451 — crop inside 319×331 at (1362,11114) → rel (1120,0) */}
        <div className="pointer-events-none absolute left-[1120px] top-0 h-[331px] w-[319px] overflow-hidden">
          <img
            src={landingAssets.countdown.mockup}
            alt=""
            className="absolute left-[-9.65%] top-[-11.79%] h-[131.94%] w-[136.61%] max-w-none"
          />
        </div>
      </div>

      <h2 className="absolute left-[302px] top-[11174px] w-[333px] text-[50px] font-medium leading-[55px] tracking-[-1.5px] text-white">
        Повышение цен через:
      </h2>

      <p className="absolute left-[674px] top-[11198px] w-[698px] text-[128px] font-bold leading-[154px] tracking-[-3px] text-white tabular-nums">
        {display}
      </p>

      <span className="absolute left-[728px] top-[11335px] text-[16px] leading-[24px] text-white">
        дней
      </span>
      <span className="absolute left-[907px] top-[11335px] text-[16px] leading-[24px] text-white">
        часов
      </span>
      <span className="absolute left-[1090px] top-[11335px] text-[16px] leading-[24px] text-white">
        минут
      </span>
      <span className="absolute left-[1270px] top-[11335px] text-[16px] leading-[24px] text-white">
        секунд
      </span>

      {/* Figma 255:2456 — тёмный CTA как «Оплатить» */}
      <a href="#tariffs" className="btn-primary absolute left-[302px] top-[11324px]">
        Выбрать тариф и оплатить
      </a>
    </>
  );
}
