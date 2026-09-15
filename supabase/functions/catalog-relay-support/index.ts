import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const TELEGRAM_API = "https://api.telegram.org";
const PREVIEW_LIMIT = 800;
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

function replyKeyboard(userId: string): string {
  return JSON.stringify({
    inline_keyboard: [
      [{ text: "Ответить на сайте", callback_data: `catreply:${userId}` }],
    ],
  });
}

function ticketText(params: {
  email: string;
  userId: string;
  body: string;
  filename?: string;
}): string {
  const lines = [
    "Тикет с сайта каталога",
    `Email: ${params.email}`,
    `user_id: ${params.userId}`,
  ];
  if (params.filename) {
    lines.push(`Вложение: ${params.filename}`);
  }
  lines.push("", previewText(params.body, PREVIEW_LIMIT) || "—");
  return lines.join("\n");
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
    console.error("catalog-relay-support telegram", method, res.status);
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
  replyMarkup: string,
): Promise<boolean> {
  const form = new FormData();
  form.set("chat_id", String(chatId));
  form.set("caption", previewText(caption, CAPTION_LIMIT));
  form.set("reply_markup", replyMarkup);
  form.set(method === "sendPhoto" ? "photo" : "document", file, filename);
  const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    console.error("catalog-relay-support telegram file", method, res.status);
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

    const { data: profileRow, error: profileErr } = await admin
      .from("catalog_profiles")
      .select("email")
      .eq("id", user.id)
      .maybeSingle();
    if (profileErr) throw profileErr;

    const email =
      (profileRow as ProfileRow | null)?.email?.trim() ||
      user.email?.trim() ||
      "—";

    const storagePath = message.storage_path?.trim() || null;
    if (storagePath) {
      const expectedPrefix = `${user.id}/`;
      if (!storagePath.startsWith(expectedPrefix) || storagePath.includes("..")) {
        return jsonResponse({ error: "forbidden" }, 403);
      }
    }

    const filename = storagePath ? filenameFromPath(storagePath) : undefined;
    const text = ticketText({
      email,
      userId: user.id,
      body: message.body,
      filename,
    });
    const keyboard = replyKeyboard(user.id);

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
        let ok = false;
        if (attachment) {
          ok = await telegramFile(
            botToken,
            attachment.image ? "sendPhoto" : "sendDocument",
            adminId,
            attachment.blob,
            attachment.filename,
            text,
            keyboard,
          );
          if (!ok && attachment.image) {
            ok = await telegramFile(
              botToken,
              "sendDocument",
              adminId,
              attachment.blob,
              attachment.filename,
              text,
              keyboard,
            );
          }
        }
        if (!ok) {
          ok = await telegramJson(botToken, "sendMessage", {
            chat_id: adminId,
            text,
            reply_markup: JSON.parse(keyboard),
          });
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
