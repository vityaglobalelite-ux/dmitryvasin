/**
 * Catalog site Stripe. Never STRIPE_SECRET_KEY — that is the bot/live account
 * on the VPS. Catalog accepts test keys only.
 */
export function catalogStripeSecret(): string | null {
  const key = Deno.env.get("CATALOG_STRIPE_SECRET_KEY")?.trim() ?? "";
  if (!key) {
    console.error("catalog stripe: CATALOG_STRIPE_SECRET_KEY is not set");
    return null;
  }
  if (!key.startsWith("sk_test_")) {
    console.error(
      "catalog stripe: CATALOG_STRIPE_SECRET_KEY must be sk_test_ (live keys are rejected)",
    );
    return null;
  }
  return key;
}

export function catalogStripeWebhookSecret(): string | null {
  const secret = Deno.env.get("STRIPE_CATALOG_WEBHOOK_SECRET")?.trim() ?? "";
  return secret || null;
}
