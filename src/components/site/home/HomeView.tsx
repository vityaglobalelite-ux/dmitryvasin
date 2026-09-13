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
import { SiteFigCanvas } from "@/components/site/home/SiteFigCanvas";

function HomeDesktopCanvas() {
  return (
    <div className="relative h-[8704px] w-[1920px] overflow-hidden bg-white">
      <HomeHeroDesktop />
      <HomeTeacherDesktop />
      <HomeDirectionsDesktop />
      <HomeCategoriesDesktop />
      <HomeCatalogRailDesktop />
      <HomeHowToDesktop />
      <HomeSupportDesktop />
      <HomeReviewsDesktop />
      <HomeFooterDesktop />
      <HomeHeaderDesktop />
    </div>
  );
}

function HomeMobileCanvas() {
  return (
    <div className="relative h-[10116px] w-[360px] overflow-hidden bg-white">
      <HomeHeroMobile />
      <HomeTeacherMobile />
      <HomeDirectionsMobile />
      <HomeCategoriesMobile />
      <HomeCatalogRailMobile />
      <HomeHowToMobile />
      <HomeSupportMobile />
      <HomeReviewsMobile />
      <HomeFooterMobile />
      <HomeHeaderMobile />
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
