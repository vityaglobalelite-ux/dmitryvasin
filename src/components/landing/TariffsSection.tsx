"use client";

import type { CSSProperties } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { ClubCta } from "@/components/landing/ClubCta";
import { clubJoinStatus, tariffAddons, tariffAddonsIntro, tariffs } from "@/lib/landing-data";
import { TARIFF_ADDON_LAYOUT, useCountdownTail } from "@/lib/countdown-tail";
import { useIsMobile } from "@/lib/landing-mode";
import {
  tariffKeyForIndex,
  useLandingTariffPrices,
  type AddonKey,
} from "@/lib/tariff-prices";

/* Figma: y 10354..11120 — «Выбирайте тариф участия» */

const cardX = [240, 727, 1213];
const mobileCardY = [12395, 12913, 13431];

const PLAQUE_GRADIENT =
  "linear-gradient(148.81deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)";

function ClubJoinPanel({
  className,
  kickerClassName,
  headlineClassName,
  stackedHeadline = false,
}: {
  className: string;
  kickerClassName: string;
  headlineClassName: string;
  stackedHeadline?: boolean;
}) {
  const date = (
    <span className="whitespace-nowrap font-bold text-white">
      {clubJoinStatus.month2Date}
    </span>
  );
  const range = (
    <span className="whitespace-nowrap">{clubJoinStatus.month2Range}</span>
  );

  return (
    <div className={className} style={{ backgroundImage: PLAQUE_GRADIENT }}>
      <div className="mt-[1px] grid size-[34px] shrink-0 place-items-center rounded-[17px] bg-white">
        <img
          src={landingAssets.icons.stopwatchStart}
          alt=""
          className="size-[24px]"
          width={24}
          height={24}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className={kickerClassName}>
          {clubJoinStatus.startedPrefix}{" "}
          <span className="whitespace-nowrap font-bold text-white">
            {clubJoinStatus.startedDate}
          </span>
        </p>
        {stackedHeadline ? (
          <>
            <p className={headlineClassName}>{clubJoinStatus.month2Prefix}</p>
            <p className={headlineClassName}>
              {range} {clubJoinStatus.month2Verb} {date}
            </p>
          </>
        ) : (
          <p className={headlineClassName}>
            {clubJoinStatus.month2Prefix} {range} {clubJoinStatus.month2Verb}{" "}
            {date}
          </p>
        )}
      </div>
    </div>
  );
}

function TariffCardsShift({ children }: { children: React.ReactNode }) {
  const { extra } = useCountdownTail();
  return (
    <div
      className="absolute left-0 top-0 h-0 w-full"
      style={{ transform: `translate3d(0, ${extra}px, 0)` }}
    >
      {children}
    </div>
  );
}

