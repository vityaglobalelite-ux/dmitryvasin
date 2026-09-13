"use client";

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
import { mapResetError } from "@/components/site/auth/mapError";
import { hrefWithReturnUrl } from "@/components/site/auth/returnUrl";
import {
  useAuthReturnUrl,
  useSignedInRedirect,
} from "@/components/site/auth/useAuthGate";
import { Button } from "@/components/site/ui/Button";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { resetPasswordForEmail } from "@/lib/supabase/auth";

export function ForgotPasswordView() {
  return (
    <Suspense fallback={<AuthScreenSkeleton fields={1} />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}

function ForgotPasswordForm() {
  const copy = authT(useLocale());
  const routes = useLocalizedRoutes();
  const returnUrl = useAuthReturnUrl();
  const { blocked } = useSignedInRedirect(returnUrl);
  const [email, setEmail] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  if (blocked) return <AuthScreenSkeleton fields={1} />;

  if (sentTo) {
    return (
      <AuthScreen>
        <AuthCard>
          <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
            <AuthTitle>{copy.forgotSentTitle}</AuthTitle>
            <p className="max-w-[328px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:max-w-[254px] max-[600px]:text-[13px]">
              {copy.forgotSentBody.replace("{email}", sentTo)}
            </p>
          </div>
          <AuthSwitch
            prompt={copy.noAccount}
            href={hrefWithReturnUrl(routes.signup, returnUrl)}
            action={copy.goSignup}
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
    setPending(true);
    try {
      await resetPasswordForEmail(email.trim());
      setSentTo(email.trim());
    } catch (caught) {
      setError(mapResetError(caught, copy));
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen>
      <AuthCard>
        <form className="flex w-full flex-col gap-10 max-[600px]:gap-5" onSubmit={onSubmit}>
          <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
            <AuthTitle>{copy.forgotTitle}</AuthTitle>
            <p className="max-w-[254px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:text-[13px]">
              {copy.forgotSubtitle}
            </p>
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
              {error ? <AuthBanner tone="error">{error}</AuthBanner> : null}
            </div>
          </div>
          <div className="flex flex-col gap-[30px] max-[600px]:gap-5">
            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                disabled={pending}
                className="w-full max-[600px]:text-[13px]"
              >
                {pending ? copy.submitting : copy.submitForgot}
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
