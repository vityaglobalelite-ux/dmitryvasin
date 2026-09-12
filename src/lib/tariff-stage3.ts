/**
 * Stage 3 list prices (screenshot «Этап 3»).
 * Applied on the landing and in tariff_prices at CLUB_CUTOVER_ISO.
 * Keep in sync with bot/src/club-cutover.js.
 */
export const CLUB_CUTOVER_ISO = "2026-08-21T00:00:00-04:00";

export const CLUB_CLOSED_ID = "club-closed";

export const STAGE3_PRICES = {
  trial: { rub: 14900, usd: 195, eur: 170 },
  full: { rub: 35900, usd: 460, eur: 405 },
  vip: { rub: 60900, usd: 770, eur: 675 },
} as const;

/**
 * Landing add-ons under the main 3 cards.
 * Keep in sync with tariff_prices (014/015) and bot/src/club-cutover.js.
 * month1 list price matches trial until a separate archive price is set.
 * month2_3 "was" = 2 × monthly list (same as renewal bundle).
 */
export const ADDON_PRICES = {
  month1: { rub: 14900, usd: 195, eur: 170 },
  month2_3: {
    rub: 27800,
    usd: 360,
    eur: 320,
    was: { rub: 29800, usd: 390, eur: 340 },
  },
} as const;
