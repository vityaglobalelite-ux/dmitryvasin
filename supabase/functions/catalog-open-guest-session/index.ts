import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const GUEST_EMAIL_DOMAIN = "guest.betango.internal";
const WINDOW_MS = 60_000;
const MAX_HITS = 8;

const hits = new Map<string, { count: number; startedAt: number }>();

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function stripSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function isLocalOrigin(origin: string): boolean {
  try {
    const host = new URL(origin).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

function parseOriginAllowlist(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((part) => stripSlash(part.trim()))
    .filter(Boolean);
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
  if (!origin) return false;
  if (isLocalOrigin(origin)) return true;
  if (allowlist.length === 0) return false;
  return allowlist.includes(stripSlash(origin));
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function allowHit(ip: string): boolean {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now - current.startedAt > WINDOW_MS) {
    hits.set(ip, { count: 1, startedAt: now });
    return true;
  }
  if (current.count >= MAX_HITS) return false;
  current.count += 1;
  return true;
}

function randomSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const byte of bytes) out += byte.toString(16).padStart(2, "0");
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return jsonResponse({ error: "misconfigured" }, 500);
  }

  const allowlist = parseOriginAllowlist(Deno.env.get("CATALOG_PUBLIC_ORIGIN"));
  if (!originAllowed(requestOrigin(req), allowlist)) {
    return jsonResponse({ error: "forbidden_origin" }, 403);
  }

  if (!allowHit(clientIp(req))) {
    return jsonResponse({ error: "rate_limited" }, 429);
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const anon = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const email = `g-${crypto.randomUUID()}@${GUEST_EMAIL_DOMAIN}`;
    const password = randomSecret();

    const { error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { catalog_guest: true },
    });
    if (createErr) {
      console.error("catalog-open-guest-session createUser", createErr);
      return jsonResponse({ error: "guest_session_failed" }, 502);
    }

    const { data, error: signErr } = await anon.auth.signInWithPassword({
      email,
      password,
    });
    if (signErr || !data.session?.access_token || !data.session.refresh_token) {
      console.error("catalog-open-guest-session signIn", signErr);
      return jsonResponse({ error: "guest_session_failed" }, 502);
    }

    return jsonResponse({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });
  } catch (err) {
    console.error("catalog-open-guest-session error:", err);
    return jsonResponse({ error: "guest_session_failed" }, 500);
  }
});
