const { getTexts } = require("./texts");
const { keyboards } = require("./keyboards");
const db = require("./db");
const { config } = require("./config");
const { processPaidPayments } = require("./payments");
const { processExpiredChatAccess } = require("./access");
const { applyClubPricesIfDue, isSaleNudgeKind, isSalesClosed } = require("./club-cutover");
const { getPriceLabels } = require("./price-labels");

async function sendSafe(bot, telegramId, text, extra) {
  try {
    await bot.telegram.sendMessage(telegramId, text, extra);
  } catch (err) {
    console.error(`Failed to send to ${telegramId}:`, err.message);
  }
}

async function contextForUser(telegramId) {
  const user = await db.getUser(telegramId);
  const method = user?.payment_method;
  const [texts, prices] = await Promise.all([
    getTexts(method, telegramId),
    getPriceLabels(method, telegramId),
  ]);
  return { texts, prices };
}

async function startVipFlow(bot, telegramId) {
  const texts = await contextForUser(telegramId).then((x) => x.texts);
  await db.upsertVipIntake(telegramId, { step: "q1" });
  await db.updateUser(telegramId, { state: "vip_q1" });
  await sendSafe(bot, telegramId, texts.vipIntro);
}

async function processDueMessages(bot) {
  await applyClubPricesIfDue();
  const due = await db.fetchDueMessages(50);
  const { evaluateRenewal } = require("./membership");
  for (const msg of due) {
    try {
      const { texts, prices } = await contextForUser(msg.telegram_id);
      if (isSaleNudgeKind(msg.kind) && (await isSalesClosed())) {
        await db.markMessageSent(msg.id);
        continue;
      }

      const sub =
        msg.kind.startsWith("renew_")
          ? (await db.getActiveSubscription(msg.telegram_id)) ||
            (await db.getChatAccessSubscription(msg.telegram_id)) ||
            (await db.getLatestSubscription(msg.telegram_id))
          : null;

      if (msg.kind.startsWith("renew_trial_")) {
        const canMonth2 = evaluateRenewal(sub, "month2").ok;
        const canBundle = evaluateRenewal(sub, "month2_3").ok;
        if (!canMonth2 && !canBundle) {
          await db.markMessageSent(msg.id);
          continue;
        }
      }
      if (msg.kind.startsWith("renew_month2_")) {
        if (!evaluateRenewal(sub, "month3").ok) {
          await db.markMessageSent(msg.id);
          continue;
        }
      }

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
            keyboards.renewTrial(prices),
          );
          break;
        case "renew_trial_d2":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialD2,
            keyboards.renewTrial(prices),
          );
          break;
        case "renew_trial_d0":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialD0,
            keyboards.renewTrial(prices),
          );
          break;
        case "renew_trial_p3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewTrialP3,
            keyboards.renewTrial(prices),
          );
          break;
        case "renew_month2_d3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2D3,
            keyboards.renewMonth3(prices),
          );
          break;
        case "renew_month2_d0":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2D0,
            keyboards.renewMonth3Alt(prices),
          );
          break;
        case "renew_month2_p3":
          await sendSafe(
            bot,
            msg.telegram_id,
            texts.renewMonth2P3,
            keyboards.renewMonth3(prices),
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
  const tickCutover = () => {
    applyClubPricesIfDue().catch((err) =>
      console.error("Club prices tick failed:", err),
    );
  };
  tickMessages();
  tickPayments();
  tickKicks();
  tickCutover();
  const msgTimer = setInterval(tickMessages, config.schedulerIntervalMs);
  const payTimer = setInterval(tickPayments, 10_000);
  const kickTimer = setInterval(tickKicks, 60_000);
  const cutoverTimer = setInterval(tickCutover, 10_000);
  return { msgTimer, payTimer, kickTimer, cutoverTimer };
}

module.exports = { startScheduler, startVipFlow };
