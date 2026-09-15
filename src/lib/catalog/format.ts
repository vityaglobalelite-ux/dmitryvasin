import type { Currency, Locale } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/geo-currency";

export function formatPriceMinor(
  minor: number,
  currency: Currency,
  _locale: Locale = "ru",
): string {
  const major = minor / 100;
  const formatted = formatMoney(major, currency);
  return formatted.replace(/ /g, "\u00A0");
}

export function formatDuration(durationSec: number, locale: Locale = "ru"): string {
  const totalMin = Math.max(0, Math.round(durationSec / 60));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (locale === "en") {
    if (hours <= 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} h`;
    return `${hours} h ${minutes} min`;
  }
  if (hours <= 0) return `${minutes} мин`;
  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}
