const { createClient } = require("@supabase/supabase-js");
const { randomUUID } = require("crypto");
const ws = require("ws");
const { config } = require("./config");

const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: ws },
});

function nowIso() {
  return new Date().toISOString();
}

async function upsertUser(from) {
  const row = {
    telegram_id: from.id,
    username: from.username || null,
    first_name: from.first_name || null,
    last_name: from.last_name || null,
    updated_at: nowIso(),
  };
  const { data, error } = await supabase
    .from("bot_users")
    .upsert(row, { onConflict: "telegram_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function getOrCreateChat(from) {
  await upsertUser(from);
  const { data: existing, error: findErr } = await supabase
    .from("chats")
    .select("*")
    .eq("telegram_id", from.id)
    .maybeSingle();
  if (findErr) throw findErr;
  if (existing) {
    const { data, error } = await supabase
      .from("chats")
      .update({
        username: from.username || existing.username,
        status: "open",
        updated_at: nowIso(),
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("chats")
    .insert({
      telegram_id: from.id,
      username: from.username || null,
      status: "open",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function getChatById(chatId) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getChatByTelegramId(telegramId) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function addMessage({
  chatId,
  isUser,
  body,
  telegramMessageId = null,
}) {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      chat_id: chatId,
      is_user: isUser,
      body,
      telegram_message_id: telegramMessageId,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function listMessages(chatId, limit) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []).reverse();
}

async function markReadForUser(chatId) {
  const { error } = await supabase.rpc("mark_chat_read_for_user", {
    p_chat_id: chatId,
  });
  if (error) throw error;
}

async function markReadForAdmin(chatId) {
  const { error } = await supabase.rpc("mark_chat_read_for_admin", {
    p_chat_id: chatId,
  });
  if (error) throw error;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;
const SUPPORT_BUCKET = "catalog-support";
const SUPPORT_MAX_BYTES = 12 * 1024 * 1024;

function catalogWho(profile) {
  const email = (profile?.email || "").trim();
  if (!email || GUEST_EMAIL_RE.test(email)) return "Гость · без email";
  return email;
}

function sanitizeFilename(name) {
  const trimmed = String(name || "file").trim().slice(0, 80);
  const cleaned = trimmed
    .replace(/[/\\]+/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^\.+/, "");
  return cleaned || "file";
}

async function getCatalogProfile(userId) {
  if (!UUID_RE.test(String(userId || ""))) return null;
  const { data, error } = await supabase
    .from("catalog_profiles")
    .select("id, email")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function addCatalogAgentMessage({ userId, body, storagePath = null }) {
  const { data, error } = await supabase
    .from("catalog_support_messages")
    .insert({
      user_id: userId,
      from_role: "agent",
      body,
      storage_path: storagePath,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function uploadCatalogSupportFile({
  userId,
  buffer,
  filename,
  contentType,
}) {
  if (!UUID_RE.test(String(userId || ""))) {
    throw new Error("invalid_user");
  }
  if (!buffer?.length) throw new Error("empty_file");
  if (buffer.length > SUPPORT_MAX_BYTES) throw new Error("file_too_large");
  const safe = sanitizeFilename(filename);
  const path = `${userId}/${randomUUID()}-${safe}`;
  const { error } = await supabase.storage
    .from(SUPPORT_BUCKET)
    .upload(path, buffer, {
      contentType: contentType || "application/octet-stream",
      upsert: false,
    });
  if (error) throw error;
  return path;
}

async function addCatalogSupportReplyNotification({ userId, body }) {
  const preview =
    body.length > 240 ? `${body.slice(0, 240)}…` : body;
  const { error } = await supabase.from("catalog_notifications").insert({
    user_id: userId,
    type: "support_reply",
    title: "Ответ поддержки",
    body: preview,
    href: "/support/",
    read: false,
  });
  if (error) throw error;
}

module.exports = {
  upsertUser,
  getOrCreateChat,
  getChatById,
  getChatByTelegramId,
  addMessage,
  listMessages,
  markReadForUser,
  markReadForAdmin,
  getCatalogProfile,
  catalogWho,
  addCatalogAgentMessage,
  uploadCatalogSupportFile,
  addCatalogSupportReplyNotification,
};
