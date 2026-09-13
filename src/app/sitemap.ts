import type { MetadataRoute } from "next";
import { catalogSitemapEntries } from "@/lib/catalog/seo";
import { listPublishedProducts } from "@/lib/catalog/repo/products";
import { CATALOG_STATIC_PARAM_STUB } from "@/lib/catalog/static-params";
import { clubConfig } from "@/lib/club-config";
import { legalNav } from "@/lib/legal-docs";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const club: MetadataRoute.Sitemap[number] = {
    url: clubConfig.canonical,
    changeFrequency: "weekly",
    priority: 1,
  };

  const legal = legalNav.map((item) => ({
    url: new URL(item.href.replace(/^\//, ""), siteConfig.canonical).href,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  let productIds: string[] = [];
  try {
    const products = await listPublishedProducts();
    productIds = products
      .map((product) => product.id)
      .filter((id) => id && id !== CATALOG_STATIC_PARAM_STUB);
  } catch {
    productIds = [];
  }

  return [club, ...legal, ...catalogSitemapEntries(productIds)];
}
