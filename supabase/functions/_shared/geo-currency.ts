export const CURRENCIES = ["rub", "eur", "usd"] as const;
export type GeoCurrency = (typeof CURRENCIES)[number];

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
  return (CURRENCIES as readonly string[]).includes(value);
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

export function currencyFromRequestHeaders(headers: Headers): GeoCurrency {
  const cf = headers.get("cf-ipcountry") || headers.get("x-country-code");
  if (cf && cf !== "XX" && cf !== "T1") {
    return currencyForCountry(cf);
  }
  return "rub";
}
