require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function parseAdminIds(raw) {
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n)),
  );
}

const config = {
  token: required("TELEGRAM_BOT_TOKEN"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  adminIds: parseAdminIds(process.env.ADMIN_TELEGRAM_IDS),
  historyLimit: Number(process.env.HISTORY_LIMIT || 30),
};

module.exports = { config };
