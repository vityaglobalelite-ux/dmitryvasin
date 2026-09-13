"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { catalogT } from "@/lib/catalog/i18n";
import {
  hrefWithReturnUrl,
  safeReturnUrl,
} from "@/components/site/auth/returnUrl";
import {
  fetchKinescopeEmbed,
  isOfficialKinescopeEmbed,
  KinescopeTokenError,
} from "@/lib/catalog/kinescope";
import { useLocalizedRoutes } from "@/lib/catalog/locale-context";
import type { Locale } from "@/lib/catalog/types";

export type KinescopePlayerProps = {
  productId: string;
  locale?: Locale;
};

type PlayerState =
  | { kind: "loading" }
  | { kind: "ready"; embedUrl: string }
  | { kind: "forbidden"; needsLogin: boolean }
  | { kind: "error"; message: string };

const IFRAME_ALLOW = "encrypted-media; fullscreen; picture-in-picture";

function PlayerFrame({
  children,
  busy = false,
}: {
  children: ReactNode;
  busy?: boolean;
}) {
  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-[30px] bg-light-gray max-[600px]:rounded-[10px]"
      aria-busy={busy || undefined}
    >
      {children}
    </div>
  );
}

function PlayerMessage({
  kicker,
  title,
  body,
  actions,
}: {
  kicker: string;
  title: string;
  body: string;
  actions: ReactNode;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto px-8 py-6 text-center max-[600px]:px-4 max-[600px]:py-4">
      <p className="text-[14px] font-semibold uppercase tracking-[0.04em] text-plum/70 max-[600px]:text-[12px]">
        {kicker}
      </p>
      <h2 className="mt-3 text-[24px] font-medium leading-[1.2] text-text max-[600px]:mt-2 max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
        {title}
      </h2>
      <p className="mt-3 max-w-[420px] text-[16px] leading-[1.5] text-text/70 max-[600px]:mt-2 max-[600px]:text-[13px]">
        {body}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 max-[600px]:mt-4">
        {actions}
      </div>
    </div>
  );
}

export function KinescopePlayer({
  productId,
  locale = "ru",
}: KinescopePlayerProps) {
  const t = catalogT(locale);
  const routes = useLocalizedRoutes();
  const [retryTick, setRetryTick] = useState(0);
  const [state, setState] = useState<PlayerState>({ kind: "loading" });
  const [iframeReady, setIframeReady] = useState(false);
  const [applied, setApplied] = useState({ productId, locale, retryTick });

  if (
    productId !== applied.productId ||
    locale !== applied.locale ||
    retryTick !== applied.retryTick
  ) {
    setApplied({ productId, locale, retryTick });
    setState({ kind: "loading" });
    setIframeReady(false);
  }

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const { embedUrl } = await fetchKinescopeEmbed(productId, locale);
        if (controller.signal.aborted) return;
        if (!isOfficialKinescopeEmbed(embedUrl)) {
          setState({ kind: "error", message: t.player.errorTitle });
          return;
        }
        setState({ kind: "ready", embedUrl });
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof KinescopeTokenError) {
          if (err.code === "forbidden" || err.code === "auth") {
            setState({
              kind: "forbidden",
              needsLogin: err.code === "auth",
            });
            return;
          }
          setState({ kind: "error", message: err.message });
          return;
        }
        setState({ kind: "error", message: t.player.errorTitle });
      }
    })();

    return () => controller.abort();
  }, [productId, locale, retryTick]);

  const compactBtn =
    "max-[600px]:h-10 max-[600px]:px-6 max-[600px]:text-[13px]";
  const loginHref =
    typeof window === "undefined"
      ? routes.login
      : hrefWithReturnUrl(
          routes.login,
          safeReturnUrl(
            `${window.location.pathname}${window.location.search}`,
            locale,
          ),
        );

  if (state.kind === "forbidden") {
    return (
      <PlayerFrame>
        <PlayerMessage
          kicker={t.player.noAccessKicker}
          title={t.player.noAccessTitle}
          body={t.player.noAccessBody}
          actions={
            <>
              {state.needsLogin ? (
                <Button href={loginHref} className={compactBtn}>
                  {t.player.loginCta}
                </Button>
              ) : null}
              <Button
                href={routes.catalog}
                variant={state.needsLogin ? "secondary" : "primary"}
                className={compactBtn}
              >
                {t.player.catalogCta}
              </Button>
              <Button
                href={routes.product(productId)}
                variant="secondary"
                className={compactBtn}
              >
                {t.player.productCta}
              </Button>
            </>
          }
        />
      </PlayerFrame>
    );
  }

  if (state.kind === "error") {
    return (
      <PlayerFrame>
        <PlayerMessage
          kicker={t.player.errorKicker}
          title={t.player.errorTitle}
          body={state.message}
          actions={
            <Button
              type="button"
              onClick={() => setRetryTick((n) => n + 1)}
              className={compactBtn}
            >
              {t.player.retryCta}
            </Button>
          }
        />
      </PlayerFrame>
    );
  }

  const showSkeleton = state.kind === "loading" || !iframeReady;

  return (
    <PlayerFrame busy={showSkeleton}>
      {state.kind === "ready" ? (
        <iframe
          src={state.embedUrl}
          title={t.player.iframeTitle}
          allow={IFRAME_ALLOW}
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
          onLoad={() => setIframeReady(true)}
        />
      ) : null}
      {showSkeleton ? (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      ) : null}
    </PlayerFrame>
  );
}
