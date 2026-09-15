import { authCopy, type AuthCopy } from "@/components/site/auth/copy";

function messageOf(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "";
}

function lower(error: unknown): string {
  return messageOf(error).toLowerCase();
}

export function mapLoginError(error: unknown, copy: AuthCopy = authCopy): string {
  const text = lower(error);
  if (text.includes("not configured")) return copy.notConfigured;
  if (text.includes("email not confirmed") || text.includes("not_confirmed")) {
    return copy.emailNotConfirmed;
  }
  if (
    text.includes("invalid login") ||
    text.includes("invalid credentials") ||
    text.includes("invalid_credentials") ||
    text.includes("wrong password") ||
    text.includes("invalid email or password")
  ) {
    return copy.loginError;
  }
  return copy.loginError;
}

export function mapSignupError(error: unknown, copy: AuthCopy = authCopy): string {
  const text = lower(error);
  if (text.includes("not configured")) return copy.notConfigured;
  if (
    text.includes("already registered") ||
    text.includes("already been registered") ||
    text.includes("user_already_exists") ||
    text.includes("already exists")
  ) {
    return copy.userExists;
  }
  if (text.includes("weak") || text.includes("password should be")) {
    return copy.weakPassword;
  }
  return copy.genericError;
}

export function mapResetError(error: unknown, copy: AuthCopy = authCopy): string {
  const text = lower(error);
  if (text.includes("not configured")) return copy.notConfigured;
  if (text.includes("weak") || text.includes("password should be")) {
    return copy.weakPassword;
  }
  return copy.genericError;
}
