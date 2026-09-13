import type { Metadata, MetadataRoute } from "next";
import { catalogT } from "@/lib/catalog/i18n";
import { withLocalePrefix } from "@/lib/catalog/locale";
import { siteRoutes } from "@/lib/catalog/routes";
import {
  absoluteUrl,
  shareOpenGraph,
  shareTwitter,
} from "@/lib/site-config";
import type { Locale } from "@/lib/catalog/types";

export function publicPageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
}): Metadata {
  const t = catalogT(locale);
  const pageTitle = title ?? t.seo.siteTitle;
  const pageDescription = description ?? t.seo.siteDescription;
  const localized = withLocalePrefix(path, locale);
  const ru = withLocalePrefix(path, "ru");
  const en = withLocalePrefix(path, "en");
  const canonical = absoluteUrl(localized);

  return {
    title: pageTitle,
    description: pageDescription,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        ru: absoluteUrl(ru),
        en: absoluteUrl(en),
        "x-default": absoluteUrl(ru),
      },
    },
    openGraph: {
      ...shareOpenGraph({
        title: pageTitle,
        description: pageDescription,
        url: canonical,
      }),
      locale: locale === "en" ? "en_US" : "ru_RU",
    },
    twitter: shareTwitter({
      title: pageTitle,
      description: pageDescription,
    }),
  };
}

export function accountPageMetadata({
  locale,
  title,
}: {
  locale: Locale;
  title: string;
}): Metadata {
  const t = catalogT(locale);
  return {
    title,
    description: t.seo.siteDescription,
    robots: { index: false, follow: false },
  };
}

function hreflangLanguages(path: string) {
  const ru = absoluteUrl(withLocalePrefix(path, "ru"));
  const en = absoluteUrl(withLocalePrefix(path, "en"));
  return { ru, en, "x-default": ru };
}

/** Public catalog URLs for sitemap.xml. Account routes stay out (noindex). */
export function catalogSitemapEntries(productIds: string[]): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: siteRoutes.home, priority: 1 },
    { path: siteRoutes.catalog, priority: 0.9 },
    { path: siteRoutes.login, priority: 0.4 },
    { path: siteRoutes.signup, priority: 0.4 },
    { path: siteRoutes.forgotPassword, priority: 0.3 },
    ...productIds.map((id) => ({
      path: siteRoutes.product(id),
      priority: 0.7,
    })),
  ];

  const entries: MetadataRoute.Sitemap = [];
  for (const { path, priority } of pages) {
    const languages = hreflangLanguages(path);
    entries.push({
      url: languages.ru,
      changeFrequency: "weekly",
      priority,
      alternates: { languages },
    });
    entries.push({
      url: languages.en,
      changeFrequency: "weekly",
      priority,
      alternates: { languages },
    });
  }
  return entries;
}
