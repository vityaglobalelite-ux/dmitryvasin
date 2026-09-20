"use client";

import { useState } from "react";
import {
  HomeHeaderDesktop,
  HomeHeaderMobile,
  HomeFooterDesktop,
  HomeFooterMobile,
} from "@/components/site/home/HomeChrome";
import { HomeCatalogRailDesktop, HomeCatalogRailMobile } from "@/components/site/home/HomeCatalogRail";
import { HomeCategoriesDesktop, HomeCategoriesMobile } from "@/components/site/home/HomeCategories";
import { HomeDirectionsDesktop, HomeDirectionsMobile } from "@/components/site/home/HomeDirections";
import { HomeHeroDesktop, HomeHeroMobile } from "@/components/site/home/HomeHero";
import {
  HOME_MOBILE_HOW_TO_Y,
  HomeHowToDesktop,
  HomeHowToMobile,
} from "@/components/site/home/HomeHowTo";
import { HomeReviewsDesktop, HomeReviewsMobile } from "@/components/site/home/HomeReviews";
import { HomeSupportDesktop, HomeSupportMobile } from "@/components/site/home/HomeSupport";
import { HomeTeacherDesktop, HomeTeacherMobile } from "@/components/site/home/HomeTeacher";
import { SiteFigCanvas, SITE_DESKTOP_CANVAS, SITE_MOBILE_CANVAS } from "@/components/site/home/SiteFigCanvas";

function HomeDesktopCanvas() {
  return (
    <div
      className="relative w-[1920px] overflow-hidden bg-white"
      style={{ height: SITE_DESKTOP_CANVAS.h }}
    >
      <div className="contents" data-eager-images>
        <HomeHeroDesktop />
        <HomeTeacherDesktop />
        <HomeHeaderDesktop />
      </div>
      <HomeDirectionsDesktop />
      <HomeCategoriesDesktop />
      <HomeCatalogRailDesktop />
      <HomeHowToDesktop />
      <HomeSupportDesktop />
      <HomeReviewsDesktop />
      <HomeFooterDesktop />
    </div>
  );
}

function HomeMobileCanvas({
  railShift,
  onRailShift,
}: {
  railShift: number;
  onRailShift: (shift: number) => void;
}) {
  return (
    <div
      className="relative w-[360px] overflow-hidden bg-white"
      style={{ height: SITE_MOBILE_CANVAS.h - railShift }}
    >
      <div className="contents" data-eager-images>
        <HomeHeroMobile />
        <HomeHeaderMobile />
      </div>
      <HomeTeacherMobile />
      <HomeDirectionsMobile />
      <HomeCategoriesMobile />
      <HomeCatalogRailMobile onRailShift={onRailShift} />
      <div
        className="absolute left-0 w-[360px] overflow-hidden transition-[top] duration-200 ease-out motion-reduce:transition-none"
        style={{
          top: HOME_MOBILE_HOW_TO_Y - railShift,
          height: SITE_MOBILE_CANVAS.h - HOME_MOBILE_HOW_TO_Y,
        }}
      >
        <div
          className="absolute left-0 w-[360px]"
          style={{
            top: -HOME_MOBILE_HOW_TO_Y,
            height: SITE_MOBILE_CANVAS.h,
          }}
        >
          <HomeHowToMobile />
          <HomeSupportMobile />
          <HomeReviewsMobile />
          <HomeFooterMobile />
        </div>
      </div>
    </div>
  );
}

export function HomeView() {
  const [mobileRailShift, setMobileRailShift] = useState(0);

  return (
    <SiteFigCanvas mobileHeight={SITE_MOBILE_CANVAS.h - mobileRailShift}>
      {(mode) =>
        mode === "mobile" ? (
          <HomeMobileCanvas
            railShift={mobileRailShift}
            onRailShift={setMobileRailShift}
          />
        ) : (
          <HomeDesktopCanvas />
        )
      }
    </SiteFigCanvas>
  );
}
