/**
 * Seed catalog settings + Wave 0 products via service role.
 *
 *   node --env-file=.env scripts/seed-catalog.mjs
 *
 * VPS apply path: scripts/seed-catalog.sql (keep ids/covers in sync).
 */
import {
  allSeedProducts,
  IDS,
  postureProgramRows,
} from "./catalog-seed-data.mjs";

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

if (serviceKey.length < 80 || !serviceKey.startsWith("eyJ")) {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY does not look like a service-role JWT.",
  );
  process.exit(1);
}

const DEV_WHOLESALE_TIERS = [
  { minQty: 2, percent: 5 },
  { minQty: 4, percent: 10 },
  { minQty: 6, percent: 15 },
];

/** Club trial list 16900₽ / $195 / €170. Figma 607:399 posture prices. */
const COURSE_FOREIGN_MINOR = {
  4000000: { usd: 46200, eur: 40200 },
  2500000: { usd: 28900, eur: 25100 },
  990000: { usd: 11500, eur: 9900 },
  1190000: { usd: 13900, eur: 11900 },
  1290000: { usd: 14900, eur: 12900 },
  1490000: { usd: 17500, eur: 14900 },
};

function foreignMinors(rubMinor) {
  const pretty = COURSE_FOREIGN_MINOR[rubMinor];
  if (pretty) return pretty;
  const rub = rubMinor / 100;
  return {
    usd: Math.max(1, Math.round((rub * 195) / 16900)) * 100,
    eur: Math.max(1, Math.round((rub * 170) / 16900)) * 100,
  };
}

async function rest(path, { method = "GET", body, prefer } = {}) {
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (prefer) headers.Prefer = prefer;
  const res = await fetch(`${supabaseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : null;
}

const PRODUCTS = allSeedProducts();

try {
  await rest("/rest/v1/catalog_settings?on_conflict=key", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: { key: "wholesale_tiers", value: DEV_WHOLESALE_TIERS },
  });

  await rest("/rest/v1/catalog_products?id=not.is.null", {
    method: "PATCH",
    prefer: "return=minimal",
    body: { published: false },
  });

  await rest("/rest/v1/catalog_products?on_conflict=id", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: PRODUCTS.map((product) => {
      const foreign = foreignMinors(product.price_minor);
      return {
        id: product.id,
        type: product.type,
        price_minor: product.price_minor,
        price_usd_minor: foreign.usd,
        price_eur_minor: foreign.eur,
        currency: product.currency,
        access_days: product.access_days,
        cover_url: product.cover_url || "",
        duration_sec: product.duration_sec,
        level: product.level,
        skills: product.skills,
        lesson_count: product.lesson_count,
        published: true,
        available_at: product.available_at ?? null,
        sort_index: product.sort_index ?? null,
      };
    }),
  });

  const i18nRows = PRODUCTS.flatMap((product) =>
    Object.entries(product.i18n).map(([locale, copy]) => ({
      product_id: product.id,
      locale,
      title: copy.title,
      short: copy.short,
      description: copy.description,
      program: copy.program ?? null,
    })),
  );

  await rest("/rest/v1/catalog_product_i18n?on_conflict=product_id,locale", {
    method: "POST",
    prefer: "return=minimal,resolution=merge-duplicates",
    body: i18nRows,
  });

  const mediaRows = PRODUCTS.flatMap((product) => {
    const urls = product.cover_urls ?? [];
    return urls.map((url, sort) => ({
      product_id: product.id,
      sort,
      url,
      kind: "cover",
    }));
  });

  if (mediaRows.length > 0) {
    const mediaProductIds = [...new Set(mediaRows.map((row) => row.product_id))];
    await rest(
      `/rest/v1/catalog_product_media?product_id=in.(${mediaProductIds.join(",")})`,
      { method: "DELETE", prefer: "return=minimal" },
    );
    await rest("/rest/v1/catalog_product_media", {
      method: "POST",
      prefer: "return=minimal",
      body: mediaRows,
    });
  }

  const bundleRows = PRODUCTS.flatMap((product) =>
    (product.bundle_children ?? []).map((childId, sort) => ({
      parent_id: product.id,
      child_id: childId,
      sort,
    })),
  );

  if (bundleRows.length > 0) {
    await rest(
      "/rest/v1/catalog_product_bundles?on_conflict=parent_id,child_id",
      {
        method: "POST",
        prefer: "return=minimal,resolution=merge-duplicates",
        body: bundleRows,
      },
    );
  }

  const programRows = PRODUCTS.flatMap((product) =>
    postureProgramRows(product.id, product.program_blocks ?? []),
  );

  if (programRows.length > 0) {
    const programProductIds = [
      ...new Set(programRows.map((row) => row.product_id)),
    ];
    await rest(
      `/rest/v1/catalog_product_program?product_id=in.(${programProductIds.join(",")})`,
      { method: "DELETE", prefer: "return=minimal" },
    );

    const inserted = await rest("/rest/v1/catalog_product_program", {
      method: "POST",
      prefer: "return=representation",
      body: programRows.map(
        ({ product_id, block_key, sort, kind, gif_urls }) => ({
          product_id,
          block_key,
          sort,
          kind,
          gif_urls,
        }),
      ),
    });

    const i18nProgram = [];
    for (let i = 0; i < programRows.length; i += 1) {
      const row = programRows[i];
      const dbRow = inserted[i];
      if (!dbRow?.id) continue;
      for (const locale of ["ru", "en"]) {
        i18nProgram.push({
          program_id: dbRow.id,
          locale,
          body: row.i18n[locale],
        });
      }
    }

    if (i18nProgram.length > 0) {
      await rest(
        "/rest/v1/catalog_product_program_i18n?on_conflict=program_id,locale",
        {
          method: "POST",
          prefer: "return=minimal,resolution=merge-duplicates",
          body: i18nProgram,
        },
      );
    }
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("PGRST205") || message.includes("catalog_products")) {
    console.error(
      "Apply database-schema/migrations/016_catalog.sql and 023_catalog_product_model.sql first.",
    );
  }
  console.error(message);
  process.exit(1);
}

console.log("Seed catalog (service role):");
console.log(
  "  wholesale_tiers →",
  JSON.stringify(DEV_WHOLESALE_TIERS),
);
console.log("  unpublished every catalog_products row, then re-published seed");
console.log(
  `  upserted ${PRODUCTS.length} products (24 peeks + posture bundle + course-2)`,
);
console.log(`  posture full ${IDS.postureFull}, blocks ${IDS.postureBlock1}/${IDS.postureBlock2}`);
console.log("  kinescope videos: none");
