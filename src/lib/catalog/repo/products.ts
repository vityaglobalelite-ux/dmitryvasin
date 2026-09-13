import type { Locale, Product, ProductType } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  mapProductRow,
  PRODUCT_SELECT,
  throwIfPostgrestError,
  type ProductRow,
} from "@/lib/catalog/repo/internal";

export type ListPublishedProductsOpts = {
  type?: ProductType;
  locale?: Locale;
};

/** Wave 1C: SELECT published products + i18n via RLS. */
export async function listPublishedProducts(
  opts: ListPublishedProductsOpts = {},
): Promise<Product[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("catalog_products")
    .select(PRODUCT_SELECT)
    .eq("published", true);

  if (opts.type) {
    query = query.eq("type", opts.type);
  }

  const { data, error } = await query;
  throwIfPostgrestError(error);

  const products: Product[] = [];
  for (const row of (data ?? []) as ProductRow[]) {
    const product = mapProductRow(row);
    if (product) products.push(product);
  }
  return products;
}

/** Wave 1C: SELECT one published product or null. */
export async function getPublishedProduct(
  id: string,
  _locale: Locale = "ru",
): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("catalog_products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data) return null;

  return mapProductRow(data as ProductRow);
}
