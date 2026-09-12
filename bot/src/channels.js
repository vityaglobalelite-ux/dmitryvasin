const { programMonthAt } = require("./club-calendar");

const MONTH_LABELS = {
  1: "Уроки — месяц 1",
  2: "Уроки — месяц 2",
  3: "Уроки — месяц 3",
};

/** Months newly granted by this purchase (unioned with previous unlocked). */
function monthsAddedByTariff(tariff) {
  switch (tariff) {
    case "month1":
      return [1];
    case "trial":
      return [programMonthAt()];
    case "month2":
      return [2];
    case "month2_3":
      return [2, 3];
    case "month3":
      return [3];
    case "full":
    case "vip":
      return [1, 2, 3];
    default:
      return [programMonthAt()];
  }
}

function mergeMonths(previous, next) {
  const set = new Set([...(previous || []), ...(next || [])]);
  return [...set].filter((m) => m >= 1 && m <= 3).sort((a, b) => a - b);
}

function resolveUnlockedMonths(tariff, previousMonths = []) {
  return mergeMonths(previousMonths, monthsAddedByTariff(tariff));
}

module.exports = {
  MONTH_LABELS,
  monthsAddedByTariff,
  mergeMonths,
  resolveUnlockedMonths,
};
