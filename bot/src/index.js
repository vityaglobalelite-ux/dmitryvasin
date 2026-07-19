const { Telegraf } = require("telegraf");
const { config } = require("./config");
const { texts } = require("./texts");
const { keyboards, BTN } = require("./keyboards");
const db = require("./db");
const {
  grantAccess,
  scheduleTariffNudges,
  resolveChannelId,
} = require("./access");
const { startScheduler, startVipFlow } = require("./scheduler");
const {
  sendMembershipCard,
  upgradeOptions,
  TARIFF_RANK,
  TARIFF_LABELS,
} = require("./membership");

const bot = new Telegraf(config.token);

function isAdmin(ctx) {
  return config.adminIds.has(ctx.from?.id);
}

async function sendPaidMessage(ctx, subscription) {
  const upgrades = upgradeOptions(subscription.tariff);
  await ctx.reply(
    "Выберите действие 👇",
    keyboards.replyMenu({
      hasSubscription: true,
      canUpgrade: upgrades.length > 0,
    }),
  );
  if (subscription.invite_link) {
    await ctx.reply(texts.paid, keyboards.afterPayment(subscription.invite_link));
  } else {
    await ctx.reply(texts.paidNoLink, keyboards.afterPayment(null));
  }
}

async function startPurchaseFlow(ctx, userId) {
  await db.updateUser(userId, {
    state: "awaiting_payment_method",
    payment_method: null,
  });
  await db.cancelMessages(userId, ["tariff_nudge_10m", "tariff_nudge_24h"]);
  await ctx.reply(
    "Выберите действие 👇",
    keyboards.replyMenu({ hasSubscription: false }),
  );
  await ctx.reply(texts.welcome, keyboards.paymentMethods());
}

async function handleStart(ctx) {
  const user = await db.upsertUser(ctx.from);
  const shown = await sendMembershipCard(ctx, bot, user.telegram_id);
  if (shown) {
    await db.updateUser(user.telegram_id, { state: "paid" });
    return;
  }
  await startPurchaseFlow(ctx, user.telegram_id);
}

bot.start(handleStart);

async function handleIdCommand(ctx) {
  const chat = ctx.chat;
  const fromId = ctx.from?.id ?? "—";
  const text = `chat_id: ${chat.id}\ntype: ${chat.type}\nfrom: ${fromId}`;
  try {
    await ctx.reply(text);
  } catch (err) {
    // В канале reply иногда недоступен — пробуем отправить новым постом
    await ctx.telegram.sendMessage(chat.id, text);
  }
}

async function handleBindChannel(ctx) {
  if (!isAdmin(ctx) && config.adminIds.size > 0) {
    try {
      await ctx.reply("Команда только для админов.");
    } catch {
      /* ignore */
    }
    return;
  }
  if (ctx.chat.type === "private") {
    return ctx.reply(
      "Напишите /bind_channel в канале/чате клуба (бот должен быть админом).",
    );
  }
  const chatId = String(ctx.chat.id);
  await db.setSetting("telegram_channel_id", chatId);
  const text = `Канал привязан: ${chatId}\ntitle: ${ctx.chat.title || "—"}`;
  log("Channel bound:", chatId);

  // В канале без права «Управление публикациями» reply падает — шлём в личку
  let delivered = false;
  try {
    await ctx.reply(text);
    delivered = true;
  } catch {
    try {
      await ctx.telegram.sendMessage(ctx.chat.id, text);
      delivered = true;
    } catch {
      /* no post rights in channel */
    }
  }
  if (!delivered && ctx.from?.id) {
    try {
      await ctx.telegram.sendMessage(
        ctx.from.id,
        `${text}\n\n(В канале бот не смог ответить — включите «Управление публикациями».)`,
      );
    } catch {
      /* user never started the bot */
    }
  }
}

bot.command("id", handleIdCommand);
bot.command("bind_channel", handleBindChannel);

// Каналы шлют channel_post, а не message — обычные bot.command их не видят
bot.on("channel_post", async (ctx) => {
  const text = ctx.channelPost?.text?.trim() || "";
  if (text === "/id" || text.startsWith("/id@")) {
    await handleIdCommand(ctx);
    return;
  }
  if (text === "/bind_channel" || text.startsWith("/bind_channel@")) {
    await handleBindChannel(ctx);
  }
});

