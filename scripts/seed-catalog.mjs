/**
 * Seed catalog settings via service role. Does not insert fake products.
 *
 * Run after applying database-schema/migrations/016_catalog.sql:
 *   node --env-file=.env scripts/seed-catalog.mjs
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (not the anon key).
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ""
).replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// DEV placeholder only. Real wholesale % are unknown — production tiers need a human.
const DEV_WHOLESALE_TIERS = [{ minQty: 2, percent: 5 }];

const { error } = await supabase.from("catalog_settings").upsert(
  {
    key: "wholesale_tiers",
    value: DEV_WHOLESALE_TIERS,
  },
  { onConflict: "key" },
);

if (error) {
  console.error("Failed to upsert catalog_settings.wholesale_tiers:", error.message);
  process.exit(1);
}

console.log("Seed catalog (service role):");
console.log(
  "  upserted catalog_settings key=wholesale_tiers →",
  JSON.stringify(DEV_WHOLESALE_TIERS),
);
console.log(
  "  (dev placeholder; production wholesale % must be set by a human)",
);
console.log("  products: none inserted (empty catalog is allowed)");
