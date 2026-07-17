"use client";

import { landingAssets } from "@/lib/landing-assets";
import { tariffs } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma: y 10354..11120 — «Выбирайте тариф участия» */

const cardX = [240, 727, 1213];
const mobileCardY = [12395, 12913, 13431];

function DurationLabel({
  duration,
  className = "text-[16px] leading-[1.5] text-[#1a1a1a]",
}: {
  duration: string;
  className?: string;
}) {
  // Bold the leading duration chunk before «участия»
  const match = duration.match(/^(.*?)(\s+участия.*)$/u);
  if (!match) {
    return <span className={className}>{duration}</span>;
  }
  return (
    <span className={className}>
      <span className="font-bold">{match[1]}</span>
      <span className="font-normal">{match[2]}</span>
    </span>
  );
}

function TariffsMobile() {
  return (
    <section id="tariffs" className="absolute left-0 top-0 h-0 w-full">
      <h2 className="h-section-mobile absolute left-[20px] top-[12279px] w-[301px]">
        Выбирайте тариф участия
      </h2>

      {/* Frame 2391 — 20,12325,193×50 */}
      <div className="absolute left-[20px] top-[12325px] flex h-[50px] w-[193px] items-center gap-[10px] rounded-[10px] bg-[image:var(--brand-gradient)] px-[15px] py-[8px]">
        <div className="grid size-[34px] shrink-0 place-items-center rounded-[17px] bg-white">
          <img
            src={landingAssets.icons.stopwatchStart}
            alt=""
            className="size-[24px]"
            width={24}
            height={24}
          />
        </div>
        <span className="whitespace-nowrap text-[16px] font-medium leading-[1.2] text-white">
          Старт: 25 июля
        </span>
      </div>

      {tariffs.map((t, i) => {
        const isVip = i === 2;
        return (
          <article
            key={t.id}
            className="absolute flex h-[498px] w-[320px] flex-col justify-between rounded-[10px] bg-light-gray p-[15px]"
            style={{ left: 20, top: mobileCardY[i] }}
          >
            <div className="flex w-full flex-col gap-[20px]">
              <div className="flex h-[50px] flex-col gap-[6px]">
                <p className="text-[12px] font-semibold uppercase leading-[1.1] text-accent-red">
                  {t.badge}
                </p>
                <p className="text-[18px] font-medium leading-[1.2] text-[#1a1a1a]">
                  {t.title}
                </p>
              </div>

              <div
                className={`flex w-full items-center gap-[10px] rounded-[10px] bg-white px-[15px] py-[10px] ${
                  isVip ? "h-[80px]" : "h-[62px]"
                }`}
              >
                <div
                  className="grid size-[34px] shrink-0 place-items-center rounded-[17px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(111.28deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
                  }}
                >
                  <img
                    src={landingAssets.icons.calendarBoldWhite}
                    alt=""
                    className="size-[20px]"
                    width={20}
                    height={20}
                  />
                </div>
                <DurationLabel
                  duration={t.duration}
                  className="flex-1 text-[13px] font-normal leading-[1.5] text-[#1a1a1a]"
                />
              </div>

              <ul className="flex w-full flex-col gap-[4px]">
                {t.features.map((f, fi) => (
                  <li key={f} className="contents">
                    {fi > 0 ? (
                      <div className="h-px w-full bg-white" aria-hidden />
                    ) : null}
                    <p className="text-[13px] font-normal leading-[1.5] text-text">
                      {f}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[30px]">
              <p className="flex items-center gap-[30px] whitespace-nowrap">
                <span
                  className="bg-clip-text text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(137.53deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
                  }}
                >
                  {t.price}
                </span>
                <span className="text-[16px] font-medium leading-[1.2] text-text line-through">
                  {t.oldPrice}
                </span>
              </p>
              <a href="#payment" className="btn-primary-mobile !w-[259px]">
                Оплатить
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function TariffsDesktop() {
  return (
    <section id="tariffs" className="absolute left-0 top-0 h-0 w-full">
      <h2 className="h-section absolute left-[240px] top-[10358px] w-[626px]">
        Выбирайте тариф участия
      </h2>

      {/* Figma 287:657 — градиентный чип «Старт» */}
      <div
        className="absolute left-[1417px] top-[10354px] flex h-[62px] w-[263px] items-center gap-[10px] rounded-[20px] px-[20px] py-[10px]"
        style={{
          backgroundImage:
            "linear-gradient(148.81deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <div className="grid size-[34px] shrink-0 place-items-center rounded-[17px] bg-white">
          <img
            src={landingAssets.icons.stopwatchStart}
            alt=""
            className="size-[24px]"
            width={24}
            height={24}
          />
        </div>
        <span className="whitespace-nowrap text-[24px] leading-[1.2] text-white">
          <span className="font-bold">Старт:</span>
          <span className="font-medium"> 25 июля</span>
        </span>
      </div>

      {tariffs.map((t, i) => (
        <article
          key={t.id}
          className="absolute flex h-[636px] w-[467px] flex-col justify-between rounded-[20px] bg-light-gray p-[30px]"
          style={{ left: cardX[i], top: 10458 }}
        >
          <div className="flex w-full flex-col gap-[30px]">
            <div className="flex h-[50px] flex-col gap-[6px]">
              <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red">
                {t.badge}
              </p>
              <p className="text-[30px] font-semibold leading-[1.2] text-[#1a1a1a]">
                {t.title}
              </p>
            </div>

            {/* Figma 249:1859 — белый duration pill */}
            <div className="flex h-[62px] w-full items-center gap-[10px] rounded-[20px] bg-white px-[20px] py-[10px]">
              <div
                className="grid size-[34px] shrink-0 place-items-center rounded-[17px]"
                style={{
                  backgroundImage:
                    "linear-gradient(111.28deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
                }}
              >
                <img
                  src={landingAssets.icons.calendarBoldWhite}
                  alt=""
                  className="size-[20px]"
                  width={20}
                  height={20}
                />
              </div>
              <DurationLabel duration={t.duration} />
            </div>

            <ul className="flex w-full flex-col gap-[10px]">
              {t.features.map((f, fi) => (
                <li key={f} className="contents">
                  {fi > 0 ? (
                    <div
                      className="h-px w-full bg-white"
                      aria-hidden
                    />
                  ) : null}
                  <p className="text-[16px] leading-[1.5] text-[#1a1a1a]">{f}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-[30px]">
            <p className="flex items-center gap-[30px] whitespace-nowrap">
              <span
                className="bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(137.53deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
                }}
              >
                {t.price}
              </span>
              <span className="text-[20px] font-semibold leading-[1.2] text-text line-through">
                {t.oldPrice}
              </span>
            </p>
            <a href="#payment" className="btn-primary">
              Оплатить
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}

export function TariffsSection() {
  const isMobile = useIsMobile();
  return isMobile ? <TariffsMobile /> : <TariffsDesktop />;
}
