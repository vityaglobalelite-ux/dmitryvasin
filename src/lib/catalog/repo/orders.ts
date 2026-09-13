import type { Currency, Order, OrderItem, OrderStatus } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import { requireUserId, throwIfPostgrestError } from "@/lib/catalog/repo/internal";

type OrderItemRow = {
  order_id: string;
  product_id: string;
  title_snapshot: string;
  price_minor: number;
  qty: number;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  subtotal_minor: number;
  discount_minor: number;
  total_minor: number;
  currency: string;
  stripe_session_id: string | null;
  created_at: string;
  catalog_order_items?: OrderItemRow[] | null;
};

function isOrderStatus(value: string): value is OrderStatus {
  return (
    value === "pending" ||
    value === "paid" ||
    value === "failed" ||
    value === "canceled"
  );
}

function isCurrency(value: string): value is Currency {
  return value === "rub" || value === "eur" || value === "usd";
}

function mapOrderItemRow(row: OrderItemRow): OrderItem {
  return {
    orderId: row.order_id,
    productId: row.product_id,
    titleSnapshot: row.title_snapshot,
    priceMinor: row.price_minor,
    qty: row.qty,
  };
}

function mapOrderRow(row: OrderRow): Order | null {
  if (!isOrderStatus(row.status) || !isCurrency(row.currency)) return null;
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    subtotalMinor: row.subtotal_minor,
    discountMinor: row.discount_minor,
    totalMinor: row.total_minor,
    currency: row.currency,
    stripeSessionId: row.stripe_session_id,
    createdAt: row.created_at,
    items: (row.catalog_order_items ?? []).map(mapOrderItemRow),
  };
}

const ORDER_SELECT =
  "id, user_id, status, subtotal_minor, discount_minor, total_minor, currency, stripe_session_id, created_at, catalog_order_items ( order_id, product_id, title_snapshot, price_minor, qty )";

/** Wave 1C: SELECT own paid/pending orders. */
export async function listMyOrders(): Promise<Order[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  throwIfPostgrestError(error);

  const result: Order[] = [];
  for (const row of (data ?? []) as OrderRow[]) {
    const order = mapOrderRow(row);
    if (order) result.push(order);
  }
  return result;
}

export async function getMyOrder(id: string): Promise<Order | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data) return null;

  return mapOrderRow(data as OrderRow);
}
