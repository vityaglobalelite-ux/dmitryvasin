import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  isTariff,
  resolvePriceFromDb,
  resolvePriceFromEnv,
} from "../_shared/tariffs.ts";

function assertCheckoutAuth(req: Request): void {
  const secret = Deno.env.get("CHECKOUT_SECRET");
  if (!secret) {
    throw new Error("CHECKOUT_SECRET is not set");
  }
  const header = req.headers.get("x-checkout-secret") || "";
  if (header !== secret) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    try {
      assertCheckoutAuth(req);
    } catch (authErr) {
      if (authErr instanceof Response) return authErr;
      throw authErr;
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!stripeKey || !supabaseUrl || !serviceKey) {
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const body = await req.json();
    const telegramId = Number(body.telegram_id);
    const tariff = String(body.tariff || "");
    const paymentMethod = String(body.payment_method || "foreign");
    const successUrl = String(body.success_url || Deno.env.get("STRIPE_SUCCESS_URL") || "");
    const cancelUrl = String(body.cancel_url || Deno.env.get("STRIPE_CANCEL_URL") || successUrl);

    if (!Number.isFinite(telegramId) || telegramId <= 0) {
      return jsonResponse({ error: "telegram_id required" }, 400);
    }
    if (!isTariff(tariff)) {
      return jsonResponse({ error: "invalid tariff" }, 400);
    }
    if (!successUrl || !cancelUrl) {
      return jsonResponse({ error: "success_url / cancel_url required" }, 400);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: user, error: userErr } = await supabase
      .from("bot_users")
      .select("telegram_id")
      .eq("telegram_id", telegramId)
      .maybeSingle();
    if (userErr) throw userErr;
    if (!user) {
      return jsonResponse({ error: "user not found" }, 404);
    }

    // Close previous unfinished checkouts for this user
    await supabase
      .from("payments")
      .update({ status: "expired", updated_at: new Date().toISOString() })
      .eq("telegram_id", telegramId)
      .eq("status", "pending");

    const { data: priceRow, error: priceErr } = await supabase
      .from("tariff_prices")
      .select(
        "price_rub, price_usd, price_eur, checkout_currency, stripe_price_id, label, active",
      )
      .eq("tariff", tariff)
      .maybeSingle();
    if (priceErr) throw priceErr;

    const price =
      resolvePriceFromDb(tariff, priceRow) || resolvePriceFromEnv(tariff);

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .insert({
        telegram_id: telegramId,
        tariff,
        payment_method: paymentMethod,
        status: "pending",
        amount_cents: price.amountCents || null,
        currency: price.currency,
        metadata: {
          source: "create-checkout",
          price_source: priceRow ? "db" : "env",
          price_rub: price.priceRub,
          price_usd: price.priceUsd,
          price_eur: price.priceEur,
        },
      })
      .select("*")
      .single();
    if (payErr) throw payErr;

    const lineItems = price.priceId
      ? [{ price: price.priceId, quantity: 1 }]
      : [
          {
            quantity: 1,
            price_data: {
              currency: price.currency,
              unit_amount: price.amountCents,
              product_data: {
                name: price.label,
                description: `BeTango research · telegram ${telegramId}`,
              },
            },
          },
        ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: successUrl.includes("{CHECKOUT_SESSION_ID}")
        ? successUrl
        : `${successUrl}${successUrl.includes("?") ? "&" : "?"}paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      client_reference_id: String(telegramId),
      metadata: {
        payment_id: payment.id,
        telegram_id: String(telegramId),
        tariff,
        payment_method: paymentMethod,
      },
      payment_intent_data: {
        metadata: {
          payment_id: payment.id,
          telegram_id: String(telegramId),
          tariff,
        },
      },
    });

    const { error: updErr } = await supabase
      .from("payments")
      .update({
        stripe_checkout_session_id: session.id,
        checkout_url: session.url,
        amount_cents: session.amount_total ?? price.amountCents ?? null,
        currency: session.currency || price.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
    if (updErr) throw updErr;

    return jsonResponse({
      payment_id: payment.id,
      session_id: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
