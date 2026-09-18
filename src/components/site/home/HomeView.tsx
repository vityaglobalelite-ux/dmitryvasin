"use client";

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
import { HomeHowToDesktop, HomeHowToMobile } from "@/components/site/home/HomeHowTo";
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

function HomeMobileCanvas() {
  return (
    <div
      className="relative w-[360px] overflow-hidden bg-white"
      style={{ height: SITE_MOBILE_CANVAS.h }}
    >
      <div className="contents" data-eager-images>
        <HomeHeroMobile />
        <HomeHeaderMobile />
      </div>
      <HomeTeacherMobile />
      <HomeDirectionsMobile />
      <HomeCategoriesMobile />
      <HomeCatalogRailMobile />
      <HomeHowToMobile />
      <HomeSupportMobile />
      <HomeReviewsMobile />
      <HomeFooterMobile />
    </div>
  );
}

export function HomeView() {
  return (
    <SiteFigCanvas>
      {(mode) => (mode === "mobile" ? <HomeMobileCanvas /> : <HomeDesktopCanvas />)}
    </SiteFigCanvas>
  );
}
