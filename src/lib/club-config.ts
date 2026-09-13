/**
 * Closed club identity for dmitryvasin.com/privateclub.
 * Copy matches the live hero.
 */

import { absoluteUrl } from "@/lib/site-config";

export const CLUB_PATH = "/privateclub";

export const clubPath = (slug = "") => {
  const normalized = slug.replace(/^\/+|\/+$/g, "");
  return normalized ? `${CLUB_PATH}/${normalized}/` : `${CLUB_PATH}/`;
};

export const clubConfig = {
  name: "Дмитрий Васин",
  /** Browser tab */
  title: "90 дней исследования танго — Дмитрий Васин",
  /** og:title / twitter:title — siteName is sent separately */
  ogTitle: "90 дней исследования танго",
  description:
    "Готовы по-новому прочувствовать и понять свой танец? Приглашаю вас провести следующие 3 месяца вместе со мной.",
  url: absoluteUrl(CLUB_PATH),
  canonical: absoluteUrl(clubPath()),
  locale: "ru_RU",
  localeLang: "ru",
  publisher: "BeTango Global LLC",
  ogImage: {
    url: absoluteUrl("/assets/images/og-share.png"),
    width: 1200,
    height: 630,
    alt: "90 дней исследования танго — Дмитрий Васин",
    type: "image/png",
  },
} as const;
