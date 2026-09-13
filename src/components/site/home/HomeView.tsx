import { HomeCatalogRail } from "@/components/site/home/HomeCatalogRail";
import { HomeCategories } from "@/components/site/home/HomeCategories";
import { HomeDirections } from "@/components/site/home/HomeDirections";
import { HomeHero } from "@/components/site/home/HomeHero";
import { HomeHowTo } from "@/components/site/home/HomeHowTo";
import { HomeReviews } from "@/components/site/home/HomeReviews";
import { HomeSupport } from "@/components/site/home/HomeSupport";
import { HomeTeacher } from "@/components/site/home/HomeTeacher";

export function HomeView() {
  return (
    <main className="flex-1 bg-white">
      <HomeHero />
      <HomeTeacher />
      <HomeDirections />
      <HomeCategories />
      <HomeCatalogRail />
      <HomeHowTo />
      <HomeSupport />
      <HomeReviews />
    </main>
  );
}
