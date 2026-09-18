import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { isCatalogGuest } from "../_shared/catalog-guest.ts";
import {
  ticketHtml,
  ticketPlain,
  type CatalogPerson,
} from "../_shared/catalog-who.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TELEGRAM_API = "https://api.telegram.org";
const CAPTION_LIMIT = 1024;
const SUPPORT_BUCKET = "catalog-support";
const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|avif)$/i;

type RelayBody = {
  messageId?: unknown;
  message_id?: unknown;
};

type SupportRow = {
  id: string;
  user_id: string;
  from_role: string;
  body: string;
  storage_path: string | null;
  created_at: string;
};

type ProfileRow = {
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
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

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function readJsonBody(raw: unknown): RelayBody {
  if (!raw || typeof raw !== "object") return {};
  return raw as RelayBody;
}

function parseAdminIds(raw: string | undefined): number[] {
  if (!raw?.trim()) return [];
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (!Number.isFinite(n) || n <= 0) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    ids.push(n);
  }
  return ids;
}

function supportBotToken(): string | undefined {
  return (
    Deno.env.get("SUPPORT_BOT_TOKEN")?.trim() ||
    Deno.env.get("TELEGRAM_SUPPORT_BOT_TOKEN")?.trim() ||
    Deno.env.get("TELEGRAM_BOT_TOKEN")?.trim() ||
    undefined
  );
}

function supportAdminIds(): number[] {
  const primary = parseAdminIds(Deno.env.get("CATALOG_SUPPORT_ADMIN_IDS"));
  if (primary.length) return primary;
  return parseAdminIds(Deno.env.get("ADMIN_TELEGRAM_IDS"));
}

