import { accountT } from "@/components/site/account/copy";
import type { Access, Locale } from "@/lib/catalog/types";

export type AccessTone = "green" | "yellow" | "red" | "expired";

export type RemainingAccess = {
  expired: boolean;
  tone: AccessTone;
  ratio: number;
  label: string;
  totalDays: number;
};

const TONE_CLASS: Record<AccessTone, string> = {
  green: "bg-[#80ff00]",
  yellow: "bg-[#ffd400]",
  red: "bg-[red]",
  expired: "bg-transparent",
};

export function remainingToneClass(tone: AccessTone): string {
  return TONE_CLASS[tone];
}

function plural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (d === 1) return one;
  if (d >= 2 && d <= 4) return few;
  return many;
}

export function totalAccessDays(access: Access): number {
  const fromProduct = access.product?.accessDays;
  if (fromProduct && fromProduct > 0) return fromProduct;
  const purchased = new Date(access.purchasedAt).getTime();
  const expires = new Date(access.expiresAt).getTime();
  if (Number.isNaN(purchased) || Number.isNaN(expires) || expires <= purchased) {
    return 1;
  }
  return Math.max(1, Math.round((expires - purchased) / 86_400_000));
}

export function remainingAccess(
  access: Access,
  now: Date = new Date(),
  locale: Locale = "ru",
): RemainingAccess {
  const copy = accountT(locale);
  const totalDays = totalAccessDays(access);
  const expires = new Date(access.expiresAt).getTime();
  if (Number.isNaN(expires) || expires <= now.getTime()) {
    return {
      expired: true,
      tone: "expired",
      ratio: 0,
      label: copy.expired,
      totalDays,
    };
  }

  const msLeft = expires - now.getTime();
  const hoursLeft = Math.max(1, Math.ceil(msLeft / 3_600_000));
  const daysLeft = Math.max(1, Math.ceil(msLeft / 86_400_000));
  const ratio = Math.min(1, Math.max(0, daysLeft / totalDays));
  const tone: AccessTone = ratio >= 0.7 ? "green" : ratio >= 0.3 ? "yellow" : "red";

  const dayUnit = plural(totalDays, copy.dayOne, copy.dayFew, copy.dayMany);

  if (hoursLeft < 24) {
    return {
      expired: false,
      tone,
      ratio,
      label: copy.remainingHours
        .replace("{hours}", String(hoursLeft))
        .replace("{unit}", plural(hoursLeft, copy.hourOne, copy.hourFew, copy.hourMany))
        .replace("{total}", String(totalDays))
        .replace("{dayUnit}", dayUnit),
      totalDays,
    };
  }

  return {
    expired: false,
    tone,
    ratio,
    label: copy.remainingDays
      .replace("{left}", String(daysLeft))
      .replace("{total}", String(totalDays))
      .replace("{unit}", dayUnit),
    totalDays,
  };
}
