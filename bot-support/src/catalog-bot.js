const fs = require("fs");
const { Telegraf, Markup } = require("telegraf");
const { config } = require("./config");
const db = require("./db");

const bot = new Telegraf(config.token);
const SITE_SUPPORT_URL = "https://betango.dance/support/";

/** adminTelegramId -> catalog_profiles.id */
const replyTarget = new Map();

function log(...args) {
  const line = `[${new Date().toISOString()}] ${args
    .map((a) => (typeof a === "string" ? a : String(a)))
    .join(" ")}\n`;
  try {
    fs.appendFileSync("/tmp/catalog-support-bot.log", line);
  } catch {
    /* ignore */
  }
  console.log(...args);
}

function isAdmin(ctx) {
  return config.adminIds.has(ctx.from?.id);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function adminStartText() {
  return [
    "<b>Поддержка сайта BeTango</b>",
    "",
    "Сюда приходят вопросы с betango.dance/support — гости и аккаунты.",
    "",
    "1. Приходит карточка вопроса",
    "2. Нажимаете <b>Ответить</b>",
    "3. Пишете текст, фото или файл — это уйдёт человеку в чат на сайте",
    "",
    "Он увидит ответ в чате, точку у «Поддержка» и уведомление.",
    "/cancel — если передумали.",
  ].join("\n");
}

async function sendReplyToSite({ userId, body, storagePath = null }) {
  const profile = await db.getCatalogProfile(userId);
  if (!profile) return { ok: false, reason: "missing" };
  const text = (body || "").trim() || (storagePath ? "Вложение" : "");
  if (!text && !storagePath) return { ok: false, reason: "empty" };
  await db.addCatalogAgentMessage({
    userId: profile.id,
    body: text,
    storagePath,
  });
  await db.addCatalogSupportReplyNotification({
    userId: profile.id,
    body: text,
  });
  return { ok: true, who: db.catalogWho(profile) };
}

async function downloadTelegramFile(ctx, fileId) {
  const link = await ctx.telegram.getFileLink(fileId);
  const res = await fetch(link.href);
  if (!res.ok) throw new Error(`telegram_file_${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > 12 * 1024 * 1024) throw new Error("file_too_large");
  return buf;
}

async function uploadFromTelegram(ctx, userId, fileId, filename, contentType) {
  const buffer = await downloadTelegramFile(ctx, fileId);
  return db.uploadCatalogSupportFile({
    userId,
    buffer,
    filename,
    contentType,
  });
}

bot.start(async (ctx) => {
  if (isAdmin(ctx)) {
    await ctx.reply(adminStartText(), {
      parse_mode: "HTML",
      ...Markup.removeKeyboard(),
    });
    return;
  }
  await ctx.reply(
    [
      "Это рабочий бот поддержки сайта BeTango.",
      `Написать в поддержку: ${SITE_SUPPORT_URL}`,
    ].join("\n"),
    Markup.removeKeyboard(),
  );
});

bot.command("cancel", async (ctx) => {
  if (!isAdmin(ctx)) return;
  if (!replyTarget.has(ctx.from.id)) {
    await ctx.reply("Сейчас нечего отменять. Дождитесь вопроса и нажмите «Ответить».");
    return;
  }
  replyTarget.delete(ctx.from.id);
  await ctx.reply("Ответ отменён.");
});

bot.action(/^catreply:([0-9a-f-]{36})$/i, async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return;
  const userId = ctx.match[1];
  const profile = await db.getCatalogProfile(userId);
  if (!profile) {
    await ctx.reply("Человек на сайте не найден. Тикет мог устареть.");
    return;
  }
  replyTarget.set(ctx.from.id, profile.id);
  const who = escapeHtml(db.catalogWho(profile));
  await ctx.reply(
    [
      `<b>Пишете ответ</b>`,
      who,
      "",
      "Следующее сообщение (текст, фото или файл) уйдёт в чат на сайте.",
      "/cancel — отмена",
    ].join("\n"),
    {
      parse_mode: "HTML",
      ...Markup.forceReply().selective(true),
    },
  );
});

bot.on("message", async (ctx) => {
  if (!isAdmin(ctx)) {
    if (ctx.message.text?.startsWith("/")) return;
    await ctx.reply(`Написать в поддержку сайта: ${SITE_SUPPORT_URL}`);
    return;
  }

  const text = ctx.message.text?.trim() || "";
  if (text.startsWith("/")) return;

  if (!replyTarget.has(ctx.from.id)) {
    await ctx.reply(
      "Сначала откройте вопрос и нажмите «Ответить». Так сообщение попадёт нужному человеку на сайте.",
    );
    return;
  }

  const userId = replyTarget.get(ctx.from.id);
  const caption = ctx.message.caption?.trim() || "";
  let storagePath = null;
  let body = text;

  try {
    if (ctx.message.photo?.length) {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      storagePath = await uploadFromTelegram(
        ctx,
        userId,
        photo.file_id,
        "photo.jpg",
        "image/jpeg",
      );
      body = caption || "Фото";
    } else if (ctx.message.document) {
      const doc = ctx.message.document;
      storagePath = await uploadFromTelegram(
        ctx,
        userId,
        doc.file_id,
        doc.file_name || "file",
        doc.mime_type || "application/octet-stream",
      );
      body = caption || doc.file_name || "Файл";
    } else if (!text) {
      await ctx.reply("Для ответа нужен текст, фото или файл.");
      return;
    }

    const result = await sendReplyToSite({ userId, body, storagePath });
    if (!result.ok) {
      await ctx.reply(
        result.reason === "missing"
          ? "Человек на сайте не найден."
          : "Пустой ответ не отправлен.",
      );
      return;
    }
    replyTarget.delete(ctx.from.id);
    await ctx.reply(
      [
        "<b>Ответ ушёл на сайт</b>",
        escapeHtml(result.who),
        "",
        "Человек увидит его в чате поддержки, в уведомлениях и по точке у «Поддержка».",
      ].join("\n"),
      { parse_mode: "HTML" },
    );
  } catch (err) {
    log("reply failed", err?.message || err);
    const tooBig = err?.message === "file_too_large";
    await ctx.reply(
      tooBig
        ? "Файл больше 12 МБ — сайт такой не примет. Отправьте файл поменьше или ссылкой в тексте."
        : "Не получилось отправить на сайт. Попробуйте ещё раз или /cancel.",
    );
  }
});

bot.catch((err, ctx) => {
  log("error", ctx?.updateType, err?.message || err);
});

async function setupCommands() {
  await bot.telegram.deleteWebhook({ drop_pending_updates: false });
  await bot.telegram.setMyCommands([]);
  for (const adminId of config.adminIds) {
    try {
      await bot.telegram.setMyCommands(
        [
          { command: "start", description: "Как отвечать с сайта" },
          { command: "cancel", description: "Отменить ответ" },
        ],
        { scope: { type: "chat", chat_id: adminId } },
      );
    } catch (err) {
      log("setMyCommands skip", adminId, err.message);
    }
  }
}

log(
  `Starting catalog support bot (admins=${[...config.adminIds].join(",") || "none"})`,
);

setupCommands()
  .then(() =>
    bot.launch({
      allowedUpdates: ["message", "callback_query"],
    }),
  )
  .then(() => log("catalog support bot is polling"))
  .catch((err) => {
    log("Failed to start:", err?.message || err);
    process.exit(1);
  });

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
