import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Server misconfigured" }, 500);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing stripe-signature" }, 400);
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    // Deno/SubtleCrypto: sync constructEvent throws — use async
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return jsonResponse({ error: "Invalid signature" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "payment") break;
        if (session.payment_status !== "paid") break;

        const paymentId = session.metadata?.payment_id;
        const sessionId = session.id;
        const now = new Date().toISOString();
        const patch = {
          status: "paid",
          stripe_checkout_session_id: sessionId,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          stripe_event_id: event.id,
          amount_cents: session.amount_total,
          currency: session.currency,
          updated_at: now,
          error: null,
        };

        if (paymentId) {
          const { data, error } = await supabase
            .from("payments")
            .update(patch)
            .eq("id", paymentId)
            .in("status", ["pending", "expired", "failed"])
            .select("id")
            .maybeSingle();
          if (error) throw error;
          if (!data) {
            // Already paid/granted — idempotent OK
            console.log("payment already processed", paymentId);
          }
        } else {
          const { error } = await supabase
            .from("payments")
            .update(patch)
            .eq("stripe_checkout_session_id", sessionId)
            .in("status", ["pending", "expired", "failed"]);
          if (error) throw error;
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentId = session.metadata?.payment_id;
        const now = new Date().toISOString();
        if (paymentId) {
          await supabase
            .from("payments")
            .update({
              status: "expired",
              stripe_event_id: event.id,
              updated_at: now,
            })
            .eq("id", paymentId)
            .eq("status", "pending");
        } else if (session.id) {
          await supabase
            .from("payments")
            .update({
              status: "expired",
              stripe_event_id: event.id,
              updated_at: now,
            })
            .eq("stripe_checkout_session_id", session.id)
            .eq("status", "pending");
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!pi) break;
        await supabase
          .from("payments")
          .update({
            status: "refunded",
            stripe_event_id: event.id,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent_id", pi)
          .in("status", ["paid", "granting", "granted"]);
        break;
      }

      default:
        break;
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("stripe-webhook handler error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
