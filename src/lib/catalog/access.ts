import type { Access } from "@/lib/catalog/types";

/** Active row: status active and not past expires_at. Read-only helper — never grants access. */
export function isAccessActive(
  access: Access,
  now: Date = new Date(),
): boolean {
  if (access.status !== "active") return false;
  const expires = new Date(access.expiresAt);
  if (Number.isNaN(expires.getTime())) return false;
  return expires.getTime() > now.getTime();
}

export function filterActiveAccess(
  rows: Access[],
  now: Date = new Date(),
): Access[] {
  return rows.filter((row) => isAccessActive(row, now));
}
