const { config } = require("./config");
const db = require("./db");
const { resolveUnlockedMonths, MONTH_LABELS } = require("./channels");

const TARIFF_KINDS = new Set([
  "trial",
  "full",
  "vip",
  "month2",
  "month2_3",
  "month3",
]);

const TARIFF_NUDGE_KINDS = ["tariff_nudge_10m", "tariff_nudge_24h"];
const TRIAL_RENEW_KINDS = [
  "renew_trial_d5",
  "renew_trial_d2",
  "renew_trial_d0",
  "renew_trial_p3",
];
const MONTH2_RENEW_KINDS = [
  "renew_month2_d3",
  "renew_month2_d0",
  "renew_month2_p3",
];

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function chatIdForMonth(month) {
  const map = {
    1: config.channels.month1,
    2: config.channels.month2,
    3: config.channels.month3,
  };
  return map[month] || "";
}

function monthForChatId(chatId) {
  const id = String(chatId || "");
  if (id && id === String(config.channels.month1)) return 1;
  if (id && id === String(config.channels.month2)) return 2;
  if (id && id === String(config.channels.month3)) return 3;
  return null;
}

function knownChatIds() {
  return [config.channels.month1, config.channels.month2, config.channels.month3]
    .filter(Boolean)
    .map(String);
}

/** @deprecated single-channel helper */
async function resolveChannelId() {
  return config.channels.month1 || config.channelId || null;
}

function channelOpenUrl(channelId) {
  if (!channelId) return null;
  const raw = String(channelId).replace(/^-100/, "");
  return `https://t.me/c/${raw}/1`;
}

async function isMemberOfChat(bot, chatId, telegramId) {
  if (!chatId || !bot) return false;
  try {
    const member = await bot.telegram.getChatMember(chatId, telegramId);
    return ["creator", "administrator", "member", "restricted"].includes(
      member.status,
    );
  } catch {
    return false;
  }
}

/** @deprecated use buildAccessButtons / isMemberOfChat */
async function isChannelMember(bot, telegramId) {
  const channelId = await resolveChannelId();
  return isMemberOfChat(bot, channelId, telegramId);
}

async function createInviteForChat(bot, chatId, telegramId, previousLink = null) {
  if (!chatId) return null;
  if (previousLink) {
    try {
      await bot.telegram.revokeChatInviteLink(chatId, previousLink);
    } catch (err) {
      console.error("revokeChatInviteLink:", err.message);
    }
  }
  const link = await bot.telegram.createChatInviteLink(chatId, {
    creates_join_request: true,
    name: `u${telegramId}m`.slice(0, 32),
  });
  return link.invite_link;
}

/**
 * Create personal invite links for each unlocked month.
 * @returns {Promise<Array<{month:number, chatId:string, inviteLink:string|null, label:string}>>}
 */
async function createMonthInvites(bot, telegramId, months, previousInvites = []) {
  const prevByMonth = new Map(
    (previousInvites || []).map((row) => [row.month, row.invite_link]),
  );
  const results = [];
  for (const month of months) {
    const chatId = chatIdForMonth(month);
    if (!chatId) {
      results.push({
        month,
        chatId: null,
        inviteLink: null,
        label: MONTH_LABELS[month],
      });
      continue;
    }
    let inviteLink = null;
    try {
      inviteLink = await createInviteForChat(
        bot,
        chatId,
        telegramId,
        prevByMonth.get(month) || null,
      );
    } catch (err) {
      console.error(`createInvite month ${month}:`, err.message);
    }
    results.push({
      month,
      chatId: String(chatId),
      inviteLink,
      label: MONTH_LABELS[month],
    });
  }
  return results;
}

/**
 * Access buttons: open URL if already member, else invite link.
 */
async function buildMonthAccessRows(bot, telegramId, unlockedMonths, invitesByMonth) {
  const rows = [];
  for (const month of unlockedMonths || []) {
    const chatId = chatIdForMonth(month);
    const label = MONTH_LABELS[month] || `Месяц ${month}`;
    if (!chatId) continue;
    const member = await isMemberOfChat(bot, chatId, telegramId);
    if (member) {
      const openUrl = channelOpenUrl(chatId);
      if (openUrl) rows.push({ month, label, url: openUrl, kind: "open" });
    } else {
      const invite = invitesByMonth.get(month);
      if (invite) rows.push({ month, label, url: invite, kind: "invite" });
    }
  }
  return rows;
}

