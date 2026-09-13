"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import {
  AuthBanner,
  AuthCard,
  AuthField,
  AuthScreen,
  AuthScreenSkeleton,
  AuthSwitch,
  AuthTitle,
  PrivacyConsent,
} from "@/components/site/auth/AuthPrimitives";
import { authT } from "@/components/site/auth/copy";
import { mapLoginError } from "@/components/site/auth/mapError";
import { hrefWithReturnUrl } from "@/components/site/auth/returnUrl";
import {
  useAuthReturnUrl,
  useSignedInRedirect,
} from "@/components/site/auth/useAuthGate";
import { Button } from "@/components/site/ui/Button";
import { mergeGuestCartOnLogin } from "@/lib/catalog/cart";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { getSession, signInWithPassword } from "@/lib/supabase/auth";

export function LoginView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={2} />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const copy = authT(useLocale());
  const routes = useLocalizedRoutes();
  const returnUrl = useAuthReturnUrl();
  const { blocked } = useSignedInRedirect(returnUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (blocked) return <AuthScreenSkeleton fields={2} />;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!privacy) {
      setPrivacyError(copy.privacyRequired);
      return;
    }
    setPrivacyError(null);
    setPending(true);
    try {
      await signInWithPassword(email.trim(), password);
      const session = await getSession();
      if (!session?.user) {
        setError(copy.loginError);
        return;
      }
      try {
        await mergeGuestCartOnLogin();
      } catch {
        /* Session is real; cart merge is best-effort. */
      }
      router.push(returnUrl);
    } catch (caught) {
      setError(mapLoginError(caught, copy));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen>
      <AuthCard>
        <form className="flex w-full flex-col gap-10 max-[600px]:gap-5" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
            <AuthTitle>{copy.loginTitle}</AuthTitle>
            <div className="flex w-full flex-col gap-4">
              <AuthField
                label={copy.email}
                leading="mail"
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <AuthField
                label={copy.password}
                leading="lock"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {error ? <AuthBanner tone="error">{error}</AuthBanner> : null}
              <Link
                href={hrefWithReturnUrl(routes.forgotPassword, returnUrl)}
                className="w-full text-right text-[16px] font-semibold leading-[1.5] text-plum underline underline-offset-2 max-[600px]:text-[13px]"
              >
                {copy.forgotLink}
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-[30px] max-[600px]:gap-5">
            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                disabled={pending}
                className="w-full max-[600px]:text-[13px]"
              >
                {pending ? copy.submitting : copy.submitLogin}
              </Button>
              <PrivacyConsent
                checked={privacy}
                onChange={(next) => {
                  setPrivacy(next);
                  if (next) setPrivacyError(null);
                }}
                requiredMessage={privacyError}
              />
            </div>
            <AuthSwitch
              prompt={copy.noAccount}
              href={hrefWithReturnUrl(routes.signup, returnUrl)}
              action={copy.goSignup}
            />
          </div>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
