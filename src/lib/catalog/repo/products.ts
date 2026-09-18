import type { Locale, Product, PublicProductType } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  mapProductRow,
  PRODUCT_LIST_SELECT,
  PRODUCT_SELECT,
  PRODUCT_SELECT_LEGACY,
  catalogSelectWithFallback,
  throwIfPostgrestError,
  type ProductRow,
} from "@/lib/catalog/repo/internal";

export const PUBLIC_PRODUCT_TYPES: PublicProductType[] = [
  "lifehack",
  "lesson",
  "course",
  "peek",
];

export type ListPublishedProductsOpts = {
  type?: PublicProductType;
  locale?: Locale;
};

function comparePublishedProducts(a: Product, b: Product): number {
  if (a.type === "peek" && b.type === "peek") {
    const ai = a.sortIndex ?? Number.MAX_SAFE_INTEGER;
    const bi = b.sortIndex ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    const at = a.availableAt ? Date.parse(a.availableAt) : 0;
    const bt = b.availableAt ? Date.parse(b.availableAt) : 0;
    if (at !== bt) return at - bt;
  }
  return a.id.localeCompare(b.id);
}

/** Wave 1C: SELECT published products + i18n via RLS. */
export async function listPublishedProducts(
  opts: ListPublishedProductsOpts = {},
): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const locale = opts.locale ?? "ru";
  const types = opts.type ? [opts.type] : PUBLIC_PRODUCT_TYPES;

  const run = async (select: string) =>
    supabase
      .from("catalog_products")
      .select(select)
      .eq("published", true)
      .in("type", types);

  const { data, error } = await catalogSelectWithFallback(
    PRODUCT_LIST_SELECT,
    PRODUCT_SELECT_LEGACY,
    run,
  );
  throwIfPostgrestError(error);

  const products: Product[] = [];
  for (const row of (data ?? []) as unknown as ProductRow[]) {
    const product = mapProductRow(row, locale);
    if (product) products.push(product);
  }
  products.sort(comparePublishedProducts);
  return products;
}

/** Wave 1C: SELECT one published product or null. */
export async function getPublishedProduct(
  id: string,
  locale: Locale = "ru",
): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const run = async (select: string) =>
    supabase
      .from("catalog_products")
      .select(select)
      .eq("id", id)
      .eq("published", true)
      .in("type", PUBLIC_PRODUCT_TYPES)
      .maybeSingle();

  const { data, error } = await catalogSelectWithFallback(
    PRODUCT_SELECT,
    PRODUCT_SELECT_LEGACY,
    run,
  );
  throwIfPostgrestError(error);
  if (!data) return null;

  return mapProductRow(data as unknown as ProductRow, locale);
}
