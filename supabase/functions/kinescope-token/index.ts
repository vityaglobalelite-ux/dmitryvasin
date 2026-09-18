import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const LOCALES = ["ru", "en"] as const;
type CatalogLocale = (typeof LOCALES)[number];

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PLAYBACK_TTL_SEC = 20 * 60;
const KINESCOPE_API = "https://api.kinescope.io";
const EMBED_HOSTS = new Set(["kinescope.io", "www.kinescope.io"]);

type TokenBody = {
  productId?: unknown;
  product_id?: unknown;
  locale?: unknown;
};

type AccessRow = {
  status: string;
  expires_at: string;
};

type VideoRow = {
  kinescope_id: string;
  locale: string;
};

type KinescopeVideoData = {
  id?: unknown;
  project_id?: unknown;
  embed_link?: unknown;
  play_link?: unknown;
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

function isLocale(value: string): value is CatalogLocale {
  return (LOCALES as readonly string[]).includes(value);
}

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function readJsonBody(raw: unknown): TokenBody {
  if (!raw || typeof raw !== "object") return {};
  return raw as TokenBody;
}

function stripSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function parseOriginAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => stripSlash(part.trim()))
    .filter(Boolean);
}

function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

function requestOrigin(req: Request): string | null {
  const origin = asTrimmedString(req.headers.get("Origin"));
  if (origin) return stripSlash(origin);
  const referer = asTrimmedString(req.headers.get("Referer"));
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function originAllowed(origin: string | null, allowlist: string[]): boolean {
  if (!origin) return true;
  if (isLocalOrigin(origin)) return true;
  if (allowlist.length === 0) return true;
  return allowlist.includes(stripSlash(origin));
}

function otherLocale(locale: CatalogLocale): CatalogLocale {
  return locale === "ru" ? "en" : "ru";
}

function pickVideoId(
  rows: VideoRow[],
  locale: CatalogLocale,
): string | null {
  const preferred = rows.find((row) => row.locale === locale)?.kinescope_id
    ?.trim();
  if (preferred) return preferred;
  const fallback = rows.find((row) => row.locale === otherLocale(locale))
    ?.kinescope_id
    ?.trim();
  return fallback || null;
}

function base64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(
    /=+$/g,
    "",
  );
}

function base64UrlJson(value: unknown): string {
  return base64Url(new TextEncoder().encode(JSON.stringify(value)));
}

