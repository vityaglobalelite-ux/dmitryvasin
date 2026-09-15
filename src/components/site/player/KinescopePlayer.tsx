"use client";

import { load } from "@kinescope/player-iframe-api-loader";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { catalogT } from "@/lib/catalog/i18n";
import { useAuthModal } from "@/components/site/auth/AuthModal";
import {
  fetchKinescopeEmbed,
  isOfficialKinescopeEmbed,
  KinescopeTokenError,
  withKinescopeStartTime,
} from "@/lib/catalog/kinescope";
import { useAuthUser } from "@/lib/catalog/hooks";
import { useLocalizedRoutes } from "@/lib/catalog/locale-context";
import {
  getMyWatchProgress,
  upsertWatchProgress,
} from "@/lib/catalog/repo/progress";
import type { Locale } from "@/lib/catalog/types";
import {
  isWatchComplete,
  resumeSeekSeconds,
} from "@/lib/catalog/watch-progress";

export type KinescopePlayerProps = {
  productId: string;
  locale?: Locale;
};

type PlayerState =
  | { kind: "loading" }
  | { kind: "ready"; embedUrl: string; resumeSec: number }
  | { kind: "forbidden"; needsLogin: boolean }
  | { kind: "error"; message: string };

const IFRAME_ALLOW = "encrypted-media; fullscreen; picture-in-picture";
const SAVE_INTERVAL_MS = 4000;

type KinescopeApi = Awaited<ReturnType<typeof load>>;
type KinescopeHandle = Awaited<ReturnType<KinescopeApi["create"]>>;

