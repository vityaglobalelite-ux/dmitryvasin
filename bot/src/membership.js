const { keyboards } = require("./keyboards");
const db = require("./db");
const { getPriceLabels } = require("./price-labels");
const {
  ensureMonthInvites,
  buildMonthAccessRows,
  isPaidLive,
  isChatAccessLive,
} = require("./access");
const { resolveUnlockedMonths } = require("./channels");

const TARIFF_LABELS = {
  trial: "Тест-драйв | 1 месяц",
  full: "Полное исследование | 90 дней",
  vip: "VIP-исследование",
  month2: "2-й месяц",
  month2_3: "2 + 3 месяц",
  month3: "3-й месяц",
};

const TARIFF_RANK = {
  trial: 1,
  month2: 1,
  month3: 1,
  month2_3: 2,
  full: 2,
  vip: 3,
};

function formatDateRu(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isSubscriptionLive(sub) {
  return isPaidLive(sub);
}

function upgradeOptions(tariff) {
  const rank = TARIFF_RANK[tariff] || 0;
  const options = [];
  if (rank < TARIFF_RANK.full) options.push("full");
  if (rank < TARIFF_RANK.vip) options.push("vip");
  return options;
}

function membershipText(sub, prices, accessRows = [], { inGrace = false } = {}) {
  const label = TARIFF_LABELS[sub.tariff] || sub.tariff;
  const lines = [
    "🕺Вы уже участник исследования танго.",
    "",
    `▶️Тариф: ${label}`,
  ];

  if (inGrace) {
    lines.push(`▶️Оплаченный период завершён: ${formatDateRu(sub.access_ends_at)}`);
    lines.push(
      `▶️Доступ к чатам с уроками до: ${formatDateRu(sub.chat_access_ends_at)}`,
    );
    lines.push("");
    lines.push(
      "⏳Сейчас у вас дополнительный месяц доступа к уже открытым материалам.",
    );
    lines.push(
      "💡Чтобы продолжить исследование и открыть следующие месяцы — продлите участие.",
    );
  } else {
    lines.push(`▶️Доступ до: ${formatDateRu(sub.access_ends_at)}`);
    if (sub.chat_access_ends_at) {
      lines.push(
        `▶️Чаты с уроками доступны до: ${formatDateRu(sub.chat_access_ends_at)} (+1 месяц после подписки)`,
      );
    }

    const upgrades = upgradeOptions(sub.tariff);
    if (upgrades.length) {
      lines.push("");
      if (upgrades.includes("full") && upgrades.includes("vip")) {
        lines.push(
          "💡Можете улучшить тариф — получите полный доступ или VIP с индивидуальными занятиями:",
        );
      } else if (upgrades.includes("vip")) {
        lines.push(
          "💡Можете улучшить тариф — получите VIP с индивидуальными занятиями:",
        );
      } else {
        lines.push("💡Можете улучшить тариф:");
      }
      lines.push("");
      if (upgrades.includes("full")) {
        lines.push(`✔️Полное исследование — ${prices.full}`);
      }
      if (upgrades.includes("vip")) {
        lines.push(`✔️VIP-исследование — ${prices.vip}`);
      }
    } else {
      lines.push("");
      lines.push("У вас максимальный тариф. ♥️Спасибо, что с нами!");
    }
  }

  if (accessRows.length) {
    lines.push("");
    const allOpen = accessRows.every((r) => r.kind === "open");
    if (allOpen) {
      lines.push("⏬️Вы уже в чатах с уроками — откройте их по кнопкам ниже.");
    } else {
      lines.push(
        "⏬️Персональные ссылки в чаты с уроками — по кнопкам ниже (привязаны к вашему Telegram).",
      );
    }
  }

  return lines.join("\n");
}

async function sendMembershipCard(ctx, bot, telegramId) {
  let sub = await db.getActiveSubscription(telegramId);
  let inGrace = false;

  if (sub && !isPaidLive(sub)) {
    await db.updateSubscription(sub.id, { status: "expired" });
    sub = null;
  }

  if (!sub) {
    sub = await db.getChatAccessSubscription(telegramId);
    if (sub && isChatAccessLive(sub)) {
      inGrace = true;
      if (sub.status === "active") {
        await db.updateSubscription(sub.id, { status: "expired" });
        sub = { ...sub, status: "expired" };
      }
    } else {
      sub = null;
    }
  }

  if (!sub) return false;

  const user = await db.getUser(telegramId);
  const prices = await getPriceLabels(user?.payment_method);

  const invites = await ensureMonthInvites(bot, sub);
  const invitesByMonth = new Map(invites.map((r) => [r.month, r.invite_link]));
  const unlocked = sub.unlocked_months?.length
    ? sub.unlocked_months
    : resolveUnlockedMonths(sub.tariff, []);
  const accessRows = await buildMonthAccessRows(
    bot,
    telegramId,
    unlocked,
    invitesByMonth,
  );

  const upgrades = inGrace ? [] : upgradeOptions(sub.tariff);
  const channelOpts = { accessRows };

  await ctx.reply(
    "Выберите действие 👇",
    keyboards.replyMenu({ hasSubscription: true }),
  );

  await ctx.reply(
    membershipText(sub, prices, accessRows, { inGrace }),
    keyboards.membership(sub, upgrades, channelOpts),
  );

  if (inGrace) {
    if (sub.tariff === "trial") {
      await ctx.reply("⏬️Продлить участие:", keyboards.renewTrial());
    } else if (sub.tariff === "month2") {
      await ctx.reply("⏬️Продлить на 3-й месяц:", keyboards.renewMonth3());
    }
  }

  return true;
}

module.exports = {
  TARIFF_LABELS,
  TARIFF_RANK,
  isSubscriptionLive,
  upgradeOptions,
  membershipText,
  sendMembershipCard,
  formatDateRu,
};
