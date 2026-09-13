import type { Notification } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import { requireUserId, throwIfPostgrestError } from "@/lib/catalog/repo/internal";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  created_at: string;
};

function mapNotificationRow(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    href: row.href,
    read: row.read,
    createdAt: row.created_at,
  };
}

export async function listNotifications(): Promise<Notification[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_notifications")
    .select("id, user_id, type, title, body, href, read, created_at")
    .order("created_at", { ascending: false });

  throwIfPostgrestError(error);
  return ((data ?? []) as NotificationRow[]).map(mapNotificationRow);
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();

  const { error } = await supabase
    .from("catalog_notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", userId);

  throwIfPostgrestError(error);
}

export async function countUnreadNotifications(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  await requireUserId();

  const { count, error } = await supabase
    .from("catalog_notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  throwIfPostgrestError(error);
  return count ?? 0;
}
