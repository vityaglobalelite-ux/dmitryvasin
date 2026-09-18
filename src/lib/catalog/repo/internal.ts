import type { PostgrestError } from "@supabase/supabase-js";
import type {
  CourseProgram,
  Currency,
  Locale,
  Product,
  ProductI18n,
  ProductType,
  ProgramBlock,
  ProgramLesson,
} from "@/lib/catalog/types";
import { filterSkillKeys } from "@/lib/catalog/skills";
import { getSupabase } from "@/lib/supabase/client";

export class AuthRequiredError extends Error {
  readonly name = "AuthRequiredError";

  constructor(message = "Authentication required") {
    super(message);
  }
}

export function throwIfPostgrestError(error: PostgrestError | null): void {
  if (error) throw new Error(error.message);
}

/** PostgREST 400 when Wave 0 columns/embeds are not on this instance yet. */
export function isCatalogSchemaMismatch(
  error: { message?: string; code?: string } | null | undefined,
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const message = error.message ?? "";
  return (
    code === "PGRST200" ||
    code === "PGRST204" ||
    code === "42703" ||
    /could not find/i.test(message) ||
    /schema cache/i.test(message) ||
    /does not exist/i.test(message)
  );
}

/** In-memory only: after one 023-embed 400, skip it for this JS session. Reload retries full select (so applying 023 later works). */
let prefersLegacyProductSelect = false;

function rememberLegacyProductSelect(): void {
  prefersLegacyProductSelect = true;
}

export async function catalogSelectWithFallback<T>(
  fullSelect: string,
  legacySelect: string,
  run: (select: string) => PromiseLike<{
    data: T;
    error: PostgrestError | null;
  }>,
): Promise<{ data: T; error: PostgrestError | null }> {
  if (prefersLegacyProductSelect) {
    return run(legacySelect);
  }
  const first = await run(fullSelect);
  if (first.error && isCatalogSchemaMismatch(first.error)) {
    rememberLegacyProductSelect();
    return run(legacySelect);
  }
  return first;
}

export async function requireUserId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    if (/auth session missing/i.test(error.message) || !user) {
      throw new AuthRequiredError();
    }
    throw new Error(error.message);
  }
  if (!user) throw new AuthRequiredError();
  return user.id;
}

const LOCALES: Locale[] = ["ru", "en"];

const EMPTY_I18N: ProductI18n = {
  title: "",
  short: "",
  description: "",
};

const EMPTY_PROGRAM: CourseProgram = { blocks: [] };

export type ProductI18nRow = {
  locale: string;
  title: string | null;
  short: string | null;
  description: string | null;
  program: string | null;
};

export type ProductMediaRow = {
  sort: number;
  url: string;
  kind: string;
};

export type ProductBundleChildRow = {
  child_id: string;
  sort: number;
};

export type ProductBundleParentRow = {
  parent_id: string;
};

export type ProductProgramI18nRow = {
  locale: string;
  body: string | null;
};

export type ProductProgramRow = {
  id: string;
  block_key: string;
  sort: number;
  kind: string;
  gif_urls: string[] | null;
  catalog_product_program_i18n?: ProductProgramI18nRow[] | null;
};

export type ProductRow = {
  id: string;
  type: string;
  price_minor: number;
  price_usd_minor: number;
  price_eur_minor: number;
  currency: string;
  access_days: number;
  cover_url: string | null;
  duration_sec: number;
  level: string;
  skills: string[] | null;
  lesson_count: number | null;
  published: boolean;
  available_at?: string | null;
  sort_index?: number | null;
  catalog_product_i18n?: ProductI18nRow[] | null;
  catalog_product_media?: ProductMediaRow[] | null;
  bundle_children?: ProductBundleChildRow[] | null;
  bundle_parent?: ProductBundleParentRow[] | ProductBundleParentRow | null;
  catalog_product_program?: ProductProgramRow[] | null;
};

function isProductType(value: string): value is ProductType {
  return (
    value === "lifehack" ||
    value === "lesson" ||
    value === "course" ||
    value === "extra" ||
    value === "research" ||
    value === "peek"
  );
}

function isCurrency(value: string): value is Currency {
  return value === "rub" || value === "eur" || value === "usd";
}

function mapI18nRow(row: ProductI18nRow): ProductI18n {
  const i18n: ProductI18n = {
    title: row.title ?? "",
    short: row.short ?? "",
    description: row.description ?? "",
  };
  if (row.program != null && row.program !== "") {
    i18n.program = row.program;
  }
  return i18n;
}

export function buildProductI18n(
  rows: ProductI18nRow[] | null | undefined,
): Record<Locale, ProductI18n> {
  const byLocale = new Map<Locale, ProductI18nRow>();
  for (const row of rows ?? []) {
    if (row.locale === "ru" || row.locale === "en") {
      byLocale.set(row.locale, row);
    }
  }
  const result = {} as Record<Locale, ProductI18n>;
  for (const locale of LOCALES) {
    const row = byLocale.get(locale);
    result[locale] = row ? mapI18nRow(row) : { ...EMPTY_I18N };
  }
  return result;
}

function programBodyForLocale(
  rows: ProductProgramI18nRow[] | null | undefined,
  locale: Locale,
): string {
  const list = rows ?? [];
  const preferred = list.find((row) => row.locale === locale)?.body;
  if (preferred?.trim()) return preferred.trim();
  const fallback = list.find((row) => row.locale === "ru")?.body;
  return fallback?.trim() ?? "";
}

