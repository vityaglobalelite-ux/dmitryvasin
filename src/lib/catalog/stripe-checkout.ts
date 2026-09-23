import { FunctionsHttpError } from "@supabase/supabase-js";
import { siteRoutes } from "@/lib/catalog/routes";
import { getSupabase } from "@/lib/supabase/client";
import { isGuestUser } from "@/lib/supabase/auth";

export type StartCatalogCheckoutOptions = {
  successUrl?: string;
  cancelUrl?: string;
  currency?: "rub" | "usd" | "eur";
  locale?: "ru" | "en";
};

export type StartCatalogCheckoutResult = {
  url: string;
  orderId?: string;
  alreadyPaid?: boolean;
};

export type CatalogCheckoutErrorCode =
  | "auth"
  | "config"
  | "cart"
  | "validation"
  | "not_implemented"
  | "network"
  | "invalid_response";

/** What the buyer is told — the UI maps each reason to localized copy. */
export type CatalogCheckoutFailure =
  | "sign_in"
  | "session_expired"
  | "empty_cart"
  | "currency"
  | "unavailable_product"
  | "not_connected"
  | "temporarily_unavailable"
  | "network"
  | "start_failed";

export class CatalogCheckoutError extends Error {
  readonly code: CatalogCheckoutErrorCode;
  readonly reason: CatalogCheckoutFailure;

  /** `detail` is for logs only; never show it to the buyer. */
  constructor(
    code: CatalogCheckoutErrorCode,
    reason: CatalogCheckoutFailure,
    detail: string = reason,
  ) {
    super(detail);
    this.name = "CatalogCheckoutError";
    this.code = code;
    this.reason = reason;
  }
}

const PENDING_ORDER_STORAGE_KEY = "catalog_checkout_pending_order_id";

export function rememberPendingCheckoutOrderId(orderId: string) {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PENDING_ORDER_STORAGE_KEY, orderId);
}

export function readPendingCheckoutOrderId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  return sessionStorage.getItem(PENDING_ORDER_STORAGE_KEY);
}

export function clearPendingCheckoutOrderId() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PENDING_ORDER_STORAGE_KEY);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function defaultCheckoutUrls(): {
  successUrl?: string;
  cancelUrl?: string;
} {
  if (typeof window === "undefined" || !window.location?.origin) {
    return {};
  }
  const origin = window.location.origin;
  return {
    successUrl: `${origin}${siteRoutes.account}`,
    cancelUrl: `${origin}${siteRoutes.checkout}`,
  };
}

function reasonForServerError(
  errorCode: string | undefined,
  status?: number,
): CatalogCheckoutFailure {
  if (status === 401 || errorCode === "unauthorized") return "session_expired";
  if (errorCode === "empty_cart") return "empty_cart";
  if (errorCode === "mixed_currencies" || errorCode === "invalid_currency") {
    return "currency";
  }
  if (errorCode === "unpublished_product") return "unavailable_product";
  if (status === 503 || errorCode === "catalog_stripe_misconfigured") {
    return "not_connected";
  }
  if (status === 501 || errorCode === "not_implemented") {
    return "temporarily_unavailable";
  }
  return "start_failed";
}

function codeForServerError(
  errorCode: string | undefined,
  status?: number,
): CatalogCheckoutErrorCode {
  if (status === 401 || errorCode === "unauthorized") return "auth";
  if (
    errorCode === "empty_cart" ||
    errorCode === "mixed_currencies" ||
    errorCode === "invalid_currency" ||
    errorCode === "unpublished_product"
  ) {
    return "cart";
  }
  if (errorCode === "invalid_url" || errorCode === "invalid_amount") {
    return "validation";
  }
  if (status === 503 || errorCode === "catalog_stripe_misconfigured") {
    return "not_implemented";
  }
  if (status === 501 || errorCode === "not_implemented") return "not_implemented";
  return "network";
}

function parseInvokeSuccess(
  data: unknown,
  fallbackPaidUrl?: string,
): StartCatalogCheckoutResult | null {
  if (!isRecord(data)) return null;
  const orderId =
    typeof data.orderId === "string" && data.orderId.trim()
      ? data.orderId
      : typeof data.order_id === "string" && data.order_id.trim()
        ? data.order_id
        : undefined;
  const sessionId =
    typeof data.session_id === "string" && data.session_id.trim()
      ? data.session_id.trim()
      : undefined;
  if (data.already_paid === true) {
    if (!fallbackPaidUrl) return null;
    const url = sessionId
      ? withQuery(fallbackPaidUrl, "session_id", sessionId)
      : fallbackPaidUrl;
    return { url, orderId, alreadyPaid: true };
  }
  if (typeof data.url !== "string" || !data.url.trim()) return null;
  return { url: data.url, orderId };
}

function withQuery(url: string, key: string, value: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${key}=${encodeURIComponent(value)}`;
}

/** POST catalog-create-checkout with the user JWT. Server prices the cart. */
export async function startCatalogCheckout(
  opts?: StartCatalogCheckoutOptions,
): Promise<StartCatalogCheckoutResult> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new CatalogCheckoutError(
      "config",
      "temporarily_unavailable",
      "Supabase client is not configured",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token?.trim();
  if (!accessToken || (session?.user && isGuestUser(session.user))) {
    throw new CatalogCheckoutError("auth", "sign_in", "No signed-in session");
  }

  const defaults = defaultCheckoutUrls();
  const successUrl = opts?.successUrl?.trim() || defaults.successUrl;
  const cancelUrl = opts?.cancelUrl?.trim() || defaults.cancelUrl;

  const { data, error } = await supabase.functions.invoke(
    "catalog-create-checkout",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        success_url: successUrl,
        cancel_url: cancelUrl,
        ...(opts?.currency ? { currency: opts.currency } : {}),
        ...(opts?.locale ? { locale: opts.locale } : {}),
      },
    },
  );

  if (error) {
    if (error instanceof FunctionsHttpError) {
      let payload: unknown = null;
      try {
        payload = await error.context.json();
      } catch {
        payload = null;
      }
      const status = error.context.status;
      const serverCode = isRecord(payload) && typeof payload.error === "string"
        ? payload.error
        : undefined;
      throw new CatalogCheckoutError(
        codeForServerError(serverCode, status),
        reasonForServerError(serverCode, status),
        `catalog-create-checkout ${status}${serverCode ? ` ${serverCode}` : ""}`,
      );
    }
    throw new CatalogCheckoutError("network", "network", error.message);
  }

  const parsed = parseInvokeSuccess(data, successUrl);
  if (!parsed) {
    throw new CatalogCheckoutError(
      "invalid_response",
      "start_failed",
      "catalog-create-checkout returned no checkout url",
    );
  }

  return parsed;
}