bot.command("status", async (ctx) => {
  const user = await db.getUser(ctx.from.id);
  const sub = await db.getActiveSubscription(ctx.from.id);
  const channelId = await resolveChannelId();
  await ctx.reply(
    [
      `state: ${user?.state || "—"}`,
      `payment: ${user?.payment_method || "—"}`,
      `tariff: ${sub?.tariff || "—"}`,
      `access_until: ${sub?.access_ends_at || "—"}`,
      `channel: ${channelId || "не задан"}`,
      `payment_mode: ${config.paymentMode}`,
    ].join("\n"),
  );
});

bot.action(/^pay:(ru|foreign)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await db.upsertUser(ctx.from);
  if (await sendMembershipCard(ctx, bot, ctx.from.id)) {
    return;
  }
  const method = ctx.match[1];
  await db.updateUser(ctx.from.id, {
    payment_method: method,
    state: "awaiting_tariff",
  });
  await scheduleTariffNudges(ctx.from.id);
  await ctx.reply(texts.chooseTariff, keyboards.tariffs());
});

async function purchaseTariff(ctx, tariff) {
  const user = await db.upsertUser(ctx.from);
  const current = await db.getActiveSubscription(user.telegram_id);

  if (current) {
    const currentRank = TARIFF_RANK[current.tariff] || 0;
    const nextRank = TARIFF_RANK[tariff] || 0;
    if (nextRank <= currentRank) {
      await ctx.reply(
        `У вас уже активен тариф «${TARIFF_LABELS[current.tariff] || current.tariff}». Выберите более высокий тариф или откройте /start.`,
      );
      await sendMembershipCard(ctx, bot, user.telegram_id);
      return;
    }
  }

  if (config.paymentMode !== "mock") {
    await ctx.reply(
      "Оплата пока не подключена. Режим mock выключен — напишите в поддержку.",
      keyboards.afterPayment(null),
    );
    return;
  }

  const sub = await grantAccess(
    bot,
    user.telegram_id,
    tariff,
    user.payment_method,
  );
  await sendPaidMessage(ctx, sub);
}

bot.action(/^tariff:(trial|full|vip)$/, async (ctx) => {
  await ctx.answerCbQuery();
  await purchaseTariff(ctx, ctx.match[1]);
});

bot.action(/^upgrade:(full|vip)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const tariff = ctx.match[1];
  const user = await db.upsertUser(ctx.from);
  const current = await db.getActiveSubscription(user.telegram_id);
  const allowed = current ? upgradeOptions(current.tariff) : [];
  if (!current || !allowed.includes(tariff)) {
    await ctx.reply("Этот апгрейд сейчас недоступен. Откройте /start.");
    await sendMembershipCard(ctx, bot, user.telegram_id);
    return;
  }
  // В mock сразу улучшаем; позже здесь будет оплата
  await purchaseTariff(ctx, tariff);
});

bot.action(/^renew:(month2|month2_3|month3)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const tariff = ctx.match[1];
  const user = await db.upsertUser(ctx.from);

  if (config.paymentMode !== "mock") {
    await ctx.reply(
      "Оплата пока не подключена. Режим mock выключен — напишите в поддержку.",
      keyboards.afterPayment(null),
    );
    return;
  }

  const sub = await grantAccess(
    bot,
    user.telegram_id,
    tariff,
    user.payment_method,
  );
  await sendPaidMessage(ctx, sub);
});

bot.action(/^vip_days:(weekdays|weekend|any)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const map = {
    weekdays: "Будни",
    weekend: "Выходные",
    any: "Любые дни",
  };
  await db.upsertVipIntake(ctx.from.id, {
    preferred_days: map[ctx.match[1]],
    step: "q3",
  });
  await db.updateUser(ctx.from.id, { state: "vip_q3" });
  await ctx.reply(texts.vipQ3, keyboards.vipTime());
});

