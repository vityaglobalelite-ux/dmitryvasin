/**
 * Club sales window + list prices.
 * Keep in sync with src/lib/tariff-stage3.ts and supabase/functions/_shared/legacy-prices.ts.
 *
 * ACCESS_CLOSE_ISO / bot_settings.price_increase_at — 24 Sep 2026 00:00 Miami:
 * countdown until then, then new enrollment closes. Existing members keep access.
 * Amounts: tariff_prices.price_list current|legacy, locked on bot_users.pricing_cohort.
 * LEGACY_PRICES is the frozen snapshot for that list — not applied because someone paid.
 */
const ACCESS_CLOSE_ISO = "2026-09-24T00:00:00-04:00";
/** @deprecated historical Aug-21 cutover; sales window now ACCESS_CLOSE_ISO */
const CLUB_CUTOVER_ISO = ACCESS_CLOSE_ISO;
const PRICE_INCREASE_KEY = "price_increase_at";
const STAGE3_APPLIED_KEY = "stage3_prices_applied_at";

/** Snapshot for anyone who already had a subscription (any status). */
const LEGACY_PRICES = {
  trial: { rub: 14900, usd: 195, eur: 170 },
  full: { rub: 35900, usd: 460, eur: 405 },
  vip: { rub: 60900, usd: 770, eur: 675 },
  month1: { rub: 14900, usd: 195, eur: 170 },
  month2: { rub: 14900, usd: 195, eur: 170 },
  month3: { rub: 14900, usd: 195, eur: 170 },
  month2_3: {
    rub: 27800,
    usd: 360,
    eur: 320,
    was: { rub: 29800, usd: 390, eur: 340 },
  },
};

/** Public list for new buyers. USD/EUR unchanged; RUB raised Sep 2026. */
const NEW_LIST_PRICES = {
  trial: { rub: 16900, usd: 195, eur: 170 },
  full: { rub: 39900, usd: 460, eur: 405 },
  vip: { rub: 67900, usd: 770, eur: 675 },
  month1: { rub: 16900, usd: 195, eur: 170 },
  month2: { rub: 16900, usd: 195, eur: 170 },
  month3: { rub: 16900, usd: 195, eur: 170 },
  month2_3: {
    rub: 30900,
    usd: 360,
    eur: 320,
    was: { rub: 33800, usd: 390, eur: 340 },
  },
};

/** Landing main cards fallback — same as NEW_LIST_PRICES. */
const STAGE3_PRICES = {
  trial: NEW_LIST_PRICES.trial,
  full: NEW_LIST_PRICES.full,
  vip: NEW_LIST_PRICES.vip,
};

const ADDON_PRICES = {
  month1: NEW_LIST_PRICES.month1,
  month2_3: NEW_LIST_PRICES.month2_3,
};

const MONTH_LIST_PRICE = {
  rub: NEW_LIST_PRICES.month2.rub,
  usd: NEW_LIST_PRICES.month2.usd,
  eur: NEW_LIST_PRICES.month2.eur,
};

const RENEWAL_PRICES = {
  month2: NEW_LIST_PRICES.month2,
  month3: NEW_LIST_PRICES.month3,
  month2_3: NEW_LIST_PRICES.month2_3,
};

const RENEWAL_PRICES_KEY = "renewal_prices_applied";
const RENEWAL_PRICES_VERSION = "month2-2026-14900";
const NEW_LIST_PRICES_KEY = "sep21_close_prices_applied";
const NEW_LIST_PRICES_VERSION = "2026-09-15-16900";

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
  let target = parseTarget(ACCESS_CLOSE_ISO);
  try {
    const raw = await db.getSetting(PRICE_INCREASE_KEY);
    target = parseTarget(raw);
  } catch {
    target = parseTarget(ACCESS_CLOSE_ISO);
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

/** After close date: block people who never bought. Members can still renew. */
async function isNewEnrollmentBlocked(telegramId) {
  if (!(await isSalesClosed())) return false;
  if (!telegramId) return true;
  return !(await require("./db").hasAnySubscription(telegramId));
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
  clearPriceLabelCache();
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

async function applyNewListPricesIfNeeded() {
  const db = require("./db");
  const already = await db.getSetting(NEW_LIST_PRICES_KEY);
  if (already === NEW_LIST_PRICES_VERSION) return false;

  await db.applyRenewalPrices(NEW_LIST_PRICES);
  await db.setSetting(NEW_LIST_PRICES_KEY, NEW_LIST_PRICES_VERSION);
  clearPriceLabelCache();
  invalidateSalesWindowCache();
  console.log("Applied Sep-21 close list prices (new buyers)");
  return true;
}

async function applyClubPricesIfDue() {
  const stage3 = await applyStage3PricesIfDue();
  const renewal = await applyRenewalPricesIfNeeded();
  const next = await applyNewListPricesIfNeeded();
  return stage3 || renewal || next;
}

module.exports = {
  ACCESS_CLOSE_ISO,
  CLUB_CUTOVER_ISO,
  STAGE3_PRICES,
  ADDON_PRICES,
  MONTH_LIST_PRICE,
  RENEWAL_PRICES,
  RENEWAL_PRICES_VERSION,
  LEGACY_PRICES,
  NEW_LIST_PRICES,
  NEW_LIST_PRICES_VERSION,
  getSalesWindow,
  isSalesClosed,
  isNewEnrollmentBlocked,
  isSaleNudgeKind,
  applyStage3PricesIfDue,
  applyRenewalPricesIfNeeded,
  applyNewListPricesIfNeeded,
  applyClubPricesIfDue,
  invalidateSalesWindowCache,
};
