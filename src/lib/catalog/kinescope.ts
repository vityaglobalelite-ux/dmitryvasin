import { FunctionsHttpError } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";
import type { Locale } from "@/lib/catalog/types";

export type KinescopeEmbed = {
  embedUrl: string;
};

export type KinescopeTokenErrorCode =
  | "auth"
  | "forbidden"
  | "not_found"
  | "config"
  | "not_implemented"
  | "network"
  | "invalid_response";

export class KinescopeTokenError extends Error {
  readonly code: KinescopeTokenErrorCode;

  constructor(code: KinescopeTokenErrorCode, message: string) {
    super(message);
    this.name = "KinescopeTokenError";
    this.code = code;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Official Kinescope iframe only — never mp4 / HLS / CDN file URLs. */
export function isOfficialKinescopeEmbed(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host !== "kinescope.io" && host !== "www.kinescope.io") return false;
    if (!parsed.pathname.startsWith("/embed/")) return false;
    if (parsed.pathname.length <= "/embed/".length) return false;
    const path = parsed.pathname.toLowerCase();
    if (path.includes(".mp4") || path.includes(".m3u8")) return false;
    return true;
  } catch {
    return false;
  }
}

function parseEmbed(data: unknown): KinescopeEmbed | null {
  if (!isRecord(data)) return null;
  const embedUrl =
    typeof data.embedUrl === "string"
      ? data.embedUrl.trim()
      : typeof data.embed_url === "string"
        ? data.embed_url.trim()
        : "";
  if (!embedUrl || !isOfficialKinescopeEmbed(embedUrl)) return null;
  return { embedUrl };
}

function codeForServerError(
  errorCode: string | undefined,
  status?: number,
): KinescopeTokenErrorCode {
  if (status === 401 || errorCode === "unauthorized") return "auth";
  if (errorCode === "forbidden" || status === 403) return "forbidden";
  if (errorCode === "not_found" || status === 404) return "not_found";
  if (status === 501 || errorCode === "not_implemented") return "not_implemented";
  return "network";
}

function messageForServerError(code: KinescopeTokenErrorCode): string {
  if (code === "auth") {
    return "Сессия истекла. Войдите снова, чтобы смотреть урок.";
  }
  if (code === "forbidden") {
    return "Нет доступа к этому видео.";
  }
  if (code === "not_found") {
    return "Видео для этого урока ещё не подключено.";
  }
  if (code === "not_implemented") {
    return "Плеер временно недоступен. Попробуйте чуть позже.";
  }
  return "Не удалось загрузить видео. Попробуйте ещё раз.";
}

/**
 * POST kinescope-token with the user JWT.
 * Never reads `catalog_product_videos` from the browser.
 */
export async function fetchKinescopeEmbed(
  productId: string,
  locale: Locale = "ru",
): Promise<KinescopeEmbed> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new KinescopeTokenError(
      "config",
      "Сервис видео недоступен. Проверьте подключение и попробуйте позже.",
    );
  }

  const id = productId.trim();
  if (!id) {
    throw new KinescopeTokenError("not_found", "Не указан материал.");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token?.trim();
  if (!accessToken) {
    throw new KinescopeTokenError(
      "auth",
      "Войдите в аккаунт, чтобы смотреть урок.",
    );
  }

  const { data, error } = await supabase.functions.invoke("kinescope-token", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: {
      productId: id,
      locale,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      let payload: unknown = null;
      try {
        payload = await error.context.json();
      } catch {
        payload = null;
      }
      const status = error.context.status;
      const serverCode =
        isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : undefined;
      const mapped =
        serverCode === "forbidden_origin"
          ? "network"
          : codeForServerError(serverCode, status);
      throw new KinescopeTokenError(mapped, messageForServerError(mapped));
    }
    throw new KinescopeTokenError(
      "network",
      "Не удалось связаться с сервером видео. Попробуйте ещё раз.",
    );
  }

  const parsed = parseEmbed(data);
  if (!parsed) {
    throw new KinescopeTokenError(
      "invalid_response",
      "Сервер вернул неожиданный ответ. Попробуйте позже.",
    );
  }

  return parsed;
}