async function grantAccess(bot, telegramId, tariff, paymentMethod) {
  if (!TARIFF_KINDS.has(tariff)) {
    throw new Error(`Unknown tariff: ${tariff}`);
  }

  await db.cancelMessages(telegramId, TARIFF_NUDGE_KINDS);

  const active = await db.getActiveSubscription(telegramId);
  const previousMonths = active?.unlocked_months || [];
  if (active) {
    await db.updateSubscription(active.id, { status: "replaced" });
  }

  const starts = new Date();
  let base = starts;
  if (
    active &&
    new Date(active.access_ends_at) > starts &&
    (tariff === "month2" || tariff === "month2_3" || tariff === "month3")
  ) {
    base = new Date(active.access_ends_at);
  }

  const days = config.durationsDays[tariff];
  const ends = addDays(base, days);
  const chatAccessEnds = addDays(ends, config.chatGraceDays);
  const unlockedMonths = resolveUnlockedMonths(tariff, previousMonths);

  const previousInvites = active
    ? await db.getInvitesBySubscription(active.id)
    : [];
  const monthInvites = await createMonthInvites(
    bot,
    telegramId,
    unlockedMonths,
    previousInvites,
  );
  const primaryLink =
    monthInvites.find((x) => x.inviteLink)?.inviteLink || null;

  const sub = await db.createSubscription({
    telegram_id: telegramId,
    tariff,
    payment_method: paymentMethod || null,
    status: "active",
    access_starts_at: starts.toISOString(),
    access_ends_at: ends.toISOString(),
    chat_access_ends_at: chatAccessEnds.toISOString(),
    chat_kicked_at: null,
    invite_link: primaryLink,
    invite_created_at: primaryLink ? starts.toISOString() : null,
    unlocked_months: unlockedMonths,
  });

  await db.replaceSubscriptionInvites(
    sub.id,
    telegramId,
    monthInvites.filter((x) => x.inviteLink && x.chatId),
  );

  // Attach invites on returned object for UI
  sub._monthInvites = monthInvites;
  sub.unlocked_months = unlockedMonths;

  await db.updateUser(telegramId, {
    state: tariff === "vip" ? "vip_pending" : "paid",
    payment_method: paymentMethod || undefined,
  });

  await db.cancelMessages(telegramId, [
    ...TRIAL_RENEW_KINDS,
    ...MONTH2_RENEW_KINDS,
    "vip_intro_5m",
  ]);

  if (tariff === "trial") {
    await scheduleTrialRenewals(telegramId, ends);
  } else if (tariff === "month2") {
    await scheduleMonth2Renewals(telegramId, ends);
  }

  if (tariff === "vip") {
    await db.scheduleMessage(
      telegramId,
      "vip_intro_5m",
      addMinutes(new Date(), config.vipIntroDelayMinutes),
    );
  }

  return sub;
}

async function scheduleTrialRenewals(telegramId, accessEndsAt) {
  await db.cancelMessages(telegramId, TRIAL_RENEW_KINDS);
  const end = new Date(accessEndsAt);
  await db.scheduleMessage(telegramId, "renew_trial_d5", addDays(end, -5));
  await db.scheduleMessage(telegramId, "renew_trial_d2", addDays(end, -2));
  await db.scheduleMessage(telegramId, "renew_trial_d0", end);
  await db.scheduleMessage(telegramId, "renew_trial_p3", addDays(end, 3));
}

async function scheduleMonth2Renewals(telegramId, accessEndsAt) {
  await db.cancelMessages(telegramId, MONTH2_RENEW_KINDS);
  const end = new Date(accessEndsAt);
  await db.scheduleMessage(telegramId, "renew_month2_d3", addDays(end, -3));
  await db.scheduleMessage(telegramId, "renew_month2_d0", end);
  await db.scheduleMessage(telegramId, "renew_month2_p3", addDays(end, 3));
}

async function scheduleTariffNudges(telegramId) {
  await db.cancelMessages(telegramId, TARIFF_NUDGE_KINDS);
  const now = new Date();
  await db.scheduleMessage(telegramId, "tariff_nudge_10m", addMinutes(now, 10));
  await db.scheduleMessage(telegramId, "tariff_nudge_24h", addDays(now, 1));
}

