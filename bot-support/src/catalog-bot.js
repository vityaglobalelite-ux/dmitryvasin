const fs = require("fs");
const { Telegraf, Markup } = require("telegraf");
const { config } = require("./config");
const db = require("./db");
const who = require("./who");

const bot = new Telegraf(config.token);
const SITE_SUPPORT_URL = "https://betango.dance/support/";

/** adminTelegramId -> catalog_profiles.id */
const replyTarget = new Map();

const MENU = {
  waiting: "📥 Ожидают ответа",
  recent: "🕓 Последние диалоги",
  help: "❓ Помощь",
};

const adminKeyboard = Markup.keyboard([
  [MENU.waiting],
  [MENU.recent, MENU.help],
])
  .resize()
  .persistent();

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

function personOf(profile) {
  return who.personFromRow(profile);
}

function personHtml(profile) {
  return who.personHeaderHtml(personOf(profile));
}

function fmtTime(value) {
  return who.formatSupportTime(value, config.displayTz);
}

function plural(n, one, few, many) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function truncate(value, limit) {
  const text = String(value ?? "");
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function splitText(text, limit = 3800) {
  const out = [];
  let current = "";
  for (const rawLine of String(text).split("\n")) {
    let line = rawLine;
    while (line.length > limit) {
      if (current) {
        out.push(current);
        current = "";
      }
      out.push(line.slice(0, limit));
      line = line.slice(limit);
    }
    const piece = current ? `${current}\n${line}` : line;
    if (piece.length > limit) {
      if (current) out.push(current);
      current = line;
    } else {
      current = piece;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [""];
}

const HTML_EXTRA = { parse_mode: "HTML", disable_web_page_preview: true };

async function replyHtml(ctx, text, extra = {}) {
  const parts = splitText(text);
  for (let i = 0; i < parts.length; i += 1) {
    const last = i === parts.length - 1;
    await ctx.reply(parts[i], { ...HTML_EXTRA, ...(last ? extra : {}) });
  }
}

async function sendHtml(chatId, text, extra = {}) {
  const parts = splitText(text);
  for (let i = 0; i < parts.length; i += 1) {
    const last = i === parts.length - 1;
    await bot.telegram.sendMessage(chatId, parts[i], {
      ...HTML_EXTRA,
      ...(last ? extra : {}),
    });
  }
}

function ticketKeyboard(userId, hasHistory) {
  const rows = [[Markup.button.callback("✍️ Ответить", `catreply:${userId}`)]];
  const second = [];
  if (hasHistory) {
    second.push(Markup.button.callback("📜 История", `cathist:${userId}`));
  }
  second.push(Markup.button.callback("✓ Прочитано", `catread:${userId}`));
  rows.push(second);
  return Markup.inlineKeyboard(rows);
}

function replyAndHistoryKeyboard(userId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("✍️ Ответить", `catreply:${userId}`),
      Markup.button.callback("📜 История", `cathist:${userId}`),
    ],
  ]);
}

function replyOnlyKeyboard(userId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback("✍️ Ответить", `catreply:${userId}`)],
  ]);
}

function adminDisplayName(from) {
  const custom = config.adminNames.get(from.id);
  if (custom) return custom;
  const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
  if (name) return name;
  if (from.username) return `@${from.username}`;
  return String(from.id);
}

async function requireProfile(userId) {
  const profile = await db.getCatalogProfile(userId);
  if (!profile) return null;
  return profile;
}

async function showHelp(ctx) {
  await replyHtml(
    ctx,
    [
      "🛟 <b>Поддержка сайта BeTango</b>",
      "Сообщения приходят с betango.dance/support.",
      "",
      "<b>Под карточкой:</b>",
      "• <b>✍️ Ответить</b> — следующее сообщение (текст, фото или файл) уйдёт человеку на сайт.",
      "• <b>📜 История</b> — вся переписка с этим человеком.",
      "• <b>✓ Прочитано</b> — снять непрочитанное, если отвечать пока не нужно.",
      "",
      "<b>Меню внизу:</b>",
      `• <b>${MENU.waiting}</b> — все, кому ещё не ответили.`,
      `• <b>${MENU.recent}</b> — последние диалоги.`,
      "",
      "<b>Кто есть кто:</b>",
      "• <b>Гость · G-XXXX-XXXX</b> — без аккаунта. Тот же код = тот же браузер.",
      "• <b>Имя и почта</b> — человек из личного кабинета.",
      "",
      "Когда кто-то отвечает, остальные админы видят <b>кто</b> и <b>что</b>.",
      "",
      "<b>Команды:</b>",
      "• <code>/history G-XXXX-XXXX</code> или почта",
      "• <code>/reply G-XXXX-XXXX текст</code>",
      "• <code>/cancel</code> — отменить начатый ответ",
    ].join("\n"),
    adminKeyboard,
  );
}

