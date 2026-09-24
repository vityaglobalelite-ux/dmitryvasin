import {
  dropPostureBlocksIfFullCovered,
  isPostureBundleBlock,
  isPostureBundleFull,
} from "@/lib/catalog/bundles";
import { POSTURE_BUNDLE } from "@/lib/catalog/ids";
import { asIdentifiedUser, type CartItem } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import { mapAuthUser, peekCachedAuthUser } from "@/lib/supabase/auth";
import {
  AuthRequiredError,
  CART_ITEMS_SELECT,
  CART_ITEMS_SELECT_LEGACY,
  catalogSelectWithFallback,
  mapProductRow,
  throwIfPostgrestError,
  type ProductRow,
} from "@/lib/catalog/repo/internal";

/** Local session id. RLS still checks the JWT; this skips the Auth round trip. */
async function actorId(): Promise<string> {
  const cached = peekCachedAuthUser();
  if (cached) return cached.id;

  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error || !session?.user) throw new AuthRequiredError();
  const mapped = asIdentifiedUser(mapAuthUser(session.user));
  if (!mapped) throw new AuthRequiredError();
  return mapped.id;
}

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

  await actorId();

  const result = await catalogSelectWithFallback(
    CART_ITEMS_SELECT,
    CART_ITEMS_SELECT_LEGACY,
    (select) =>
      supabase
        .from("catalog_cart_items")
        .select(select)
        .order("added_at", { ascending: true }),
  );

  throwIfPostgrestError(result.error);
  return ((result.data ?? []) as unknown as CartItemRow[]).map(mapCartItemRow);
}

export class CartBundleConflictError extends Error {
  readonly name = "CartBundleConflictError";
}

function isActiveAccessRow(
  row: { status?: string; expires_at?: string } | null,
): boolean {
  if (!row || row.status !== "active" || !row.expires_at) return false;
  const expires = Date.parse(row.expires_at);
  return Number.isFinite(expires) && expires > Date.now();
}

async function hasActiveFullAccess(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("catalog_access")
    .select("status, expires_at")
    .eq("user_id", userId)
    .eq("product_id", POSTURE_BUNDLE.fullId)
    .maybeSingle();
  throwIfPostgrestError(error);
  return isActiveAccessRow(data);
}

async function dropCartBlocks(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase
    .from("catalog_cart_items")
    .delete()
    .eq("user_id", userId)
    .in("product_id", [POSTURE_BUNDLE.block1Id, POSTURE_BUNDLE.block2Id]);
  throwIfPostgrestError(error);
}

async function enforceBundleCartRules(
  userId: string,
  productId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  if (isPostureBundleBlock(productId)) {
    if (await hasActiveFullAccess(userId)) {
      throw new CartBundleConflictError();
    }
    const { data, error } = await supabase
      .from("catalog_cart_items")
      .select("product_id")
      .eq("user_id", userId)
      .eq("product_id", POSTURE_BUNDLE.fullId)
      .maybeSingle();
    throwIfPostgrestError(error);
    if (data) throw new CartBundleConflictError();
  }

  if (isPostureBundleFull(productId)) {
    await dropCartBlocks(userId);
  }
}

export async function upsertCartItem(productId: string, qty = 1): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await actorId();
  const safeQty = Math.min(Math.max(qty, 1), 1);

  await enforceBundleCartRules(userId, productId);

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

  const userId = await actorId();

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

  const userId = await actorId();
  const unique = new Map<string, CartItem>();
  for (const item of items) {
    if (!unique.has(item.productId)) unique.set(item.productId, item);
  }
  if (unique.size === 0) return;

  const { data: existing, error: existingErr } = await supabase
    .from("catalog_cart_items")
    .select("product_id")
    .eq("user_id", userId);
  throwIfPostgrestError(existingErr);

  const hasFullAccess = await hasActiveFullAccess(userId);
  const combined = dropPostureBlocksIfFullCovered(
    [
      ...(existing ?? []).map((row) => row.product_id),
      ...unique.keys(),
    ],
    hasFullAccess,
  );
  const keep = new Set(combined);
  if (hasFullAccess || keep.has(POSTURE_BUNDLE.fullId)) {
    await dropCartBlocks(userId);
  }

  const now = new Date().toISOString();
  const rows = [...unique.values()]
    .filter((item) => keep.has(item.productId))
    .map((item) => ({
      user_id: userId,
      product_id: item.productId,
      qty: 1,
      added_at: item.addedAt || now,
    }));
  if (rows.length === 0) return;

  const { error } = await supabase
    .from("catalog_cart_items")
    .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });

  throwIfPostgrestError(error);
}

export async function clearCart(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await actorId();

  const { error } = await supabase
    .from("catalog_cart_items")
    .delete()
    .eq("user_id", userId);

  throwIfPostgrestError(error);
}
