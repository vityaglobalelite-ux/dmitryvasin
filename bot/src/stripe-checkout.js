const { config } = require("./config");

/**
 * Creates a Stripe Checkout Session via Supabase Edge Function.
 * @returns {{ payment_id: string, session_id: string, url: string }}
 */
async function createCheckoutSession({ telegramId, tariff, paymentMethod }) {
  if (!config.checkoutSecret) {
    throw new Error("CHECKOUT_SECRET is not set");
  }

  const successUrl =
    config.stripeSuccessUrl ||
    (config.botUsername ? `https://t.me/${config.botUsername}` : "");
  const cancelUrl = config.stripeCancelUrl || successUrl;
  if (!successUrl) {
    throw new Error(
      "Set STRIPE_SUCCESS_URL or TELEGRAM_BOT_USERNAME for Checkout return URLs",
    );
  }

  const url = `${config.supabaseUrl.replace(/\/$/, "")}/functions/v1/create-checkout`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.supabaseKey}`,
      apikey: config.supabaseKey,
      "x-checkout-secret": config.checkoutSecret,
    },
    body: JSON.stringify({
      telegram_id: telegramId,
      tariff,
      payment_method: paymentMethod || "foreign",
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `create-checkout HTTP ${res.status}`);
  }
  if (!data.url) {
    throw new Error("create-checkout returned no url");
  }
  return data;
}

module.exports = { createCheckoutSession };