async function showWaiting(ctx) {
  let rows;
  try {
    rows = await db.getCatalogWaiting();
  } catch (err) {
    log("waiting", err.message);
    await replyHtml(ctx, "Не удалось загрузить очередь. Попробуйте ещё раз.", adminKeyboard);
    return;
  }
  if (!rows.length) {
    await replyHtml(
      ctx,
      "✅ <b>Очереди нет.</b>\nНа все сообщения с сайта уже ответили.",
      adminKeyboard,
    );
    return;
  }
  const shown = rows.slice(0, 25);
  await replyHtml(
    ctx,
    `📥 <b>Ожидают ответа:</b> ${rows.length} ${plural(
      rows.length,
      "человек",
      "человека",
      "человек",
    )}`,
    adminKeyboard,
  );
  for (const row of shown) {
    const bodies = Array.isArray(row.bodies) ? row.bodies : [];
    const list = bodies.slice(0, 12);
    const numbered = list
      .map(
        (body, index) =>
          `<b>${index + 1}.</b> ${who.escapeHtml(truncate(body, 600))}`,
      )
      .join("\n");
    const more =
      bodies.length > list.length
        ? `\n<i>…и ещё ${bodies.length - list.length}</i>`
        : "";
    const block = [
      personHtml(row),
      `🕓 ждёт с ${fmtTime(row.first_waiting_at)} · ${row.waiting_count} ${plural(
        row.waiting_count,
        "сообщение",
        "сообщения",
        "сообщений",
      )}`,
      "",
      numbered + more,
    ].join("\n");
    await replyHtml(ctx, block, replyAndHistoryKeyboard(row.user_id));
  }
  if (rows.length > shown.length) {
    await replyHtml(
      ctx,
      `<i>Показаны первые ${shown.length} из ${rows.length}. Ответьте на них, чтобы увидеть остальные.</i>`,
    );
  }
}

async function showRecent(ctx) {
  let rows;
  try {
    rows = await db.getCatalogRecent(15);
  } catch (err) {
    log("recent", err.message);
    await replyHtml(ctx, "Не удалось загрузить диалоги. Попробуйте ещё раз.", adminKeyboard);
    return;
  }
  if (!rows.length) {
    await replyHtml(ctx, "Пока нет ни одного диалога с сайта.", adminKeyboard);
    return;
  }
  const lines = ["🕓 <b>Последние диалоги</b>", ""];
  const buttons = [];
  rows.forEach((row, index) => {
    const person = personOf(row);
    const n = index + 1;
    const flag =
      row.waiting_count > 0 ? `⏳ ${row.waiting_count} ждут` : "✓ отвечено";
    lines.push(`<b>${n}.</b> ${personHtml(row)} — ${flag}`);
    if (row.last_message_preview) {
      lines.push(
        `    <i>${who.escapeHtml(truncate(row.last_message_preview, 80))}</i> · ${fmtTime(
          row.last_message_at,
        )}`,
      );
    }
    buttons.push([
      Markup.button.callback(
        `${n}. ${who.personButtonLabel(person)}${row.waiting_count > 0 ? " ⏳" : ""}`,
        `cathist:${row.user_id}`,
      ),
    ]);
  });
  await replyHtml(ctx, lines.join("\n"), Markup.inlineKeyboard(buttons));
}

async function showHistory(ctx, userId) {
  const profile = await requireProfile(userId);
  if (!profile) {
    await replyHtml(ctx, "Человек на сайте не найден.");
    return;
  }
  const msgs = await db.listCatalogMessages(userId, config.historyLimit);
  const header = `📜 <b>История</b>\n${personHtml(profile)}`;
  if (!msgs.length) {
    await replyHtml(ctx, `${header}\n\n<i>Сообщений пока нет.</i>`, replyOnlyKeyboard(userId));
    return;
  }
  const lines = msgs.map((message) => {
    const author =
      message.from_role === "user"
        ? "👤 С сайта"
        : `🛟 ${who.escapeHtml(message.admin_name || "Поддержка")}`;
    const file = message.storage_path ? "\n📎 вложение" : "";
    return `<b>${fmtTime(message.created_at)}</b> · ${author}\n${who.escapeHtml(
      message.body,
    )}${file}`;
  });
  await replyHtml(ctx, `${header}\n\n${lines.join("\n\n")}`, replyOnlyKeyboard(userId));
}

