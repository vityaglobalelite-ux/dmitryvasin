#!/usr/bin/env node
/**
 * One-shot: correction after d5 went out with placeholder prices (12 Sep 2026).
 * Usage inside the bot container: node /app/send-price-correction.js
 */
const { Telegraf } = require("telegraf");
const { config } = require("../src/config");
const db = require("../src/db");
const { getTexts } = require("../src/texts");
const { getPriceLabels } = require("../src/price-labels");
const { keyboards } = require("../src/keyboards");

const IDS = [462902421, 323712284, 300514887, 1180697020, 5891427815];

async function main() {
  const bot = new Telegraf(config.token);
  for (const id of IDS) {
    const user = await db.getUser(id);
    const method = user?.payment_method;
    const [texts, prices] = await Promise.all([
      getTexts(method),
      getPriceLabels(method),
    ]);
    if (!texts.renewTrialPriceCorrection) {
      throw new Error("renewTrialPriceCorrection missing");
    }
    await bot.telegram.sendMessage(
      id,
      texts.renewTrialPriceCorrection,
      keyboards.renewTrial(prices),
    );
    console.log("sent", id, method || "ru", prices.month2, prices.month2_3);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
