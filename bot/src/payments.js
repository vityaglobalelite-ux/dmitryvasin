const db = require("./db");
const {
  grantAccess,
  channelOpenUrl,
  isChannelMember,
  resolveChannelId,
} = require("./access");
const { getTexts } = require("./texts");
const { keyboards } = require("./keyboards");

async function sendPaidToUser(bot, telegramId, subscription) {
  const texts = await getTexts();
  const member = await isChannelMember(bot, telegramId);
  const openUrl = channelOpenUrl(await resolveChannelId());
  try {
    await bot.telegram.sendMessage(
      telegramId,
      "Выберите действие 👇",
      keyboards.replyMenu({ hasSubscription: true }),
    );
  } catch (err) {
    console.error("sendPaid menu:", err.message);
  }

  const body =
    subscription.invite_link || (member && openUrl)
      ? texts.paid
      : texts.paidNoLink;
  const kb = keyboards.afterPayment(subscription.invite_link, {
    isMember: member,
    openUrl,
  });
  try {
    await bot.telegram.sendMessage(telegramId, body, kb);
  } catch (err) {
    console.error("sendPaid body:", err.message);
  }
}

/**
 * Process Stripe payments marked paid by webhook → grant club access.
 */
async function processPaidPayments(bot, limit = 20) {
  const rows = await db.fetchPaidUngrantedPayments(limit);
  for (const row of rows) {
    let claimed;
    try {
      claimed = await db.claimPaidPayment(row.id);
    } catch (err) {
      console.error("claimPaidPayment:", row.id, err.message);
      continue;
    }
    if (!claimed) continue;

    try {
      const sub = await grantAccess(
        bot,
        claimed.telegram_id,
        claimed.tariff,
        claimed.payment_method || "foreign",
      );
      await db.markPaymentGranted(claimed.id, sub.id);
      await sendPaidToUser(bot, claimed.telegram_id, sub);
      console.log(
        "payment granted",
        claimed.id,
        "user",
        claimed.telegram_id,
        "tariff",
        claimed.tariff,
      );
    } catch (err) {
      console.error("grant after payment failed:", claimed.id, err.message);
      try {
        await db.markPaymentGrantFailed(claimed.id, err.message);
      } catch (e2) {
        console.error("markPaymentGrantFailed:", e2.message);
      }
    }
  }
}

module.exports = { processPaidPayments, sendPaidToUser };
