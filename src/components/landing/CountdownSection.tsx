"use client";

import { useEffect, useState } from "react";
import { ClubCta } from "@/components/landing/ClubCta";
import { landingAssets } from "@/lib/landing-assets";
import { useIsMobile } from "@/lib/landing-mode";
import { useCountdownTail } from "@/lib/countdown-tail";
import { CLUB_CLOSED_ID } from "@/lib/tariff-stage3";

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

function useCountdownDisplay(target: Date | null) {
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    if (!target) {
      setTime(null);
      return;
    }
    const tick = () => setTime(getTimeLeft(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return time
    ? `${pad(time.days)}:${pad(time.hours)}:${pad(time.minutes)}:${pad(time.seconds)}`
    : "00:00:00:00";
}

function ClosedCopy({
  titleClassName,
  subtitleClassName,
}: {
  titleClassName: string;
  subtitleClassName: string;
}) {
  return (
    <>
      <h2 className={titleClassName}>Вход в клуб закрыт</h2>
      <p className={subtitleClassName}>
        Набор новых участников приостановлен
      </p>
    </>
  );
}

/* Figma Главная_360: 287:736 Rect41 + 287:738/739 + 287:795 + 287:824 */
function CountdownMobile({
  display,
  closed,
}: {
  display: string;
  closed: boolean;
}) {
  return (
    <div
      id={closed ? CLUB_CLOSED_ID : undefined}
      className="absolute left-[20px] top-[13949px] z-[2] h-[351px] w-[320px] overflow-hidden rounded-[10px]"
      style={{
        backgroundImage:
          "linear-gradient(109.54deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
      }}
    >
      {closed ? (
        <ClosedCopy
          titleClassName="absolute left-[15px] top-[28px] z-[1] w-[290px] text-[32px] font-medium leading-[1.15] tracking-[-0.6px] text-white"
          subtitleClassName="absolute left-[15px] top-[118px] z-[1] w-[250px] text-[16px] font-medium leading-[1.3] text-white/90"
        />
      ) : (
        <>
          <h2 className="absolute left-[15px] top-[20px] z-[1] w-[290px] text-[24px] font-medium leading-[1.2] text-white">
            Закрытие
            <br />
            доступа через:
          </h2>
          <p className="absolute left-[15px] top-[59px] z-[1] w-[284px] text-[57px] font-medium leading-[1.1] tracking-[-1.71px] text-white tabular-nums">
            {display}
          </p>
          <ClubCta className="btn-primary absolute left-[15px] top-[152px] z-[1]">
            Выбрать тариф и оплатить
          </ClubCta>
        </>
      )}

      <div className="pointer-events-none absolute left-[142px] top-[212px] z-0 h-[139px] w-[178px] overflow-hidden">
        <img
          src={landingAssets.countdown.clockMobile}
          alt=""
          draggable={false}
          className="pointer-events-none absolute left-[-16.29%] top-[-11.79%] h-[183.62%] w-[142.06%] max-w-none select-none [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
        />
      </div>
    </div>
  );
}

/* Figma: Rectangle 41 (242,11114,1440x330) + CTA 255:2456 + mockup 255:2451 */
function CountdownDesktop({
  display,
  closed,
}: {
  display: string;
  closed: boolean;
}) {
  return (
    <>
      <div
        id={closed ? CLUB_CLOSED_ID : undefined}
        className="absolute left-[242px] top-[11114px] h-[330px] w-[1440px] overflow-hidden rounded-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(149.52deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <div className="pointer-events-none absolute left-[1120px] top-0 h-[331px] w-[319px] overflow-hidden">
          <img
            src={landingAssets.countdown.mockup}
            alt=""
            className="absolute left-[-9.65%] top-[-11.79%] h-[131.94%] w-[136.61%] max-w-none"
          />
        </div>
      </div>

      {closed ? (
        <ClosedCopy
          titleClassName="absolute left-[302px] top-[11188px] z-[1] w-[780px] text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-white"
          subtitleClassName="absolute left-[302px] top-[11308px] z-[1] w-[720px] text-[24px] font-medium leading-[1.2] text-white/90"
        />
      ) : (
        <>
          <h2 className="absolute left-[302px] top-[11174px] w-[360px] text-[44px] font-medium leading-[1.15] tracking-[-1.32px] text-white">
            Закрытие
            <br />
            доступа через:
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

          <ClubCta className="btn-primary absolute left-[302px] top-[11324px]">
            Выбрать тариф и оплатить
          </ClubCta>
        </>
      )}
    </>
  );
}

export function CountdownSection() {
  const isMobile = useIsMobile();
  const { target, active, closed } = useCountdownTail();
  const display = useCountdownDisplay(active ? target : null);

  if (closed) {
    return isMobile ? (
      <CountdownMobile display={display} closed />
    ) : (
      <CountdownDesktop display={display} closed />
    );
  }

  if (!active || !target) return null;

  return isMobile ? (
    <CountdownMobile display={display} closed={false} />
  ) : (
    <CountdownDesktop display={display} closed={false} />
  );
}
