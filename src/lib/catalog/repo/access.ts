import type { Access, AccessStatus } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  ACCESS_SELECT,
  mapProductRow,
  requireUserId,
  throwIfPostgrestError,
  type ProductRow,
} from "@/lib/catalog/repo/internal";

type AccessRow = {
  user_id: string;
  product_id: string;
  order_id: string;
  purchased_at: string;
  expires_at: string;
  status: string;
  catalog_products?: ProductRow | ProductRow[] | null;
};

function isAccessStatus(value: string): value is AccessStatus {
  return value === "active" || value === "expired";
}

function mapAccessRow(row: AccessRow): Access | null {
  if (!isAccessStatus(row.status)) return null;
  const embedded = row.catalog_products;
  const productRow = Array.isArray(embedded) ? embedded[0] : embedded;
  const product = productRow ? mapProductRow(productRow) : null;

  const access: Access = {
    userId: row.user_id,
    productId: row.product_id,
    orderId: row.order_id,
    purchasedAt: row.purchased_at,
    expiresAt: row.expires_at,
    status: row.status,
  };
  if (product) access.product = product;
  return access;
}

/** Wave 1C: SELECT own rows. INSERT is service_role only. */
export async function listMyAccess(): Promise<Access[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_access")
    .select(ACCESS_SELECT)
    .order("purchased_at", { ascending: false });

  throwIfPostgrestError(error);

  const result: Access[] = [];
  for (const row of (data ?? []) as AccessRow[]) {
    const access = mapAccessRow(row);
    if (access) result.push(access);
  }
  return result;
}

export async function getMyAccess(productId: string): Promise<Access | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_access")
    .select(ACCESS_SELECT)
    .eq("product_id", productId)
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data) return null;

  return mapAccessRow(data as AccessRow);
}
