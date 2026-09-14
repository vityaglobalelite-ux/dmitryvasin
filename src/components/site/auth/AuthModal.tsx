"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AuthBanner,
  AuthCard,
  AuthField,
  AuthScreenSkeleton,
  AuthSwitch,
  AuthTitle,
  PrivacyConsent,
} from "@/components/site/auth/AuthPrimitives";
import { authT } from "@/components/site/auth/copy";
import {
  mapLoginError,
  mapResetError,
  mapSignupError,
} from "@/components/site/auth/mapError";
import { safeReturnUrl } from "@/components/site/auth/returnUrl";
import { Button } from "@/components/site/ui/Button";
import { mergeGuestCartOnLogin } from "@/lib/catalog/cart";
import { useAuthUser } from "@/lib/catalog/hooks";
import { emitCartChanged } from "@/lib/catalog/use-add-to-cart";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT, useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import {
  getSession,
  resetPasswordForEmail,
  signInWithPassword,
  signUp,
} from "@/lib/supabase/auth";

export type AuthMode = "login" | "signup" | "forgot";

type OpenAuthOptions = {
  onDismiss?: () => void;
};

type AuthModalContextValue = {
  open: boolean;
  mode: AuthMode;
  openAuth: (mode?: AuthMode, options?: OpenAuthOptions) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
};

const CLOSE_MS = 280;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [session, setSession] = useState(0);
  const dismissRef = useRef<(() => void) | undefined>(undefined);
  const closeReasonRef = useRef<"dismiss" | "success">("dismiss");
  const closingRef = useRef(false);
  const openRef = useRef(false);

  const openAuth = useCallback((next: AuthMode = "login", options?: OpenAuthOptions) => {
    dismissRef.current = options?.onDismiss;
    closeReasonRef.current = "dismiss";
    setMode(next);
    closingRef.current = false;
    setClosing(false);
    if (!openRef.current) setSession((value) => value + 1);
    openRef.current = true;
    setOpen(true);
  }, []);

  const closeAuth = useCallback((reason: "dismiss" | "success" = "dismiss") => {
    if (!openRef.current || closingRef.current) return;
    closeReasonRef.current = reason;
    if (reason === "success") dismissRef.current = undefined;
    closingRef.current = true;
    setClosing(true);
  }, []);

  const dismissAuth = useCallback(() => closeAuth("dismiss"), [closeAuth]);
  const succeedAuth = useCallback(() => closeAuth("success"), [closeAuth]);

  const { data: user } = useAuthUser();
  useEffect(() => {
    if (user) closeAuth("success");
  }, [closeAuth, user]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      const dismiss = dismissRef.current;
      const reason = closeReasonRef.current;
      dismissRef.current = undefined;
      openRef.current = false;
      closingRef.current = false;
      setOpen(false);
      setClosing(false);
      if (reason === "dismiss") dismiss?.();
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [closing]);

  const value: AuthModalContextValue = {
    open,
    mode,
    openAuth,
    closeAuth: dismissAuth,
    setMode,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <AuthDialog
        open={open}
        closing={closing}
        mode={mode}
        session={session}
        setMode={setMode}
        onDismiss={dismissAuth}
        onSuccess={succeedAuth}
      />
    </AuthModalContext.Provider>
  );
}

