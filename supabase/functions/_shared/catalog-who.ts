const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;
const DEFAULT_TZ = "Europe/Moscow";

export type CatalogPerson = {
  id: string;
  guest: boolean;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type CatalogWho = {
  guest: boolean;
  headline: string;
  details: string[];
};

export type TicketView = {
  person: CatalogPerson;
  body: string;
  filename?: string;
  createdAt?: string;
  waitingCount?: number;
  timeZone?: string;
};

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function guestCode(userId: string): string {
  const hex = userId
    .replace(/-/g, "")
    .replace(/[^0-9a-f]/gi, "")
    .slice(0, 8)
    .toUpperCase();
  if (hex.length < 8) return "G-????-????";
  return `G-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function contactEmail(email: string | null | undefined): string | null {
  const value = clean(email);
  if (!value || GUEST_EMAIL_RE.test(value)) return null;
  return value;
}

export function displayName(
  firstName?: string | null,
  lastName?: string | null,
): string | null {
  const full = [clean(firstName), clean(lastName)].filter(Boolean).join(" ");
  return full || null;
}

export function describeCatalogPerson(person: CatalogPerson): CatalogWho {
  const name = displayName(person.firstName, person.lastName);
  const email = contactEmail(person.email);
  if (person.guest) {
    const details = [guestCode(person.id)];
    if (email) details.push(email);
    return {
      guest: true,
      headline: name || "Гость",
      details,
    };
  }
  if (name && email) {
    return { guest: false, headline: name, details: [email] };
  }
  if (name) return { guest: false, headline: name, details: [] };
  if (email) return { guest: false, headline: email, details: [] };
  return { guest: false, headline: "Аккаунт", details: [] };
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function formatSupportTime(
  value?: string | Date | null,
  timeZone = DEFAULT_TZ,
): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString();
  }
}

export function personHeaderHtml(person: CatalogPerson): string {
  const who = describeCatalogPerson(person);
  if (who.guest) {
    const code = who.details.find((item) => item.startsWith("G-")) ||
      guestCode(person.id);
    const rest = who.details.filter((item) => item !== code);
    const title =
      who.headline === "Гость"
        ? `Гость · <code>${escapeHtml(code)}</code>`
        : `<b>${escapeHtml(who.headline)}</b>\nГость · <code>${escapeHtml(code)}</code>`;
    return [title, ...rest.map((item) => escapeHtml(item))].join("\n");
  }
  const lines = [`<b>${escapeHtml(who.headline)}</b>`];
  for (const detail of who.details) lines.push(escapeHtml(detail));
  return lines.join("\n");
}

export function whoHtml(person: CatalogPerson): string {
  return personHeaderHtml(person);
}

function previewText(value: string, limit: number): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "—") return "";
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}…`;
}

export function ticketHtml(params: TicketView): string {
  const waiting = Number(params.waitingCount) || 0;
  const timeLabel = formatSupportTime(params.createdAt, params.timeZone);
  const lines = [
    "🆕 <b>Новое сообщение с сайта</b>",
    personHeaderHtml(params.person),
  ];
  if (params.person.guest) {
    lines.push("<i>Тот же код — тот же человек в этом браузере</i>");
  }
  const meta: string[] = [];
  if (timeLabel) meta.push(`🕓 ${escapeHtml(timeLabel)}`);
  if (waiting > 1) meta.push(`⏳ в очереди: ${waiting}`);
  if (meta.length) lines.push(meta.join(" · "));
  if (params.filename) {
    lines.push(`📎 <code>${escapeHtml(params.filename)}</code>`);
  }
  const body = previewText(params.body, 800);
  if (body) {
    lines.push("", escapeHtml(body));
  }
  return lines.join("\n");
}

export function ticketPlain(params: TicketView): string {
  const who = describeCatalogPerson(params.person);
  const waiting = Number(params.waitingCount) || 0;
  const timeLabel = formatSupportTime(params.createdAt, params.timeZone);
  const lines = ["Новое сообщение с сайта", who.headline, ...who.details];
  if (params.person.guest) {
    lines.push("Тот же код — тот же человек в этом браузере");
  }
  const meta: string[] = [];
  if (timeLabel) meta.push(timeLabel);
  if (waiting > 1) meta.push(`в очереди: ${waiting}`);
  if (meta.length) lines.push(meta.join(" · "));
  if (params.filename) lines.push(`Файл: ${params.filename}`);
  const body = previewText(params.body, 800);
  if (body) {
    lines.push("", body);
  }
  return lines.join("\n");
}

export function personButtonLabel(person: CatalogPerson): string {
  if (person.guest) return guestCode(person.id);
  const name = displayName(person.firstName, person.lastName);
  if (name) return name.length > 28 ? `${name.slice(0, 27)}…` : name;
  const email = contactEmail(person.email);
  if (email) return email.length > 28 ? `${email.slice(0, 27)}…` : email;
  return "Аккаунт";
}
