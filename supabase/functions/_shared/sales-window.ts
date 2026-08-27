/** Same cutover as bot_settings.price_increase_at / src/lib/tariff-stage3.ts */
export function isSalesClosedAt(raw: string | null | undefined, now = Date.now()): boolean {
  if (!raw?.trim()) return false;
  const d = new Date(raw.trim());
  return Number.isFinite(d.getTime()) && d.getTime() <= now;
}
