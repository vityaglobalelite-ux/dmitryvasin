import type { Access, Product } from "@/lib/catalog/types";

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

export function isPeekWatchable(
  product: Pick<Product, "type" | "availableAt">,
  now: Date = new Date(),
): boolean {
  if (product.type !== "peek") return true;
  if (!product.availableAt) return true;
  const unlock = new Date(product.availableAt);
  if (Number.isNaN(unlock.getTime())) return true;
  return unlock.getTime() <= now.getTime();
}

/** Access clock starts when the peek unlocks, not at purchase. */
export function accessStartsAt(
  purchaseAt: Date,
  availableAt: string | null | undefined,
): Date {
  if (!availableAt) return purchaseAt;
  const unlock = new Date(availableAt);
  if (Number.isNaN(unlock.getTime())) return purchaseAt;
  return unlock.getTime() > purchaseAt.getTime() ? unlock : purchaseAt;
}

export function expiresAtFromStart(start: Date, accessDays: number): Date {
  return new Date(start.getTime() + accessDays * 24 * 60 * 60 * 1000);
}
