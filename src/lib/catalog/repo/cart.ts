import type { CartItem } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  CART_ITEMS_SELECT,
  mapProductRow,
  requireUserId,
  throwIfPostgrestError,
  type ProductRow,
} from "@/lib/catalog/repo/internal";

type CartItemRow = {
  product_id: string;
  qty: number;
  added_at: string;
  catalog_products?: ProductRow | ProductRow[] | null;
};

function mapCartItemRow(row: CartItemRow): CartItem {
  const embedded = row.catalog_products;
  const productRow = Array.isArray(embedded) ? embedded[0] : embedded;
  const product = productRow ? mapProductRow(productRow) : null;

  const item: CartItem = {
    productId: row.product_id,
    qty: 1,
    addedAt: row.added_at,
  };
  if (product) item.product = product;
  return item;
}

/** Wave 1C: RLS `auth.uid() = user_id`. */
export async function listCartItems(): Promise<CartItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_cart_items")
    .select(CART_ITEMS_SELECT)
    .order("added_at", { ascending: true });

  throwIfPostgrestError(error);
  return ((data ?? []) as CartItemRow[]).map(mapCartItemRow);
}

export async function upsertCartItem(productId: string, qty = 1): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();
  const safeQty = Math.min(Math.max(qty, 1), 1);

  const { error } = await supabase.from("catalog_cart_items").upsert(
    {
      user_id: userId,
      product_id: productId,
      qty: safeQty,
      added_at: new Date().toISOString(),
    },
    { onConflict: "user_id,product_id" },
  );

  throwIfPostgrestError(error);
}

export async function removeCartItem(productId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();

  const { error } = await supabase
    .from("catalog_cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  throwIfPostgrestError(error);
}

export async function mergeGuestCart(items: CartItem[]): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();
  const unique = new Map<string, CartItem>();
  for (const item of items) {
    if (!unique.has(item.productId)) unique.set(item.productId, item);
  }
  if (unique.size === 0) return;

  const rows = [...unique.values()].map((item) => ({
    user_id: userId,
    product_id: item.productId,
    qty: 1,
    added_at: item.addedAt || new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("catalog_cart_items")
    .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });

  throwIfPostgrestError(error);
}

export async function clearCart(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();

  const { error } = await supabase
    .from("catalog_cart_items")
    .delete()
    .eq("user_id", userId);

  throwIfPostgrestError(error);
}
