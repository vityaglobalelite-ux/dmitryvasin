const { Telegraf } = require("telegraf");
const { config } = require("./config");
const { texts } = require("./texts");
const { keyboards } = require("./keyboards");
const db = require("./db");
const {
  grantAccess,
  scheduleTariffNudges,
  resolveChannelId,
} = require("./access");
const { startScheduler, startVipFlow } = require("./scheduler");

const bot = new Telegraf(config.token);

function isAdmin(ctx) {
  return config.adminIds.has(ctx.from?.id);
}

async function sendPaidMessage(ctx, subscription) {
  if (subscription.invite_link) {
    await ctx.reply(texts.paid, keyboards.afterPayment(subscription.invite_link));
  } else {
    await ctx.reply(texts.paidNoLink, keyboards.afterPayment(null));
  }
}

bot.start(async (ctx) => {
  const user = await db.upsertUser(ctx.from);
  await db.updateUser(user.telegram_id, {
    state: "awaiting_payment_method",
    payment_method: null,
  });
  await db.cancelMessages(user.telegram_id, [
    "tariff_nudge_10m",
    "tariff_nudge_24h",
  ]);
  await ctx.reply(texts.welcome, keyboards.paymentMethods());
});

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
  const method = ctx.match[1];
  await db.upsertUser(ctx.from);
  await db.updateUser(ctx.from.id, {
    payment_method: method,
    state: "awaiting_tariff",
  });
  await scheduleTariffNudges(ctx.from.id);
  await ctx.reply(texts.chooseTariff, keyboards.tariffs());
});

bot.action(/^tariff:(trial|full|vip)$/, async (ctx) => {
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
  if (ctx.message.text?.startsWith("/")) return;

  const user = await db.getUser(ctx.from.id);
  if (!user) {
    await db.upsertUser(ctx.from);
    await ctx.reply(texts.welcome, keyboards.paymentMethods());
    return;
  }

  if (user.state === "vip_q1") {
    await db.upsertVipIntake(ctx.from.id, {
      timezone_country: ctx.message.text.trim(),
      step: "q2",
    });
    await db.updateUser(ctx.from.id, { state: "vip_q2" });
    await ctx.reply(texts.vipQ2, keyboards.vipDays());
    return;
  }

  if (user.state === "vip_q4") {
    await db.upsertVipIntake(ctx.from.id, {
      topic: ctx.message.text.trim(),
      step: "done",
      completed_at: new Date().toISOString(),
    });
    await db.updateUser(ctx.from.id, { state: "vip_done" });
    await ctx.reply(texts.vipDone);
    return;
  }

  if (user.state === "awaiting_payment_method" || user.state === "new") {
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

  await ctx.reply(
    "Если нужна помощь с доступом — нажмите «Поддержка».\nЧтобы начать заново: /start",
    keyboards.afterPayment(null),
  );
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
