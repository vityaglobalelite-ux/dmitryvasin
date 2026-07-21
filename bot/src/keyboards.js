const { Markup } = require("telegraf");
const { config } = require("./config");

const BTN = {
  START: "Старт",
  SUBSCRIBE: "Оформить участие",
  SUBSCRIPTION: "Моя подписка",
  SUPPORT: "Поддержка",
};

const keyboards = {
  /** Нижняя клавиатура — всегда видна в чате после первого /start */
  replyMenu: ({ hasSubscription = false } = {}) => {
    const rows = [];
    if (!hasSubscription) {
      rows.push([BTN.START, BTN.SUBSCRIBE]);
    } else {
      rows.push([BTN.SUBSCRIPTION]);
    }
    rows.push([Markup.button.webApp(BTN.SUPPORT, config.supportWebAppUrl)]);
    return Markup.keyboard(rows).resize().persistent();
  },

  paymentMethods: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Российская карта", "pay:ru")],
      [Markup.button.callback("Карта иностранного банка", "pay:foreign")],
    ]),

  stripePay: (checkoutUrl) =>
    Markup.inlineKeyboard([
      [Markup.button.url("Оплатить картой", checkoutUrl)],
      [Markup.button.url("Поддержка", config.supportUrl)],
    ]),

  tariffs: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Тест-драйв | 1 месяц", "tariff:trial")],
      [Markup.button.callback("Полное исследование | 90 дней", "tariff:full")],
      [Markup.button.callback("VIP-исследование", "tariff:vip")],
    ]),

  /**
   * @param {Array<{label:string, url:string, kind?:string}>} accessRows
   */
  monthAccess: (accessRows = []) => {
    const rows = (accessRows || [])
      .filter((r) => r?.url)
      .map((r) => {
        const prefix = r.kind === "open" ? "Открыть: " : "Вступить: ";
        return [Markup.button.url(`${prefix}${r.label}`, r.url)];
      });
    rows.push([Markup.button.url("Поддержка", config.supportUrl)]);
    return Markup.inlineKeyboard(rows);
  },

  /** @deprecated single-link helper */
  channelAccess: ({ inviteLink = null, isMember = false, openUrl = null } = {}) => {
    const rows = [];
    if (isMember && openUrl) {
      rows.push([Markup.button.url("Открыть канал", openUrl)]);
    } else if (inviteLink) {
      rows.push([
        Markup.button.url("Вступить в закрытый telegram-канал", inviteLink),
      ]);
    }
    rows.push([Markup.button.url("Поддержка", config.supportUrl)]);
    return Markup.inlineKeyboard(rows);
  },

  afterPayment: (inviteLink, channelOpts = {}) => {
    if (channelOpts.accessRows?.length) {
      return keyboards.monthAccess(channelOpts.accessRows);
    }
    return keyboards.channelAccess({
      inviteLink,
      isMember: channelOpts.isMember,
      openUrl: channelOpts.openUrl,
    });
  },

  vipDays: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Будни", "vip_days:weekdays")],
      [Markup.button.callback("Выходные", "vip_days:weekend")],
      [Markup.button.callback("Любые дни", "vip_days:any")],
    ]),

  vipTime: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Утро", "vip_time:morning")],
      [Markup.button.callback("День", "vip_time:day")],
      [Markup.button.callback("Вечер", "vip_time:evening")],
    ]),

  renewTrial: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("2 месяц", "renew:month2")],
      [Markup.button.callback("2 + 3 месяц", "renew:month2_3")],
    ]),

  renewMonth3: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Продлить участие", "renew:month3")],
    ]),

  renewMonth3Alt: () =>
    Markup.inlineKeyboard([
      [
        Markup.button.callback(
          "Продлить участие на 3-й месяц",
          "renew:month3",
        ),
      ],
    ]),

  membership: (sub, upgrades = [], channelOpts = {}) => {
    const rows = [];
    if (channelOpts.accessRows?.length) {
      for (const r of channelOpts.accessRows) {
        if (!r?.url) continue;
        const prefix = r.kind === "open" ? "Открыть: " : "Вступить: ";
        rows.push([Markup.button.url(`${prefix}${r.label}`, r.url)]);
      }
    } else if (channelOpts.isMember && channelOpts.openUrl) {
      rows.push([Markup.button.url("Открыть канал", channelOpts.openUrl)]);
    } else if (sub?.invite_link) {
      rows.push([
        Markup.button.url(
          "Вступить в закрытый telegram-канал",
          sub.invite_link,
        ),
      ]);
    }
    if (upgrades.includes("full")) {
      rows.push([
        Markup.button.callback(
          "Улучшить до Полного исследования",
          "upgrade:full",
        ),
      ]);
    }
    if (upgrades.includes("vip")) {
      rows.push([Markup.button.callback("Улучшить до VIP", "upgrade:vip")]);
    }
    rows.push([Markup.button.url("Поддержка", config.supportUrl)]);
    return Markup.inlineKeyboard(rows);
  },
};

module.exports = { keyboards, BTN };
