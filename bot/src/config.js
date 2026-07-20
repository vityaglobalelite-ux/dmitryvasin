require("dotenv").config();

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
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
  channelId: process.env.TELEGRAM_CHANNEL_ID || "",
  supportUrl:
    process.env.SUPPORT_URL ||
    "https://t.me/be_tango_support_bot?start=help",
  /** HTTPS-страница-редирект для WebApp-кнопки «Поддержка» */
  supportWebAppUrl:
    process.env.SUPPORT_WEBAPP_URL || "https://betango.dance/go-support.html",
  adminIds: parseAdminIds(process.env.ADMIN_TELEGRAM_IDS),
  /**
   * mock — тариф сразу выдаёт доступ (без Stripe)
   * stripe — foreign → Stripe Checkout; ru пока заглушка
   */
  paymentMode: process.env.PAYMENT_MODE || "mock",
  checkoutSecret: process.env.CHECKOUT_SECRET || "",
  botUsername: (process.env.TELEGRAM_BOT_USERNAME || "").replace(/^@/, ""),
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL || "",
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL || "",
  prices: {
    trial: process.env.PRICE_TRIAL || "1 000 ₽",
    full: process.env.PRICE_FULL || "1 000 ₽",
    vip: process.env.PRICE_VIP || "1 000 ₽",
    month2: process.env.PRICE_MONTH2 || "1 000 ₽",
    month2_3: process.env.PRICE_MONTH2_3 || "1 000 ₽",
    month2_3_was: process.env.PRICE_MONTH2_3_WAS || "2 000 ₽",
    month3: process.env.PRICE_MONTH3 || "1 000 ₽",
  },
  durationsDays: {
    trial: 30,
    full: 90,
    vip: 90,
    month2: 30,
    month2_3: 60,
    month3: 30,
  },
  schedulerIntervalMs: 30_000,
  vipIntroDelayMinutes: Number(process.env.VIP_INTRO_DELAY_MINUTES || 5),
};

module.exports = { config };
