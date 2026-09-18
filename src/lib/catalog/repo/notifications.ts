import type { Notification } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  AuthRequiredError,
  requireUserId,
  throwIfPostgrestError,
} from "@/lib/catalog/repo/internal";

export const UNREAD_CHANGED_EVENT = "catalog-unread-changed";
export const SUPPORT_REPLY_TYPE = "support_reply";

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

export function emitUnreadChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UNREAD_CHANGED_EVENT));
}

async function requireUserIdOrNull(): Promise<string | null> {
  try {
    return await requireUserId();
  } catch (error) {
    if (error instanceof AuthRequiredError) return null;
    throw error;
  }
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
  emitUnreadChanged();
}

export async function markSupportNotificationsRead(): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserIdOrNull();
  if (!userId) return;

  const { error } = await supabase
    .from("catalog_notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("type", SUPPORT_REPLY_TYPE)
    .eq("read", false);

  throwIfPostgrestError(error);
  emitUnreadChanged();
}

export async function countUnreadNotifications(
  type?: string,
): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  const userId = await requireUserIdOrNull();
  if (!userId) return 0;

  let query = supabase
    .from("catalog_notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (type) query = query.eq("type", type);

  const { count, error } = await query;
  throwIfPostgrestError(error);
  return count ?? 0;
}

export async function peekUnreadSupportReply(): Promise<Notification | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await requireUserIdOrNull();
  if (!userId) return null;

  const { data, error } = await supabase
    .from("catalog_notifications")
    .select("id, user_id, type, title, body, href, read, created_at")
    .eq("type", SUPPORT_REPLY_TYPE)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfPostgrestError(error);
  return data ? mapNotificationRow(data as NotificationRow) : null;
}
