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

export function maxDate(a: Date, b: Date): Date {
  return a.getTime() >= b.getTime() ? a : b;
}
