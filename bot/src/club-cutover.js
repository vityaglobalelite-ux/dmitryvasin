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

/** Closed to people who never bought. /start or unpaid funnel does not count as a member. */
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
  try {
    require("./price-labels").clearPriceCache();
  } catch {
    /* optional */
  }
  invalidateSalesWindowCache();
  console.log("Applied stage-3 tariff prices (no strikethrough)");
  return true;
}

module.exports = {
  CLUB_CUTOVER_ISO,
  STAGE3_PRICES,
  getSalesWindow,
  isSalesClosed,
  isNewEnrollmentBlocked,
  isSaleNudgeKind,
  applyStage3PricesIfDue,
  invalidateSalesWindowCache,
};
