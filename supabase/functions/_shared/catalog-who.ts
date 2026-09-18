const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;

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

export function whoHtml(person: CatalogPerson): string {
  const who = describeCatalogPerson(person);
  const lines = [`<b>${escapeHtml(who.headline)}</b>`];
  for (const detail of who.details) {
    const safe = escapeHtml(detail);
    lines.push(detail.startsWith("G-") ? `<code>${safe}</code>` : safe);
  }
  return lines.join("\n");
}
