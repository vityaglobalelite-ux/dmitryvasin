"use client";

import Link from "next/link";
import { Layer } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";

const bubbleShadow =
  "shadow-[0_5px_5px_rgba(0,0,0,0.06),0_18px_9px_rgba(0,0,0,0.05),0_42px_12.5px_rgba(0,0,0,0.03)]";

const lookGradient =
  "bg-gradient-to-r from-plum to-[#762655] bg-clip-text text-transparent";

function LookHeadline({
  text,
  eyeSrc,
}: {
  text: string;
  eyeSrc: string;
}) {
  return (
    <p className="absolute left-[509px] top-[152px] z-[12] flex h-[145px] w-[475px] items-center whitespace-nowrap text-[109px] font-semibold uppercase leading-none tracking-[-4.36px]">
      <span className={lookGradient}>{text}</span>
      <img
        src={eyeSrc}
        alt=""
        width={45}
        height={45}
        className="pointer-events-none absolute z-[1] size-[45.32px]"
        style={{ left: 202.52, top: 52.34 }}
      />
    </p>
  );
}

export function HomeHeroDesktop() {
  const locale = useLocale();
  const { copy } = homeT(locale);
  const routes = useLocalizedRoutes();
  const ru = locale === "ru";

  return (
    <>
      <img
        src={homeAssets.heroBg}
        alt=""
        className="pointer-events-none absolute left-0 top-[-49px] z-0 h-[1120px] w-[1920px] object-cover"
      />
      <img
        src={homeAssets.heroBlob}
        alt=""
        className="pointer-events-none absolute left-[-27px] top-[-12px] z-[1] h-[818px] w-[1610px] max-w-none"
      />

      <img
        src={`${homeAssets.heroPhone}?v=cutout`}
        alt=""
        width={901}
        height={1104}
        className="pointer-events-none absolute left-[35px] top-[79px] z-[9] h-[1104.5px] w-[901.5px] max-w-none"
      />

      <LookHeadline text={copy.look} eyeSrc={homeAssets.iconLook} />

      <div className="absolute left-[881.58px] top-[281.65px] z-[12] h-[174.84px] w-[592.85px]">
        <p className="absolute left-[12.05px] top-[30.04px] origin-center rotate-[-0.18deg] whitespace-nowrap text-[109px] font-semibold uppercase leading-none tracking-[-4.36px] text-[rgba(76,13,50,0.6)] opacity-50">
          {copy.repeat}
        </p>
        <p
          className="absolute left-[12.05px] top-[30.04px] origin-center -rotate-3 whitespace-nowrap bg-clip-text text-[109px] font-semibold uppercase leading-none tracking-[-4.36px] text-transparent"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #762655 0%, #4c0d32 100%), linear-gradient(90deg, #4c0d32 0%, #4c0d32 100%)",
          }}
        >
          {copy.repeat}
        </p>
        <img
          src={homeAssets.decoQuote}
          alt=""
          width={39}
          height={39}
          className="absolute left-0 top-[120.32px] size-[38.97px] -rotate-3"
        />
        <img
          src={`${homeAssets.decoQuoteTr}?v=figma`}
          alt=""
          width={44}
          height={42}
          className="absolute left-[538.9px] top-[-1.31px] z-[1] h-[42px] w-[44px] max-w-none"
        />
      </div>

      <p
        className="absolute left-[1254px] top-[444.71px] z-[12] bg-clip-text text-[109px] font-bold uppercase leading-none tracking-[-4.36px] text-transparent"
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        {copy.dance}
      </p>

      <div
        className={`absolute left-[1002px] top-[174px] z-[15] flex h-[82px] w-[511px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
      >
        <p className="text-[16px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleLookLead}</span>
          {ru ? (
            <>
              {" из\u00a0любой точки мира,"}
              <br />
              {"с\u00a0любого гаджета и\u00a0разбирай движения вместе со\u00a0мной."}
            </>
          ) : (
            copy.bubbleLookRest
          )}
        </p>
      </div>
      <div
        className={`absolute left-[535px] top-[332px] z-[5] flex h-[82px] w-[327px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
      >
        <p className="text-[16px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleDoLead}</span>
          {ru ? (
            <>
              {" шаг\u00a0за\u00a0шагом,"}
              <br />
              {"последовательно и\u00a0анализируя."}
            </>
          ) : (
            copy.bubbleDoRest
          )}
        </p>
      </div>
      <div
        className={`absolute left-[868px] top-[470px] z-[15] flex h-[82px] w-[367px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
      >
        <p className="text-[16px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleDanceLead}</span>
          {ru ? (
            <>
              {" и\u00a0двигайся"}
              <br />
              {"уверенно и\u00a0в\u00a0удовольствие!"}
            </>
          ) : (
            copy.bubbleDanceRest
          )}
        </p>
      </div>

      <img
        src={`${homeAssets.decoArrow}?v=page`}
        alt=""
        width={196}
        height={157}
        className="pointer-events-none absolute z-[17] max-w-none"
        style={{ left: 679, top: 500, width: 196, height: 157 }}
      />

      <div className="absolute left-[758px] top-[615px] z-[16] flex h-[60px] w-[382px] items-center gap-[13px]">
        <Button href={routes.catalog} className="h-[60px] w-[309px] px-0">
          {copy.chooseVideos}
        </Button>
        <Link
          href={routes.catalog}
          className="size-[60px] transition-transform duration-200 hover:scale-105 active:scale-95"
          aria-label={copy.chooseVideos}
        >
          <img
            src={`${homeAssets.btnPlay}?v=svg`}
            alt=""
            width={60}
            height={60}
            className="size-[60px]"
          />
        </Link>
      </div>
    </>
  );
}

export function HomeHeroMobile() {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();

  return (
    <>
      <img
        src={homeAssets.heroBgMobile}
        alt=""
        className="pointer-events-none absolute left-[-5px] top-0 z-0 h-[844px] w-[370px] object-cover"
      />
      <img
        src={homeAssets.heroBlob}
        alt=""
        className="pointer-events-none absolute left-[-170.98px] top-0 z-[1] h-[618px] w-[665px] max-w-none"
      />

      <p className="absolute left-5 top-[69px] z-[3] bg-gradient-to-r from-plum to-[#762655] bg-clip-text text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-transparent">
        {copy.look}
      </p>
      <img
        src={homeAssets.iconLook}
        alt=""
        width={23}
        height={23}
        className="absolute left-[122.18px] top-[90.74px] z-[4] size-[22.87px]"
      />
      <div
        className={`absolute left-5 top-[132px] z-[5] h-[71px] w-[249px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
      >
        <p className="text-[13px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleLookLead}</span>
          {copy.bubbleLookRest}
        </p>
      </div>

      <div className="absolute left-[30px] top-[225px] z-[3] h-[88.08px] w-[299.5px]">
        <p className="absolute left-[8.36px] top-[7.11px] text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-plum/50">
          {copy.repeat}
        </p>
        <p
          className="absolute left-[6.08px] top-[15.18px] -rotate-3 bg-clip-text text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-transparent"
          style={{ backgroundImage: "linear-gradient(90deg, #762655, #4c0d32)" }}
        >
          {copy.repeat}
        </p>
      </div>
      <div
        className={`absolute left-[79px] top-[300px] z-[5] h-[54px] w-[220px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
      >
        <p className="text-[13px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleDoLead}</span>
          {copy.bubbleDoRest}
        </p>
      </div>

      <p
        className="absolute left-[121px] top-[386px] z-[3] bg-clip-text text-[55px] font-bold uppercase leading-none tracking-[-2.2px] text-transparent"
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        {copy.dance}
      </p>
      <div
        className={`absolute left-[93px] top-[454px] z-[5] h-[54px] w-[247px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
      >
        <p className="text-[13px] leading-[1.3] text-text">
          <span className="font-bold">{copy.bubbleDanceLead}</span>
          {copy.bubbleDanceRest}
        </p>
      </div>
      <img
        src={homeAssets.decoArrow}
        alt=""
        width={101}
        height={90}
        className="pointer-events-none absolute left-[13px] top-[514.46px] z-[4] h-[89.81px] w-[100.89px]"
      />
      <Layer x={50} y={546} w={260} h={50} z={6}>
        <Button href={routes.catalog} className="h-[50px] w-[260px] px-0 text-[13px]">
          {copy.chooseVideos}
        </Button>
      </Layer>
    </>
  );
}
