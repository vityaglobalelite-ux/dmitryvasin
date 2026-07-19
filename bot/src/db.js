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

async function getUser(telegramId) {
  const { data, error } = await supabase
    .from("bot_users")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateUser(telegramId, patch) {
  const { data, error } = await supabase
    .from("bot_users")
    .update({ ...patch, updated_at: nowIso() })
    .eq("telegram_id", telegramId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function createSubscription(row) {
  const { data, error } = await supabase
    .from("subscriptions")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function getActiveSubscription(telegramId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("telegram_id", telegramId)
    .eq("status", "active")
    .gt("access_ends_at", nowIso())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function updateSubscription(id, patch) {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function upsertVipIntake(telegramId, patch) {
  const existing = await getVipIntake(telegramId);
  if (!existing) {
    const { data, error } = await supabase
      .from("vip_intake")
      .insert({
        telegram_id: telegramId,
        step: "q1",
        ...patch,
        updated_at: nowIso(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("vip_intake")
    .update({ ...patch, updated_at: nowIso() })
    .eq("telegram_id", telegramId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function getVipIntake(telegramId) {
  const { data, error } = await supabase
    .from("vip_intake")
    .select("*")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function scheduleMessage(telegramId, kind, sendAt, payload = {}) {
  const { data, error } = await supabase
    .from("scheduled_messages")
    .insert({
      telegram_id: telegramId,
      kind,
      send_at: sendAt.toISOString(),
      payload,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function cancelMessages(telegramId, kinds) {
  let query = supabase
    .from("scheduled_messages")
    .update({ cancelled_at: nowIso() })
    .eq("telegram_id", telegramId)
    .is("sent_at", null)
    .is("cancelled_at", null);
  if (kinds?.length) {
    query = query.in("kind", kinds);
  }
  const { error } = await query;
  if (error) throw error;
}

async function fetchDueMessages(limit = 50) {
  const { data, error } = await supabase
    .from("scheduled_messages")
    .select("*")
    .is("sent_at", null)
    .is("cancelled_at", null)
    .lte("send_at", nowIso())
    .order("send_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function markMessageSent(id) {
  const { error } = await supabase
    .from("scheduled_messages")
    .update({ sent_at: nowIso() })
    .eq("id", id);
  if (error) throw error;
}

async function getSetting(key) {
  const { data, error } = await supabase
    .from("bot_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  return data?.value || null;
}

async function setSetting(key, value) {
  const { error } = await supabase.from("bot_settings").upsert({
    key,
    value,
    updated_at: nowIso(),
  });
  if (error) throw error;
}

module.exports = {
  supabase,
  upsertUser,
  getUser,
  updateUser,
  createSubscription,
  getActiveSubscription,
  updateSubscription,
  upsertVipIntake,
  getVipIntake,
  scheduleMessage,
  cancelMessages,
  fetchDueMessages,
  markMessageSent,
  getSetting,
  setSetting,
};
