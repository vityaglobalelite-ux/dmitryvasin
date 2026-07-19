"use client";

import { landingAssets } from "@/lib/landing-assets";
import { paymentSteps, telegramSupportBotUrl } from "@/lib/landing-data";
import { useIsMobile } from "@/lib/landing-mode";

/* Figma: y 11624..12694 — «Стоимость и оплата» */

const stepX = [240, 605, 970, 1335];

function SwipeHint({ text }: { text: string }) {
  return (
    <div className="flex h-[40px] w-[298px] items-center gap-[10px]">
      <div className="grid size-[34px] shrink-0 place-items-center rounded-[17px] bg-light-gray">
        <img
          src={landingAssets.icons.fingerSwipe}
          alt=""
          className="size-[16px]"
          width={16}
          height={16}
        />
      </div>
      <p className="w-[254px] text-[13px] font-normal leading-[1.5] text-[#1a1a1a]">
        {text}
      </p>
    </div>
  );
}

function PaymentMobile() {
  return (
    <section className="absolute left-0 top-0 h-0 w-full">
      {/* 303:64 — title block */}
      <div
        id="payment"
        className="absolute left-[20px] top-[14420px] flex w-[297px] flex-col gap-[10px]"
      >
        <h2 className="h-section-mobile w-[297px]">Стоимость и оплата</h2>
        <p className="w-[297px] text-[16px] font-medium leading-[1.2] text-text">
          Присоединиться к закрытому исследованию можно из любой точки мира.
        </p>
      </div>

      {/* 325:2 — swipe hint */}
      <div className="absolute left-[20px] top-[14533px]">
        <SwipeHint text="Листайте вправо-влево, чтобы посмотреть инструкцию по оплате" />
      </div>

      {/* Frame 2431/2432 — horizontal steps */}
      <div className="absolute left-0 top-[14593px] z-[2] w-[360px] overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-[16px] px-[20px]">
          {paymentSteps.map((s, i) => (
            <div
              key={s.step}
              className="flex h-[262px] w-[290px] shrink-0 snap-start flex-col gap-[30px] rounded-[10px] bg-light-gray p-[15px]"
            >
              <img
                src={landingAssets.icons.stepChips[i]}
                alt={`${s.step}`}
                className="size-[40px] shrink-0"
                width={40}
                height={40}
              />
              <div className="h-[72px] w-full shrink-0 rounded-[10px] bg-[#d9d9d9]" />
              <p className="text-[13px] font-normal leading-[1.5] text-text">
                {s.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 298:33 — support row */}
      <div className="absolute left-[20px] top-[14885px] flex h-[57px] w-[321px] items-center gap-[10px]">
        <img
          src={landingAssets.icons.personSupport}
          alt=""
          className="size-[24px] shrink-0"
          width={24}
          height={24}
        />
        <p className="w-[246px] text-[16px] font-medium leading-[1.2] text-text">
          Если&nbsp;возникнут вопросы, служба поддержки в&nbsp;боте поможет
          на&nbsp;любом этапе.
        </p>
      </div>

      {/* 303:66 + 303:67 + 303:68 + 298:32 — support banner */}
      <div
        className="absolute left-[20px] top-[15062px] z-[2] h-[351px] w-[320px] overflow-hidden rounded-[10px]"
        style={{
          backgroundImage:
            "linear-gradient(109.54deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        {/* 303:67 — Medium 24 / lh 1.2 / white */}
        <p className="absolute left-[15px] top-[20px] z-[1] w-[290px] text-[24px] font-medium leading-[1.2] text-white">
          Если&nbsp;у&nbsp;вас есть&nbsp;вопросы&nbsp;— напишите
          в&nbsp;поддержку, и&nbsp;вам&nbsp;помогут
        </p>

        {/* 303:68 — 259×60 @ 15,140 */}
        <a
          href={telegramSupportBotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary absolute left-[15px] top-[138px] z-[1]"
        >
          Написать в поддержку
        </a>

        {/* 298:32 — Untitled-10 1, 209×146 @ 112,205; CROP as in Figma */}
        <div className="pointer-events-none absolute left-[112px] top-[205px] z-0 h-[146px] w-[209px] overflow-hidden">
          <img
            src={landingAssets.misc.supportQuestionMobile}
            alt=""
            draggable={false}
            className="pointer-events-none absolute left-0 top-[-10.31%] h-[185.16%] w-[129.87%] max-w-none select-none [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
          />
        </div>
      </div>
    </section>
  );
}

function PaymentDesktop() {
  return (
    <section className="absolute left-0 top-0 h-0 w-full">
      <h2
        id="payment"
        className="h-section absolute left-[241px] top-[11624px] w-[1400px]"
      >
        Стоимость и оплата
      </h2>
      <p className="absolute left-[241px] top-[11696px] w-[588px] text-[20px] leading-[29px] text-text">
        Присоединиться к закрытому исследованию можно из любой точки мира.
      </p>

      {paymentSteps.map((s, i) => (
        <div
          key={s.step}
          className="absolute flex h-[320px] w-[345px] flex-col gap-[30px] rounded-[30px] bg-light-gray p-[30px]"
          style={{ left: stepX[i], top: 11794, width: i === 0 ? 346 : 345 }}
        >
          <img
            src={landingAssets.icons.stepChips[i]}
            alt={`${s.step}`}
            className="size-[50px] shrink-0"
            width={50}
            height={50}
          />
          <div className="h-[72px] w-full shrink-0 rounded-[10px] bg-[#d9d9d9]" />
          <p className="text-[16px] leading-[1.5] text-text">{s.title}</p>
        </div>
      ))}

      {/* Figma 249:2023 */}
      <div className="absolute left-[240px] top-[12154px] flex h-[30px] w-[990px] items-center gap-[10px]">
        <img
          src={landingAssets.icons.personSupport}
          alt=""
          className="size-[30px] shrink-0"
          width={30}
          height={30}
        />
        <p className="whitespace-nowrap text-[24px] font-medium leading-[1.2] text-text">
          Если возникнут вопросы, служба поддержки в боте поможет на любом
          этапе.
        </p>
      </div>

      {/* Figma 249:1900 — градиентный баннер поддержки */}
      <div
        className="absolute left-[240px] top-[12364px] h-[330px] w-[1440px] overflow-hidden rounded-[40px]"
        style={{
          backgroundImage:
            "linear-gradient(149.52deg, #db0c25 2.6%, #e04c29 36.63%, #efb991 105.73%)",
        }}
      >
        <div className="absolute left-[60px] top-[60px] flex w-[934px] flex-col gap-[40px]">
          <p className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-light-gray">
            Если у вас есть вопросы — напишите в поддержку, и вам помогут
          </p>
          <a
            href={telegramSupportBotUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Написать в поддержку
          </a>
        </div>

        {/* Figma 249:2022 — crop inside 318×330 at (1362,12364) → rel (1122,0) */}
        <div className="pointer-events-none absolute left-[1122px] top-0 h-[330px] w-[318px] overflow-hidden">
          <img
            src={landingAssets.misc.mockupPayment}
            alt=""
            className="absolute left-0 top-[-6.97%] h-[125.15%] w-[129.87%] max-w-none"
          />
        </div>
      </div>
    </section>
  );
}

export function PaymentSection() {
  const isMobile = useIsMobile();
  return isMobile ? <PaymentMobile /> : <PaymentDesktop />;
}
