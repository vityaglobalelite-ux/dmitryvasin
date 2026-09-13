import type { PostgrestError } from "@supabase/supabase-js";
import type {
  Currency,
  Locale,
  Product,
  ProductI18n,
  ProductType,
} from "@/lib/catalog/types";
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

export async function requireUserId(): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) throw new AuthRequiredError();
  return user.id;
}

const LOCALES: Locale[] = ["ru", "en"];

const EMPTY_I18N: ProductI18n = {
  title: "",
  short: "",
  description: "",
};

export type ProductI18nRow = {
  locale: string;
  title: string | null;
  short: string | null;
  description: string | null;
  program: string | null;
};

export type ProductRow = {
  id: string;
  type: string;
  price_minor: number;
  currency: string;
  access_days: number;
  cover_url: string;
  duration_sec: number;
  level: string;
  skills: string[] | null;
  lesson_count: number | null;
  published: boolean;
  catalog_product_i18n?: ProductI18nRow[] | null;
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

export function mapProductRow(row: ProductRow): Product | null {
  if (!isProductType(row.type) || !isCurrency(row.currency)) {
    return null;
  }
  return {
    id: row.id,
    type: row.type,
    priceMinor: row.price_minor,
    currency: row.currency,
    accessDays: row.access_days,
    coverUrl: row.cover_url,
    durationSec: row.duration_sec,
    level: row.level,
    skills: row.skills ?? [],
    lessonCount: row.lesson_count ?? undefined,
    i18n: buildProductI18n(row.catalog_product_i18n),
    published: row.published,
  };
}

/** Public product columns — never kinescope / videos. */
export const PRODUCT_SELECT =
  "id, type, price_minor, currency, access_days, cover_url, duration_sec, level, skills, lesson_count, published, catalog_product_i18n ( locale, title, short, description, program )";

export const CART_ITEMS_SELECT =
  "product_id, qty, added_at, catalog_products ( id, type, price_minor, currency, access_days, cover_url, duration_sec, level, skills, lesson_count, published, catalog_product_i18n ( locale, title, short, description, program ) )";

export const ACCESS_SELECT =
  "user_id, product_id, order_id, purchased_at, expires_at, status, catalog_products ( id, type, price_minor, currency, access_days, cover_url, duration_sec, level, skills, lesson_count, published, catalog_product_i18n ( locale, title, short, description, program ) )";
