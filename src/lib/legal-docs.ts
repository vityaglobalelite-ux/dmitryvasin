export type LegalBlock = { type: "h2" | "p"; text: string };

export type LegalDocMeta = {
  slug: string;
  /** Russian title shown on page (from product) */
  titleRu: string;
  /** English subtitle from source document */
  titleEn?: string;
  description: string;
  blocks: LegalBlock[];
};

import dmcaBlocks from "@/content/legal/dmca.json";
import privacyBlocks from "@/content/legal/privacy.json";
import termsBlocks from "@/content/legal/terms.json";

const blocks = {
  dmca: dmcaBlocks as LegalBlock[],
  privacy: privacyBlocks as LegalBlock[],
  terms: termsBlocks as LegalBlock[],
};

export const legalDocs: Record<string, LegalDocMeta> = {
  "dmca-page": {
    slug: "dmca-page",
    titleRu: "Политика DMCA (Сообщение о случаях нарушения авторских прав)",
    titleEn: "DMCA Policy",
    description:
      "Политика DMCA BeTango Global LLC — сообщение о случаях нарушения авторских прав.",
    blocks: blocks.dmca,
  },
  "privacy-policy": {
    slug: "privacy-policy",
    titleRu: "Политика конфиденциальности",
    titleEn: "Privacy Policy",
    description:
      "Политика конфиденциальности BeTango Global LLC / dmitryvasin.com.",
    blocks: blocks.privacy,
  },
  "terms-and-conditions": {
    slug: "terms-and-conditions",
    titleRu: "Договор оферты",
    titleEn: "Terms and Conditions — Closed Telegram Club",
    description:
      "Договор оферты / Terms and Conditions закрытого Telegram-клуба BeTango.",
    blocks: blocks.terms,
  },
  "subscription-agreement": {
    slug: "subscription-agreement",
    titleRu: "Договор оферты",
    titleEn: "Subscription Agreement — Closed Telegram Club",
    description:
      "Договор оферты на доступ к закрытому Telegram-клубу BeTango.",
    blocks: blocks.terms,
  },
};

export const legalNav = [
  { href: "/privacy-policy/", label: "Политика конфиденциальности" },
  { href: "/subscription-agreement/", label: "Договор оферты" },
  {
    href: "/dmca-page/",
    label: "Политика DMCA",
  },
  { href: "/terms-and-conditions/", label: "Terms and Conditions" },
] as const;