/** Ensure invites exist for unlocked months; recreate missing ones. */
async function ensureMonthInvites(bot, subscription) {
  if (!subscription) return [];
  const months = subscription.unlocked_months?.length
    ? subscription.unlocked_months
    : resolveUnlockedMonths(subscription.tariff, []);
  let existing = await db.getInvitesBySubscription(subscription.id);
  const byMonth = new Map(existing.map((r) => [r.month, r]));
  const missing = months.filter((m) => !byMonth.has(m) && chatIdForMonth(m));
  if (missing.length && bot) {
    const created = await createMonthInvites(bot, subscription.telegram_id, missing, []);
    const ok = created.filter((x) => x.inviteLink && x.chatId);
    if (ok.length) {
      for (const row of ok) {
        await db.upsertSubscriptionInvite({
          invite_link: row.inviteLink,
          subscription_id: subscription.id,
          telegram_id: subscription.telegram_id,
          month: row.month,
          chat_id: row.chatId,
        });
      }
      existing = await db.getInvitesBySubscription(subscription.id);
    }
  }
  return existing;
}

async function userCanJoinMonth(telegramId, month) {
  const sub = await db.getChatAccessSubscription(telegramId);
  if (!sub) return false;
  const months = sub.unlocked_months?.length
    ? sub.unlocked_months
    : resolveUnlockedMonths(sub.tariff, []);
  return months.includes(month);
}

function isPaidLive(sub) {
  if (!sub || sub.status !== "active") return false;
  return new Date(sub.access_ends_at).getTime() > Date.now();
}

function isChatAccessLive(sub) {
  if (!sub || sub.chat_kicked_at) return false;
  const end = sub.chat_access_ends_at || sub.access_ends_at;
  if (!end) return false;
  return new Date(end).getTime() > Date.now();
}

/**
 * Kick user from all unlocked month chats and mark subscription.
 */
async function revokeChatAccess(bot, subscription) {
  const months = subscription.unlocked_months?.length
    ? subscription.unlocked_months
    : resolveUnlockedMonths(subscription.tariff, []);
  const telegramId = subscription.telegram_id;

  for (const month of months) {
    const chatId = chatIdForMonth(month);
    if (!chatId || !bot) continue;
    try {
      // ban + unban = remove from group without permanent ban
      await bot.telegram.banChatMember(chatId, telegramId);
      await bot.telegram.unbanChatMember(chatId, telegramId, {
        only_if_banned: true,
      });
      console.log("kicked", telegramId, "from month", month, chatId);
    } catch (err) {
      console.error(`kick month ${month} user ${telegramId}:`, err.message);
    }
  }

  // Revoke invite links
  try {
    const invites = await db.getInvitesBySubscription(subscription.id);
    for (const inv of invites) {
      try {
        await bot.telegram.revokeChatInviteLink(inv.chat_id, inv.invite_link);
      } catch {
        /* ignore */
      }
    }
  } catch (err) {
    console.error("revoke invites:", err.message);
  }

  await db.updateSubscription(subscription.id, {
    status: "expired",
    chat_kicked_at: new Date().toISOString(),
  });
}

async function processExpiredChatAccess(bot, limit = 20) {
  const due = await db.fetchSubscriptionsDueForKick(limit);
  for (const sub of due) {
    try {
      // Newer live chat-access sub? skip kick for this user, just mark old row
      const live = await db.getChatAccessSubscription(sub.telegram_id);
      if (live && live.id !== sub.id) {
        await db.updateSubscription(sub.id, {
          chat_kicked_at: new Date().toISOString(),
          status: sub.status === "active" ? "expired" : sub.status,
        });
        continue;
      }

      await revokeChatAccess(bot, sub);

      const { getTexts } = require("./texts");
      const user = await db.getUser(sub.telegram_id);
      const texts = await getTexts(user?.payment_method);
      try {
        await bot.telegram.sendMessage(
          sub.telegram_id,
          texts.chatAccessEnded,
          require("./keyboards").keyboards.paymentMethods(),
        );
      } catch (err) {
        console.error("kick notify failed:", err.message);
      }
      await db.updateUser(sub.telegram_id, { state: "new" });
      console.log("chat access revoked", sub.id, sub.telegram_id);
    } catch (err) {
      console.error("processExpiredChatAccess:", sub.id, err.message);
    }
  }
}

module.exports = {
  grantAccess,
  scheduleTariffNudges,
  resolveChannelId,
  createInviteLink: createInviteForChat,
  channelOpenUrl,
  isChannelMember,
  isMemberOfChat,
  chatIdForMonth,
  monthForChatId,
  knownChatIds,
  createMonthInvites,
  buildMonthAccessRows,
  ensureMonthInvites,
  userCanJoinMonth,
  isPaidLive,
  isChatAccessLive,
  revokeChatAccess,
  processExpiredChatAccess,
  TARIFF_NUDGE_KINDS,
  MONTH_LABELS,
};