bot.action(/^vip_time:(morning|day|evening)$/, async (ctx) => {
  await ctx.answerCbQuery();
  const map = {
    morning: "Утро",
    day: "День",
    evening: "Вечер",
  };
  await db.upsertVipIntake(ctx.from.id, {
    preferred_time: map[ctx.match[1]],
    step: "q4",
  });
  await db.updateUser(ctx.from.id, { state: "vip_q4" });
  await ctx.reply(texts.vipQ4);
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text?.trim() || "";
  if (text.startsWith("/")) return;

  const user = (await db.getUser(ctx.from.id)) || (await db.upsertUser(ctx.from));

  // Свободные ответы VIP-анкеты важнее кнопок меню
  if (user.state === "vip_q1") {
    await db.upsertVipIntake(ctx.from.id, {
      timezone_country: text,
      step: "q2",
    });
    await db.updateUser(ctx.from.id, { state: "vip_q2" });
    await ctx.reply(texts.vipQ2, keyboards.vipDays());
    return;
  }

  if (user.state === "vip_q4") {
    await db.upsertVipIntake(ctx.from.id, {
      topic: text,
      step: "done",
      completed_at: new Date().toISOString(),
    });
    await db.updateUser(ctx.from.id, { state: "vip_done" });
    await ctx.reply(texts.vipDone);
    return;
  }

  // Нижнее меню действий
  if (text === BTN.START || text === BTN.SUBSCRIBE || text === BTN.SUBSCRIPTION) {
    await handleStart(ctx);
    return;
  }

  if (text === BTN.SUPPORT) {
    await ctx.reply(
      "Если возникнут сложности — напишите в поддержку:",
      keyboards.afterPayment(null),
    );
    return;
  }

  if (text === BTN.UPGRADE) {
    const sub = await db.getActiveSubscription(ctx.from.id);
    const allowed = sub ? upgradeOptions(sub.tariff) : [];
    if (!sub || !allowed.length) {
      await handleStart(ctx);
      return;
    }
    await sendMembershipCard(ctx, bot, ctx.from.id);
    return;
  }

  // Участник с активной подпиской — карточка, а не повторная воронка
  if (await sendMembershipCard(ctx, bot, ctx.from.id)) {
    return;
  }

  if (user.state === "awaiting_payment_method" || user.state === "new") {
    await ctx.reply(
      "Выберите действие 👇",
      keyboards.replyMenu({ hasSubscription: false }),
    );
    await ctx.reply(texts.welcome, keyboards.paymentMethods());
    return;
  }

  if (user.state === "awaiting_tariff") {
    await ctx.reply(texts.chooseTariff, keyboards.tariffs());
    return;
  }

  if (user.state === "vip_pending") {
    await startVipFlow(bot, ctx.from.id);
    return;
  }

  if (user.state === "vip_q2") {
    await ctx.reply(texts.vipQ2, keyboards.vipDays());
    return;
  }

  if (user.state === "vip_q3") {
    await ctx.reply(texts.vipQ3, keyboards.vipTime());
    return;
  }

  await startPurchaseFlow(ctx, ctx.from.id);
});

bot.catch((err, ctx) => {
  console.error("Bot error for", ctx.updateType, err);
});

const fs = require("fs");
function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (typeof a === "string" ? a : String(a)))
    .join(" ")}\n`;
  try {
    fs.appendFileSync("/tmp/bot.log", line);
  } catch {
    /* ignore */
  }
  console.log(...args);
}

// telegraf.launch() при long polling не резолвится, пока бот жив —
// планировщик и лог старта запускаем сразу.
log(
  `Starting bot (payment_mode=${config.paymentMode}, channel=${config.channelId || "db/env"})`,
);
startScheduler(bot);

bot.telegram
  .setMyCommands([
    { command: "start", description: "Старт / моя подписка" },
    { command: "status", description: "Статус доступа" },
  ])
  .catch((err) => log("setMyCommands failed:", err.message));

bot
  .launch({
    dropPendingUpdates: false,
    allowedUpdates: [
      "message",
      "callback_query",
      "channel_post",
      "my_chat_member",
      "chat_member",
    ],
  })
  .catch((err) => {
    log("Failed to start bot:", err?.message || String(err));
    console.error("Failed to start bot:", err);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