export function buildCourseProgram(
  rows: ProductProgramRow[] | null | undefined,
  locale: Locale,
): CourseProgram {
  if (!rows?.length) return EMPTY_PROGRAM;

  const byBlock = new Map<string, ProductProgramRow[]>();
  for (const row of rows) {
    const list = byBlock.get(row.block_key) ?? [];
    list.push(row);
    byBlock.set(row.block_key, list);
  }

  const blocks: ProgramBlock[] = [];
  for (const [blockKey, blockRows] of [...byBlock.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )) {
    const sorted = [...blockRows].sort((a, b) => a.sort - b.sort);
    const outcomes: string[] = [];
    const lessons: ProgramLesson[] = [];
    for (const row of sorted) {
      const text = programBodyForLocale(row.catalog_product_program_i18n, locale);
      if (row.kind === "outcome") {
        if (text) outcomes.push(text);
      } else if (row.kind === "lesson") {
        lessons.push({
          sort: row.sort,
          title: text,
          gifUrls: row.gif_urls ?? [],
        });
      }
    }
    blocks.push({ blockKey, outcomes, lessons });
  }

  return { blocks };
}

function coverUrlsFromRow(row: ProductRow): string[] {
  const media = [...(row.catalog_product_media ?? [])]
    .filter((item) => item.kind === "cover")
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.url)
    .filter(Boolean);
  if (media.length > 0) return media;
  if (row.cover_url?.trim()) return [row.cover_url.trim()];
  return [];
}

function bundleChildIdsFromRow(row: ProductRow): string[] {
  return [...(row.bundle_children ?? [])]
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.child_id)
    .filter(Boolean);
}

function bundleParentIdFromRow(row: ProductRow): string | null {
  const embedded = row.bundle_parent;
  if (!embedded) return null;
  if (Array.isArray(embedded)) {
    return embedded[0]?.parent_id ?? null;
  }
  return embedded.parent_id ?? null;
}

export function mapProductRow(
  row: ProductRow,
  locale: Locale = "ru",
): Product | null {
  if (
    !isProductType(row.type) ||
    !isCurrency(row.currency) ||
    typeof row.price_minor !== "number" ||
    typeof row.price_usd_minor !== "number" ||
    typeof row.price_eur_minor !== "number"
  ) {
    return null;
  }
  const coverUrls = coverUrlsFromRow(row);
  return {
    id: row.id,
    type: row.type,
    priceMinor: row.price_minor,
    priceUsdMinor: row.price_usd_minor,
    priceEurMinor: row.price_eur_minor,
    currency: row.currency,
    accessDays: row.access_days,
    coverUrl: coverUrls[0] ?? row.cover_url?.trim() ?? "",
    coverUrls,
    durationSec: row.duration_sec,
    level: row.level,
    skills: filterSkillKeys(row.skills),
    lessonCount: row.lesson_count ?? undefined,
    availableAt: row.available_at ?? null,
    sortIndex: row.sort_index ?? undefined,
    bundleParentId: bundleParentIdFromRow(row),
    bundleChildIds: bundleChildIdsFromRow(row),
    programBlocks: buildCourseProgram(row.catalog_product_program, locale),
    i18n: buildProductI18n(row.catalog_product_i18n),
    published: row.published,
  };
}

const PRODUCT_EMBEDS = `
  catalog_product_i18n ( locale, title, short, description, program ),
  catalog_product_media ( sort, url, kind ),
  bundle_children:catalog_product_bundles!catalog_product_bundles_parent_id_fkey ( child_id, sort ),
  bundle_parent:catalog_product_bundles!catalog_product_bundles_child_id_fkey ( parent_id ),
  catalog_product_program (
    id, block_key, sort, kind, gif_urls,
    catalog_product_program_i18n ( locale, body )
  )
`;

const PRODUCT_COLUMNS =
  "id, type, price_minor, price_usd_minor, price_eur_minor, currency, access_days, cover_url, duration_sec, level, skills, lesson_count, published, available_at, sort_index";

const PRODUCT_COLUMNS_LEGACY =
  "id, type, price_minor, price_usd_minor, price_eur_minor, currency, access_days, cover_url, duration_sec, level, skills, lesson_count, published";

const I18N_EMBED =
  "catalog_product_i18n ( locale, title, short, description, program )";

const PRODUCT_LIST_EMBEDS = `
  catalog_product_i18n ( locale, title, short ),
  catalog_product_media ( sort, url, kind )
`;

/** Public product columns — never kinescope / videos. */
export const PRODUCT_SELECT = `${PRODUCT_COLUMNS}, ${PRODUCT_EMBEDS}`;

/** Catalog/home cards: covers + titles only, no program/gifs/long bodies. */
export const PRODUCT_LIST_SELECT = `${PRODUCT_COLUMNS}, ${PRODUCT_LIST_EMBEDS}`;

/** Pre-023 schema: instance has not applied catalog_product_model yet. */
export const PRODUCT_SELECT_LEGACY = `${PRODUCT_COLUMNS_LEGACY}, ${I18N_EMBED}`;

export const CART_ITEMS_SELECT = `product_id, qty, added_at, catalog_products ( ${PRODUCT_COLUMNS}, ${PRODUCT_EMBEDS} )`;

export const CART_ITEMS_SELECT_LEGACY = `product_id, qty, added_at, catalog_products ( ${PRODUCT_SELECT_LEGACY} )`;

export const ACCESS_SELECT = `user_id, product_id, order_id, purchased_at, expires_at, status, catalog_products ( ${PRODUCT_COLUMNS}, ${PRODUCT_EMBEDS} )`;

export const ACCESS_SELECT_LEGACY = `user_id, product_id, order_id, purchased_at, expires_at, status, catalog_products ( ${PRODUCT_SELECT_LEGACY} )`;
