/**
 * Stage 3 list prices (screenshot «Этап 3») + Miami cutover.
 * Keep in sync with src/lib/tariff-stage3.ts.
 */
const CLUB_CUTOVER_ISO = "2026-08-21T00:00:00-04:00";
const PRICE_INCREASE_KEY = "price_increase_at";
const STAGE3_APPLIED_KEY = "stage3_prices_applied_at";

const STAGE3_PRICES = {
  trial: { rub: 14900, usd: 195, eur: 170 },
  full: { rub: 35900, usd: 460, eur: 405 },
  vip: { rub: 60900, usd: 770, eur: 675 },
};

const ADDON_PRICES = {
  month1: { rub: 14900, usd: 195, eur: 170 },
  month2_3: {
    rub: 27800,
    usd: 360,
    eur: 320,
    was: {
      rub: 29800,
      usd: 390,
      eur: 340,
    },
  },
};

/** Standard monthly list price (month 1 / month 2 / month 3 standalone). */
const MONTH_LIST_PRICE = { rub: 14900, usd: 195, eur: 170 };

/**
 * Renewal tariffs. Bundle "was" is the sum of previous monthly prices (2 × month 2).
 * Keep in sync with database-schema/migrations/015_renewal_prices.sql.
 */
const RENEWAL_PRICES = {
  month2: { ...MONTH_LIST_PRICE },
  month3: { ...MONTH_LIST_PRICE },
  month2_3: {
    rub: 27800,
    usd: 360,
    eur: 320,
    was: {
      rub: MONTH_LIST_PRICE.rub * 2,
      usd: MONTH_LIST_PRICE.usd * 2,
      eur: MONTH_LIST_PRICE.eur * 2,
    },
  },
};

const RENEWAL_PRICES_KEY = "renewal_prices_applied";
const RENEWAL_PRICES_VERSION = "month2-2026-14900";

const SALE_MESSAGE_KINDS = new Set([
  "tariff_nudge_10m",
  "tariff_nudge_24h",
]);

function parseTarget(raw) {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isFinite(d.getTime()) ? d : null;
}

const CACHE_TTL_MS = 10_000;
let cache = { at: 0, target: null, closed: false };

async function loadWindow() {
  const now = Date.now();
  if (cache.at && now - cache.at < CACHE_TTL_MS) return cache;

  const db = require("./db");
  let target = parseTarget(CLUB_CUTOVER_ISO);
  try {
    const raw = await db.getSetting(PRICE_INCREASE_KEY);
    target = parseTarget(raw);
  } catch {
    target = parseTarget(CLUB_CUTOVER_ISO);
  }

  cache = {
    at: now,
    target,
    closed: Boolean(target && target.getTime() <= now),
  };
  return cache;
}

function invalidateSalesWindowCache() {
  cache = { at: 0, target: null, closed: false };
}

async function getSalesWindow() {
  return loadWindow();
}

async function isSalesClosed() {
  const { closed } = await loadWindow();
  return closed;
}

/** Cutover date applies stage-3 prices. Enrollment stays open. */
async function isNewEnrollmentBlocked(_telegramId) {
  return false;
}

function isSaleNudgeKind(kind) {
  return SALE_MESSAGE_KINDS.has(kind);
}

async function applyStage3PricesIfDue() {
  const { closed } = await loadWindow();
  if (!closed) return false;

  const db = require("./db");
  const already = await db.getSetting(STAGE3_APPLIED_KEY);
  if (already?.trim()) return false;

  await db.applyLandingStagePrices(STAGE3_PRICES);
  await db.setSetting(STAGE3_APPLIED_KEY, new Date().toISOString());
  try {
    require("./price-labels").clearPriceCache();
  } catch {
    /* optional */
  }
  invalidateSalesWindowCache();
  console.log("Applied stage-3 tariff prices (no strikethrough)");
  return true;
}

function clearPriceLabelCache() {
  try {
    require("./price-labels").clearPriceCache();
  } catch {
    /* optional */
  }
}

async function applyRenewalPricesIfNeeded() {
  const db = require("./db");
  const already = await db.getSetting(RENEWAL_PRICES_KEY);
  if (already === RENEWAL_PRICES_VERSION) return false;

  await db.applyRenewalPrices(RENEWAL_PRICES);
  await db.setSetting(RENEWAL_PRICES_KEY, RENEWAL_PRICES_VERSION);
  clearPriceLabelCache();
  console.log("Applied renewal tariff prices (month2 / month2_3 / month3)");
  return true;
}

async function applyClubPricesIfDue() {
  const stage3 = await applyStage3PricesIfDue();
  const renewal = await applyRenewalPricesIfNeeded();
  return stage3 || renewal;
}

module.exports = {
  CLUB_CUTOVER_ISO,
  STAGE3_PRICES,
  ADDON_PRICES,
  MONTH_LIST_PRICE,
  RENEWAL_PRICES,
  RENEWAL_PRICES_VERSION,
  getSalesWindow,
  isSalesClosed,
  isNewEnrollmentBlocked,
  isSaleNudgeKind,
  applyStage3PricesIfDue,
  applyRenewalPricesIfNeeded,
  applyClubPricesIfDue,
  invalidateSalesWindowCache,
};