function previewText(value: string, limit: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}…`;
}

const UUID_FILE_PREFIX_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-/i;

function filenameFromPath(storagePath: string): string {
  const last = storagePath.split("/").pop() ?? "file";
  if (UUID_FILE_PREFIX_RE.test(last)) {
    return last.replace(UUID_FILE_PREFIX_RE, "") || last;
  }
  return last;
}

function metaString(meta: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = meta?.[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function personFromUser(
  userId: string,
  guest: boolean,
  profile: ProfileRow | null,
  user: {
    email?: string | null;
    user_metadata?: Record<string, unknown> | null;
  },
): CatalogPerson {
  return {
    id: userId,
    guest,
    email: profile?.email ?? user.email ?? null,
    firstName:
      profile?.first_name?.trim() ||
      metaString(user.user_metadata, "catalog_first_name"),
    lastName:
      profile?.last_name?.trim() ||
      metaString(user.user_metadata, "catalog_last_name"),
  };
}

function ticketKeyboard(userId: string, hasHistory: boolean): Record<string, unknown> {
  const rows: { text: string; callback_data: string }[][] = [
    [{ text: "✍️ Ответить", callback_data: `catreply:${userId}` }],
  ];
  const second: { text: string; callback_data: string }[] = [];
  if (hasHistory) {
    second.push({ text: "📜 История", callback_data: `cathist:${userId}` });
  }
  second.push({ text: "✓ Прочитано", callback_data: `catread:${userId}` });
  rows.push(second);
  return { inline_keyboard: rows };
}

type ThreadStatus = {
  total_messages: number;
  waiting_count: number;
};

async function loadThreadStatus(
  admin: ReturnType<typeof createClient>,
  userId: string,
): Promise<ThreadStatus> {
  const rpc = await admin.rpc("catalog_support_thread_status", {
    p_user_id: userId,
  });
  const payload = !rpc.error ? rpc.data : null;
  const row = Array.isArray(payload) ? payload[0] : payload;
  if (row && typeof row === "object") {
    return {
      total_messages: Number(row.total_messages) || 0,
      waiting_count: Number(row.waiting_count) || 0,
    };
  }

  const listed = await admin
    .from("catalog_support_messages")
    .select("from_role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (listed.error || !listed.data) {
    return { total_messages: 1, waiting_count: 1 };
  }
  const rows = listed.data as { from_role: string; created_at: string }[];
  let lastAgent = "";
  for (const item of rows) {
    if (item.from_role === "agent") lastAgent = item.created_at;
  }
  const waiting = rows.filter(
    (item) => item.from_role === "user" && (!lastAgent || item.created_at > lastAgent),
  ).length;
  return { total_messages: rows.length, waiting_count: waiting };
}

function isMissingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

async function loadProfile(
  admin: ReturnType<typeof createClient>,
  userId: string,
): Promise<ProfileRow | null> {
  const full = await admin
    .from("catalog_profiles")
    .select("email, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  if (!full.error) return (full.data as ProfileRow | null) ?? null;
  if (!isMissingColumn(full.error)) throw full.error;

  const legacy = await admin
    .from("catalog_profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();
  if (legacy.error) throw legacy.error;
  return (legacy.data as ProfileRow | null) ?? null;
}

async function telegramJson(
  token: string,
  method: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 400);
    console.error("catalog-relay-support telegram", method, res.status, detail);
    return false;
  }
  return true;
}

async function telegramFile(
  token: string,
  method: "sendPhoto" | "sendDocument",
  chatId: number,
  file: Blob,
  filename: string,
  caption: string,
): Promise<boolean> {
  const form = new FormData();
  form.set("chat_id", String(chatId));
  const short = previewText(caption, CAPTION_LIMIT);
  if (short) form.set("caption", short);
  form.set(method === "sendPhoto" ? "photo" : "document", file, filename);
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 400);
    console.error("catalog-relay-support telegram file", method, res.status, detail);
    return false;
  }
  return true;
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

  const botToken = supportBotToken();
  const adminIds = supportAdminIds();
  if (!botToken || adminIds.length === 0) {
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
    if (userErr || !user) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let body: RelayBody = {};
    try {
      body = readJsonBody(await req.json());
    } catch {
      body = {};
    }

    const messageId =
      asTrimmedString(body.messageId) ?? asTrimmedString(body.message_id);

    let query = userClient
      .from("catalog_support_messages")
      .select("id, user_id, from_role, body, storage_path, created_at")
      .eq("user_id", user.id);

    if (messageId) {
      if (!UUID_RE.test(messageId)) {
        return jsonResponse({ error: "forbidden" }, 403);
      }
      query = query.eq("id", messageId);
    } else {
      query = query
        .eq("from_role", "user")
        .order("created_at", { ascending: false })
        .limit(1);
    }

    const { data: row, error: rowErr } = await query.maybeSingle();
    if (rowErr) throw rowErr;

    const message = row as SupportRow | null;
    if (
      !message ||
      message.user_id !== user.id ||
      message.from_role !== "user"
    ) {
      return jsonResponse({ error: "forbidden" }, 403);
    }

    const profileRow = await loadProfile(admin, user.id);

    const guest = isCatalogGuest(user);
    const person = personFromUser(
      user.id,
      guest,
      profileRow,
      user,
    );

    const storagePath = message.storage_path?.trim() || null;
    if (storagePath) {
      const expectedPrefix = `${user.id}/`;
      if (!storagePath.startsWith(expectedPrefix) || storagePath.includes("..")) {
        return jsonResponse({ error: "forbidden" }, 403);
      }
    }

    const filename = storagePath ? filenameFromPath(storagePath) : undefined;
    const status = await loadThreadStatus(admin, user.id);
    const ticket = {
      person,
      body: message.body,
      filename,
      createdAt: message.created_at,
      waitingCount: status.waiting_count,
      timeZone: Deno.env.get("DISPLAY_TZ")?.trim() || "Europe/Moscow",
    };
    const htmlText = ticketHtml(ticket);
    const plainText = ticketPlain(ticket);
    const markup = ticketKeyboard(user.id, status.total_messages > 1);

    let attachment: { blob: Blob; filename: string; image: boolean } | null =
      null;
    if (storagePath) {
      const { data: file, error: fileErr } = await admin.storage
        .from(SUPPORT_BUCKET)
        .download(storagePath);
      if (fileErr || !file) {
        console.error("catalog-relay-support storage download failed");
      } else {
        attachment = {
          blob: file,
          filename: filename || "file",
          image: IMAGE_EXT_RE.test(storagePath),
        };
      }
    }

    let delivered = 0;
    for (const adminId of adminIds) {
      try {
        let ok = await telegramJson(botToken, "sendMessage", {
          chat_id: adminId,
          text: htmlText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: markup,
        });
        if (!ok) {
          ok = await telegramJson(botToken, "sendMessage", {
            chat_id: adminId,
            text: plainText,
            disable_web_page_preview: true,
            reply_markup: markup,
          });
        }
        if (ok && attachment) {
          let fileOk = await telegramFile(
            botToken,
            attachment.image ? "sendPhoto" : "sendDocument",
            adminId,
            attachment.blob,
            attachment.filename,
            attachment.filename,
          );
          if (!fileOk && attachment.image) {
            fileOk = await telegramFile(
              botToken,
              "sendDocument",
              adminId,
              attachment.blob,
              attachment.filename,
              attachment.filename,
            );
          }
          if (!fileOk) {
            console.error("catalog-relay-support attachment failed", adminId);
          }
        }
        if (ok) delivered += 1;
      } catch (err) {
        console.error("catalog-relay-support notify failed", adminId, err);
      }
    }

    if (delivered === 0) {
      return jsonResponse({ error: "relay_failed" }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("catalog-relay-support error:", err);
    return jsonResponse({ error: "relay_failed" }, 500);
  }
});
