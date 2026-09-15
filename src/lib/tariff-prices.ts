"use client";

import { useEffect, useState } from "react";
import { useCountdownTail } from "@/lib/countdown-tail";
import {
  currencyForCountry,
  detectCountryCode,
  formatMoney,
  type GeoCurrency,
} from "@/lib/geo-currency";
import { ADDON_PRICES, STAGE3_PRICES } from "@/lib/tariff-stage3";

export type DisplayCurrency = GeoCurrency;
export { currencyForCountry, formatMoney };

export type TariffKey = "trial" | "full" | "vip";
export type AddonKey = "month1" | "month2_3";

export type DisplayPrice = {
  price: string;
  oldPrice: string | null;
};

const LANDING_TARIFFS: TariffKey[] = ["trial", "full", "vip"];
const LANDING_ADDONS: AddonKey[] = ["month1", "month2_3"];
const LANDING_PRICE_KEYS = [...LANDING_TARIFFS, ...LANDING_ADDONS] as const;

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
    `&price_list=eq.current` +
    `&tariff=in.(${LANDING_PRICE_KEYS.join(",")})`;

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

function amountsToDisplay(
  price: number,
  was: number | null | undefined,
  currency: DisplayCurrency,
): DisplayPrice {
  return {
    price: formatMoney(price, currency),
    oldPrice:
      was != null && was > price ? formatMoney(was, currency) : null,
  };
}

function rowToDisplay(
  row: PriceRow,
  currency: DisplayCurrency,
): DisplayPrice | null {
  const price = pickAmount(row, currency, "price");
  if (price == null || price <= 0) return null;
  return amountsToDisplay(price, pickAmount(row, currency, "was"), currency);
}

function stage3Display(
  currency: DisplayCurrency,
): Record<TariffKey, DisplayPrice> {
  return Object.fromEntries(
    LANDING_TARIFFS.map((key) => [
      key,
      amountsToDisplay(STAGE3_PRICES[key][currency], null, currency),
    ]),
  ) as Record<TariffKey, DisplayPrice>;
}

function addonFallbackDisplay(
  currency: DisplayCurrency,
): Record<AddonKey, DisplayPrice> {
  return {
    month1: amountsToDisplay(ADDON_PRICES.month1[currency], null, currency),
    month2_3: amountsToDisplay(
      ADDON_PRICES.month2_3[currency],
      ADDON_PRICES.month2_3.was[currency],
      currency,
    ),
  };
}

function addonStatusMap(label: string): Record<AddonKey, DisplayPrice> {
  return {
    month1: { price: label, oldPrice: null },
    month2_3: { price: label, oldPrice: null },
  };
}

function buildDisplay<K extends string>(
  rows: PriceRow[] | null,
  keys: readonly K[],
  currency: DisplayCurrency,
): Record<K, DisplayPrice> | null {
  if (!rows?.length) return null;

  const byTariff = new Map(rows.map((r) => [r.tariff, r]));
  const out = {} as Record<K, DisplayPrice>;

  for (const key of keys) {
    const row = byTariff.get(key);
    if (!row) return null;
    const display = rowToDisplay(row, currency);
    if (!display) return null;
    out[key] = display;
  }
  return out;
}

/** Prices for landing cards: live DB values + geo currency, never hardcoded money. */
export function useLandingTariffPrices(): {
  prices: Record<TariffKey, DisplayPrice>;
  addonPrices: Record<AddonKey, DisplayPrice>;
  currency: DisplayCurrency;
  ready: boolean;
  error: boolean;
} {
  const { closed } = useCountdownTail();
  const [currency, setCurrency] = useState<DisplayCurrency>("rub");
  const [prices, setPrices] = useState<Record<TariffKey, DisplayPrice>>(() =>
    statusMap("Загрузка…"),
  );
  const [addonPrices, setAddonPrices] = useState<Record<AddonKey, DisplayPrice>>(
    () => addonStatusMap("Загрузка…"),
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
      const display = closed
        ? stage3Display(cur)
        : buildDisplay(rows, LANDING_TARIFFS, cur);
      const addons = closed
        ? addonFallbackDisplay(cur)
        : buildDisplay(rows, LANDING_ADDONS, cur);
      setCurrency(cur);
      setPrices(display ?? statusMap("Цена недоступна"));
      setAddonPrices(addons ?? addonStatusMap("Цена недоступна"));
      setError(!closed && (!display || !addons));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [closed]);

  return { prices, addonPrices, currency, ready, error };
}

export function tariffKeyForIndex(index: number): TariffKey {
  return LANDING_TARIFFS[index] ?? "trial";
}