async function beginReply(ctx, userId) {
  const profile = await requireProfile(userId);
  if (!profile) {
    await replyHtml(ctx, "Человек на сайте не найден. Тикет мог устареть.");
    return;
  }
  replyTarget.set(ctx.from.id, profile.id);
  await db.markCatalogRead(profile.id).catch((err) => log("markRead", err.message));
  await replyHtml(
    ctx,
    [
      `✍️ Отвечаете:\n${personHtml(profile)}`,
      "Следующее сообщение (текст, фото или файл) уйдёт в чат на сайте.",
      "<i>Отмена — /cancel</i>",
    ].join("\n"),
  );
}

async function sendReplyToSite({
  userId,
  body,
  storagePath = null,
  adminTelegramId = null,
  adminName = null,
}) {
  const profile = await db.getCatalogProfile(userId);
  if (!profile) return { ok: false, reason: "missing" };
  const text = (body || "").trim() || (storagePath ? "Вложение" : "");
  if (!text && !storagePath) return { ok: false, reason: "empty" };
  await db.addCatalogAgentMessage({
    userId: profile.id,
    body: text,
    storagePath,
    adminTelegramId,
    adminName,
  });
  await db.addCatalogSupportReplyNotification({
    userId: profile.id,
    body: text,
  });
  return { ok: true, profile };
}

async function broadcastReply(from, profile, body) {
  const adminName = adminDisplayName(from);
  const text = [
    `✅ <b>${who.escapeHtml(adminName)}</b> ответил(а):`,
    personHtml(profile),
    "",
    who.escapeHtml(truncate(body, 3000)),
  ].join("\n");
  for (const adminId of config.adminIds) {
    if (adminId === from.id) continue;
    try {
      await sendHtml(adminId, text, replyAndHistoryKeyboard(profile.id));
    } catch (err) {
      log("broadcast failed", adminId, err.message);
    }
  }
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

async function resolvePersonQuery(query) {
  const matches = await db.findCatalogPerson(query);
  return matches;
}

bot.start(async (ctx) => {
  if (isAdmin(ctx)) {
    let waitingCount = 0;
    try {
      waitingCount = (await db.getCatalogWaiting()).length;
    } catch (err) {
      log("start waiting", err.message);
    }
    const hint =
      waitingCount > 0
        ? `📥 Сейчас ждут ответа: <b>${waitingCount}</b> ${plural(
            waitingCount,
            "человек",
            "человека",
            "человек",
          )}.`
        : "✅ Неотвеченных сообщений нет.";
    await replyHtml(
      ctx,
      [
        "🛟 <b>Поддержка сайта BeTango</b>",
        "Обращения с сайта — кнопками ниже.",
        "",
        hint,
        "",
        "Подсказка: <b>❓ Помощь</b> — как всё устроено.",
      ].join("\n"),
      adminKeyboard,
    );
    return;
  }
  await ctx.reply(
    [
      "Это рабочий бот поддержки сайта BeTango.",
      `Написать: ${SITE_SUPPORT_URL}`,
    ].join("\n"),
    Markup.removeKeyboard(),
  );
});

bot.command("help", async (ctx) => {
  if (isAdmin(ctx)) return showHelp(ctx);
  await ctx.reply(`Написать в поддержку сайта: ${SITE_SUPPORT_URL}`);
});

bot.command("waiting", async (ctx) => {
  if (!isAdmin(ctx)) return;
  await showWaiting(ctx);
});

bot.command("recent", async (ctx) => {
  if (!isAdmin(ctx)) return;
  await showRecent(ctx);
});

bot.command("cancel", async (ctx) => {
  if (!isAdmin(ctx)) return;
  if (!replyTarget.has(ctx.from.id)) {
    await ctx.reply("Сейчас нечего отменять.", adminKeyboard);
    return;
  }
  replyTarget.delete(ctx.from.id);
  await ctx.reply("Ответ отменён.", adminKeyboard);
});

bot.command("history", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const query = ctx.message.text.replace(/^\/history(@\w+)?\s*/, "").trim();
  if (!query) {
    await ctx.reply("Формат: /history G-XXXX-XXXX или почта");
    return;
  }
  const matches = await resolvePersonQuery(query);
  if (!matches.length) {
    await ctx.reply("Никого не нашли по этому коду или почте.");
    return;
  }
  if (matches.length > 1) {
    await ctx.reply("Нашлось несколько человек — уточните код или почту.");
    return;
  }
  await showHistory(ctx, matches[0].id);
});