async function signPlaybackJwt(params: {
  secret: string;
  userId: string;
  productId: string;
  videoId: string;
  locale: CatalogLocale;
  expiresAtMs: number;
}): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = Math.min(
    nowSec + PLAYBACK_TTL_SEC,
    Math.floor(params.expiresAtMs / 1000),
  );
  const header = base64UrlJson({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlJson({
    sub: params.userId,
    pid: params.productId,
    vid: params.videoId,
    loc: params.locale,
    iss: "catalog-kinescope-token",
    aud: "kinescope",
    iat: nowSec,
    exp: Math.max(expSec, nowSec + 1),
  });
  const data = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(params.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return `${data}.${base64Url(new Uint8Array(signature))}`;
}

function isOfficialEmbed(url: URL): boolean {
  if (url.protocol !== "https:") return false;
  if (!EMBED_HOSTS.has(url.hostname.toLowerCase())) return false;
  if (!url.pathname.startsWith("/embed/")) return false;
  const path = url.pathname.toLowerCase();
  if (path.includes(".mp4") || path.includes(".m3u8")) return false;
  return url.pathname.length > "/embed/".length;
}

function embedUrlFromKinescope(data: KinescopeVideoData, videoId: string): URL {
  const fromApi = asTrimmedString(data.embed_link);
  if (fromApi) {
    const parsed = new URL(fromApi);
    if (isOfficialEmbed(parsed)) {
      return new URL(
        `${parsed.origin}${parsed.pathname}`,
      );
    }
  }
  return new URL(`https://kinescope.io/embed/${encodeURIComponent(videoId)}`);
}

async function fetchKinescopeVideo(
  apiToken: string,
  videoId: string,
): Promise<KinescopeVideoData> {
  const res = await fetch(
    `${KINESCOPE_API}/v1/videos/${encodeURIComponent(videoId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: "application/json",
      },
    },
  );
  if (res.status === 404) {
    throw Object.assign(new Error("kinescope_not_found"), { status: 404 });
  }
  if (!res.ok) {
    throw Object.assign(new Error(`kinescope_http_${res.status}`), {
      status: 502,
    });
  }
  const json: unknown = await res.json();
  if (!json || typeof json !== "object") {
    throw Object.assign(new Error("kinescope_invalid"), { status: 502 });
  }
  const data = (json as { data?: unknown }).data;
  if (!data || typeof data !== "object") {
    throw Object.assign(new Error("kinescope_invalid"), { status: 502 });
  }
  return data as KinescopeVideoData;
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

  const kinescopeApiToken = Deno.env.get("KINESCOPE_API_TOKEN")?.trim();
  if (!kinescopeApiToken) {
    return jsonResponse({ error: "not_implemented" }, 501);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
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
    if (userErr || !user || user.is_anonymous === true || user.user_metadata?.catalog_guest === true) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let body: TokenBody = {};
    try {
      body = readJsonBody(await req.json());
    } catch {
      body = {};
    }

    const productId =
      asTrimmedString(body.productId) ?? asTrimmedString(body.product_id);
    if (!productId || !UUID_RE.test(productId)) {
      return jsonResponse({ error: "invalid_body" }, 400);
    }

    const localeRaw = asTrimmedString(body.locale) ?? "ru";
    if (!isLocale(localeRaw)) {
      return jsonResponse({ error: "invalid_body" }, 400);
    }
    const locale = localeRaw;

    const allowlist = parseOriginAllowlist(
      Deno.env.get("CATALOG_PUBLIC_ORIGIN"),
    );
    if (!originAllowed(requestOrigin(req), allowlist)) {
      return jsonResponse({ error: "forbidden_origin" }, 403);
    }

    const { data: accessRow, error: accessErr } = await admin
      .from("catalog_access")
      .select("status, expires_at")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .maybeSingle();
    if (accessErr) throw accessErr;

    const access = accessRow as AccessRow | null;
    const expiresAtMs = access ? Date.parse(access.expires_at) : NaN;
    const hasActiveAccess =
      access?.status === "active" &&
      Number.isFinite(expiresAtMs) &&
      expiresAtMs > Date.now();
    if (!hasActiveAccess) {
      return jsonResponse({ error: "forbidden" }, 403);
    }

    const { data: videoRows, error: videoErr } = await admin
      .from("catalog_product_videos")
      .select("kinescope_id, locale")
      .eq("product_id", productId);
    if (videoErr) throw videoErr;

    const kinescopeId = pickVideoId((videoRows ?? []) as VideoRow[], locale);
    if (!kinescopeId) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    let video: KinescopeVideoData;
    try {
      video = await fetchKinescopeVideo(kinescopeApiToken, kinescopeId);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        return jsonResponse({ error: "not_found" }, 404);
      }
      console.error("kinescope-token kinescope api:", err);
      return jsonResponse({ error: "kinescope_unavailable" }, 502);
    }

    const expectedProject = Deno.env.get("KINESCOPE_PROJECT_ID")?.trim();
    const videoProject = asTrimmedString(video.project_id);
    if (expectedProject && videoProject && videoProject !== expectedProject) {
      return jsonResponse({ error: "not_found" }, 404);
    }

    const resolvedId = asTrimmedString(video.id) ?? kinescopeId;
    const embed = embedUrlFromKinescope(video, resolvedId);
    if (!isOfficialEmbed(embed)) {
      return jsonResponse({ error: "kinescope_unavailable" }, 502);
    }

    const signingSecret =
      Deno.env.get("KINESCOPE_PLAYBACK_JWT_SECRET")?.trim() ||
      kinescopeApiToken;
    const drmauthtoken = await signPlaybackJwt({
      secret: signingSecret,
      userId: user.id,
      productId,
      videoId: resolvedId,
      locale,
      expiresAtMs,
    });

    embed.searchParams.set("drmauthtoken", drmauthtoken);
    embed.searchParams.set("preload", "0");
    const playerId = Deno.env.get("KINESCOPE_PLAYER_ID")?.trim();
    if (playerId) {
      embed.searchParams.set("player_id", playerId);
    }

    return jsonResponse({ embedUrl: embed.toString() });
  } catch (err) {
    console.error("kinescope-token error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ error: message }, 500);
  }
});
