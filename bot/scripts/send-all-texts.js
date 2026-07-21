#!/usr/bin/env node
/**
 * Send all current bot message variants to a telegram user (preview).
 * Usage: node scripts/send-all-texts.js <telegram_id>
 */
require("dotenv").config();
const { Telegraf } = require("telegraf");
const { getTexts } = require("./src/texts");
const { config } = require("./src/config");
const { getPriceLabels } = require("./src/price-labels");
const { membershipText, TARIFF_LABELS } = require("./src/membership");

async function main() {
  const telegramId = Number(process.argv[2] || "5347333358");
  if (!Number.isFinite(telegramId)) {
    throw new Error("telegram_id required");
  }

  const bot = new Telegraf(config.token);
  const texts = await getTexts("ru");
  const prices = await getPriceLabels("ru");

  const samples = [];

  const push = (title, body) => {
    samples.push({ title, body: typeof body === "function" ? body() : body });
  };

  push("1. welcome", texts.welcome);
  push("2. chooseTariff", texts.chooseTariff);
  push("3. tariffNudge10m", texts.tariffNudge10m);
  push("4. tariffNudge24h", texts.tariffNudge24h);
  push("5. payStripe", texts.payStripe);
  push("6. payRuStub", texts.payRuStub);
  push("7. needPaymentMethod", texts.needPaymentMethod);
  push(
    "8. tariffAlreadyActive",
    texts.tariffAlreadyActive(TARIFF_LABELS.trial),
  );
  push("9. upgradeUnavailable", texts.upgradeUnavailable);
  push("10. paid", texts.paid);
  push("11. paidNoLink", texts.paidNoLink);
  push("12. vipIntro", texts.vipIntro);
  push("13. vipQ2", texts.vipQ2);
  push("14. vipQ3", texts.vipQ3);
  push("15. vipQ4", texts.vipQ4);
  push("16. vipDone", texts.vipDone);
  push("17. renewTrialD5", texts.renewTrialD5);
  push("18. renewTrialD2", texts.renewTrialD2);
  push("19. renewTrialD0", texts.renewTrialD0);
  push("20. renewTrialP3", texts.renewTrialP3);
  push("21. renewMonth2D3", texts.renewMonth2D3);
  push("22. renewMonth2D0", texts.renewMonth2D0);
  push("23. renewMonth2P3", texts.renewMonth2P3);

  const endTrial = new Date("2026-07-20T12:00:00Z").toISOString();
  const endFull = new Date("2026-10-20T12:00:00Z").toISOString();

  push(
    "24. membership trial (+ upgrade)",
    membershipText(
      {
        tariff: "trial",
        access_ends_at: endTrial,
        unlocked_months: [1],
      },
      prices,
      [{ kind: "invite", label: "Уроки — месяц 1", url: "https://t.me/" }],
    ),
  );
  push(
    "25. membership full (+ vip upgrade, already in chats)",
    membershipText(
      {
        tariff: "full",
        access_ends_at: endFull,
        unlocked_months: [1, 2, 3],
      },
      prices,
      [
        { kind: "open", label: "Уроки — месяц 1", url: "https://t.me/" },
        { kind: "open", label: "Уроки — месяц 2", url: "https://t.me/" },
        { kind: "open", label: "Уроки — месяц 3", url: "https://t.me/" },
      ],
    ),
  );
  push(
    "26. membership vip (max)",
    membershipText(
      {
        tariff: "vip",
        access_ends_at: endFull,
        unlocked_months: [1, 2, 3],
      },
      prices,
      [
        { kind: "open", label: "Уроки — месяц 1", url: "https://t.me/" },
        { kind: "open", label: "Уроки — месяц 2", url: "https://t.me/" },
        { kind: "open", label: "Уроки — месяц 3", url: "https://t.me/" },
      ],
    ),
  );

  push("27. reply menu (нет подписки)", "Выберите действие 👇");
  push("28. reply menu (есть подписка)", "Выберите действие 👇");

  await bot.telegram.sendMessage(
    telegramId,
    `📋 Превью всех текстов бота (${samples.length} шт.)\nЦены из БД (ru).`,
  );

  for (const item of samples) {
    const header = `——— ${item.title} ———`;
    const text = `${header}\n\n${item.body}`;
    // Telegram limit 4096
    if (text.length > 4000) {
      await bot.telegram.sendMessage(telegramId, header);
      await bot.telegram.sendMessage(telegramId, item.body.slice(0, 4000));
    } else {
      await bot.telegram.sendMessage(telegramId, text);
    }
    await new Promise((r) => setTimeout(r, 350));
  }

  await bot.telegram.sendMessage(telegramId, "✅ Готово — все варианты отправлены.");
  console.log(`Sent ${samples.length} previews to ${telegramId}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
