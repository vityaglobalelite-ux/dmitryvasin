import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPPORT_BUCKET = "catalog-support";
function isCatalogGuest(user: {
  is_anonymous?: boolean;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): boolean {
  if (user.is_anonymous === true) return true;
  if (user.user_metadata?.catalog_guest === true) return true;
  return /@guest\.betango\.internal$/i.test(user.email ?? "");
}

type ClaimBody = {
  guestAccessToken?: unknown;
  guest_access_token?: unknown;
};

type MessageRow = {
  id: string;
  storage_path: string | null;
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

function readJsonBody(raw: unknown): ClaimBody {
  if (!raw || typeof raw !== "object") return {};
  return raw as ClaimBody;
}

function isJwt(value: string): boolean {
  const parts = value.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

function retargetPath(storagePath: string, fromId: string, toId: string): string {
  const prefix = `${fromId}/`;
  if (!storagePath.startsWith(prefix) || storagePath.includes("..")) {
    return storagePath;
  }
  return `${toId}/${storagePath.slice(prefix.length)}`;
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
      data: { user: owner },
      error: ownerErr,
    } = await userClient.auth.getUser();
    if (ownerErr || !owner || isCatalogGuest(owner)) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    let body: ClaimBody = {};
    try {
      body = readJsonBody(await req.json());
    } catch {
      body = {};
    }

    const guestAccessToken =
      asTrimmedString(body.guestAccessToken) ??
      asTrimmedString(body.guest_access_token);
    if (!guestAccessToken || !isJwt(guestAccessToken)) {
      return jsonResponse({ ok: true, claimed: false });
    }

    const {
      data: { user: guest },
      error: guestErr,
    } = await admin.auth.getUser(guestAccessToken);
    if (guestErr || !guest || !isCatalogGuest(guest)) {
      return jsonResponse({ ok: true, claimed: false });
    }
    if (!UUID_RE.test(guest.id) || !UUID_RE.test(owner.id)) {
      return jsonResponse({ error: "forbidden" }, 403);
    }
    if (guest.id === owner.id) {
      return jsonResponse({ ok: true, claimed: false });
    }

    const { data: files, error: listErr } = await admin.storage
      .from(SUPPORT_BUCKET)
      .list(guest.id, { limit: 1000 });
    if (listErr) throw listErr;

    for (const file of files ?? []) {
      if (!file.name || file.name.endsWith("/")) continue;
      const fromPath = `${guest.id}/${file.name}`;
      const toPath = `${owner.id}/${file.name}`;
      const { error: moveErr } = await admin.storage
        .from(SUPPORT_BUCKET)
        .move(fromPath, toPath);
      if (moveErr) {
        console.error("catalog-claim-support move failed", fromPath, moveErr);
        return jsonResponse({ error: "claim_failed" }, 502);
      }
    }

    const { data: messageRows, error: messageErr } = await admin
      .from("catalog_support_messages")
      .select("id, storage_path")
      .eq("user_id", guest.id);
    if (messageErr) throw messageErr;

    for (const row of (messageRows ?? []) as MessageRow[]) {
      const storagePath = row.storage_path
        ? retargetPath(row.storage_path, guest.id, owner.id)
        : null;
      const { error: updateErr } = await admin
        .from("catalog_support_messages")
        .update({
          user_id: owner.id,
          storage_path: storagePath,
        })
        .eq("id", row.id)
        .eq("user_id", guest.id);
      if (updateErr) throw updateErr;
    }

    const { error: noteErr } = await admin
      .from("catalog_notifications")
      .update({
        user_id: owner.id,
        href: "/support/",
      })
      .eq("user_id", guest.id);
    if (noteErr) throw noteErr;

    const { error: deleteErr } = await admin.auth.admin.deleteUser(guest.id);
    if (deleteErr) {
      console.error("catalog-claim-support delete guest failed", deleteErr);
    }

    return jsonResponse({ ok: true, claimed: true });
  } catch (err) {
    console.error("catalog-claim-support error:", err);
    return jsonResponse({ error: "claim_failed" }, 500);
  }
});