function AuthDialog({
  open,
  closing,
  mode,
  session,
  setMode,
  onDismiss,
  onSuccess,
}: {
  open: boolean;
  closing: boolean;
  mode: AuthMode;
  session: number;
  setMode: (mode: AuthMode) => void;
  onDismiss: () => void;
  onSuccess: () => void;
}) {
  const copy = authT(useLocale());
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);

  function isInsideDialog(target: EventTarget | null): boolean {
    return target instanceof Node && Boolean(panelRef.current?.contains(target));
  }

  function onBackdropPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    backdropPressRef.current = !isInsideDialog(event.target);
  }

  function onBackdropPointerUp(event: PointerEvent<HTMLDivElement>) {
    const startedOnBackdrop = backdropPressRef.current;
    backdropPressRef.current = false;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!startedOnBackdrop || isInsideDialog(event.target)) return;
    onDismiss();
  }

  function onBackdropPointerCancel() {
    backdropPressRef.current = false;
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const chrome = document.querySelector("[data-site-chrome]");
    chrome?.setAttribute("inert", "");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      chrome?.removeAttribute("inert");
      window.removeEventListener("keydown", onKey);
    };
  }, [onDismiss, open]);

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
        if (el.tabIndex < 0) return false;
        if (el.hasAttribute("disabled")) return false;
        return true;
      });
    const initial =
      root.querySelector<HTMLElement>("input:not([type='hidden'])") ??
      focusables()[0];
    initial?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, session]);

  useEffect(() => {
    if (!open || closing) return;
    const root = panelRef.current;
    const next = root?.querySelector<HTMLElement>("input:not([type='hidden'])");
    next?.focus();
  }, [closing, mode, open]);

  useEffect(() => {
    if (open) return;
    backdropPressRef.current = false;
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] overflow-y-auto bg-black/30 ${closing ? "auth-backdrop-out" : "auth-backdrop-in"}`}
      onPointerDownCapture={onBackdropPointerDown}
      onPointerUp={onBackdropPointerUp}
      onPointerCancel={onBackdropPointerCancel}
    >
      <div className="flex min-h-full items-center justify-center p-5">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`w-full max-w-[462px] max-[600px]:max-w-[320px] ${closing ? "auth-panel-out" : "auth-panel-in"}`}
        >
          <button type="button" className="sr-only" onClick={onDismiss}>
            {copy.closeAria}
          </button>
          <AuthCard>
            <AuthDialogForm
              key={session}
              mode={mode}
              titleId={titleId}
              setMode={setMode}
              onSuccess={onSuccess}
            />
          </AuthCard>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function AuthDialogForm({
  mode,
  titleId,
  setMode,
  onSuccess,
}: {
  mode: AuthMode;
  titleId: string;
  setMode: (mode: AuthMode) => void;
  onSuccess: () => void;
}) {
  const copy = authT(useLocale());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;
  const match = password.length > 0 && confirm.length > 0 && password === confirm;

  useEffect(() => {
    setError(null);
    setPrivacyError(null);
    setPassword("");
    setConfirm("");
    setCheckEmail(null);
    setSentTo(null);
  }, [mode]);

  async function finishSignedIn() {
    const session = await getSession();
    if (!session?.user) return false;
    try {
      await mergeGuestCartOnLogin();
    } catch {
      /* Session is real; cart merge is best-effort. */
    }
    emitCartChanged();
    onSuccess();
    return true;
  }

  function requirePrivacy(): boolean {
    if (privacy) {
      setPrivacyError(null);
      return true;
    }
    setPrivacyError(copy.privacyRequired);
    return false;
  }

  async function onLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!requirePrivacy()) return;
    setPending(true);
    try {
      await signInWithPassword(email.trim(), password);
      if (!(await finishSignedIn())) setError(copy.loginError);
    } catch (caught) {
      setError(mapLoginError(caught, copy));
    } finally {
      setPending(false);
    }
  }

  async function onSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!requirePrivacy()) return;
    if (mismatch || password !== confirm) {
      setError(copy.mismatch);
      return;
    }
    setPending(true);
    try {
      await signUp(email.trim(), password);
      if (!(await finishSignedIn())) setCheckEmail(email.trim());
    } catch (caught) {
      setError(mapSignupError(caught, copy));
    } finally {
      setPending(false);
    }
  }

  async function onForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!requirePrivacy()) return;
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

  const title =
    mode === "signup"
      ? copy.signupTitle
      : mode === "forgot"
        ? sentTo
          ? copy.forgotSentTitle
          : copy.forgotTitle
        : copy.loginTitle;

  if (checkEmail) {
    return (
      <div className="auth-form-in flex flex-col gap-10 max-[600px]:gap-5">
        <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
          <AuthTitle id={titleId} as="h2">
            {copy.checkEmailTitle}
          </AuthTitle>
          <p className="max-w-[328px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:max-w-[254px] max-[600px]:text-[13px]">
            {copy.checkEmailBody.replace("{email}", checkEmail)}
          </p>
        </div>
        <AuthSwitch
          prompt={copy.hasAccount}
          action={copy.goLogin}
          onAction={() => setMode("login")}
        />
      </div>
    );
  }

  if (mode === "forgot" && sentTo) {
    return (
      <div className="auth-form-in flex flex-col gap-10 max-[600px]:gap-5">
        <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
          <AuthTitle id={titleId} as="h2">
            {copy.forgotSentTitle}
          </AuthTitle>
          <p className="max-w-[328px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:max-w-[254px] max-[600px]:text-[13px]">
            {copy.forgotSentBody.replace("{email}", sentTo)}
          </p>
        </div>
        <AuthSwitch
          prompt={copy.hasAccount}
          action={copy.goLogin}
          onAction={() => setMode("login")}
        />
      </div>
    );
  }

  const signupBanner = error
    ? { tone: "error" as const, text: error }
    : mismatch
      ? { tone: "error" as const, text: copy.mismatch }
      : match
        ? { tone: "success" as const, text: copy.match }
        : null;

  return (
    <form
      key={mode}
      className="auth-form-in flex w-full flex-col gap-10 max-[600px]:gap-5"
      onSubmit={
        mode === "signup" ? onSignup : mode === "forgot" ? onForgot : onLogin
      }
    >
      <div className="flex flex-col items-center gap-5 max-[600px]:gap-2.5">
        <AuthTitle id={titleId} as="h2">
          {title}
        </AuthTitle>
        {mode === "forgot" ? (
          <p className="max-w-[254px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:text-[13px]">
            {copy.forgotSubtitle}
          </p>
        ) : null}
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
          {mode !== "forgot" ? (
            <AuthField
              label={copy.password}
              leading="lock"
              type="password"
              name="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={copy.passwordPlaceholder}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              required
            />
          ) : null}
          {mode === "signup" ? (
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
          ) : null}
          {mode === "signup" && signupBanner ? (
            <AuthBanner tone={signupBanner.tone}>{signupBanner.text}</AuthBanner>
          ) : null}
          {mode !== "signup" && error ? (
            <AuthBanner tone="error">{error}</AuthBanner>
          ) : null}
          {mode === "login" ? (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-right text-[16px] font-semibold leading-[1.5] text-plum underline underline-offset-2 max-[600px]:text-[13px]"
            >
              {copy.forgotLink}
            </button>
          ) : null}
          {mode === "signup" && error === copy.userExists ? (
            <button
              type="button"
              onClick={() => setMode("forgot")}
              className="w-full text-right text-[16px] font-semibold leading-[1.5] text-plum underline underline-offset-2 max-[600px]:text-[13px]"
            >
              {copy.forgotLink}
            </button>
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
            {pending
              ? copy.submitting
              : mode === "signup"
                ? copy.submitSignup
                : mode === "forgot"
                  ? copy.submitForgot
                  : copy.submitLogin}
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
        {mode === "signup" ? (
          <AuthSwitch
            prompt={copy.hasAccount}
            action={copy.goLogin}
            onAction={() => setMode("login")}
          />
        ) : (
          <AuthSwitch
            prompt={copy.noAccount}
            action={copy.goSignup}
            onAction={() => setMode("signup")}
          />
        )}
      </div>
    </form>
  );
}

export function AuthEntryChip({ compact }: { compact?: boolean }) {
  const { data: user } = useAuthUser();
  const signedIn = Boolean(user);
  const copy = useCatalogT();
  const routes = useLocalizedRoutes();
  const { openAuth, open } = useAuthModal();

  if (signedIn) {
    return (
      <Button
        href={routes.account}
        variant="chip"
        className={compact ? "h-8 px-[15px] text-[13px] font-normal" : undefined}
      >
        {copy.nav.account}
        <img
          src={siteAssets.user}
          alt=""
          width={15}
          height={15}
          className="size-[15px]"
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="chip"
      aria-haspopup="dialog"
      aria-expanded={open}
      className={compact ? "h-8 px-[15px] text-[13px] font-normal" : undefined}
      onClick={() => openAuth("login")}
    >
      {copy.nav.login}
      <img
        src={siteAssets.user}
        alt=""
        width={15}
        height={15}
        className="size-[15px]"
      />
    </Button>
  );
}

export function AuthDeepLink({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const routes = useLocalizedRoutes();
  const { openAuth } = useAuthModal();
  const { data: user, loading } = useAuthUser();
  const started = useRef(false);

  useEffect(() => {
    if (loading || started.current) return;
    started.current = true;
    if (user) {
      router.replace(safeReturnUrl(searchParams.get("returnUrl"), locale));
      return;
    }
    openAuth(mode);
    const raw = searchParams.get("returnUrl");
    router.replace(raw ? safeReturnUrl(raw, locale, routes.home) : routes.home);
  }, [loading, locale, mode, openAuth, router, routes.home, searchParams, user]);

  return (
    <AuthScreenSkeleton
      fields={mode === "signup" ? 3 : mode === "forgot" ? 1 : 2}
    />
  );
}
