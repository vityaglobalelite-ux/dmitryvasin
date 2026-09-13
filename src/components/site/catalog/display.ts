import { formatPriceMinor } from "@/lib/catalog/format";
import { catalogT } from "@/lib/catalog/i18n";
import { localizedSiteRoutes } from "@/lib/catalog/locale";
import type { Currency, Locale, ProductType } from "@/lib/catalog/types";
import { catalogCardAssets } from "@/components/site/catalog/assets";

export const PRODUCT_TYPES: readonly ProductType[] = [
  "lifehack",
  "lesson",
  "course",
  "extra",
  "research",
  "peek",
] as const;

export const BASE_FILTERS: { type: ProductType; label: string }[] = [
  { type: "lifehack", label: catalogT().catalog.filters.lifehack },
  { type: "lesson", label: catalogT().catalog.filters.lesson },
  { type: "course", label: catalogT().catalog.filters.course },
  { type: "extra", label: catalogT().catalog.filters.extra },
];

export const OPTIONAL_FILTERS: { type: ProductType; label: string }[] = [
  { type: "research", label: catalogT().catalog.filters.research },
  { type: "peek", label: catalogT().catalog.filters.peek },
];

export const TYPE_BADGE_LABEL: Record<ProductType, string> = {
  ...catalogT().catalog.types,
};

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

export function formatAccessLabel(
  accessDays: number,
  variant: "overlay" | "chip",
  locale: Locale = "ru",
): string | null {
  if (accessDays <= 0) return null;
  const t = catalogT(locale);
  const months = accessDays / 30;
  if (Number.isInteger(months) && months >= 1) {
    if (variant === "overlay") return `${t.product.access}: ${months} ${t.product.monthShort}`;
    if (locale === "en") {
      const noun = months === 1 ? "month" : "months";
      return `${t.product.access}: ${months} ${noun}`;
    }
    const noun =
      months % 10 === 1 && months % 100 !== 11
        ? "месяц"
        : months % 10 >= 2 &&
            months % 10 <= 4 &&
            (months % 100 < 10 || months % 100 >= 20)
          ? "месяца"
          : "месяцев";
    return `Доступ: ${months} ${noun}`;
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
  const raw = formatPriceMinor(minor, currency);
  return raw.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1 ");
}

export function parseDifficulty(level: string): 1 | 2 | 3 | 4 {
  const numeric = Number.parseInt(level.replace(/[^\d]/g, ""), 10);
  if (numeric >= 1 && numeric <= 4) return numeric as 1 | 2 | 3 | 4;
  return 1;
}

export function skillIconSrc(skill: string): string | undefined {
  const value = skill.trim().toLowerCase();
  if (value.includes("осознав")) return catalogCardAssets.skillBrain;
  if (value.includes("техник")) return catalogCardAssets.skillFootprint;
  return undefined;
}
