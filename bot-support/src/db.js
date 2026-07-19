const { createClient } = require("@supabase/supabase-js");
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

module.exports = {
  upsertUser,
  getOrCreateChat,
  getChatById,
  getChatByTelegramId,
  addMessage,
  listMessages,
  markReadForUser,
  markReadForAdmin,
};
