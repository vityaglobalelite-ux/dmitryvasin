import type { Tariff } from "./tariffs.ts";

/** Same numbers as bot/src/club-cutover.js LEGACY_PRICES. */
export const LEGACY_PRICES: Record<
  Tariff,
  { rub: number; usd: number; eur: number }
> = {
  trial: { rub: 14900, usd: 195, eur: 170 },
  full: { rub: 35900, usd: 460, eur: 405 },
  vip: { rub: 60900, usd: 770, eur: 675 },
  month1: { rub: 14900, usd: 195, eur: 170 },
  month2: { rub: 14900, usd: 195, eur: 170 },
  month3: { rub: 14900, usd: 195, eur: 170 },
  month2_3: { rub: 27800, usd: 360, eur: 320 },
};
