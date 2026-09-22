import { catalogCardAssets } from "@/components/site/catalog/assets";
import { formatPriceMinor } from "@/lib/catalog/format";
import { catalogT } from "@/lib/catalog/i18n";
import { localizedSiteRoutes } from "@/lib/catalog/locale";
import { isSkillKey, type SkillKey } from "@/lib/catalog/skills";
import type { Currency, Locale, Product, ProductType } from "@/lib/catalog/types";

export const PRODUCT_TYPES: readonly ProductType[] = [
  "lifehack",
  "lesson",
  "course",
  "extra",
  "research",
  "peek",
] as const;

/** Chips on `/catalog/`. extra / research stay in PRODUCT_TYPES for parse/typecheck. */
export const CATALOG_FILTERS: readonly ProductType[] = [
  "lifehack",
  "lesson",
  "course",
  "peek",
] as const;

export const TYPE_BADGE_LABEL: Record<ProductType, string> = {
  ...catalogT().catalog.types,
};

const SKILL_ICONS: Record<SkillKey, string> = {
  awareness: catalogCardAssets.skillAwareness,
  technique: catalogCardAssets.skillTechnique,
  variability: catalogCardAssets.skillVariability,
  interaction: catalogCardAssets.skillInteraction,
  musicality: catalogCardAssets.skillMusicality,
};

const SKILL_ICON_SIZE: Record<SkillKey, { width: number; height: number }> = {
  awareness: { width: 20, height: 20 },
  technique: { width: 20, height: 20 },
  variability: { width: 24, height: 24 },
  interaction: { width: 20, height: 20 },
  musicality: { width: 19.7747, height: 16.6667 },
};

const RU_MONTH_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

const EN_MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function catalogTypeLabel(type: ProductType, locale: Locale = "ru"): string {
  return catalogT(locale).catalog.types[type];
}

export function catalogFilterLabel(
  type: ProductType,
  locale: Locale = "ru",
): string {
  return catalogT(locale).catalog.filters[type];
}

const TYPE_ICON: Partial<Record<ProductType, string>> = {
  lifehack: catalogCardAssets.typeLifehack,
  lesson: catalogCardAssets.typeLesson,
  course: catalogCardAssets.typeCourse,
  research: catalogCardAssets.typeResearch,
  peek: catalogCardAssets.typePeek,
};

export function parseProductType(value: string | null): ProductType | undefined {
  if (!value) return undefined;
  return PRODUCT_TYPES.includes(value as ProductType)
    ? (value as ProductType)
    : undefined;
}

export function catalogFilterHref(
  type?: ProductType,
  locale: Locale = "ru",
): string {
  const catalog = localizedSiteRoutes(locale).catalog;
  if (!type) return catalog;
  return `${catalog}?type=${type}`;
}

export function typeBadgeIcon(type: ProductType): string | undefined {
  return TYPE_ICON[type];
}

function monthNoun(months: number, locale: Locale): string {
  if (locale === "en") return months === 1 ? "month" : "months";
  const mod10 = months % 10;
  const mod100 = months % 100;
  if (mod10 === 1 && mod100 !== 11) return "месяц";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "месяца";
  return "месяцев";
}

export function formatAccessLabel(
  accessDays: number,
  _variant: "overlay" | "chip",
  locale: Locale = "ru",
): string | null {
  if (accessDays <= 0) return null;
  const t = catalogT(locale);
  const months = accessDays / 30;
  if (Number.isInteger(months) && months >= 1) {
    return `${t.product.access}: ${months} ${monthNoun(months, locale)}`;
  }
  return `${t.product.access}: ${accessDays} ${t.product.dayShort}`;
}

/** Figma overlay clock, e.g. `20:21 мин`. */
export function formatDurationClock(
  durationSec: number,
  locale: Locale = "ru",
): string | null {
  if (durationSec <= 0) return null;
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")} ${catalogT(locale).product.durationMin}`;
}

export function lessonNoun(count: number, locale: Locale = "ru"): string {
  if (locale === "en") return count === 1 ? "lesson" : "lessons";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "урок";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "урока";
  return "уроков";
}

export function formatCatalogPrice(minor: number, currency: Currency): string {
  return formatPriceMinor(minor, currency);
}

export function parseDifficulty(level: string): 1 | 2 | 3 | 4 {
  const numeric = Number.parseInt(level.replace(/[^\d]/g, ""), 10);
  if (numeric >= 1 && numeric <= 4) return numeric as 1 | 2 | 3 | 4;
  return 1;
}

export function skillIconSrc(skill: string): string | undefined {
  return isSkillKey(skill) ? SKILL_ICONS[skill] : undefined;
}

export function skillIconSize(skill: SkillKey): { width: number; height: number } {
  return SKILL_ICON_SIZE[skill];
}

/** Native RUB 0 = unset. Do not show a converted €/$. */
export function isCatalogPriceUnset(product: Pick<Product, "priceMinor">): boolean {
  return product.priceMinor <= 0;
}

/** Course cards play the showcase clips. Product heroes keep cover stills. */
export function stageFrames(
  product: Pick<Product, "type" | "coverUrl" | "coverUrls" | "previewClipUrls">,
): string[] {
  if (product.type === "course" && product.previewClipUrls.length > 0) {
    return product.previewClipUrls;
  }
  return coverFrames(product);
}

export function coverFrames(product: Pick<Product, "coverUrl" | "coverUrls">): string[] {
  if (product.coverUrls.length > 0) return product.coverUrls;
  if (product.coverUrl) return [product.coverUrl];
  return [];
}

/** Figma lock line: `21 сентября` / `21 September`. */
export function formatPeekUnlockDate(
  availableAt: string,
  locale: Locale = "ru",
): string | null {
  const date = new Date(availableAt);
  if (Number.isNaN(date.getTime())) return null;
  const day = date.getDate();
  const month = date.getMonth();
  if (locale === "en") return `${day} ${EN_MONTH[month]}`;
  return `${day} ${RU_MONTH_GENITIVE[month]}`;
}
