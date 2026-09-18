const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;

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

function whoHtml(person) {
  const who = describeCatalogPerson(person);
  const lines = [`<b>${escapeHtml(who.headline)}</b>`];
  for (const detail of who.details) {
    const safe = escapeHtml(detail);
    lines.push(detail.startsWith("G-") ? `<code>${safe}</code>` : safe);
  }
  return lines.join("\n");
}

function personFromProfile(profile, guest) {
  return {
    id: profile?.id || "",
    guest: Boolean(guest),
    email: profile?.email || null,
    firstName: profile?.first_name || null,
    lastName: profile?.last_name || null,
  };
}

function isGuestProfile(profile) {
  return GUEST_EMAIL_RE.test(profile?.email || "");
}

module.exports = {
  guestCode,
  contactEmail,
  displayName,
  describeCatalogPerson,
  whoHtml,
  personFromProfile,
  isGuestProfile,
};
