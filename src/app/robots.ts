import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/en/account/"],
    },
    sitemap: new URL("sitemap.xml", siteConfig.canonical).href,
    host: siteConfig.canonical,
  };
}
