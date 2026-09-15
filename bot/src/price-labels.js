const { config } = require("./config");
const db = require("./db");

const CACHE_TTL_MS = 60_000;
/** @type {Map<string, { at: number, rows: Map<string, object> }>} */
const listCache = new Map();

function formatMajor(amount, currency) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount ?? "");
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(n);
  if (currency === "usd") return `$${formatted}`;
  if (currency === "eur") return `${formatted} €`;
  return `${formatted} ₽`;
}

function pickCurrency(_row, paymentMethod) {
  return paymentMethod === "foreign" ? "usd" : "rub";
}

function amountFor(row, currency, { was = false } = {}) {
  if (!row) return null;
  if (was) {
    if (currency === "usd") return row.price_usd_was;
    if (currency === "eur") return row.price_eur_was;
    return row.price_rub_was;
  }
  if (currency === "usd") return row.price_usd;
  if (currency === "eur") return row.price_eur;
  return row.price_rub;
}

async function loadRows(priceList = "current", force = false) {
  const list = priceList === "legacy" ? "legacy" : "current";
  const now = Date.now();
  const hit = listCache.get(list);
  if (!force && hit && now - hit.at < CACHE_TTL_MS) {
    return hit.rows;
  }
  const rows = await db.getTariffPrices(list);
  const map = new Map();
  for (const row of rows) {
    map.set(row.tariff, row);
  }
  listCache.set(list, { at: now, rows: map });
  return map;
}

/**
 * Labels for bot copy. foreign → USD; ru → RUB.
 * List comes from bot_users.pricing_cohort (locked), not from "has a subscription".
 * @param {string|null|undefined} paymentMethod
 * @param {number|null|undefined} telegramId
 */
async function getPriceLabels(paymentMethod = "ru", telegramId = null) {
  const method = paymentMethod === "foreign" ? "foreign" : "ru";
  const cohort = telegramId ? await db.getPricingCohort(telegramId) : null;
  const priceList = db.priceListForCohort(cohort);
  const map = await loadRows(priceList);
  const env = config.prices;
  const labels = {
    trial: env.trial,
    full: env.full,
    vip: env.vip,
    month1: env.month1,
    month2: env.month2,
    month2_3: env.month2_3,
    month2_3_was: env.month2_3_was,
    month3: env.month3,
  };

  for (const tariff of Object.keys(labels)) {
    if (tariff === "month2_3_was") continue;
    const row = map.get(tariff);
    if (!row) continue;
    const currency = pickCurrency(row, method);
    const amount = amountFor(row, currency);
    if (amount != null) {
      labels[tariff] = formatMajor(amount, currency);
    }
  }

  const currency = method === "foreign" ? "usd" : "rub";
  const bundle = map.get("month2_3");
  if (bundle) {
    const was = amountFor(bundle, currency, { was: true });
    if (was != null) {
      labels.month2_3_was = formatMajor(was, currency);
    }
  }

  return labels;
}

function clearPriceCache() {
  listCache.clear();
}

module.exports = {
  getPriceLabels,
  loadRows,
  formatMajor,
  clearPriceCache,
};
