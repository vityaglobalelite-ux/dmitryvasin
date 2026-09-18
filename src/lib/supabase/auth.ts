import type { AuthChangeEvent, Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  asIdentifiedUser,
  type AuthUser,
} from "@/lib/catalog/types";
import { clearProfileCache } from "@/lib/catalog/repo/profile";
import { clearAccountListsCache } from "@/lib/catalog/repo/account-lists-cache";
import { getSupabase } from "@/lib/supabase/client";

const GUEST_META = "catalog_guest";
const GUEST_EMAIL_RE = /@guest\.betango\.internal$/i;

export function isGuestUser(user: User): boolean {
  if (user.is_anonymous === true) return true;
  if (user.user_metadata?.[GUEST_META] === true) return true;
  return GUEST_EMAIL_RE.test(user.email ?? "");
}

export function mapAuthUser(user: User): AuthUser {
  const guest = isGuestUser(user);
  return {
    id: user.id,
    email: guest ? null : (user.email ?? null),
    isAnonymous: guest,
  };
}

/** Full session identity, including anonymous support visitors. */
let cachedSessionUser: AuthUser | null | undefined;

export function peekCachedSessionUser(): AuthUser | null | undefined {
  return cachedSessionUser;
}

/** Identified account only — anonymous visitors are not "logged in". */
export function peekCachedAuthUser(): AuthUser | null | undefined {
  if (cachedSessionUser === undefined) return undefined;
  return asIdentifiedUser(cachedSessionUser);
}

export function rememberAuthUser(user: AuthUser | null): void {
  cachedSessionUser = user;
}

function isMissingSessionError(error: { message?: string } | null | undefined): boolean {
  return Boolean(error && /auth session missing/i.test(error.message ?? ""));
}

function clientOrThrow() {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error("Supabase is not configured");
  }
  return supabase;
}

function catalogAuthRedirectTo(): string {
  const accountPath = (pathname: string) =>
    pathname === "/en" || pathname.startsWith("/en/") ? "/en/account/" : "/account/";

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${accountPath(window.location.pathname)}`;
  }
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (appUrl) {
    return `${appUrl.replace(/\/+$/, "")}/account/`;
  }
  return "/account/";
}

async function claimGuestSupport(guestAccessToken: string): Promise<void> {
  const supabase = clientOrThrow();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const accessToken = session?.access_token?.trim();
  if (!accessToken) return;

  const { error } = await supabase.functions.invoke("catalog-claim-support", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: { guestAccessToken },
  });
  if (error) throw new Error(error.message);
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthUser> {
  const supabase = clientOrThrow();
  const {
    data: { session: previous },
  } = await supabase.auth.getSession();
  const guestToken = previous?.user && isGuestUser(previous.user)
    ? previous.access_token
    : null;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-in failed");
  const mapped = mapAuthUser(data.user);
  rememberAuthUser(mapped);
  if (guestToken && mapped.id !== previous?.user?.id) {
    try {
      await claimGuestSupport(guestToken);
    } catch {
      /* Login is real; thread merge is best-effort. */
    }
  }
  return mapped;
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const supabase = clientOrThrow();
  const {
    data: { session: existingSession },
  } = await supabase.auth.getSession();

  if (existingSession?.user && isGuestUser(existingSession.user)) {
    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
      data: { [GUEST_META]: false },
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Sign-up failed");
    const mapped = mapAuthUser(data.user);
    rememberAuthUser(mapped);
    return mapped;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: catalogAuthRedirectTo() },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-up failed");
  const mapped = mapAuthUser(data.user);
  rememberAuthUser(mapped);
  return mapped;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForCatalogProfile(userId: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data } = await supabase
      .from("catalog_profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();
    if (data?.id) return;
    await wait(90 * 2 ** attempt);
  }
}

/** Opens a durable browser session for support without logging the visitor in. */
export async function ensureSupportSession(): Promise<AuthUser> {
  const supabase = clientOrThrow();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError && !isMissingSessionError(sessionError)) {
    throw new Error(sessionError.message);
  }
  if (session?.user) {
    const mapped = mapAuthUser(session.user);
    rememberAuthUser(mapped);
    return mapped;
  }

  const { data, error } = await supabase.auth.signInAnonymously();
  if (!error && data.user) {
    const mapped = mapAuthUser(data.user);
    rememberAuthUser(mapped);
    await waitForCatalogProfile(mapped.id);
    return mapped;
  }
  if (error && !/anonymous sign-ins are disabled/i.test(error.message)) {
    throw new Error(error.message);
  }
  return openMintedGuestSession(supabase);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function openMintedGuestSession(
  supabase: SupabaseClient,
): Promise<AuthUser> {
  const { data, error } = await supabase.functions.invoke(
    "catalog-open-guest-session",
    { method: "POST", body: {} },
  );
  if (error) throw new Error(error.message);

  const accessToken =
    isRecord(data) && typeof data.access_token === "string"
      ? data.access_token.trim()
      : "";
  const refreshToken =
    isRecord(data) && typeof data.refresh_token === "string"
      ? data.refresh_token.trim()
      : "";
  if (!accessToken || !refreshToken) {
    throw new Error("Anonymous sign-ins are disabled");
  }

  const { data: sessionData, error: setError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  if (setError || !sessionData.user) {
    throw new Error(setError?.message || "guest session failed");
  }
  const mapped = mapAuthUser(sessionData.user);
  rememberAuthUser(mapped);
  await waitForCatalogProfile(mapped.id);
  return mapped;
}

let authPromptSuppressed = false;

/** True between sign-out and landing on a public route. Protected pages must not prompt login. */
export function isAuthPromptSuppressed(): boolean {
  return authPromptSuppressed;
}

export function suppressAuthPrompt(): void {
  authPromptSuppressed = true;
}

export function resumeAuthPrompt(): void {
  authPromptSuppressed = false;
}

export async function signOut(): Promise<void> {
  suppressAuthPrompt();
  rememberAuthUser(null);
  clearProfileCache();
  clearAccountListsCache();
  const supabase = clientOrThrow();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  } catch (error) {
    resumeAuthPrompt();
    throw error;
  }
}

export async function resetPasswordForEmail(email: string): Promise<void> {
  const supabase = clientOrThrow();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: catalogAuthRedirectTo(),
  });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password: string): Promise<void> {
  const supabase = clientOrThrow();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if (isMissingSessionError(error)) return null;
    throw new Error(error.message);
  }
  return data.user ? mapAuthUser(data.user) : null;
}

export async function getUser(): Promise<AuthUser | null> {
  return asIdentifiedUser(await getSessionUser());
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): { unsubscribe: () => void } {
  const supabase = getSupabase();
  if (!supabase) {
    return { unsubscribe: () => {} };
  }
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback);
  return { unsubscribe: () => subscription.unsubscribe() };
}
