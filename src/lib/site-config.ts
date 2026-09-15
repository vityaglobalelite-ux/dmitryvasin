/**
 * Public catalog identity (`/`). Club copy lives in club-config.ts.
 *
 * `output: "export"` bakes absolute OG/canonical URLs at build time.
 * Set NEXT_PUBLIC_APP_URL to the host of THIS deploy (betango.dance or
 * dmitryvasin.com), otherwise crawlers get the fallback origin.
 */

const FALLBACK_ORIGIN = "https://dmitryvasin.com";

function resolvePublicOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return FALLBACK_ORIGIN;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return FALLBACK_ORIGIN;
    }
    return url.origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

export const siteOrigin = resolvePublicOrigin();

export const absoluteUrl = (path = "") => {
  const normalized = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${siteOrigin}${normalized}`;
};

const catalogShareTitle = "Дмитрий Васин. СМОТРИ. ПОВТОРЯЙ. ТАНЦУЙ!";
const catalogShareDescription =
  "Аргентинское танго в лёгких и понятных видеоуроках, в своём темпе и в любое время, всегда в твоём смартфоне. СЛОЖНЫЕ ПРОЦЕССЫ В ТАНГО ПРОСТЫМ И ДОСТУПНЫМ ЯЗЫКОМ";

export const siteConfig = {
  name: "Дмитрий Васин",
  title: catalogShareTitle,
  ogTitle: catalogShareTitle,
  description: catalogShareDescription,
  url: siteOrigin,
  canonical: `${siteOrigin}/`,
  locale: "ru_RU",
  localeLang: "ru",
  publisher: "BeTango Global LLC",
  ogImage: {
    url: absoluteUrl("/assets/images/og-photo.png"),
    width: 1200,
    height: 630,
    alt: catalogShareTitle,
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

function shareImage(brand: BrandIdentity) {
  return {
    ...brand.ogImage,
    secureUrl: brand.ogImage.url.startsWith("https:")
      ? brand.ogImage.url
      : undefined,
  };
}

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
  images: [shareImage(brand)],
});

export const shareTwitter = (
  page: Omit<ShareCopy, "url">,
  brand: BrandIdentity = siteConfig,
) => ({
  card: "summary_large_image" as const,
  title: page.title,
  description: page.description,
  images: [shareImage(brand)],
});
