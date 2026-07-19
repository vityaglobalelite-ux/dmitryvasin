const { config } = require("./config");
const { keyboards } = require("./keyboards");
const db = require("./db");
const {
  createInviteLink,
  resolveChannelId,
  channelOpenUrl,
  isChannelMember,
} = require("./access");

const TARIFF_LABELS = {
  trial: "Тест-драйв | 1 месяц",
  full: "Полное исследование | 90 дней",
  vip: "VIP-исследование",
  month2: "2-й месяц",
  month2_3: "2 + 3 месяц",
  month3: "3-й месяц",
};

/** Чем выше — тем «дороже» / полнее тариф */
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
  if (!sub || sub.status !== "active") return false;
  return new Date(sub.access_ends_at).getTime() > Date.now();
}

function upgradeOptions(tariff) {
  const rank = TARIFF_RANK[tariff] || 0;
  const options = [];
  if (rank < TARIFF_RANK.full) options.push("full");
  if (rank < TARIFF_RANK.vip) options.push("vip");
  return options;
}

function membershipText(sub) {
  const label = TARIFF_LABELS[sub.tariff] || sub.tariff;
  const lines = [
    "Вы уже участник исследования танго.",
    "",
    `Тариф: ${label}`,
    `Доступ до: ${formatDateRu(sub.access_ends_at)}`,
  ];

  const upgrades = upgradeOptions(sub.tariff);
  if (upgrades.length) {
    lines.push("");
    lines.push(
      "Можете улучшить тариф — получите полный доступ или VIP с индивидуальными занятиями:",
    );
    if (upgrades.includes("full")) {
      lines.push(`• Полное исследование — ${config.prices.full}`);
    }
    if (upgrades.includes("vip")) {
      lines.push(`• VIP-исследование — ${config.prices.vip}`);
    }
  } else {
    lines.push("");
    lines.push("У вас максимальный тариф. Спасибо, что с нами!");
  }

  return lines.join("\n");
}

function membershipTextWithChannel(sub, { isMember }) {
  const base = membershipText(sub);
  if (isMember) {
    return `${base}\n\nВы уже в закрытом канале — откройте его по кнопке ниже.`;
  }
  if (sub.invite_link) {
    return `${base}\n\nПерсональная ссылка в закрытый telegram-канал — по кнопке ниже (привязана к вашему Telegram).`;
  }
  return base;
}

async function sendMembershipCard(ctx, bot, telegramId) {
  let sub = await db.getActiveSubscription(telegramId);
  if (sub && !isSubscriptionLive(sub)) {
    await db.updateSubscription(sub.id, { status: "expired" });
    sub = null;
  }
  if (!sub) return false;

  const member = await isChannelMember(bot, telegramId);

  // Ссылка-заявка нужна только если ещё не в канале
  if (!member && !sub.invite_link && bot) {
    try {
      const link = await createInviteLink(bot, telegramId, null);
      if (link) {
        sub = await db.updateSubscription(sub.id, {
          invite_link: link,
          invite_created_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("invite refresh failed:", err.message);
    }
  }

  const channelId = await resolveChannelId();
  const openUrl = channelOpenUrl(channelId);
  const upgrades = upgradeOptions(sub.tariff);
  const channelOpts = { isMember: member, openUrl };

  await ctx.reply(
    "Выберите действие 👇",
    keyboards.replyMenu({ hasSubscription: true }),
  );
  await ctx.reply(
    membershipTextWithChannel(sub, channelOpts),
    keyboards.membership(sub, upgrades, channelOpts),
  );
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
