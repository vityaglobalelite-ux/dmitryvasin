import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  currencyFromRequestHeaders,
  isGeoCurrency,
  type GeoCurrency,
} from "../_shared/geo-currency.ts";
import {
  computeCartTotalsFromPrices,
  discountedPriceMinor,
  parseWholesaleTiers,
} from "../_shared/catalog-totals.ts";

type CatalogCurrency = GeoCurrency;

type CheckoutBody = {
  success_url?: unknown;
  cancel_url?: unknown;
  successUrl?: unknown;
  cancelUrl?: unknown;
  currency?: unknown;
};

type CartItemRow = {
  product_id: string;
};

type ProductI18nRow = {
  locale: string;
  title: string | null;
};

type ProductRow = {
  id: string;
  price_minor: number;
  price_usd_minor: number;
  price_eur_minor: number;
  published: boolean;
  catalog_product_i18n?: ProductI18nRow[] | ProductI18nRow | null;
};

type CheckoutLine = {
  productId: string;
  title: string;
  priceMinor: number;
  unitAmount: number;
};

function bearerJwt(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = header.match(/^Bearer\s+(\S+)$/i);
  if (!match) return null;
  const token = match[1];
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) return null;
  return token;
}

function readCheckoutCurrency(
  body: CheckoutBody,
  req: Request,
): CatalogCurrency | null {
  if (typeof body.currency === "string" && body.currency.trim() !== "") {
    const raw = body.currency.trim().toLowerCase();
    if (!isGeoCurrency(raw)) return null;
    return raw;
  }
  return currencyFromRequestHeaders(req.headers);
}

function priceMinorFor(
  product: ProductRow,
  currency: CatalogCurrency,
): number {
  if (currency === "usd") return product.price_usd_minor;
  if (currency === "eur") return product.price_eur_minor;
  return product.price_minor;
}

function isFinitePrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function readJsonBody(raw: unknown): CheckoutBody {
  if (!raw || typeof raw !== "object") return {};
  return raw as CheckoutBody;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function isAllowedCheckoutUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") return true;
    if (parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

function withSessionPlaceholder(url: string): string {
  if (url.includes("{CHECKOUT_SESSION_ID}")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}session_id={CHECKOUT_SESSION_ID}`;
}

function titleFromI18n(
  embedded: ProductRow["catalog_product_i18n"],
): string {
  const rows = Array.isArray(embedded) ? embedded : embedded ? [embedded] : [];
  const ru = rows.find((row) => row.locale === "ru");
  if (ru?.title?.trim()) return ru.title.trim();
  const en = rows.find((row) => row.locale === "en");
  if (en?.title?.trim()) return en.title.trim();
  const first = rows.find((row) => row.title?.trim());
  return first?.title?.trim() || "BeTango";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const jwt = bearerJwt(req);
  if (!jwt) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!stripeKey || !supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: "misconfigured" }, 500);
  }

  try {
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();
    if (userErr || !user) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let body: CheckoutBody = {};
    try {
      body = readJsonBody(await req.json());
    } catch {
      body = {};
    }

    const successUrl =
      asOptionalString(body.success_url) ??
      asOptionalString(body.successUrl) ??
      Deno.env.get("CATALOG_STRIPE_SUCCESS_URL")?.trim();
    const cancelUrl =
      asOptionalString(body.cancel_url) ??
      asOptionalString(body.cancelUrl) ??
      Deno.env.get("CATALOG_STRIPE_CANCEL_URL")?.trim() ??
      successUrl;

    if (!successUrl || !cancelUrl) {
      return jsonResponse({ error: "invalid_url" }, 400);
    }
    if (!isAllowedCheckoutUrl(successUrl) || !isAllowedCheckoutUrl(cancelUrl)) {
      return jsonResponse({ error: "invalid_url" }, 400);
    }

    const { data: cartRows, error: cartErr } = await admin
      .from("catalog_cart_items")
      .select("product_id")
      .eq("user_id", user.id);
    if (cartErr) throw cartErr;

    const uniqueProductIds: string[] = [];
    const seen = new Set<string>();
    for (const row of (cartRows ?? []) as CartItemRow[]) {
      if (!row.product_id || seen.has(row.product_id)) continue;
      seen.add(row.product_id);
      uniqueProductIds.push(row.product_id);
    }

    if (uniqueProductIds.length === 0) {
      return jsonResponse({ error: "empty_cart" }, 400);
    }

    const { data: productRows, error: productErr } = await admin
      .from("catalog_products")
      .select(
        "id, price_minor, price_usd_minor, price_eur_minor, published, catalog_product_i18n ( locale, title )",
      )
      .in("id", uniqueProductIds);
    if (productErr) throw productErr;

    const productsById = new Map<string, ProductRow>();
    for (const row of (productRows ?? []) as ProductRow[]) {
      productsById.set(row.id, row);
    }

    const lines: CheckoutLine[] = [];
    const currency = readCheckoutCurrency(body, req);
    if (!currency) {
      return jsonResponse({ error: "invalid_currency" }, 400);
    }

    for (const productId of uniqueProductIds) {
      const product = productsById.get(productId);
      if (!product || !product.published) {
        return jsonResponse({ error: "unpublished_product" }, 400);
      }
      const priceMinor = priceMinorFor(product, currency);
      if (!isFinitePrice(priceMinor)) {
        return jsonResponse({ error: "unpublished_product" }, 400);
      }
      lines.push({
        productId,
        title: titleFromI18n(product.catalog_product_i18n),
        priceMinor,
        unitAmount: 0,
      });
    }

    if (lines.length === 0) {
      return jsonResponse({ error: "empty_cart" }, 400);
    }

    const { data: settingsRow, error: settingsErr } = await admin
      .from("catalog_settings")
      .select("value")
      .eq("key", "wholesale_tiers")
      .maybeSingle();
    if (settingsErr) throw settingsErr;

    const tiers = parseWholesaleTiers(settingsRow?.value);
    const totals = computeCartTotalsFromPrices(
      lines.map((line) => line.priceMinor),
      tiers,
    );

    for (const line of lines) {
      line.unitAmount = discountedPriceMinor(line.priceMinor, totals.percent);
    }

    if (totals.payableMinor < 1 || lines.some((line) => line.unitAmount < 1)) {
      return jsonResponse({ error: "invalid_amount" }, 400);
    }

    const { data: order, error: orderErr } = await admin
      .from("catalog_orders")
      .insert({
        user_id: user.id,
        status: "pending",
        subtotal_minor: totals.subtotalMinor,
        discount_minor: totals.discountMinor,
        total_minor: totals.payableMinor,
        currency,
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    const { error: itemsErr } = await admin.from("catalog_order_items").insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        title_snapshot: line.title,
        price_minor: line.priceMinor,
        qty: 1,
      })),
    );
    if (itemsErr) {
      await admin.from("catalog_orders").delete().eq("id", order.id);
      throw itemsErr;
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-06-20",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((line) => ({
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: line.unitAmount,
          product_data: {
            name: line.title,
          },
        },
      })),
      success_url: withSessionPlaceholder(successUrl),
      cancel_url: cancelUrl,
      client_reference_id: order.id,
      metadata: {
        catalog_order_id: order.id,
        catalog_user_id: user.id,
        catalog_currency: currency,
      },
      payment_intent_data: {
        metadata: {
          catalog_order_id: order.id,
          catalog_user_id: user.id,
          catalog_currency: currency,
        },
      },
    });

    if (!session.url) {
      await admin
        .from("catalog_orders")
        .update({ status: "failed" })
        .eq("id", order.id)
        .eq("status", "pending");
      return jsonResponse({ error: "checkout_failed" }, 500);
    }

    const { error: sessionErr } = await admin
      .from("catalog_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);
    if (sessionErr) throw sessionErr;

    return jsonResponse({
      url: session.url,
      order_id: order.id,
    });
  } catch (err) {
    console.error("catalog-create-checkout error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
