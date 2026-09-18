import { FunctionsHttpError } from "@supabase/supabase-js";
import type { SupportFromRole, SupportMessage } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  AuthRequiredError,
  requireUserId,
  throwIfPostgrestError,
} from "@/lib/catalog/repo/internal";

export const SUPPORT_BUCKET = "catalog-support";
export const SUPPORT_MAX_BYTES = 12 * 1024 * 1024;
const SIGNED_URL_TTL_SEC = 60 * 60;
const UUID_FILE_PREFIX_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-/i;
const SUPPORT_IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|bmp|avif|heic|heif)$/i;

export type SupportImageTransform = {
  width: number;
  height: number;
  quality: number;
};

export const SUPPORT_PREVIEW_TRANSFORM: SupportImageTransform = {
  width: 960,
  height: 960,
  quality: 68,
};

export class SupportRelayError extends Error {
  readonly name = "SupportRelayError";
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type SupportMessageRow = {
  id: string;
  user_id: string;
  from_role: string;
  body: string;
  storage_path: string | null;
  created_at: string;
};

function isSupportFromRole(value: string): value is SupportFromRole {
  return value === "user" || value === "agent";
}

function mapSupportMessageRow(row: SupportMessageRow): SupportMessage | null {
  if (!isSupportFromRole(row.from_role)) return null;
  return {
    id: row.id,
    userId: row.user_id,
    fromRole: row.from_role,
    body: row.body,
    storagePath: row.storage_path,
    createdAt: row.created_at,
  };
}

export async function listSupportMessages(): Promise<SupportMessage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_support_messages")
    .select("id, user_id, from_role, body, storage_path, created_at")
    .order("created_at", { ascending: true });

  throwIfPostgrestError(error);

  const result: SupportMessage[] = [];
  for (const row of (data ?? []) as SupportMessageRow[]) {
    const message = mapSupportMessageRow(row);
    if (message) result.push(message);
  }
  return result;
}

export async function sendSupportMessage(
  body: string,
  storagePath?: string | null,
): Promise<SupportMessage | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("catalog_support_messages")
    .insert({
      user_id: userId,
      from_role: "user",
      body,
      storage_path: storagePath ?? null,
    })
    .select("id, user_id, from_role, body, storage_path, created_at")
    .single();

  throwIfPostgrestError(error);
  if (!data) return null;

  return mapSupportMessageRow(data as SupportMessageRow);
}

/** Storage object keys must be ASCII; Cyrillic etc. → InvalidKey. */
const CYR_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function transliterateForStorageKey(value: string): string {
  let out = "";
  for (const ch of value) {
    const lower = ch.toLowerCase();
    const mapped = CYR_TO_LAT[lower];
    if (mapped !== undefined) {
      out += ch === lower ? mapped : mapped.toUpperCase();
      continue;
    }
    out += ch;
  }
  return out;
}

function sanitizeFilename(name: string): string {
  const trimmed = name.trim().slice(0, 80);
  const cleaned = transliterateForStorageKey(trimmed)
    .replace(/[/\\]+/g, "")
    .replace(/\.\.+/g, ".")
    // Storage keys: ASCII only (Cyrillic → InvalidKey on supabase/storage-api).
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+/, "")
    .replace(/[._-]+$/, "");
  return cleaned || "file";
}

export function supportFilename(storagePath: string): string {
  const last = storagePath.split("/").pop() ?? "file";
  if (UUID_FILE_PREFIX_RE.test(last)) {
    return last.replace(UUID_FILE_PREFIX_RE, "") || last;
  }
  return last;
}

export function isSupportImagePath(storagePath: string): boolean {
  return SUPPORT_IMAGE_EXT_RE.test(storagePath);
}

export function isSupportImageFile(file: File): boolean {
  if (file.type === "image/svg+xml") return false;
  if (file.type.startsWith("image/")) return true;
  return SUPPORT_IMAGE_EXT_RE.test(file.name);
}

function canTransformImage(storagePath: string): boolean {
  return isSupportImagePath(storagePath) && !/\.gif$/i.test(storagePath);
}

export async function uploadSupportAttachment(file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const userId = await requireUserId();
  if (file.size <= 0) throw new Error("empty_file");
  if (file.size > SUPPORT_MAX_BYTES) throw new Error("file_too_large");

  const path = `${userId}/${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;
  const { error } = await supabase.storage.from(SUPPORT_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function createSupportAttachmentSignedUrl(
  storagePath: string,
  transform?: SupportImageTransform | null,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await requireUserId();
  const prefix = `${userId}/`;
  if (!storagePath.startsWith(prefix) || storagePath.includes("..")) {
    return null;
  }

  const preview = transform && canTransformImage(storagePath) ? transform : null;
  const options = preview
    ? {
        transform: {
          width: preview.width,
          height: preview.height,
          resize: "contain" as const,
          quality: preview.quality,
        },
      }
    : undefined;

  const { data, error } = await supabase.storage
    .from(SUPPORT_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SEC, options);
  if (!error && data?.signedUrl) return data.signedUrl;

  if (preview) {
    const fallback = await supabase.storage
      .from(SUPPORT_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SEC);
    if (!fallback.error && fallback.data?.signedUrl) {
      return fallback.data.signedUrl;
    }
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function relaySupportMessage(messageId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token?.trim();
  if (!accessToken) throw new AuthRequiredError();

  const { data, error } = await supabase.functions.invoke("catalog-relay-support", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: { messageId },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      let payload: unknown = null;
      try {
        payload = await error.context.json();
      } catch {
        payload = null;
      }
      const code =
        isRecord(payload) && typeof payload.error === "string"
          ? payload.error
          : "relay_failed";
      throw new SupportRelayError(error.context.status, code, code);
    }
    throw new SupportRelayError(0, "network", "network");
  }

  if (isRecord(data) && data.error) {
    const code = typeof data.error === "string" ? data.error : "relay_failed";
    throw new SupportRelayError(502, code, code);
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Retries transient relay failures before surfacing to the UI. */
export async function relaySupportMessageReliable(
  messageId: string,
  attempts = 3,
): Promise<void> {
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await relaySupportMessage(messageId);
      return;
    } catch (err) {
      last = err;
      if (i < attempts - 1) await wait(350 * 2 ** i);
    }
  }
  throw last instanceof Error ? last : new Error("relay_failed");
}
