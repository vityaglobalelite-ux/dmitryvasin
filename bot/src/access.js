const { config } = require("./config");
const db = require("./db");

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

async function resolveChannelId() {
  if (config.channelId) return config.channelId;
  return db.getSetting("telegram_channel_id");
}

async function createInviteLink(bot) {
  const channelId = await resolveChannelId();
  if (!channelId) {
    return null;
  }
  const link = await bot.telegram.createChatInviteLink(channelId, {
    member_limit: 1,
    name: `user-${Date.now()}`.slice(0, 32),
  });
  return link.invite_link;
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

async function grantAccess(bot, telegramId, tariff, paymentMethod) {
  if (!TARIFF_KINDS.has(tariff)) {
    throw new Error(`Unknown tariff: ${tariff}`);
  }

  await db.cancelMessages(telegramId, TARIFF_NUDGE_KINDS);

  const active = await db.getActiveSubscription(telegramId);
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

  let inviteLink = null;
  try {
    inviteLink = await createInviteLink(bot);
  } catch (err) {
    console.error("createInviteLink failed:", err.message);
  }

  const sub = await db.createSubscription({
    telegram_id: telegramId,
    tariff,
    payment_method: paymentMethod || null,
    status: "active",
    access_starts_at: starts.toISOString(),
    access_ends_at: ends.toISOString(),
    invite_link: inviteLink,
    invite_created_at: inviteLink ? starts.toISOString() : null,
  });

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

async function scheduleTariffNudges(telegramId) {
  await db.cancelMessages(telegramId, TARIFF_NUDGE_KINDS);
  const now = new Date();
  await db.scheduleMessage(telegramId, "tariff_nudge_10m", addMinutes(now, 10));
  await db.scheduleMessage(telegramId, "tariff_nudge_24h", addDays(now, 1));
}

module.exports = {
  grantAccess,
  scheduleTariffNudges,
  resolveChannelId,
  createInviteLink,
  TARIFF_NUDGE_KINDS,
};
