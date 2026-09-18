const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;
const DEFAULT_TZ = "Europe/Moscow";

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function guestCode(userId) {
  const hex = String(userId || "")
    .replace(/-/g, "")
    .replace(/[^0-9a-f]/gi, "")
    .slice(0, 8)
    .toUpperCase();
  if (hex.length < 8) return "G-????-????";
  return `G-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

function contactEmail(email) {
  const value = clean(email);
  if (!value || GUEST_EMAIL_RE.test(value)) return null;
  return value;
}

function displayName(firstName, lastName) {
  const full = [clean(firstName), clean(lastName)].filter(Boolean).join(" ");
  return full || null;
}

function describeCatalogPerson(person) {
  const name = displayName(person?.firstName, person?.lastName);
  const email = contactEmail(person?.email);
  const guest = person?.guest === true;
  if (guest) {
    const details = [guestCode(person.id)];
    if (email) details.push(email);
    return {
      guest: true,
      headline: name || "Гость",
      details,
    };
  }
  if (name && email) return { guest: false, headline: name, details: [email] };
  if (name) return { guest: false, headline: name, details: [] };
  if (email) return { guest: false, headline: email, details: [] };
  return { guest: false, headline: "Аккаунт", details: [] };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatSupportTime(value, timeZone = DEFAULT_TZ) {
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

function personHeaderHtml(person) {
  const described = describeCatalogPerson(person);
  if (described.guest) {
    const code =
      described.details.find((item) => item.startsWith("G-")) ||
      guestCode(person.id);
    const rest = described.details.filter((item) => item !== code);
    const title =
      described.headline === "Гость"
        ? `Гость · <code>${escapeHtml(code)}</code>`
        : `<b>${escapeHtml(described.headline)}</b>\nГость · <code>${escapeHtml(code)}</code>`;
    return [title, ...rest.map((item) => escapeHtml(item))].join("\n");
  }
  const lines = [`<b>${escapeHtml(described.headline)}</b>`];
  for (const detail of described.details) lines.push(escapeHtml(detail));
  return lines.join("\n");
}

function whoHtml(person) {
  return personHeaderHtml(person);
}

function personButtonLabel(person) {
  if (person?.guest) return guestCode(person.id);
  const name = displayName(person?.firstName, person?.lastName);
  if (name) return name.length > 28 ? `${name.slice(0, 27)}…` : name;
  const email = contactEmail(person?.email);
  if (email) return email.length > 28 ? `${email.slice(0, 27)}…` : email;
  return "Аккаунт";
}

function personFromProfile(profile, guest) {
  return {
    id: profile?.id || profile?.user_id || "",
    guest: Boolean(guest),
    email: profile?.email || null,
    firstName: profile?.first_name || null,
    lastName: profile?.last_name || null,
  };
}

function isGuestProfile(profile) {
  return GUEST_EMAIL_RE.test(profile?.email || "");
}

function personFromRow(row) {
  return personFromProfile(row, isGuestProfile(row));
}

module.exports = {
  guestCode,
  contactEmail,
  displayName,
  describeCatalogPerson,
  escapeHtml,
  formatSupportTime,
  personHeaderHtml,
  whoHtml,
  personButtonLabel,
  personFromProfile,
  isGuestProfile,
  personFromRow,
};
