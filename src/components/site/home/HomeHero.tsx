"use client";

import Link from "next/link";
import { homeAssets } from "@/lib/catalog/home-assets";
import { homeT } from "@/lib/catalog/home-copy";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { HomeFrame } from "@/components/site/home/HomeFrame";
import { Button } from "@/components/site/ui/Button";

const bubbleShadow =
  "shadow-[0_5px_5px_rgba(0,0,0,0.06),0_18px_9px_rgba(0,0,0,0.05),0_42px_12.5px_rgba(0,0,0,0.03)]";

function HeroCta({ compact }: { compact?: boolean }) {
  const { copy } = homeT(useLocale());
  const routes = useLocalizedRoutes();
  return (
    <div className="flex items-center gap-[13px]">
      <Button
        href={routes.catalog}
        className={compact ? "h-[50px] w-[260px] px-0 text-[13px]" : "w-[309px] px-0"}
      >
        {copy.chooseVideos}
      </Button>
      <Link
        href={routes.catalog}
        className="transition-transform duration-200 hover:scale-105 active:scale-95"
        aria-label={copy.chooseVideos}
      >
        <img
          src={homeAssets.btnPlay}
          alt=""
          width={compact ? 50 : 60}
          height={compact ? 50 : 60}
          className={compact ? "size-[50px]" : "size-[60px]"}
        />
      </Link>
    </div>
  );
}

function DesktopHero() {
  const { copy } = homeT(useLocale());
  return (
    <HomeFrame width={1920} height={724}>
      <div className="relative h-[724px] w-[1920px] overflow-hidden">
        <img
          src={homeAssets.heroBg}
          alt=""
          className="absolute left-0 top-[-114px] h-[1120px] w-[1920px] object-cover"
        />
        <div className="absolute left-0 top-[-114px] h-[1120px] w-[1920px] bg-gradient-to-b from-white to-transparent to-[18%]" />
        <img
          src={homeAssets.heroBlob}
          alt=""
          className="absolute left-[-27px] top-[-77px] h-[818px] w-[1610px] max-w-none"
        />
        <img
          src={homeAssets.heroPhone}
          alt=""
          width={657}
          height={775}
          className="absolute left-[66px] top-[34px] h-[775px] w-[657px] max-w-none"
        />

        <p className="absolute left-[509px] top-[87px] bg-gradient-to-r from-plum to-[#762655] bg-clip-text text-[109px] font-semibold uppercase leading-none tracking-[-4.36px] text-transparent">
          {copy.look}
        </p>
        <img
          src={homeAssets.iconLook}
          alt=""
          width={45}
          height={45}
          className="absolute left-[712px] top-[130px] size-[45px]"
        />

        <div className="absolute left-[882px] top-[217px] h-[175px] w-[593px]">
          <p className="absolute left-[16px] top-[14px] rotate-[-0.18deg] text-[109px] font-semibold uppercase leading-none tracking-[-4.36px] text-plum/50">
            {copy.repeat}
          </p>
          <p
            className="absolute left-[12px] top-[14px] origin-center -rotate-3 bg-clip-text text-[109px] font-semibold uppercase leading-none tracking-[-4.36px] text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #762655 0%, #4c0d32 100%)",
            }}
          >
            {copy.repeat}
          </p>
          <img
            src={homeAssets.decoQuote}
            alt=""
            width={39}
            height={39}
            className="absolute left-0 top-[118px] size-[39px] -rotate-3"
          />
          <img
            src={homeAssets.decoQuoteTr}
            alt=""
            width={39}
            height={39}
            className="absolute right-0 top-[3px] size-[39px] rotate-180"
          />
        </div>

        <p
          className="absolute left-[1254px] top-[380px] bg-clip-text text-[109px] font-bold uppercase leading-none tracking-[-4.36px] text-transparent"
          style={{ backgroundImage: "var(--brand-gradient)" }}
        >
          {copy.dance}
        </p>

        <div
          className={`absolute left-[1002px] top-[109px] flex w-[511px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
        >
          <p className="text-[16px] leading-normal text-text">
            <span className="font-bold">{copy.bubbleLookLead}</span>
            {copy.bubbleLookRest}
          </p>
        </div>
        <div
          className={`absolute left-[535px] top-[267px] flex w-[327px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
        >
          <p className="text-[16px] leading-normal text-text">
            <span className="font-bold">{copy.bubbleDoLead}</span>
            {copy.bubbleDoRest}
          </p>
        </div>
        <div
          className={`absolute left-[868px] top-[405px] flex w-[367px] items-center rounded-[20px] bg-white p-5 ${bubbleShadow}`}
        >
          <p className="text-[16px] leading-normal text-text">
            <span className="font-bold">{copy.bubbleDanceLead}</span>
            {copy.bubbleDanceRest}
          </p>
        </div>

        <img
          src={homeAssets.decoArrow}
          alt=""
          width={226}
          height={175}
          className="absolute left-[665px] top-[468px] h-[175px] w-[226px] -rotate-[14.5deg]"
        />

        <div className="absolute left-[758px] top-[550px]">
          <HeroCta />
        </div>
      </div>
    </HomeFrame>
  );
}