function DurationLabel({
  duration,
  className = "text-[16px] leading-[1.5] text-[#1a1a1a]",
}: {
  duration: string;
  className?: string;
}) {
  const match = duration.match(/^(.*?)(\s+участия.*)$/u);
  if (!match) {
    return (
      <span className={className}>
        <span className="font-bold">{duration}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      <span className="font-bold">{match[1]}</span>
      <span className="font-normal">{match[2]}</span>
    </span>
  );
}

function PriceRow({
  price,
  oldPrice,
  priceClassName,
  oldClassName,
}: {
  price: string;
  oldPrice: string | null;
  priceClassName: string;
  oldClassName: string;
}) {
  return (
    <p className="flex items-center gap-[30px] whitespace-nowrap">
      <span
        className={priceClassName}
        style={{
          backgroundImage:
            "linear-gradient(137.53deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        {price}
      </span>
      {oldPrice ? <span className={oldClassName}>{oldPrice}</span> : null}
    </p>
  );
}

function CalendarPill({
  duration,
  className,
  labelClassName,
}: {
  duration: string;
  className: string;
  labelClassName?: string;
}) {
  return (
    <div className={className}>
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
      <DurationLabel duration={duration} className={labelClassName} />
    </div>
  );
}

function AddonHeading({
  className,
  kickerClassName,
  titleClassName,
  subtitleClassName,
  style,
}: {
  className: string;
  kickerClassName: string;
  titleClassName: string;
  subtitleClassName: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style}>
      <p className={kickerClassName}>{tariffAddonsIntro.kicker}</p>
      <p className={titleClassName}>{tariffAddonsIntro.title}</p>
      <p className={subtitleClassName}>{tariffAddonsIntro.subtitle}</p>
    </div>
  );
}

function TariffsMobile() {
  const { prices, addonPrices } = useLandingTariffPrices();
  const m = TARIFF_ADDON_LAYOUT.mobile;
  const addonHeadingTop = m.lastMainTop + m.mainCardH + m.gapAfterMain;
  const addonCard0Top = addonHeadingTop + m.headingH + m.headingToCards;

  return (
    <section className="absolute left-0 top-0 h-0 w-full">
      <h2
        id="tariffs"
        className="h-section-mobile absolute left-[20px] top-[12279px] w-[301px]"
      >
        Выбирайте тариф участия
      </h2>

      <ClubJoinPanel
        className="absolute left-[20px] top-[12320px] flex w-[320px] items-start gap-[10px] rounded-[10px] px-[15px] py-[15px]"
        kickerClassName="text-[14px] font-medium leading-[1.4] text-white/85"
        headlineClassName="mt-[4px] text-[18px] font-semibold leading-[1.25] text-white"
        stackedHeadline
      />

      <TariffCardsShift>
      {tariffs.map((t, i) => {
        const isVip = i === 2;
        const display = prices[tariffKeyForIndex(i)];
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
              <PriceRow
                price={display.price}
                oldPrice={display.oldPrice}
                priceClassName="bg-clip-text text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-transparent"
                oldClassName="text-[16px] font-medium leading-[1.2] text-text line-through"
              />
              <ClubCta className="btn-primary-mobile !w-[259px]">
                Оплатить
              </ClubCta>
            </div>
          </article>
        );
      })}

      <AddonHeading
        className="absolute left-[20px] flex w-[320px] flex-col"
        style={{ top: addonHeadingTop, height: m.headingH }}
        kickerClassName="text-[12px] font-semibold uppercase leading-[1.1] text-accent-red"
        titleClassName="mt-[6px] text-[18px] font-medium leading-[1.2] text-[#1a1a1a]"
        subtitleClassName="mt-[8px] text-[13px] font-normal leading-[1.4] text-text"
      />

      {tariffAddons.map((t, i) => {
        const display = addonPrices[t.id as AddonKey];
        return (
          <article
            key={t.id}
            className="absolute flex w-[320px] flex-col justify-between rounded-[10px] bg-light-gray p-[15px]"
            style={{
              left: 20,
              top: addonCard0Top + i * (m.cardH + m.cardGap),
              height: m.cardH,
            }}
          >
            <div className="flex w-full flex-col gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <p className="text-[12px] font-semibold uppercase leading-[1.1] text-accent-red">
                  {t.badge}
                </p>
                <p className="text-[18px] font-medium leading-[1.2] text-[#1a1a1a]">
                  {t.title}
                </p>
              </div>

              <CalendarPill
                duration={t.duration}
                className="flex h-[62px] w-full items-center gap-[10px] rounded-[10px] bg-white px-[15px] py-[10px]"
                labelClassName="flex-1 text-[13px] font-normal leading-[1.5] text-[#1a1a1a]"
              />

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

            <div className="flex flex-col gap-[20px]">
              <PriceRow
                price={display.price}
                oldPrice={display.oldPrice}
                priceClassName="bg-clip-text text-[24px] font-medium leading-[1.1] tracking-[-0.72px] text-transparent"
                oldClassName="text-[16px] font-medium leading-[1.2] text-text line-through"
              />
              <ClubCta className="btn-primary-mobile !w-full">Оплатить</ClubCta>
            </div>
          </article>
        );
      })}
      </TariffCardsShift>
    </section>
  );
}

function TariffsDesktop() {
  const { prices, addonPrices } = useLandingTariffPrices();
  const d = TARIFF_ADDON_LAYOUT.desktop;
  const addonHeadingTop = d.mainTop + d.mainCardH + d.gapAfterMain;
  const addonCardsTop = addonHeadingTop + d.headingH + d.headingToCards;

  return (
    <section className="absolute left-0 top-0 h-0 w-full">
      <h2
        id="tariffs"
        className="h-section absolute left-[240px] top-[10358px] w-[626px]"
      >
        Выбирайте тариф участия
      </h2>

      <ClubJoinPanel
        className="absolute right-[240px] top-[10354px] flex w-fit max-w-[780px] items-start gap-[14px] rounded-[20px] px-[24px] py-[16px]"
        kickerClassName="text-[16px] font-medium leading-[1.2] text-white/85"
        headlineClassName="mt-[4px] text-[24px] font-semibold leading-[1.2] text-white"
        stackedHeadline
      />

      <TariffCardsShift>
      {tariffs.map((t, i) => {
        const display = prices[tariffKeyForIndex(i)];
        return (
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
                      <div className="h-px w-full bg-white" aria-hidden />
                    ) : null}
                    <p className="text-[16px] leading-[1.5] text-[#1a1a1a]">{f}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[30px]">
              <PriceRow
                price={display.price}
                oldPrice={display.oldPrice}
                priceClassName="bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent"
                oldClassName="text-[20px] font-semibold leading-[1.2] text-text line-through"
              />
              <ClubCta className="btn-primary">Оплатить</ClubCta>
            </div>
          </article>
        );
      })}

      <AddonHeading
        className="absolute left-[240px] flex w-[1440px] flex-col"
        style={{ top: addonHeadingTop, height: d.headingH }}
        kickerClassName="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red"
        titleClassName="mt-[6px] text-[30px] font-semibold leading-[1.2] text-[#1a1a1a]"
        subtitleClassName="mt-[8px] max-w-[920px] text-[16px] font-normal leading-[1.4] text-text"
      />

      {tariffAddons.map((t, i) => {
        const display = addonPrices[t.id as AddonKey];
        return (
          <article
            key={t.id}
            className="absolute flex flex-col justify-between rounded-[20px] bg-light-gray p-[30px]"
            style={{
              left: d.cardX[i],
              top: addonCardsTop,
              width: d.cardW,
              height: d.cardH,
            }}
          >
            <div className="flex w-full flex-col gap-[24px]">
              <div className="flex h-[50px] flex-col gap-[6px]">
                <p className="text-[14px] font-semibold uppercase leading-[1.1] text-accent-red">
                  {t.badge}
                </p>
                <p className="text-[30px] font-semibold leading-[1.2] text-[#1a1a1a]">
                  {t.title}
                </p>
              </div>

              <CalendarPill
                duration={t.duration}
                className="flex h-[62px] w-full items-center gap-[10px] rounded-[20px] bg-white px-[20px] py-[10px]"
              />

              <ul className="flex w-full flex-col gap-[10px]">
                {t.features.map((f, fi) => (
                  <li key={f} className="contents">
                    {fi > 0 ? (
                      <div className="h-px w-full bg-white" aria-hidden />
                    ) : null}
                    <p className="text-[16px] leading-[1.5] text-[#1a1a1a]">{f}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[24px]">
              <PriceRow
                price={display.price}
                oldPrice={display.oldPrice}
                priceClassName="bg-clip-text text-[30px] font-bold leading-[1.2] text-transparent"
                oldClassName="text-[20px] font-semibold leading-[1.2] text-text line-through"
              />
              <ClubCta className="btn-primary !w-full">Оплатить</ClubCta>
            </div>
          </article>
        );
      })}
      </TariffCardsShift>
    </section>
  );
}

export function TariffsSection() {
  const isMobile = useIsMobile();
  return isMobile ? <TariffsMobile /> : <TariffsDesktop />;
}
