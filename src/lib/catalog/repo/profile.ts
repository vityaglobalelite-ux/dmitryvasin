import type { Profile } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import { requireUserId, throwIfPostgrestError } from "@/lib/catalog/repo/internal";

type ProfileRow = {
  id: string;
  email: string;
  created_at: string;
};

function mapProfileRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
  };
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userId = await requireUserId();

  const { data, error } = await supabase
    .from("catalog_profiles")
    .select("id, email, created_at")
    .eq("id", userId)
    .maybeSingle();

  throwIfPostgrestError(error);
  if (!data) return null;

  return mapProfileRow(data as ProfileRow);
}
