/**
 * 2026 club cohort calendar (America/New_York / Miami).
 * M1 20.08–16.09, M2 17.09–14.10, M3 15.10–17.11
 */

const TZ = "America/New_York";
const CHAT_GRACE_DAYS = 30;
const CLUB_MAX_DAYS = 120;

/** @param {number} y @param {number} month1to12 @param {number} day @param {number} [hour] */
function zonedInstant(y, month1to12, day, hour = 0, minute = 0, second = 0) {
  const utcGuess = Date.UTC(y, month1to12 - 1, day, hour, minute, second);
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(new Date(utcGuess)).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  const offset = asUtc - utcGuess;
  return new Date(utcGuess - offset);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/** Exclusive end = 00:00 Miami the day after the inclusive last day. */
const CLUB_START = zonedInstant(2026, 8, 20, 0, 0, 0);
const M1_ACCESS_ENDS = zonedInstant(2026, 9, 17, 0, 0, 0); // after 16.09
const M2_ACCESS_ENDS = zonedInstant(2026, 10, 15, 0, 0, 0); // after 14.10
const M3_ACCESS_ENDS = zonedInstant(2026, 11, 18, 0, 0, 0); // after 17.11
const CLUB_CHAT_HARD_CAP = addDays(CLUB_START, CLUB_MAX_DAYS);

/**
 * @param {string} tariff
 * @param {Date} [now]
 * @returns {{ accessStartsAt: Date, accessEndsAt: Date, chatAccessEndsAt: Date }}
 */
function resolveAccessWindow(tariff, now = new Date()) {
  const accessStartsAt = now < CLUB_START ? new Date(CLUB_START) : new Date(now);

  let accessEndsAt;
  let chatAccessEndsAt;

  switch (tariff) {
    case "trial":
      accessEndsAt = new Date(M1_ACCESS_ENDS);
      chatAccessEndsAt = addDays(accessEndsAt, CHAT_GRACE_DAYS);
      break;
    case "month2":
      accessEndsAt = new Date(M2_ACCESS_ENDS);
      chatAccessEndsAt = addDays(accessEndsAt, CHAT_GRACE_DAYS);
      break;
    case "month3":
    case "month2_3":
      accessEndsAt = new Date(M3_ACCESS_ENDS);
      chatAccessEndsAt = addDays(accessEndsAt, CHAT_GRACE_DAYS);
      break;
    case "full":
    case "vip":
      accessEndsAt = new Date(M3_ACCESS_ENDS);
      chatAccessEndsAt = new Date(CLUB_CHAT_HARD_CAP);
      break;
    default:
      accessEndsAt = new Date(M1_ACCESS_ENDS);
      chatAccessEndsAt = addDays(accessEndsAt, CHAT_GRACE_DAYS);
  }

  if (chatAccessEndsAt.getTime() > CLUB_CHAT_HARD_CAP.getTime()) {
    chatAccessEndsAt = new Date(CLUB_CHAT_HARD_CAP);
  }
  if (accessEndsAt.getTime() > chatAccessEndsAt.getTime()) {
    accessEndsAt = new Date(chatAccessEndsAt);
  }

  return { accessStartsAt, accessEndsAt, chatAccessEndsAt };
}

module.exports = {
  TZ,
  CLUB_START,
  M1_ACCESS_ENDS,
  M2_ACCESS_ENDS,
  M3_ACCESS_ENDS,
  CLUB_CHAT_HARD_CAP,
  CHAT_GRACE_DAYS,
  CLUB_MAX_DAYS,
  resolveAccessWindow,
  zonedInstant,
  addDays,
};
