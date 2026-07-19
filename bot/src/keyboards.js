const { Markup } = require("telegraf");
const { config } = require("./config");

const keyboards = {
  paymentMethods: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Российская карта", "pay:ru")],
      [Markup.button.callback("Карта иностранного банка", "pay:foreign")],
    ]),

  tariffs: () =>
    Markup.inlineKeyboard([
      [Markup.button.callback("Тест-драйв | 1 месяц", "tariff:trial")],
      [Markup.button.callback("Полное исследование | 90 дней", "tariff:full")],
      [Markup.button.callback("VIP-исследование", "tariff:vip")],
    ]),

  afterPayment: (inviteLink) => {
    const rows = [];
    if (inviteLink) {
      rows.push([Markup.button.url("Вступить в чат", inviteLink)]);
    }
    rows.push([Markup.button.url("Поддержка", config.supportUrl)]);
    return Markup.inlineKeyboard(rows);
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
};

module.exports = { keyboards };
