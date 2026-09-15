import { accountT } from "@/components/site/account/copy";
import type { Access, Locale } from "@/lib/catalog/types";

export type RemainingAccess = {
  expired: boolean;
  /** 0…1 share of access period still left */
  ratio: number;
  label: string;
  totalDays: number;
};

type Rgb = readonly [number, number, number];

/** Depleted → mid → healthy. Jade, not neon lime; red = brand accent. */
const METER_STOPS: ReadonlyArray<{ t: number; rgb: Rgb }> = [
  { t: 0, rgb: [0xdb, 0x0c, 0x25] },
  { t: 0.35, rgb: [0xd4, 0x8a, 0x1a] },
  { t: 0.7, rgb: [0x3d, 0xa8, 0x6a] },
  { t: 1, rgb: [0x1a, 0x8f, 0x5c] },
];

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  const u = clamp01(t);
  return [
    Math.round(a[0] + (b[0] - a[0]) * u),
    Math.round(a[1] + (b[1] - a[1]) * u),
    Math.round(a[2] + (b[2] - a[2]) * u),
  ] as const;
}

function rgbToHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function meterRgb(ratio: number): Rgb {
  const t = clamp01(ratio);
  let i = 0;
  while (i < METER_STOPS.length - 2 && t > METER_STOPS[i + 1].t) i += 1;
  const a = METER_STOPS[i];
  const b = METER_STOPS[i + 1];
  const local = (t - a.t) / (b.t - a.t || 1);
  return mixRgb(a.rgb, b.rgb, local);
}

/** Soft axial fill for the access meter (green → red by remaining ratio). */
export function remainingMeterBackground(ratio: number): string {
  const base = meterRgb(ratio);
  const tip = mixRgb(base, [255, 255, 255], 0.14);
  return `linear-gradient(90deg, ${rgbToHex(base)} 0%, ${rgbToHex(tip)} 100%)`;
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
      ratio: 0,
      label: copy.expired,
      totalDays,
    };
  }

  const msLeft = expires - now.getTime();
  const hoursLeft = Math.max(1, Math.ceil(msLeft / 3_600_000));
  const daysLeft = Math.max(1, Math.ceil(msLeft / 86_400_000));
  const ratio = clamp01(daysLeft / totalDays);

  const dayUnit = plural(totalDays, copy.dayOne, copy.dayFew, copy.dayMany);

  if (hoursLeft < 24) {
    return {
      expired: false,
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
    ratio,
    label: copy.remainingDays
      .replace("{left}", String(daysLeft))
      .replace("{total}", String(totalDays))
      .replace("{unit}", dayUnit),
    totalDays,
  };
}
