const { config } = require("./config");
const db = require("./db");

const CACHE_TTL_MS = 60_000;
let cacheAt = 0;
/** @type {Map<string, object>|null} */
let rowsByTariff = null;

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

function pickCurrency(row, paymentMethod) {
  if (paymentMethod === "foreign") {
    const c = (row?.checkout_currency || "eur").toLowerCase();
    if (c === "usd" || c === "eur" || c === "rub") return c;
    return "eur";
  }
  return "rub";
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

async function loadRows(force = false) {
  const now = Date.now();
  if (!force && rowsByTariff && now - cacheAt < CACHE_TTL_MS) {
    return rowsByTariff;
  }
  const rows = await db.getTariffPrices();
  const map = new Map();
  for (const row of rows) {
    map.set(row.tariff, row);
  }
  rowsByTariff = map;
  cacheAt = now;
  return map;
}

/**
 * Labels for bot copy. foreign → checkout_currency; ru → rub.
 * @param {string|null|undefined} paymentMethod
 */
async function getPriceLabels(paymentMethod = "ru") {
  const method = paymentMethod === "foreign" ? "foreign" : "ru";
  const map = await loadRows();
  const env = config.prices;
  const labels = {
    trial: env.trial,
    full: env.full,
    vip: env.vip,
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

  const m23 = map.get("month2_3");
  if (m23) {
    const currency = pickCurrency(m23, method);
    const was = amountFor(m23, currency, { was: true });
    if (was != null) {
      labels.month2_3_was = formatMajor(was, currency);
    }
  }

  return labels;
}

module.exports = {
  getPriceLabels,
  loadRows,
  formatMajor,
};