function PlayerFrame({
  children,
  busy = false,
  tone = "video",
}: {
  children: ReactNode;
  busy?: boolean;
  tone?: "video" | "message";
}) {
  return (
    <div
      className={
        tone === "message"
          ? "relative aspect-video w-full min-w-0 overflow-hidden rounded-[inherit] bg-light-gray"
          : "relative aspect-video w-full min-w-0 overflow-hidden rounded-[inherit] bg-black"
      }
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

function KinescopeFrame({
  embedUrl,
  productId,
  locale,
  resumeSec,
  title,
  onReady,
  onError,
}: {
  embedUrl: string;
  productId: string;
  locale: Locale;
  resumeSec: number;
  title: string;
  onReady: () => void;
  onError: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  onReadyRef.current = onReady;
  onErrorRef.current = onError;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cancelled = false;
    let player: KinescopeHandle | null = null;
    let played = false;
    let latest = {
      position: Math.max(0, resumeSec),
      duration: 0,
      completed: false,
    };
    let saveTimer: number | null = null;
    let flushing: Promise<void> | null = null;

    const clearSaveTimer = () => {
      if (saveTimer != null) {
        window.clearTimeout(saveTimer);
        saveTimer = null;
      }
    };

    const flush = () => {
      if (flushing) return flushing;
      clearSaveTimer();
      if (!played && !latest.completed) return Promise.resolve();
      if (!(latest.duration > 0) && !latest.completed) return Promise.resolve();

      const snapshot = { ...latest };
      flushing = upsertWatchProgress({
        productId,
        positionSec: snapshot.position,
        durationSec: snapshot.duration,
        completed: snapshot.completed,
      })
        .then(() => undefined)
        .catch(() => undefined)
        .finally(() => {
          flushing = null;
        });
      return flushing;
    };

    const note = (
      position: number,
      duration: number,
      completed?: boolean,
    ) => {
      const nextDuration = duration > 0 ? duration : latest.duration;
      const nextCompleted =
        completed ?? isWatchComplete(position, nextDuration);
      latest = {
        position: Math.max(0, position),
        duration: nextDuration,
        completed: nextCompleted,
      };
      if (nextCompleted) {
        void flush();
        return;
      }
      if (saveTimer != null) return;
      saveTimer = window.setTimeout(() => {
        saveTimer = null;
        void flush();
      }, SAVE_INTERVAL_MS);
    };

    const attach = (instance: KinescopeHandle) => {
      player = instance;
      if (cancelled) {
        void instance.destroy();
        return;
      }
      onReadyRef.current();

      instance.on(instance.Events.DurationChange, (event) => {
        const duration = event.data.duration;
        if (duration > 0) latest.duration = duration;
      });

      instance.on(instance.Events.Loaded, async (event) => {
        const duration = event.data.duration;
        if (duration > 0) latest.duration = duration;
        const seek = resumeSeekSeconds(
          {
            productId,
            positionSec: resumeSec,
            durationSec: duration,
            completed: false,
            updatedAt: "",
          },
          duration,
        );
        if (seek != null) {
          try {
            await instance.seekTo(seek);
            latest.position = seek;
          } catch {
            /* keep going */
          }
        }
      });

      instance.on(instance.Events.Playing, () => {
        played = true;
      });

      instance.on(instance.Events.TimeUpdate, (event) => {
        if (!played) return;
        note(event.data.currentTime, latest.duration);
      });

      instance.on(instance.Events.Pause, () => {
        if (played) void flush();
      });

      instance.on(instance.Events.Ended, async () => {
        played = true;
        try {
          const duration =
            latest.duration > 0
              ? latest.duration
              : await instance.getDuration();
          note(duration, duration, true);
        } catch {
          note(latest.position, latest.duration, true);
        }
      });

      instance.on(instance.Events.Error, () => {
        if (!cancelled) onErrorRef.current();
      });
    };

    void (async () => {
      try {
        const factory = await load();
        if (cancelled) return;
        const created = await factory.create(iframe, {
          url: embedUrl,
          size: { width: "100%", height: "100%" },
          keepElement: true,
          behavior: {
            preload: "metadata",
            autoPlay: false,
            playsInline: true,
            localStorage: {
              time: false,
              quality: true,
              textTrack: true,
            },
          },
          ui: { language: locale },
          settings: { externalId: productId },
        });
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.position = "absolute";
        iframe.style.inset = "0";
        attach(created);
      } catch {
        if (!cancelled) onErrorRef.current();
      }
    })();

    const onHide = () => {
      if (document.visibilityState === "hidden") void flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      void (async () => {
        await flush();
        try {
          await player?.destroy();
        } catch {
          /* already gone */
        }
      })();
    };
  }, [embedUrl, locale, productId, resumeSec]);

  return (
    <iframe
      ref={iframeRef}
      title={title}
      width="100%"
      height="100%"
      allow={IFRAME_ALLOW}
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      className="absolute inset-0 block h-full w-full border-0"
    />
  );
}

export function KinescopePlayer({
  productId,
  locale = "ru",
}: KinescopePlayerProps) {
  const t = catalogT(locale);
  const routes = useLocalizedRoutes();
  const { openAuth } = useAuthModal();
  const auth = useAuthUser();
  const [retryTick, setRetryTick] = useState(0);
  const [state, setState] = useState<PlayerState>({ kind: "loading" });
  const [iframeReady, setIframeReady] = useState(false);
  const [applied, setApplied] = useState({ productId, locale, retryTick });
  const retriedUser = useRef<string | null>(null);

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
        const [embed, saved] = await Promise.all([
          fetchKinescopeEmbed(productId, locale),
          getMyWatchProgress(productId).catch(() => null),
        ]);
        if (controller.signal.aborted) return;
        if (!isOfficialKinescopeEmbed(embed.embedUrl)) {
          setState({ kind: "error", message: t.player.errorTitle });
          return;
        }
        const resumeSec = resumeSeekSeconds(saved) ?? 0;
        setState({
          kind: "ready",
          embedUrl: withKinescopeStartTime(embed.embedUrl, resumeSec),
          resumeSec,
        });
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
  }, [locale, productId, retryTick, t.player.errorTitle]);

  useEffect(() => {
    const id = auth.data?.id;
    if (
      !id ||
      auth.loading ||
      state.kind !== "forbidden" ||
      !state.needsLogin ||
      retriedUser.current === id
    ) {
      return;
    }
    retriedUser.current = id;
    setRetryTick((n) => n + 1);
  }, [auth.data?.id, auth.loading, state]);

  const compactBtn =
    "max-[600px]:h-10 max-[600px]:px-6 max-[600px]:text-[13px]";

  if (state.kind === "forbidden") {
    return (
      <PlayerFrame tone="message">
        <PlayerMessage
          kicker={t.player.noAccessKicker}
          title={t.player.noAccessTitle}
          body={t.player.noAccessBody}
          actions={
            <>
              {state.needsLogin ? (
                <Button
                  type="button"
                  className={compactBtn}
                  onClick={() => openAuth("login")}
                >
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
      <PlayerFrame tone="message">
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
        <KinescopeFrame
          embedUrl={state.embedUrl}
          productId={productId}
          locale={locale}
          resumeSec={state.resumeSec}
          title={t.player.iframeTitle}
          onReady={() => setIframeReady(true)}
          onError={() =>
            setState({ kind: "error", message: t.player.errorTitle })
          }
        />
      ) : null}
      {showSkeleton ? (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      ) : null}
    </PlayerFrame>
  );
}
