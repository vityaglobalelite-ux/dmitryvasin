import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  stripe_session_id: string | null;
};

type OrderItemRow = {
  product_id: string;
};

type ProductAccessRow = {
  id: string;
  access_days: number;
};

type AccessRow = {
  expires_at: string;
  order_id: string;
};

function isBotCheckoutMetadata(metadata: Stripe.Metadata | null): boolean {
  if (!metadata) return false;
  if (metadata.catalog_order_id) return false;
  return Boolean(metadata.payment_id || metadata.telegram_id);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asOrderId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !UUID_RE.test(trimmed)) return null;
  return trimmed;
}

function catalogOrderIdFromMetadata(
  metadata: Stripe.Metadata | null,
): string | null {
  return asOrderId(metadata?.catalog_order_id);
}

async function findOrderByIdOrSession(
  admin: SupabaseClient,
  orderId: string | null,
  sessionId: string | null,
): Promise<OrderRow | null> {
  if (orderId) {
    const { data, error } = await admin
      .from("catalog_orders")
      .select("id, user_id, status, stripe_session_id")
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as OrderRow;
  }
  if (sessionId) {
    const { data, error } = await admin
      .from("catalog_orders")
      .select("id, user_id, status, stripe_session_id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (error) throw error;
    if (data) return data as OrderRow;
  }
  return null;
}

function addAccessDays(from: Date, accessDays: number): Date {
  return new Date(from.getTime() + accessDays * 24 * 60 * 60 * 1000);
}

async function grantCatalogAccess(
  admin: SupabaseClient,
  order: OrderRow,
  options: { extend: boolean },
): Promise<void> {
  const { data: items, error: itemsErr } = await admin
    .from("catalog_order_items")
    .select("product_id")
    .eq("order_id", order.id);
  if (itemsErr) throw itemsErr;

  const productIds = [
    ...new Set(
      ((items ?? []) as OrderItemRow[])
        .map((row) => row.product_id)
        .filter(Boolean),
    ),
  ];
  if (productIds.length === 0) return;

  const { data: products, error: productsErr } = await admin
    .from("catalog_products")
    .select("id, access_days")
    .in("id", productIds);
  if (productsErr) throw productsErr;

  const daysByProduct = new Map<string, number>();
  for (const product of (products ?? []) as ProductAccessRow[]) {
    daysByProduct.set(product.id, product.access_days);
  }

  const now = new Date();
  const nowIso = now.toISOString();

  for (const productId of productIds) {
    const accessDays = daysByProduct.get(productId);
    if (!accessDays || accessDays <= 0) {
      throw new Error(`missing access_days for product ${productId}`);
    }

    const { data: existing, error: existingErr } = await admin
      .from("catalog_access")
      .select("expires_at, order_id")
      .eq("user_id", order.user_id)
      .eq("product_id", productId)
      .maybeSingle();
    if (existingErr) throw existingErr;

    const current = existing as AccessRow | null;
    if (!current) {
      const { error: insertErr } = await admin.from("catalog_access").insert({
        user_id: order.user_id,
        product_id: productId,
        order_id: order.id,
        purchased_at: nowIso,
        expires_at: addAccessDays(now, accessDays).toISOString(),
        status: "active",
      });
      if (insertErr) throw insertErr;
      continue;
    }

    if (current.order_id === order.id || !options.extend) {
      continue;
    }

    const currentExpiry = new Date(current.expires_at);
    const proposed = addAccessDays(now, accessDays);
    const expiresAt = proposed > currentExpiry ? proposed : currentExpiry;

    const { error: updateErr } = await admin
      .from("catalog_access")
      .update({
        order_id: order.id,
        purchased_at: nowIso,
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .eq("user_id", order.user_id)
      .eq("product_id", productId);
    if (updateErr) throw updateErr;
  }
}

async function clearUserCart(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin
    .from("catalog_cart_items")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
}

async function fulfillPaidOrder(
  admin: SupabaseClient,
  order: OrderRow,
  sessionId: string | null,
): Promise<void> {
  if (order.status === "paid") {
    if (sessionId && !order.stripe_session_id) {
      const { error: sessionErr } = await admin
        .from("catalog_orders")
        .update({ stripe_session_id: sessionId })
        .eq("id", order.id)
        .is("stripe_session_id", null);
      if (sessionErr) throw sessionErr;
    }
    await grantCatalogAccess(admin, order, { extend: false });
    await clearUserCart(admin, order.user_id);
    return;
  }

  const patch: { status: "paid"; stripe_session_id?: string } = {
    status: "paid",
  };
  if (sessionId) patch.stripe_session_id = sessionId;

  const { data: claimed, error: claimErr } = await admin
    .from("catalog_orders")
    .update(patch)
    .eq("id", order.id)
    .neq("status", "paid")
    .select("id, user_id, status, stripe_session_id")
    .maybeSingle();
  if (claimErr) throw claimErr;

  if (!claimed) {
    await grantCatalogAccess(admin, order, { extend: false });
    await clearUserCart(admin, order.user_id);
    return;
  }

  const paidOrder = claimed as OrderRow;
  await grantCatalogAccess(admin, paidOrder, { extend: true });
  await clearUserCart(admin, paidOrder.user_id);
}

async function markOrderTerminal(
  admin: SupabaseClient,
  order: OrderRow,
  status: "canceled" | "failed",
  sessionId: string | null,
): Promise<void> {
  if (order.status === "paid") return;

  const patch: { status: "canceled" | "failed"; stripe_session_id?: string } = {
    status,
  };
  if (sessionId && !order.stripe_session_id) {
    patch.stripe_session_id = sessionId;
  }

  const { error } = await admin
    .from("catalog_orders")
    .update(patch)
    .eq("id", order.id)
    .eq("status", "pending");
  if (error) throw error;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_CATALOG_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeKey || !webhookSecret || !supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "misconfigured" }, 500);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-06-20",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "invalid_signature" }, 400);
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("catalog-stripe-webhook signature failed:", err);
    return jsonResponse({ error: "invalid_signature" }, 400);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (isBotCheckoutMetadata(session.metadata)) {
          console.log("catalog-stripe-webhook ignoring bot session", session.id);
          break;
        }
        if (session.mode !== "payment") break;
        if (session.payment_status !== "paid") break;

        const catalogOrderId =
          catalogOrderIdFromMetadata(session.metadata) ??
          asOrderId(session.client_reference_id);
        const order = await findOrderByIdOrSession(
          admin,
          catalogOrderId,
          session.id,
        );
        if (!order) {
          if (catalogOrderIdFromMetadata(session.metadata)) {
            return jsonResponse({ error: "order_not_found" }, 500);
          }
          break;
        }
        await fulfillPaidOrder(admin, order, session.id);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (isBotCheckoutMetadata(session.metadata)) break;
        const order = await findOrderByIdOrSession(
          admin,
          catalogOrderIdFromMetadata(session.metadata) ??
            asOrderId(session.client_reference_id),
          session.id,
        );
        if (!order) break;
        await markOrderTerminal(admin, order, "canceled", session.id);
        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (isBotCheckoutMetadata(session.metadata)) break;
        const order = await findOrderByIdOrSession(
          admin,
          catalogOrderIdFromMetadata(session.metadata) ??
            asOrderId(session.client_reference_id),
          session.id,
        );
        if (!order) break;
        await markOrderTerminal(admin, order, "failed", session.id);
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        if (isBotCheckoutMetadata(intent.metadata)) break;
        const orderId = catalogOrderIdFromMetadata(intent.metadata);
        if (!orderId) break;
        const order = await findOrderByIdOrSession(admin, orderId, null);
        if (!order) break;
        await markOrderTerminal(admin, order, "failed", null);
        break;
      }

      default:
        break;
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("catalog-stripe-webhook handler error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
