import { FunctionsHttpError } from "@supabase/supabase-js";
import { siteRoutes } from "@/lib/catalog/routes";
import { getSupabase } from "@/lib/supabase/client";

export type StartCatalogCheckoutOptions = {
  successUrl?: string;
  cancelUrl?: string;
};

export type StartCatalogCheckoutResult = {
  url: string;
  orderId?: string;
};

export type CatalogCheckoutErrorCode =
  | "auth"
  | "config"
  | "cart"
  | "validation"
  | "not_implemented"
  | "network"
  | "invalid_response";

export class CatalogCheckoutError extends Error {
  readonly code: CatalogCheckoutErrorCode;

  constructor(code: CatalogCheckoutErrorCode, message: string) {
    super(message);
    this.name = "CatalogCheckoutError";
    this.code = code;
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

function messageForServerError(
  errorCode: string | undefined,
  status?: number,
): string {
  if (status === 401 || errorCode === "unauthorized") {
    return "Сессия истекла. Войдите снова и повторите оплату.";
  }
  if (errorCode === "empty_cart") {
    return "Корзина пуста. Добавьте уроки и повторите оплату.";
  }
  if (errorCode === "mixed_currencies") {
    return "В корзине товары в разных валютах. Уберите лишние и повторите.";
  }
  if (errorCode === "unpublished_product") {
    return "Один из товаров больше недоступен. Обновите корзину и повторите.";
  }
  if (errorCode === "invalid_url" || errorCode === "invalid_amount") {
    return "Не удалось начать оплату. Обновите страницу и попробуйте ещё раз.";
  }
  if (status === 501 || errorCode === "not_implemented") {
    return "Оплата временно недоступна — мы уже подключаем Stripe. Попробуйте чуть позже.";
  }
  return "Не удалось начать оплату. Попробуйте ещё раз или напишите в поддержку.";
}

function codeForServerError(
  errorCode: string | undefined,
  status?: number,
): CatalogCheckoutErrorCode {
  if (status === 401 || errorCode === "unauthorized") return "auth";
  if (
    errorCode === "empty_cart" ||
    errorCode === "mixed_currencies" ||
    errorCode === "unpublished_product"
  ) {
    return "cart";
  }
  if (errorCode === "invalid_url" || errorCode === "invalid_amount") {
    return "validation";
  }
  if (status === 501 || errorCode === "not_implemented") return "not_implemented";
  return "network";
}

function parseInvokeSuccess(data: unknown): StartCatalogCheckoutResult | null {
  if (!isRecord(data)) return null;
  if (typeof data.url !== "string" || !data.url.trim()) return null;
  const orderId =
    typeof data.orderId === "string" && data.orderId.trim()
      ? data.orderId
      : typeof data.order_id === "string" && data.order_id.trim()
        ? data.order_id
        : undefined;
  return { url: data.url, orderId };
}

/** POST catalog-create-checkout with the user JWT. Server prices the cart. */
export async function startCatalogCheckout(
  opts?: StartCatalogCheckoutOptions,
): Promise<StartCatalogCheckoutResult> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new CatalogCheckoutError(
      "config",
      "Сервис оплаты недоступен. Проверьте подключение и попробуйте позже.",
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token?.trim();
  if (!accessToken) {
    throw new CatalogCheckoutError(
      "auth",
      "Войдите в аккаунт, чтобы перейти к оплате.",
    );
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
        messageForServerError(serverCode, status),
      );
    }
    throw new CatalogCheckoutError(
      "network",
      "Не удалось связаться с сервером оплаты. Попробуйте ещё раз.",
    );
  }

  const parsed = parseInvokeSuccess(data);
  if (!parsed) {
    throw new CatalogCheckoutError(
      "invalid_response",
      "Сервер вернул неожиданный ответ. Попробуйте позже.",
    );
  }

  return parsed;
}
