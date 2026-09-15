import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { AuthUser } from "@/lib/catalog/types";
import { getSupabase } from "@/lib/supabase/client";

export function mapAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
  };
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

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<AuthUser> {
  const supabase = clientOrThrow();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-in failed");
  return mapAuthUser(data.user);
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  const supabase = clientOrThrow();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: catalogAuthRedirectTo() },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Sign-up failed");
  return mapAuthUser(data.user);
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

export async function getUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw new Error(error.message);
  return data.user ? mapAuthUser(data.user) : null;
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
