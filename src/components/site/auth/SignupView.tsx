"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useMemo, useState, type FormEvent } from "react";
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
import { mapSignupError } from "@/components/site/auth/mapError";
import { hrefWithReturnUrl } from "@/components/site/auth/returnUrl";
import {
  useAuthReturnUrl,
  useSignedInRedirect,
} from "@/components/site/auth/useAuthGate";
import { Button } from "@/components/site/ui/Button";
import { mergeGuestCartOnLogin } from "@/lib/catalog/cart";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { getSession, signUp } from "@/lib/supabase/auth";

export function SignupView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={3} />}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const copy = authT(useLocale());
  const routes = useLocalizedRoutes();
  const returnUrl = useAuthReturnUrl();
  const { blocked } = useSignedInRedirect(returnUrl);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;
  const match = password.length > 0 && confirm.length > 0 && password === confirm;

  const banner = useMemo(() => {
    if (error) return { tone: "error" as const, text: error };
    if (mismatch) return { tone: "error" as const, text: copy.mismatch };
    if (match) return { tone: "success" as const, text: copy.match };
    return null;
  }, [error, match, mismatch]);

  if (blocked) return <AuthScreenSkeleton fields={3} />;

  if (checkEmail) {
    return (
      <AuthScreen>
        <AuthCard>
          <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
            <AuthTitle>{copy.checkEmailTitle}</AuthTitle>
            <p className="max-w-[328px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:max-w-[254px] max-[600px]:text-[13px]">
              {copy.checkEmailBody.replace("{email}", checkEmail)}
            </p>
          </div>
          <AuthSwitch
            prompt={copy.hasAccount}
            href={hrefWithReturnUrl(routes.login, returnUrl)}
            action={copy.goLogin}
          />
        </AuthCard>
      </AuthScreen>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!privacy) {
      setPrivacyError(copy.privacyRequired);
      return;
    }
    setPrivacyError(null);
    if (mismatch || password !== confirm) {
      setError(copy.mismatch);
      return;
    }
    setPending(true);
    try {
      await signUp(email.trim(), password);
      const session = await getSession();
      if (!session?.user) {
        setCheckEmail(email.trim());
        return;
      }
      try {
        await mergeGuestCartOnLogin();
      } catch {
        /* Session is real; cart merge is best-effort. */
      }
      router.push(returnUrl);
    } catch (caught) {
      setError(mapSignupError(caught, copy));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen>
      <AuthCard>
        <form className="flex w-full flex-col gap-10 max-[600px]:gap-5" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
            <AuthTitle>{copy.signupTitle}</AuthTitle>
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
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                }}
                required
              />
              <AuthField
                label={copy.password}
                leading="lock"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder={copy.passwordPlaceholder}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                required
              />
              <AuthField
                label={copy.passwordRepeat}
                leading="lock"
                type="password"
                name="passwordConfirm"
                autoComplete="new-password"
                placeholder={copy.passwordPlaceholder}
                value={confirm}
                invalid={mismatch}
                onChange={(event) => {
                  setConfirm(event.target.value);
                  setError(null);
                }}
                required
              />
              {banner ? (
                <AuthBanner tone={banner.tone}>{banner.text}</AuthBanner>
              ) : null}
              {error === copy.userExists ? (
                <Link
                  href={hrefWithReturnUrl(routes.forgotPassword, returnUrl)}
                  className="w-full text-right text-[16px] font-semibold leading-[1.5] text-plum underline underline-offset-2 max-[600px]:text-[13px]"
                >
                  {copy.forgotLink}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-[30px] max-[600px]:gap-5">
            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                disabled={pending}
                className="w-full max-[600px]:text-[13px]"
              >
                {pending ? copy.submitting : copy.submitSignup}
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
              prompt={copy.hasAccount}
              href={hrefWithReturnUrl(routes.login, returnUrl)}
              action={copy.goLogin}
            />
          </div>
        </form>
      </AuthCard>
    </AuthScreen>
  );
}
