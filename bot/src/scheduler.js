const { getTexts } = require("./texts");
const { keyboards } = require("./keyboards");
const db = require("./db");
const { config } = require("./config");
const { processPaidPayments } = require("./payments");
const { processExpiredChatAccess } = require("./access");

async function sendSafe(bot, telegramId, text, extra) {
  try {
    await bot.telegram.sendMessage(telegramId, text, extra);
  } catch (err) {
    console.error(`Failed to send to ${telegramId}:`, err.message);
  }
}

async function textsForUser(telegramId) {
  const user = await db.getUser(telegramId);
  return getTexts(user?.payment_method);
}

async function startVipFlow(bot, telegramId) {
  const texts = await textsForUser(telegramId);
  await db.upsertVipIntake(telegramId, { step: "q1" });
  await db.updateUser(telegramId, { state: "vip_q1" });
  await sendSafe(bot, telegramId, texts.vipIntro);
}

async function processDueMessages(bot) {
  const due = await db.fetchDueMessages(50);
  for (const msg of due) {
    try {
      const texts = await textsForUser(msg.telegram_id);
      switch (msg.kind) {
        case "tariff_nudge_10m":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.tariffNudge10m,
            keyboards.tariffs(),
          );
          break;
        case "tariff_nudge_24h":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.tariffNudge24h,
            keyboards.tariffs(),
          );
          break;
        case "vip_intro_5m":
          await startVipFlow(bot, msg.telegram_id);
          break;
        case "renew_trial_d5":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialD5,
            keyboards.renewTrial(),
          );
          break;
        case "renew_trial_d2":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialD2,
            keyboards.renewTrial(),
          );
          break;
        case "renew_trial_d0":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialD0,
            keyboards.renewTrial(),
          );
          break;
        case "renew_trial_p3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialP3,
            keyboards.renewTrial(),
          );
          break;
        case "renew_month2_d3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2D3,
            keyboards.renewMonth3(),
          );
          break;
        case "renew_month2_d0":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2D0,
            keyboards.renewMonth3Alt(),
          );
          break;
        case "renew_month2_p3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2P3,
            keyboards.renewMonth3(),
          );
          break;
        default:
          console.warn("Unknown scheduled kind:", msg.kind);
      }
      await db.markMessageSent(msg.id);
    } catch (err) {
      console.error("Scheduler item failed:", msg.id, err.message);
    }
  }
}

function startScheduler(bot) {
  const tickMessages = () => {
    processDueMessages(bot).catch((err) =>
      console.error("Scheduler tick failed:", err),
    );
  };
  const tickPayments = () => {
    if (config.paymentMode !== "stripe") return;
    processPaidPayments(bot).catch((err) =>
      console.error("Payments tick failed:", err),
    );
  };
  const tickKicks = () => {
    processExpiredChatAccess(bot).catch((err) =>
      console.error("Chat kick tick failed:", err),
    );
  };
  tickMessages();
  tickPayments();
  tickKicks();
  const msgTimer = setInterval(tickMessages, config.schedulerIntervalMs);
  const payTimer = setInterval(tickPayments, 10_000);
  const kickTimer = setInterval(tickKicks, 60_000);
  return { msgTimer, payTimer, kickTimer };
}

module.exports = { startScheduler, startVipFlow };
