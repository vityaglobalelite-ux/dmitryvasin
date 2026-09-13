import type { Metadata } from "next";
import dmcaBlocks from "@/content/legal/dmca.json";
import privacyBlocks from "@/content/legal/privacy.json";
import termsBlocks from "@/content/legal/terms.json";
import { clubConfig, clubPath } from "@/lib/club-config";
import { shareOpenGraph, shareTwitter } from "@/lib/site-config";

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
  { href: clubPath("privacy-policy"), label: "Политика конфиденциальности" },
  { href: clubPath("subscription-agreement"), label: "Договор оферты" },
  { href: clubPath("dmca-page"), label: "Политика DMCA" },
  { href: clubPath("terms-and-conditions"), label: "Terms and Conditions" },
] as const;

export function legalMetadata(doc: LegalDocMeta): Metadata {
  const title = `${doc.titleRu} — ${clubConfig.name}`;
  const canonical = clubPath(doc.slug);
  return {
    title,
    description: doc.description,
    alternates: { canonical },
    openGraph: shareOpenGraph(
      {
        title,
        description: doc.description,
        url: canonical,
      },
      clubConfig,
    ),
    twitter: shareTwitter(
      {
        title,
        description: doc.description,
      },
      clubConfig,
    ),
  };
}
