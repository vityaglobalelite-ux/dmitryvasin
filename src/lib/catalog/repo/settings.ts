import type { WholesaleTier } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import { throwIfPostgrestError } from "@/lib/catalog/repo/internal";

function parseWholesaleTiers(value: unknown): WholesaleTier[] {
  if (!Array.isArray(value)) return [];
  const tiers: WholesaleTier[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as { minQty?: unknown; min_qty?: unknown; percent?: unknown };
    const minQty =
      typeof row.minQty === "number"
        ? row.minQty
        : typeof row.min_qty === "number"
          ? row.min_qty
          : null;
    const percent = typeof row.percent === "number" ? row.percent : null;
    if (minQty !== null && percent !== null) {
      tiers.push({ minQty, percent });
    }
  }
  return tiers;
}

/** Wave 1C: `catalog_settings` key `wholesale_tiers`. */
export async function getWholesaleTiers(): Promise<WholesaleTier[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("catalog_settings")
    .select("value")
    .eq("key", "wholesale_tiers")
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data?.value) return [];

  return parseWholesaleTiers(data.value);
}
