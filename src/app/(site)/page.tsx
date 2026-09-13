import type { Metadata } from "next";
import { HomeView } from "@/components/site/home/HomeView";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("ru");

export const metadata: Metadata = publicPageMetadata({
  locale: "ru",
  path: "/",
  title: copy.seo.siteTitle,
  description: copy.seo.siteDescription,
});

export default function Home() {
  return <HomeView />;
}
