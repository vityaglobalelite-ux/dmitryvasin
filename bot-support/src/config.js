require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function parseAdminIds(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function parseAdminNames(raw) {
  const map = new Map();
  if (!raw) return map;
  for (const part of raw.split(",")) {
    const idx = part.indexOf(":");
    if (idx === -1) continue;
    const id = Number(part.slice(0, idx).trim());
    const name = part.slice(idx + 1).trim();
    if (Number.isFinite(id) && name) map.set(id, name);
  }
  return map;
}

const adminIdsList = parseAdminIds(process.env.ADMIN_TELEGRAM_IDS);

const config = {
  token: required("TELEGRAM_BOT_TOKEN"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  adminIds: new Set(adminIdsList),
  adminIdsList,
  adminNames: parseAdminNames(process.env.ADMIN_NAMES),
  historyLimit: Number(process.env.HISTORY_LIMIT || 30),
  displayTz: process.env.DISPLAY_TZ || "Europe/Moscow",
};

module.exports = { config };
