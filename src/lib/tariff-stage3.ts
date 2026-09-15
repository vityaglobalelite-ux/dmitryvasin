/**
 * Public list prices + sales-window close (22 Sep 2026 00:00 Miami).
 * Keep in sync with bot/src/club-cutover.js NEW_LIST_PRICES.
 */
export const CLUB_CUTOVER_ISO = "2026-09-22T00:00:00-04:00";

export const CLUB_CLOSED_ID = "club-closed";

export const STAGE3_PRICES = {
  trial: { rub: 16900, usd: 195, eur: 170 },
  full: { rub: 39900, usd: 460, eur: 405 },
  vip: { rub: 67900, usd: 770, eur: 675 },
} as const;

/**
 * Landing add-ons under the main 3 cards.
 * month2_3 "was" = 2 × monthly list.
 */
export const ADDON_PRICES = {
  month1: { rub: 16900, usd: 195, eur: 170 },
  month2_3: {
    rub: 30900,
    usd: 360,
    eur: 320,
    was: { rub: 33800, usd: 390, eur: 340 },
  },
} as const;
