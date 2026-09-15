"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
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
  AuthSwitch,
  AuthTitle,
  PrivacyConsent,
} from "@/components/site/auth/AuthPrimitives";
import {
  OverlayHostProvider,
  useOverlayHost,
} from "@/components/site/auth/overlay-host";
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
  onAuthStateChange,
  resetPasswordForEmail,
  signInWithPassword,
  signUp,
  updatePassword,
} from "@/lib/supabase/auth";

export type AuthMode = "login" | "signup" | "forgot" | "reset";

type OpenAuthOptions = {
  onDismiss?: () => void;
  onSuccess?: () => void;
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

function getCanvasScale(canvas: HTMLElement): number {
  const named = Number(canvas.dataset.canvasScale);
  if (Number.isFinite(named) && named > 0) return named;
  const zoom = Number(canvas.style.zoom);
  if (Number.isFinite(zoom) && zoom > 0) return zoom;
  const width = canvas.offsetWidth;
  return width > 0 ? canvas.getBoundingClientRect().width / width : 1;
}

function syncDialogToVisibleFrame(node: HTMLDialogElement, host: HTMLElement) {
  const canvas = host.closest<HTMLElement>("[data-site-canvas]");
  const vv = window.visualViewport;
  const viewTop = vv?.offsetTop ?? 0;
  const viewLeft = vv?.offsetLeft ?? 0;
  const viewW = vv?.width ?? window.innerWidth;
  const viewH = vv?.height ?? window.innerHeight;

  if (!canvas) {
    node.style.top = `${viewTop}px`;
    node.style.left = `${viewLeft}px`;
    node.style.width = `${viewW}px`;
    node.style.height = `${viewH}px`;
    return;
  }

  const scale = getCanvasScale(canvas);
  const canvasRect = canvas.getBoundingClientRect();
  node.style.top = `${(viewTop - canvasRect.top) / scale}px`;
  node.style.left = `${(viewLeft - canvasRect.left) / scale}px`;
  node.style.width = `${viewW / scale}px`;
  node.style.height = `${viewH / scale}px`;
}

function inertBackground(host: HTMLElement): Element[] {
  const inerted: Element[] = [];
  const canvas = host.closest("[data-site-canvas]");
  if (canvas) {
    for (const child of canvas.children) {
      if (child !== host) {
        child.setAttribute("inert", "");
        inerted.push(child);
      }
    }
    return inerted;
  }
  const chrome = document.querySelector("[data-site-chrome]");
  if (chrome && !chrome.contains(host)) {
    chrome.setAttribute("inert", "");
    inerted.push(chrome);
  }
  return inerted;
}

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
  const successRef = useRef<(() => void) | undefined>(undefined);
  const closeReasonRef = useRef<"dismiss" | "success">("dismiss");
  const closingRef = useRef(false);
  const openRef = useRef(false);
  const recoveryRef = useRef(false);

  const openAuth = useCallback((next: AuthMode = "login", options?: OpenAuthOptions) => {
    dismissRef.current = options?.onDismiss;
    successRef.current = options?.onSuccess;
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
    recoveryRef.current = false;
    if (reason === "success") dismissRef.current = undefined;
    closingRef.current = true;
    setClosing(true);
  }, []);

  const dismissAuth = useCallback(() => closeAuth("dismiss"), [closeAuth]);
  const succeedAuth = useCallback(() => closeAuth("success"), [closeAuth]);

  const { data: user } = useAuthUser();
  useEffect(() => {
    const { unsubscribe } = onAuthStateChange((event) => {
      if (event !== "PASSWORD_RECOVERY") return;
      recoveryRef.current = true;
      openAuth("reset");
    });
    return () => unsubscribe();
  }, [openAuth]);

  useEffect(() => {
    if (user && !recoveryRef.current) closeAuth("success");
  }, [closeAuth, user]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      const dismiss = dismissRef.current;
      const success = successRef.current;
      const reason = closeReasonRef.current;
      dismissRef.current = undefined;
      successRef.current = undefined;
      openRef.current = false;
      closingRef.current = false;
      setOpen(false);
      setClosing(false);
      if (reason === "success") success?.();
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
    <OverlayHostProvider>
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
    </OverlayHostProvider>
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
  const host = useOverlayHost();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropPressRef = useRef(false);

  function isInsideCard(target: EventTarget | null): boolean {
    return target instanceof Node && Boolean(panelRef.current?.contains(target));
  }

  function onBackdropPointerDown(event: PointerEvent<HTMLDialogElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    backdropPressRef.current = !isInsideCard(event.target);
  }

  function onBackdropPointerUp(event: PointerEvent<HTMLDialogElement>) {
    const startedOnBackdrop = backdropPressRef.current;
    backdropPressRef.current = false;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!startedOnBackdrop || isInsideCard(event.target)) return;
    onDismiss();
  }

  function onBackdropPointerCancel() {
    backdropPressRef.current = false;
  }

  useLayoutEffect(() => {
    const node = dialogRef.current;
    if (!open || !node || !host) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (node.open) node.close();
    node.show();
    const inerted = inertBackground(host);

    const clearViewport = () => {
      node.style.height = "";
      node.style.width = "";
      node.style.top = "";
      node.style.left = "";
    };

    const syncViewport = () => syncDialogToVisibleFrame(node, host);
    syncViewport();
    window.visualViewport?.addEventListener("resize", syncViewport);
    window.visualViewport?.addEventListener("scroll", syncViewport);
    window.addEventListener("resize", syncViewport);
    window.addEventListener("scroll", syncViewport, true);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onDismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.tabIndex >= 0 && !el.hasAttribute("disabled"),
      );
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
    window.addEventListener("keydown", onKey);

    return () => {
      window.visualViewport?.removeEventListener("resize", syncViewport);
      window.visualViewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("scroll", syncViewport, true);
      window.removeEventListener("keydown", onKey);
      inerted.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
      clearViewport();
      if (node.open) node.close();
    };
  }, [host, onDismiss, open]);

  useEffect(() => {
    if (!open) return;
    const root = panelRef.current;
    if (!root) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const initial = root.querySelector<HTMLElement>("input:not([type='hidden'])");
    initial?.focus();
    return () => {
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

  if (!open || !host) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      className={`auth-dialog ${closing ? "auth-backdrop-out" : "auth-backdrop-in"}`}
      onCancel={(event) => {
        event.preventDefault();
        if (!closing) onDismiss();
      }}
      onPointerDownCapture={onBackdropPointerDown}
      onPointerUp={onBackdropPointerUp}
      onPointerCancel={onBackdropPointerCancel}
    >
      <div className="auth-dialog-frame">
        <div
          ref={panelRef}
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
    </dialog>,
    host,
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
  const requestGen = useRef(0);

  const mismatch = confirm.length > 0 && password !== confirm;
  const match = password.length > 0 && confirm.length > 0 && password === confirm;
  const needsPrivacy = mode === "login" || mode === "signup";
  const needsPair = mode === "signup" || mode === "reset";

  useEffect(() => {
    requestGen.current += 1;
    setError(null);
    setPrivacyError(null);
    setPassword("");
    setConfirm("");
    setCheckEmail(null);
    setSentTo(null);
    setPending(false);
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
    const gen = ++requestGen.current;
    setPending(true);
    try {
      await signInWithPassword(email.trim(), password);
      if (requestGen.current !== gen) return;
      if (!(await finishSignedIn())) setError(copy.loginError);
    } catch (caught) {
      if (requestGen.current !== gen) return;
      setError(mapLoginError(caught, copy));
    } finally {
      if (requestGen.current === gen) setPending(false);
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
    const gen = ++requestGen.current;
    setPending(true);
    try {
      await signUp(email.trim(), password);
      if (requestGen.current !== gen) return;
      if (!(await finishSignedIn())) setCheckEmail(email.trim());
    } catch (caught) {
      if (requestGen.current !== gen) return;
      setError(mapSignupError(caught, copy));
    } finally {
      if (requestGen.current === gen) setPending(false);
    }
  }

  async function onForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const gen = ++requestGen.current;
    setPending(true);
    try {
      await resetPasswordForEmail(email.trim());
      if (requestGen.current !== gen) return;
      setSentTo(email.trim());
    } catch (caught) {
      if (requestGen.current !== gen) return;
      setError(mapResetError(caught, copy));
    } finally {
      if (requestGen.current === gen) setPending(false);
    }
  }

  async function onReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (mismatch || password !== confirm) {
      setError(copy.mismatch);
      return;
    }
    const gen = ++requestGen.current;
    setPending(true);
    try {
      await updatePassword(password);
      if (requestGen.current !== gen) return;
      if (!(await finishSignedIn())) setError(copy.genericError);
    } catch (caught) {
      if (requestGen.current !== gen) return;
      setError(mapResetError(caught, copy));
    } finally {
      if (requestGen.current === gen) setPending(false);
    }
  }

  const title =
    mode === "signup"
      ? copy.signupTitle
      : mode === "forgot"
        ? sentTo
          ? copy.forgotSentTitle
          : copy.forgotTitle
        : mode === "reset"
          ? copy.resetTitle
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
          prompt={copy.rememberedPassword}
          action={copy.goLogin}
          onAction={() => setMode("login")}
        />
      </div>
    );
  }

  const pairBanner = error
    ? { tone: "error" as const, text: error }
    : mismatch
      ? { tone: "error" as const, text: copy.mismatch }
      : match
        ? { tone: "success" as const, text: copy.match }
        : null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (mode === "signup") return onSignup(event);
    if (mode === "forgot") return onForgot(event);
    if (mode === "reset") return onReset(event);
    return onLogin(event);
  }

  const submitLabel =
    mode === "signup"
      ? copy.submitSignup
      : mode === "forgot"
        ? copy.submitForgot
        : mode === "reset"
          ? copy.submitReset
          : copy.submitLogin;

  return (
    <form
      key={mode}
      className="auth-form-in flex w-full flex-col gap-10 max-[600px]:gap-5"
      onSubmit={onSubmit}
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
        {mode === "reset" ? (
          <p className="max-w-[328px] text-center text-[16px] leading-[1.5] text-[#212121] max-[600px]:max-w-[254px] max-[600px]:text-[13px]">
            {copy.resetSubtitle}
          </p>
        ) : null}
        <div className="flex w-full flex-col gap-4">
          {mode !== "reset" ? (
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
          ) : null}
          {mode !== "forgot" ? (
            <AuthField
              label={copy.password}
              leading="lock"
              type="password"
              name="password"
              autoComplete={needsPair ? "new-password" : "current-password"}
              placeholder={copy.passwordPlaceholder}
              value={password}
              minLength={needsPair ? 6 : undefined}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              required
            />
          ) : null}
          {needsPair ? (
            <AuthField
              label={copy.passwordRepeat}
              leading="lock"
              type="password"
              name="passwordConfirm"
              autoComplete="new-password"
              placeholder={copy.passwordPlaceholder}
              value={confirm}
              invalid={mismatch}
              minLength={6}
              onChange={(event) => {
                setConfirm(event.target.value);
                setError(null);
              }}
              required
            />
          ) : null}
          {needsPair && pairBanner ? (
            <AuthBanner tone={pairBanner.tone}>{pairBanner.text}</AuthBanner>
          ) : null}
          {!needsPair && error ? (
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
            aria-busy={pending || undefined}
            className="w-full max-[600px]:text-[13px]"
          >
            {pending ? copy.submitting : submitLabel}
          </Button>
          {needsPrivacy ? (
            <PrivacyConsent
              checked={privacy}
              onChange={(next) => {
                setPrivacy(next);
                if (next) setPrivacyError(null);
              }}
              requiredMessage={privacyError}
            />
          ) : null}
        </div>
        {mode === "reset" ? null : mode === "signup" ? (
          <AuthSwitch
            prompt={copy.hasAccount}
            action={copy.goLogin}
            onAction={() => setMode("login")}
          />
        ) : mode === "forgot" ? (
          <AuthSwitch
            prompt={copy.rememberedPassword}
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

  return null;
}