bot.command("reply", async (ctx) => {
  if (!isAdmin(ctx)) return;
  const rest = ctx.message.text.replace(/^\/reply(@\w+)?\s*/, "").trim();
  const match = rest.match(/^(\S+)\s+([\s\S]+)$/);
  if (!match) {
    await ctx.reply("Формат: /reply G-XXXX-XXXX текст");
    return;
  }
  const matches = await resolvePersonQuery(match[1]);
  if (!matches.length) {
    await ctx.reply("Никого не нашли по этому коду или почте.");
    return;
  }
  if (matches.length > 1) {
    await ctx.reply("Нашлось несколько человек — уточните код или почту.");
    return;
  }
  replyTarget.delete(ctx.from.id);
  const result = await sendReplyToSite({
    userId: matches[0].id,
    body: match[2].trim(),
    adminTelegramId: ctx.from.id,
    adminName: adminDisplayName(ctx.from),
  });
  if (!result.ok) {
    await replyHtml(ctx, "Не удалось отправить ответ на сайт.");
    return;
  }
  await replyHtml(
    ctx,
    `✅ Ответ ушёл на сайт:\n${personHtml(result.profile)}`,
    adminKeyboard,
  );
  await broadcastReply(ctx.from, result.profile, match[2].trim());
});

bot.action(/^catreply:([0-9a-f-]{36})$/i, async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return;
  await beginReply(ctx, ctx.match[1]);
});

bot.action(/^cathist:([0-9a-f-]{36})$/i, async (ctx) => {
  await ctx.answerCbQuery();
  if (!isAdmin(ctx)) return;
  await showHistory(ctx, ctx.match[1]);
});

bot.action(/^catread:([0-9a-f-]{36})$/i, async (ctx) => {
  await ctx.answerCbQuery("Отмечено прочитанным");
  if (!isAdmin(ctx)) return;
  await db.markCatalogRead(ctx.match[1]).catch((err) => log("read", err.message));
});

bot.on("message", async (ctx) => {
  if (!isAdmin(ctx)) {
    if (ctx.message.text?.startsWith("/")) return;
    await ctx.reply(`Написать в поддержку сайта: ${SITE_SUPPORT_URL}`);
    return;
  }

  const text = ctx.message.text?.trim() || "";
  if (text === MENU.waiting) {
    replyTarget.delete(ctx.from.id);
    return showWaiting(ctx);
  }
  if (text === MENU.recent) {
    replyTarget.delete(ctx.from.id);
    return showRecent(ctx);
  }
  if (text === MENU.help) {
    replyTarget.delete(ctx.from.id);
    return showHelp(ctx);
  }
  if (text.startsWith("/")) return;

  if (!replyTarget.has(ctx.from.id)) {
    await replyHtml(
      ctx,
      "Выберите обращение кнопкой <b>✍️ Ответить</b> или откройте <b>📥 Ожидают ответа</b>.",
      adminKeyboard,
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

    const result = await sendReplyToSite({
      userId,
      body,
      storagePath,
      adminTelegramId: ctx.from.id,
      adminName: adminDisplayName(ctx.from),
    });
    if (!result.ok) {
      await ctx.reply(
        result.reason === "missing"
          ? "Человек на сайте не найден."
          : "Пустой ответ не отправлен.",
      );
      return;
    }
    replyTarget.delete(ctx.from.id);
    await replyHtml(
      ctx,
      `✅ Ответ ушёл на сайт:\n${personHtml(result.profile)}`,
      adminKeyboard,
    );
    await broadcastReply(ctx.from, result.profile, body);
  } catch (err) {
    log("reply failed", err?.message || err);
    const tooBig = err?.message === "file_too_large";
    await ctx.reply(
      tooBig
        ? "Файл больше 12 МБ — сайт такой не примет. Отправьте поменьше или ссылкой."
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
  const adminCommands = [
    { command: "start", description: "Меню поддержки" },
    { command: "waiting", description: "Ожидают ответа" },
    { command: "recent", description: "Последние диалоги" },
    { command: "history", description: "История: /history код" },
    { command: "reply", description: "Ответ: /reply код текст" },
    { command: "cancel", description: "Отменить ответ" },
    { command: "help", description: "Помощь" },
  ];
  for (const adminId of config.adminIds) {
    try {
      await bot.telegram.setMyCommands(adminCommands, {
        scope: { type: "chat", chat_id: adminId },
      });
    } catch (err) {
      log("setMyCommands skip", adminId, err.message);
    }
  }
}

log(
  `Starting catalog support bot (admins=${config.adminIdsList.join(",") || "none"}, tz=${config.displayTz})`,
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
