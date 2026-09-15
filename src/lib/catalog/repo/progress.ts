import type { WatchProgress } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  requireUserId,
  throwIfPostgrestError,
} from "@/lib/catalog/repo/internal";
import { notifyWatchProgress } from "@/lib/catalog/watch-progress";

const PROGRESS_SELECT =
  "product_id, position_sec, duration_sec, completed, updated_at";

type ProgressRow = {
  product_id: string;
  position_sec: number;
  duration_sec: number;
  completed: boolean;
  updated_at: string;
};

function asNonNegInt(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function mapProgressRow(row: ProgressRow): WatchProgress {
  return {
    productId: row.product_id,
    positionSec: asNonNegInt(row.position_sec),
    durationSec: asNonNegInt(row.duration_sec),
    completed: row.completed === true,
    updatedAt: row.updated_at,
  };
}

export async function listMyWatchProgress(): Promise<WatchProgress[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  await requireUserId();

  const { data, error } = await supabase
    .from("catalog_watch_progress")
    .select(PROGRESS_SELECT)
    .order("updated_at", { ascending: false });

  throwIfPostgrestError(error);
  return ((data ?? []) as ProgressRow[]).map(mapProgressRow);
}

export async function getMyWatchProgress(
  productId: string,
): Promise<WatchProgress | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  await requireUserId();
  const id = productId.trim();
  if (!id) return null;

  const { data, error } = await supabase
    .from("catalog_watch_progress")
    .select(PROGRESS_SELECT)
    .eq("product_id", id)
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data) return null;
  return mapProgressRow(data as ProgressRow);
}

export async function upsertWatchProgress(input: {
  productId: string;
  positionSec: number;
  durationSec: number;
  completed: boolean;
}): Promise<WatchProgress> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const userId = await requireUserId();
  const productId = input.productId.trim();
  if (!productId) throw new Error("product_id required");

  const durationSec = asNonNegInt(input.durationSec);
  let positionSec = asNonNegInt(input.positionSec);
  if (durationSec > 0) positionSec = Math.min(positionSec, durationSec);
  const row = {
    user_id: userId,
    product_id: productId,
    position_sec: positionSec,
    duration_sec: durationSec,
    completed: input.completed === true,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("catalog_watch_progress")
    .upsert(row, { onConflict: "user_id,product_id" })
    .select(PROGRESS_SELECT)
    .maybeSingle();

  throwIfPostgrestError(error);
  const mapped = data
    ? mapProgressRow(data as ProgressRow)
    : {
        productId,
        positionSec,
        durationSec,
        completed: row.completed,
        updatedAt: row.updated_at,
      };
  notifyWatchProgress(mapped);
  return mapped;
}
