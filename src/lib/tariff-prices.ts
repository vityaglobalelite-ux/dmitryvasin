"use client";

import { useEffect, useState } from "react";
import { useCountdownTail } from "@/lib/countdown-tail";
import { STAGE3_PRICES } from "@/lib/tariff-stage3";

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

function statusMap(label: string): Record<TariffKey, DisplayPrice> {
  return Object.fromEntries(
    LANDING_TARIFFS.map((key) => [key, { price: label, oldPrice: null }]),
  ) as Record<TariffKey, DisplayPrice>;
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
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_DATA_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return null;

  const url =
    `${base}/rest/v1/tariff_prices` +
    `?select=tariff,price_rub,price_usd,price_eur,price_rub_was,price_usd_was,price_eur_was,active` +
    `&active=eq.true` +
    `&tariff=in.(${LANDING_TARIFFS.join(",")})`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return (await res.json()) as PriceRow[];
      if (res.status < 500) return null;
    } catch {
      // Retry transient edge/origin failures below.
    }

    if (attempt < 2) {
      await new Promise((resolve) => window.setTimeout(resolve, 300 * (attempt + 1)));
    }
  }

  return null;
}

function stage3Display(
  currency: DisplayCurrency,
): Record<TariffKey, DisplayPrice> {
  return Object.fromEntries(
    LANDING_TARIFFS.map((key) => [
      key,
      {
        price: formatMoney(STAGE3_PRICES[key][currency], currency),
        oldPrice: null,
      },
    ]),
  ) as Record<TariffKey, DisplayPrice>;
}

function buildDisplay(
  rows: PriceRow[] | null,
  currency: DisplayCurrency,
): Record<TariffKey, DisplayPrice> | null {
  if (!rows?.length) return null;

  const byTariff = new Map(rows.map((r) => [r.tariff, r]));
  const out = {} as Record<TariffKey, DisplayPrice>;

  for (const key of LANDING_TARIFFS) {
    const row = byTariff.get(key);
    if (!row) return null;
    const price = pickAmount(row, currency, "price");
    if (price == null || price <= 0) return null;
    const was = pickAmount(row, currency, "was");
    out[key] = {
      price: formatMoney(price, currency),
      oldPrice:
        was != null && was > price ? formatMoney(was, currency) : null,
    };
  }
  return out;
}

/** Prices for landing cards: live DB values + geo currency, never hardcoded money. */
export function useLandingTariffPrices(): {
  prices: Record<TariffKey, DisplayPrice>;
  currency: DisplayCurrency;
  ready: boolean;
  error: boolean;
} {
  const { closed } = useCountdownTail();
  const [currency, setCurrency] = useState<DisplayCurrency>("rub");
  const [prices, setPrices] = useState<Record<TariffKey, DisplayPrice>>(() =>
    statusMap("Загрузка…"),
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [country, rows] = await Promise.all([
        detectCountryCode(),
        closed ? Promise.resolve(null) : fetchPriceRows(),
      ]);
      if (cancelled) return;
      const cur = currencyForCountry(country);
      const display = closed ? stage3Display(cur) : buildDisplay(rows, cur);
      setCurrency(cur);
      setPrices(display ?? statusMap("Цена недоступна"));
      setError(!closed && !display);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [closed]);

  return { prices, currency, ready, error };
}

export function tariffKeyForIndex(index: number): TariffKey {
  return LANDING_TARIFFS[index] ?? "trial";
}
