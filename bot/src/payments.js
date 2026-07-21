const db = require("./db");
const {
  grantAccess,
  ensureMonthInvites,
  buildMonthAccessRows,
} = require("./access");
const { resolveUnlockedMonths } = require("./channels");
const { getTexts } = require("./texts");
const { keyboards } = require("./keyboards");

async function sendPaidToUser(bot, telegramId, subscription) {
  const texts = await getTexts();

  const invites =
    subscription._monthInvites?.length
      ? subscription._monthInvites.map((x) => ({
          month: x.month,
          invite_link: x.inviteLink,
        }))
      : await ensureMonthInvites(bot, subscription);
  const invitesByMonth = new Map(
    invites
      .filter((r) => r.invite_link || r.inviteLink)
      .map((r) => [r.month, r.invite_link || r.inviteLink]),
  );
  const unlocked = subscription.unlocked_months?.length
    ? subscription.unlocked_months
    : resolveUnlockedMonths(subscription.tariff, []);
  const accessRows = await buildMonthAccessRows(
    bot,
    telegramId,
    unlocked,
    invitesByMonth,
  );

  try {
    await bot.telegram.sendMessage(
      telegramId,
      "Выберите действие 👇",
      keyboards.replyMenu({ hasSubscription: true }),
    );
  } catch (err) {
    console.error("sendPaid menu:", err.message);
  }

  const body = accessRows.length ? texts.paid : texts.paidNoLink;
  const kb = keyboards.afterPayment(null, { accessRows });
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
