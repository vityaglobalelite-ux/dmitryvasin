export const TARIFFS = [
  "trial",
  "full",
  "vip",
  "month2",
  "month2_3",
  "month3",
] as const;

export type Tariff = (typeof TARIFFS)[number];

export type CheckoutCurrency = "rub" | "usd" | "eur";

export function isTariff(value: string): value is Tariff {
  return (TARIFFS as readonly string[]).includes(value);
}

export const TARIFF_LABELS: Record<Tariff, string> = {
  trial: "Test-drive | 1 month",
  full: "Full research | 90 days",
  vip: "VIP research | 90 days",
  month2: "Month 2 renewal",
  month2_3: "Month 2+3 renewal",
  month3: "Month 3 renewal",
};

export type ResolvedPrice = {
  priceId?: string;
  amountCents: number;
  currency: CheckoutCurrency;
  label: string;
  priceRub: number;
  priceUsd: number;
  priceEur: number;
};

export type TariffPriceRow = {
  price_rub: number | string;
  price_usd: number | string;
  price_eur: number | string;
  checkout_currency: string | null;
  stripe_price_id: string | null;
  label: string | null;
  active: boolean;
};

function toMajor(value: number | string): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid price value: ${value}`);
  }
  return n;
}

/** Stripe expects minor units (kopecks / cents). */
export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}

function pickCurrency(row: TariffPriceRow): CheckoutCurrency {
  const fromRow = (row.checkout_currency || "").toLowerCase();
  if (fromRow === "rub" || fromRow === "usd" || fromRow === "eur") {
    return fromRow;
  }
  const fromEnv = (Deno.env.get("STRIPE_CURRENCY") || "eur").toLowerCase();
  if (fromEnv === "rub" || fromEnv === "usd" || fromEnv === "eur") {
    return fromEnv;
  }
  return "eur";
}

function amountForCurrency(
  row: TariffPriceRow,
  currency: CheckoutCurrency,
): number {
  if (currency === "rub") return toMajor(row.price_rub);
  if (currency === "usd") return toMajor(row.price_usd);
  return toMajor(row.price_eur);
}

/** Primary source: tariff_prices (price_rub / price_usd / price_eur). */
export function resolvePriceFromDb(
  tariff: Tariff,
  row: TariffPriceRow | null,
): ResolvedPrice | null {
  if (!row || row.active === false) return null;

  const currency = pickCurrency(row);
  const major = amountForCurrency(row, currency);
  const label = row.label?.trim() || TARIFF_LABELS[tariff];
  const priceId = row.stripe_price_id?.trim();

  return {
    priceId: priceId || undefined,
    amountCents: toMinorUnits(major),
    currency,
    label,
    priceRub: toMajor(row.price_rub),
    priceUsd: toMajor(row.price_usd),
    priceEur: toMajor(row.price_eur),
  };
}

/** Fallback if DB row missing. */
export function resolvePriceFromEnv(tariff: Tariff): ResolvedPrice {
  const currencyRaw = (Deno.env.get("STRIPE_CURRENCY") || "eur").toLowerCase();
  const currency: CheckoutCurrency =
    currencyRaw === "rub" || currencyRaw === "usd" || currencyRaw === "eur"
      ? currencyRaw
      : "eur";
  const label = TARIFF_LABELS[tariff];

  const priceIdEnv: Record<Tariff, string | undefined> = {
    trial: Deno.env.get("STRIPE_PRICE_TRIAL"),
    full: Deno.env.get("STRIPE_PRICE_FULL"),
    vip: Deno.env.get("STRIPE_PRICE_VIP"),
    month2: Deno.env.get("STRIPE_PRICE_MONTH2"),
    month2_3: Deno.env.get("STRIPE_PRICE_MONTH2_3"),
    month3: Deno.env.get("STRIPE_PRICE_MONTH3"),
  };
  const amountEnv: Record<Tariff, string | undefined> = {
    trial: Deno.env.get("STRIPE_AMOUNT_TRIAL"),
    full: Deno.env.get("STRIPE_AMOUNT_FULL"),
    vip: Deno.env.get("STRIPE_AMOUNT_VIP"),
    month2: Deno.env.get("STRIPE_AMOUNT_MONTH2"),
    month2_3: Deno.env.get("STRIPE_AMOUNT_MONTH2_3"),
    month3: Deno.env.get("STRIPE_AMOUNT_MONTH3"),
  };

  const priceId = priceIdEnv[tariff]?.trim();
  const raw = amountEnv[tariff]?.trim();
  let amountCents: number;
  if (raw) {
    amountCents = Number(raw);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      throw new Error(`Invalid STRIPE_AMOUNT_${tariff.toUpperCase()}`);
    }
  } else if (priceId) {
    amountCents = 0;
  } else {
    throw new Error(
      `No price in tariff_prices for "${tariff}" and no STRIPE_AMOUNT_ env`,
    );
  }

  const major = amountCents / 100;
  return {
    priceId: priceId || undefined,
    amountCents: priceId ? 0 : amountCents,
    currency,
    label,
    priceRub: major,
    priceUsd: major,
    priceEur: major,
  };
}
