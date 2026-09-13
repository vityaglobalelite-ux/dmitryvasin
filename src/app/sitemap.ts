import type { MetadataRoute } from "next";
import { clubConfig } from "@/lib/club-config";
import { legalNav } from "@/lib/legal-docs";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return [club, ...legal];
}
