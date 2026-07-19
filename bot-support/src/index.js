const fs = require("fs");
const { Telegraf, Markup } = require("telegraf");
const { config } = require("./config");
const db = require("./db");

const bot = new Telegraf(config.token);

/** adminTelegramId -> chatUuid */
const adminReplyTarget = new Map();

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (typeof a === "string" ? a : String(a)))
    .join(" ")}\n`;
  try {
    fs.appendFileSync("/tmp/support-bot.log", line);
  } catch {
    /* ignore */
  }
  console.log(...args);
}

function isAdmin(ctx) {
  return config.adminIds.has(ctx.from?.id);
}

async function ensureUserChat(from) {
  const chat = await db.getOrCreateChat(from);
  await db.markReadForUser(chat.id);
  return chat;
}

async function notifyAdmins(chat, text, from) {
  if (!config.adminIds.size) {
    log("No ADMIN_TELEGRAM_IDS — skip notify");
    return;
  }
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  const uname = from.username ? `@${from.username}` : "—";
  const preview = text.length > 800 ? `${text.slice(0, 800)}…` : text;
  const msg = [
    "Новое сообщение в поддержку",
    `От: ${name} (${uname})`,
    `telegram_id: ${from.id}`,
    `chat: ${chat.id}`,
    "",
    preview,
  ].join("\n");

  for (const adminId of config.adminIds) {
    try {
      await bot.telegram.sendMessage(
        adminId,
        msg,
        Markup.inlineKeyboard([
          [Markup.button.callback("Ответить", `reply:${chat.id}`)],
          [Markup.button.callback("Отметить прочитанным", `read:${chat.id}`)],
        ]),
      );
    } catch (err) {
      log("notify admin failed", adminId, err.message);
    }
  }
}

bot.start(async (ctx) => {
  if (isAdmin(ctx)) {
    await ctx.reply(
      [
        "Режим администратора поддержки.",
        "Когда пользователь напишет — придёт уведомление с кнопкой «Ответить».",
        "Либо: /reply <telegram_id> текст ответа",
      ].join("\n"),
      Markup.removeKeyboard(),
    );
    return;
  }
  await ensureUserChat(ctx.from);
  await ctx.reply(
    "Здравствуйте! Это поддержка исследования танго.\nНапишите ваш вопрос — ответим в этом чате.",
    Markup.removeKeyboard(),
  );
});

bot.command("reply", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const rest = ctx.message.text.replace(/^\/reply(@\w+)?\s*/, "");
  const m = rest.match(/^(\d+)\s+([\s\S]+)$/);
  if (!m) {
    await ctx.reply("Формат: /reply <telegram_id> текст");
    return;
  }
  const telegramId = Number(m[1]);
  const body = m[2].trim();
  const chat = await db.getChatByTelegramId(telegramId);
  if (!chat) {
    await ctx.reply("Чат с этим пользователем не найден.");
    return;
  }
  await db.addMessage({ chatId: chat.id, isUser: false, body });
  await bot.telegram.sendMessage(telegramId, body);
  await ctx.reply("Ответ отправлен.");
});

bot.action(/^reply:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return;
  const chatId = ctx.match[1];
  adminReplyTarget.set(ctx.from.id, chatId);
  await db.markReadForAdmin(chatId);
  await ctx.reply(
    "Введите текст ответа одним сообщением (или /cancel чтобы отменить).",
  );
});

bot.action(/^read:(.+)$/, async (ctx) => {
  await ctx.answerCbQuery("Прочитано");
  if (!isAdmin(ctx)) return;
  await db.markReadForAdmin(ctx.match[1]);
});

bot.command("cancel", async (ctx) => {
  if (!isAdmin(ctx)) return;
  adminReplyTarget.delete(ctx.from.id);
  await ctx.reply("Ответ отменён.");
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text?.trim() || "";
  if (text.startsWith("/")) return;

  if (isAdmin(ctx) && adminReplyTarget.has(ctx.from.id)) {
    const chatId = adminReplyTarget.get(ctx.from.id);
    adminReplyTarget.delete(ctx.from.id);
    const chat = await db.getChatById(chatId);
    if (!chat) {
      await ctx.reply("Чат не найден.");
      return;
    }
    await db.addMessage({
      chatId: chat.id,
      isUser: false,
      body: text,
      telegramMessageId: ctx.message.message_id,
    });
    try {
      await bot.telegram.sendMessage(chat.telegram_id, text);
      await ctx.reply("Ответ отправлен пользователю.");
    } catch (err) {
      await ctx.reply(`Не удалось доставить: ${err.message}`);
    }
    return;
  }

  if (isAdmin(ctx)) {
    await ctx.reply(
      "Дождитесь сообщения пользователя или используйте /reply <telegram_id> текст",
    );
    return;
  }

  const chat = await db.getOrCreateChat(ctx.from);
  await db.addMessage({
    chatId: chat.id,
    isUser: true,
    body: text,
    telegramMessageId: ctx.message.message_id,
  });
  await notifyAdmins(chat, text, ctx.from);
});

bot.catch((err, ctx) => {
  log("error", ctx?.updateType, err?.message || err);
});

log(
  `Starting support bot (admins=${[...config.adminIds].join(",") || "none"})`,
);

bot.telegram
  .setMyCommands([{ command: "start", description: "Написать в поддержку" }])
  .catch((err) => log("setMyCommands", err.message));

bot
  .launch({
    allowedUpdates: ["message", "callback_query"],
  })
  .catch((err) => {
    log("Failed to start:", err?.message || err);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
