import type { Metadata } from "next";
import { CatalogListing } from "@/components/site/catalog/CatalogListing";
import { catalogT } from "@/lib/catalog/i18n";
import { publicPageMetadata } from "@/lib/catalog/seo";

const copy = catalogT("en");

export const metadata: Metadata = publicPageMetadata({
  locale: "en",
  path: "/catalog/",
  title: copy.pages.catalog,
});

export default function EnCatalogPage() {
  return <CatalogListing />;
}
