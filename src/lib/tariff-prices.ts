"use client";

import { useEffect, useState } from "react";
import { tariffs as fallbackTariffs } from "@/lib/landing-data";

export type DisplayCurrency = "rub" | "usd" | "eur";

export type TariffKey = "trial" | "full" | "vip";

export type DisplayPrice = {
  price: string;
  oldPrice: string | null;
};

const LANDING_TARIFFS: TariffKey[] = ["trial", "full", "vip"];

/** CIS / post-Soviet → RUB */
const CIS = new Set([
  "RU",
  "BY",
  "KZ",
  "AM",
  "AZ",
  "KG",
  "MD",
  "TJ",
  "UZ",
  "TM",
  "GE",
]);

/** Europe → EUR */
const EUROPE = new Set([
  "AL",
  "AD",
  "AT",
  "BA",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "XK",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "MC",
  "ME",
  "NL",
  "MK",
  "NO",
  "PL",
  "PT",
  "RO",
  "SM",
  "RS",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "UA",
  "GB",
  "VA",
]);

/** Americas → USD */
const AMERICAS = new Set([
  "US",
  "CA",
  "MX",
  "BR",
  "AR",
  "CL",
  "CO",
  "PE",
  "UY",
  "PY",
  "BO",
  "EC",
  "VE",
  "CR",
  "PA",
  "GT",
  "HN",
  "SV",
  "NI",
  "DO",
  "CU",
  "PR",
  "JM",
  "TT",
]);

type PriceRow = {
  tariff: string;
  price_rub: number | string;
  price_usd: number | string;
  price_eur: number | string;
  price_rub_was: number | string | null;
  price_usd_was: number | string | null;
  price_eur_was: number | string | null;
  active: boolean;
};

function toNum(v: number | string | null | undefined): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

export function currencyForCountry(code: string | null | undefined): DisplayCurrency {
  const c = (code || "").toUpperCase();
  if (!c) return "rub";
  if (CIS.has(c)) return "rub";
  if (EUROPE.has(c)) return "eur";
  if (AMERICAS.has(c)) return "usd";
  return "rub";
}

export function formatMoney(amount: number, currency: DisplayCurrency): string {
  if (currency === "rub") {
    const rounded = Math.round(amount);
    return `${rounded.toLocaleString("ru-RU").replace(/\u00a0/g, " ")} ₽`;
  }
  if (currency === "usd") {
    const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
    return `$${n}`;
  }
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `€${n}`;
}

function pickAmount(
  row: PriceRow,
  currency: DisplayCurrency,
  which: "price" | "was",
): number | null {
  if (which === "was") {
    if (currency === "usd") return toNum(row.price_usd_was);
    if (currency === "eur") return toNum(row.price_eur_was);
    return toNum(row.price_rub_was);
  }
  if (currency === "usd") return toNum(row.price_usd);
  if (currency === "eur") return toNum(row.price_eur);
  return toNum(row.price_rub);
}

function fallbackMap(): Record<TariffKey, DisplayPrice> {
  const out = {} as Record<TariffKey, DisplayPrice>;
  LANDING_TARIFFS.forEach((key, i) => {
    const t = fallbackTariffs[i];
    out[key] = {
      price: t?.price ?? "1 000 ₽",
      oldPrice: t?.oldPrice ?? null,
    };
  });
  return out;
}

async function detectCountryCode(): Promise<string | null> {
  try {
    const res = await fetch("https://api.country.is/", {
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { country?: string };
    return data.country?.toUpperCase() || null;
  } catch {
    return null;
  }
}

async function fetchPriceRows(): Promise<PriceRow[] | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return null;

  const url =
    `${base}/rest/v1/tariff_prices` +
    `?select=tariff,price_rub,price_usd,price_eur,price_rub_was,price_usd_was,price_eur_was,active` +
    `&active=eq.true` +
    `&tariff=in.(${LANDING_TARIFFS.join(",")})`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    return (await res.json()) as PriceRow[];
  } catch {
    return null;
  }
}

function buildDisplay(
  rows: PriceRow[] | null,
  currency: DisplayCurrency,
): Record<TariffKey, DisplayPrice> {
  const fallback = fallbackMap();
  if (!rows?.length) return fallback;

  const byTariff = new Map(rows.map((r) => [r.tariff, r]));
  const out = { ...fallback };

  for (const key of LANDING_TARIFFS) {
    const row = byTariff.get(key);
    if (!row) continue;
    const price = pickAmount(row, currency, "price");
    if (price == null || price <= 0) continue;
    const was = pickAmount(row, currency, "was");
    out[key] = {
      price: formatMoney(price, currency),
      oldPrice:
        was != null && was > price ? formatMoney(was, currency) : null,
    };
  }
  return out;
}

/** Prices for landing cards: DB + geo currency, RUB fallback. */
export function useLandingTariffPrices(): {
  prices: Record<TariffKey, DisplayPrice>;
  currency: DisplayCurrency;
  ready: boolean;
} {
  const [currency, setCurrency] = useState<DisplayCurrency>("rub");
  const [prices, setPrices] = useState<Record<TariffKey, DisplayPrice>>(fallbackMap);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [country, rows] = await Promise.all([
        detectCountryCode(),
        fetchPriceRows(),
      ]);
      if (cancelled) return;
      const cur = currencyForCountry(country);
      setCurrency(cur);
      setPrices(buildDisplay(rows, cur));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { prices, currency, ready };
}

export function tariffKeyForIndex(index: number): TariffKey {
  return LANDING_TARIFFS[index] ?? "trial";
}
