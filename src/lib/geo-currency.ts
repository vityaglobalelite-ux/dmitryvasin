/** Geo → display/charge currency. Shared by privateclub landing and catalog. */

export type GeoCurrency = "rub" | "usd" | "eur";

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

export function isGeoCurrency(value: string): value is GeoCurrency {
  return value === "rub" || value === "usd" || value === "eur";
}

export function currencyForCountry(
  code: string | null | undefined,
): GeoCurrency {
  const c = (code || "").toUpperCase();
  if (!c) return "rub";
  if (CIS.has(c)) return "rub";
  if (EUROPE.has(c)) return "eur";
  if (AMERICAS.has(c)) return "usd";
  return "rub";
}

export function currencyFromRequestHeaders(
  headers: Headers,
): GeoCurrency {
  const cf = headers.get("cf-ipcountry") || headers.get("x-country-code");
  if (cf && cf !== "XX" && cf !== "T1") {
    return currencyForCountry(cf);
  }
  return "rub";
}

export async function detectCountryCode(): Promise<string | null> {
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

/** `amount` is major units (16900 ₽, 195 $, 170 €). */
export function formatMoney(amount: number, currency: GeoCurrency): string {
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
