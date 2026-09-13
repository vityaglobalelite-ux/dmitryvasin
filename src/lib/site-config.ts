/**
 * Public site identity for dmitryvasin.com (`/`).
 * Club copy lives in club-config.ts.
 */

export const siteOrigin = "https://dmitryvasin.com";

export const absoluteUrl = (path = "") => {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${siteOrigin}${normalized}`;
};

export const siteConfig = {
  name: "Дмитрий Васин",
  title: "Дмитрий Васин",
  ogTitle: "Дмитрий Васин",
  description: "Официальный сайт Дмитрия Васина.",
  url: siteOrigin,
  canonical: `${siteOrigin}/`,
  locale: "ru_RU",
  localeLang: "ru",
  publisher: "BeTango Global LLC",
  ogImage: {
    url: absoluteUrl("/assets/images/og-share.png"),
    width: 1200,
    height: 630,
    alt: "Дмитрий Васин",
    type: "image/png",
  },
} as const;

export type BrandIdentity = {
  name: string;
  locale: string;
  ogImage: {
    readonly url: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
    readonly type: string;
  };
};

type ShareCopy = {
  title: string;
  description: string;
  url: string;
};

export const shareOpenGraph = (
  page: ShareCopy,
  brand: BrandIdentity = siteConfig,
) => ({
  title: page.title,
  description: page.description,
  url: page.url,
  siteName: brand.name,
  locale: brand.locale,
  type: "website" as const,
  images: [brand.ogImage],
});

export const shareTwitter = (
  page: Omit<ShareCopy, "url">,
  brand: BrandIdentity = siteConfig,
) => ({
  card: "summary_large_image" as const,
  title: page.title,
  description: page.description,
  images: [brand.ogImage],
});