function MobileHero() {
  const { copy } = homeT(useLocale());
  return (
    <HomeFrame width={360} height={594}>
      <div className="relative h-[594px] w-[360px] overflow-hidden">
        <img
          src={homeAssets.heroBgMobile}
          alt=""
          className="absolute left-[-5px] top-[-42px] h-[844px] w-[370px] object-cover"
        />
        <div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-white to-transparent" />
        <img
          src={homeAssets.heroBlob}
          alt=""
          className="absolute left-[-171px] top-[-42px] h-[618px] w-[665px] max-w-none"
        />

        <p className="absolute left-5 top-[27px] bg-gradient-to-r from-plum to-[#762655] bg-clip-text text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-transparent">
          {copy.look}
        </p>
        <img
          src={homeAssets.iconLook}
          alt=""
          width={23}
          height={23}
          className="absolute left-[122px] top-[49px] size-[23px]"
        />
        <div
          className={`absolute left-5 top-[90px] w-[249px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
        >
          <p className="text-[13px] leading-[1.3] text-text">
            <span className="font-bold">{copy.bubbleLookLead}</span>
            {copy.bubbleLookRest}
          </p>
        </div>

        <div className="absolute left-[30px] top-[183px] h-[88px] w-[300px]">
          <p className="absolute left-2 top-[7px] text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-plum/50">
            {copy.repeat}
          </p>
          <p
            className="absolute left-1.5 top-[15px] -rotate-3 bg-clip-text text-[55px] font-semibold uppercase leading-none tracking-[-2.2px] text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #762655, #4c0d32)",
            }}
          >
            {copy.repeat}
          </p>
        </div>
        <div
          className={`absolute left-[79px] top-[258px] w-[220px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
        >
          <p className="text-[13px] leading-[1.3] text-text">
            <span className="font-bold">{copy.bubbleDoLead}</span>
            {copy.bubbleDoRest}
          </p>
        </div>

        <p
          className="absolute left-[121px] top-[344px] bg-clip-text text-[55px] font-bold uppercase leading-none tracking-[-2.2px] text-transparent"
          style={{ backgroundImage: "var(--brand-gradient)" }}
        >
          {copy.dance}
        </p>
        <div
          className={`absolute left-[93px] top-[412px] w-[247px] rounded-[20px] bg-white px-[15px] py-2.5 ${bubbleShadow}`}
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
          className="absolute left-[13px] top-[472px] h-[90px] w-[101px]"
        />
        <div className="absolute left-[50px] top-[504px]">
          <HeroCta compact />
        </div>
      </div>
    </HomeFrame>
  );
}

export function HomeHero() {
  return (
    <section aria-label="BeTango">
      <DesktopHero />
      <MobileHero />
    </section>
  );
}
