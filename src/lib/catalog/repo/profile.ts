import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";
import {
  AuthRequiredError,
  requireUserId,
  throwIfPostgrestError,
} from "@/lib/catalog/repo/internal";

export const AVATAR_BUCKET = "catalog-avatars";
const AVATAR_FALLBACK_BUCKET = "catalog-support";
export const AVATAR_MAX_BYTES = 8 * 1024 * 1024;

const PROFILE_SELECT = "id, email, first_name, last_name, avatar_path, created_at";
const PROFILE_SELECT_LEGACY = "id, email, created_at";
const SIGNED_URL_TTL_SEC = 60 * 60 * 24;
const META_FIRST = "catalog_first_name";
const META_LAST = "catalog_last_name";
const META_AVATAR = "catalog_avatar_path";
const META_BUCKET = "catalog_avatar_bucket";

type ProfileRow = {
  id: string;
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_path?: string | null;
  created_at: string;
};

type AvatarRef = {
  path: string | null;
  bucket: string | null;
};

const profileListeners = new Set<() => void>();

export function notifyProfileChanged(): void {
  for (const listener of profileListeners) listener();
}

export function onProfileChanged(listener: () => void): () => void {
  profileListeners.add(listener);
  return () => {
    profileListeners.delete(listener);
  };
}

function metaString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isMissingColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42703" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

function metaFromUser(user: User): {
  firstName: string;
  lastName: string;
  avatar: AvatarRef;
} {
  const meta = user.user_metadata ?? {};
  return {
    firstName: metaString(meta[META_FIRST]),
    lastName: metaString(meta[META_LAST]),
    avatar: {
      path: metaString(meta[META_AVATAR]) || null,
      bucket: metaString(meta[META_BUCKET]) || null,
    },
  };
}

async function requireUser(): Promise<User> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  if (!user) throw new AuthRequiredError();
  return user;
}

async function resolveAvatarUrl(avatar: AvatarRef): Promise<string | null> {
  const path = avatar.path?.trim();
  if (!path || path.includes("..")) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  const bucket = avatar.bucket || AVATAR_BUCKET;
  if (bucket === AVATAR_BUCKET) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl || null;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL_SEC);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

async function mapProfile(
  row: ProfileRow,
  user: User,
): Promise<Profile> {
  const meta = metaFromUser(user);
  const firstName = row.first_name?.trim() || meta.firstName;
  const lastName = row.last_name?.trim() || meta.lastName;
  const avatar: AvatarRef = {
    path: row.avatar_path?.trim() || meta.avatar.path,
    bucket: row.avatar_path?.trim()
      ? AVATAR_BUCKET
      : meta.avatar.bucket,
  };
  if (row.avatar_path?.trim() && meta.avatar.path === row.avatar_path.trim()) {
    avatar.bucket = meta.avatar.bucket || AVATAR_BUCKET;
  }

  return {
    id: row.id,
    email: row.email ?? user.email ?? "",
    firstName,
    lastName,
    avatarPath: avatar.path,
    avatarBucket: avatar.path ? avatar.bucket : null,
    avatarUrl: await resolveAvatarUrl(avatar),
    createdAt: row.created_at,
  };
}

export function profileDisplayName(
  profile: Pick<Profile, "firstName" | "lastName" | "email"> | null | undefined,
  fallback = "",
): string {
  const full = [profile?.firstName, profile?.lastName]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" ");
  if (full) return full;
  const email = profile?.email?.trim();
  if (!email) return fallback;
  return email.split("@")[0]?.trim() || email;
}

export function profileAvatarSrc(profile: Profile | null | undefined): string | null {
  const url = profile?.avatarUrl?.trim();
  return url || null;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const user = await requireUser();

  const full = await supabase
    .from("catalog_profiles")
    .select(PROFILE_SELECT)
    .eq("id", user.id)
    .maybeSingle();

  if (full.error && !isMissingColumn(full.error)) {
    throwIfPostgrestError(full.error);
  }

  if (full.data && !full.error) {
    return mapProfile(full.data as ProfileRow, user);
  }

  const legacy = await supabase
    .from("catalog_profiles")
    .select(PROFILE_SELECT_LEGACY)
    .eq("id", user.id)
    .maybeSingle();

  throwIfPostgrestError(legacy.error);
  if (!legacy.data) return null;
  return mapProfile(legacy.data as ProfileRow, user);
}

async function writeAuthMeta(
  firstName: string,
  lastName: string,
  avatar: AvatarRef,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");
  const { error } = await supabase.auth.updateUser({
    data: {
      [META_FIRST]: firstName,
      [META_LAST]: lastName,
      [META_AVATAR]: avatar.path,
      [META_BUCKET]: avatar.bucket,
    },
  });
  if (error) throw new Error(error.message);
}

export async function updateMyProfile(input: {
  firstName: string;
  lastName: string;
  avatarPath: string | null;
  avatarBucket?: string | null;
}): Promise<Profile> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const user = await requireUser();
  const firstName = input.firstName.trim().slice(0, 80);
  const lastName = input.lastName.trim().slice(0, 80);
  const avatar: AvatarRef = {
    path: input.avatarPath,
    bucket: input.avatarPath ? input.avatarBucket || AVATAR_BUCKET : null,
  };

  await writeAuthMeta(firstName, lastName, avatar);

  const { data, error } = await supabase
    .from("catalog_profiles")
    .update({
      first_name: firstName || null,
      last_name: lastName || null,
      avatar_path: avatar.path,
    })
    .eq("id", user.id)
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error && !isMissingColumn(error)) {
    throwIfPostgrestError(error);
  }

  const row: ProfileRow = data
    ? (data as ProfileRow)
    : {
        id: user.id,
        email: user.email ?? "",
        first_name: firstName,
        last_name: lastName,
        avatar_path: avatar.path,
        created_at: user.created_at,
      };

  const profile = await mapProfile(row, {
    ...user,
    user_metadata: {
      ...user.user_metadata,
      [META_FIRST]: firstName,
      [META_LAST]: lastName,
      [META_AVATAR]: avatar.path,
      [META_BUCKET]: avatar.bucket,
    },
  });
  notifyProfileChanged();
  return profile;
}

export async function uploadMyAvatar(file: File): Promise<{ path: string; bucket: string }> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured");

  const userId = await requireUserId();
  if (file.size <= 0) throw new Error("empty_file");
  if (file.size > AVATAR_MAX_BYTES) throw new Error("avatar_too_large");

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const options = {
    upsert: false,
    contentType: file.type || "image/webp",
    cacheControl: "3600",
  };

  const primary = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, options);
  if (!primary.error) return { path, bucket: AVATAR_BUCKET };

  const fallback = await supabase.storage.from(AVATAR_FALLBACK_BUCKET).upload(path, file, options);
  if (fallback.error) throw new Error(fallback.error.message);
  return { path, bucket: AVATAR_FALLBACK_BUCKET };
}

export async function deleteMyAvatar(
  path: string | null | undefined,
  bucket?: string | null,
): Promise<void> {
  const cleaned = path?.trim();
  if (!cleaned || cleaned.includes("..")) return;

  const supabase = getSupabase();
  if (!supabase) return;

  const userId = await requireUserId();
  const prefix = `${userId}/`;
  if (!cleaned.startsWith(prefix)) return;

  await supabase.storage.from(bucket || AVATAR_BUCKET).remove([cleaned]);
  if (bucket !== AVATAR_FALLBACK_BUCKET) {
    await supabase.storage.from(AVATAR_FALLBACK_BUCKET).remove([cleaned]);
  }
}
