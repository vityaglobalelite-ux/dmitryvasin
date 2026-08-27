"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { landingAssets } from "@/lib/landing-assets";
import {
  setLandingLayoutFrozen,
  useIsMobile,
} from "@/lib/landing-mode";

type QuoteVideoPlayerProps = {
  playButtonSize: number;
  className?: string;
  /** Prefer native fullscreen when playback starts (mobile). */
  enterFullscreenOnPlay?: boolean;
};

type VideoEl = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitExitFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

type ShellEl = HTMLDivElement & {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => Promise<void> | void;
};

const OVERLAY_HISTORY_KEY = "quote-video-overlay-fs";

function isIosLikeVideoApi(video: VideoEl) {
  return typeof video.webkitEnterFullscreen === "function";
}

async function requestElementFullscreen(el: ShellEl | VideoEl) {
  if (typeof el.requestFullscreen === "function") {
    await el.requestFullscreen();
    return true;
  }
  const withWebkit = el as ShellEl;
  if (typeof withWebkit.webkitRequestFullscreen === "function") {
    await withWebkit.webkitRequestFullscreen();
    return true;
  }
  return false;
}

function exitDocumentFullscreen() {
  const doc = document as Document & {
    webkitExitFullscreen?: () => void;
    webkitFullscreenElement?: Element | null;
  };
  if (document.fullscreenElement && document.exitFullscreen) {
    void document.exitFullscreen().catch(() => {});
    return;
  }
  if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
}

function getFullscreenElement(): Element | null {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
  };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

/**
 * Mobile quote video.
 * - Stays in document flow while inline (no fixed portal → no scroll jump).
 * - Native fullscreen only (iOS webkit / Fullscreen API) — no orientation.lock
 *   (lock was rotating the phone → landing flipped to desktop → player unmounted).
 * - CSS overlay via body portal only as last resort; layout stays frozen meanwhile.
 */
function QuoteVideoPlayer({
  playButtonSize,
  className,
  enterFullscreenOnPlay = false,
}: QuoteVideoPlayerProps) {
  const videoRef = useRef<VideoEl>(null);
  const shellRef = useRef<ShellEl>(null);
  const fsAttemptRef = useRef(false);
  const fsEnteredRef = useRef(false);
  const overlayFsRef = useRef(false);
  const historyPushedRef = useRef(false);
  const fallbackTimerRef = useRef<number | null>(null);
  const resumeAfterPortalRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [overlayFs, setOverlayFs] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [sourceAttached, setSourceAttached] = useState(false);
  const portalReady = typeof document !== "undefined";
  const titleId = useId();

  const setOverlay = useCallback((next: boolean) => {
    overlayFsRef.current = next;
    setOverlayFs(next);
    setLandingLayoutFrozen(next || Boolean(videoRef.current?.webkitDisplayingFullscreen));
  }, []);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const popOverlayHistory = useCallback(() => {
    if (!historyPushedRef.current) return;
    historyPushedRef.current = false;
    if (window.history.state?.quoteVideoOverlay === OVERLAY_HISTORY_KEY) {
      window.history.back();
    }
  }, []);

  const leavePresentation = useCallback(() => {
    clearFallbackTimer();
    fsAttemptRef.current = false;
    fsEnteredRef.current = false;
    resumeAfterPortalRef.current = false;
    setOverlay(false);
    setLandingLayoutFrozen(false);
    exitDocumentFullscreen();
    popOverlayHistory();
    const video = videoRef.current;
    if (video?.webkitDisplayingFullscreen && video.webkitExitFullscreen) {
      try {
        video.webkitExitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }, [clearFallbackTimer, popOverlayHistory, setOverlay]);

  const stopPlayback = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    setPlaying(false);
    setBuffering(false);
    leavePresentation();
  }, [leavePresentation]);

  const openOverlayFullscreen = useCallback(() => {
    clearFallbackTimer();
    fsEnteredRef.current = true;
    fsAttemptRef.current = false;
    resumeAfterPortalRef.current = true;
    setLandingLayoutFrozen(true);
    setOverlay(true);

    if (!historyPushedRef.current) {
      window.history.pushState(
        { quoteVideoOverlay: OVERLAY_HISTORY_KEY },
        "",
      );
      historyPushedRef.current = true;
    }
  }, [clearFallbackTimer, setOverlay]);

  /* After portal mount, resume the same media without requiring a new gesture. */
  useEffect(() => {
    if (!overlayFs || !resumeAfterPortalRef.current) return;
    const video = videoRef.current;
    if (!video) return;
    resumeAfterPortalRef.current = false;
    setPlaying(true);
    void video.play().catch(() => {});
  }, [overlayFs]);

  const enterMobileFullscreen = useCallback(
    (video: VideoEl) => {
      clearFallbackTimer();
      fsAttemptRef.current = true;
      fsEnteredRef.current = false;
      setLandingLayoutFrozen(true);

      if (isIosLikeVideoApi(video)) {
        try {
          video.webkitEnterFullscreen?.();
        } catch {
          openOverlayFullscreen();
          return;
        }

        fallbackTimerRef.current = window.setTimeout(() => {
          fallbackTimerRef.current = null;
          if (!fsAttemptRef.current || fsEnteredRef.current) return;
          if (video.webkitDisplayingFullscreen) {
            fsEnteredRef.current = true;
            fsAttemptRef.current = false;
            return;
          }
          openOverlayFullscreen();
        }, 700);
        return;
      }

      void (async () => {
        try {
          const ok = await requestElementFullscreen(video);
          if (ok) {
            clearFallbackTimer();
            fsEnteredRef.current = true;
            fsAttemptRef.current = false;
            return;
          }
        } catch {
          /* overlay fallback */
        }
        if (!fsEnteredRef.current) openOverlayFullscreen();
      })();

      fallbackTimerRef.current = window.setTimeout(() => {
        fallbackTimerRef.current = null;
        if (!fsAttemptRef.current || fsEnteredRef.current) return;
        if (getFullscreenElement()) {
          fsEnteredRef.current = true;
          fsAttemptRef.current = false;
          return;
        }
        openOverlayFullscreen();
      }, 700);
    },
    [clearFallbackTimer, openOverlayFullscreen],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onEnded = () => stopPlayback();
    const onWaiting = () => setBuffering(true);
    const onPlayingEvt = () => setBuffering(false);
    const onCanPlay = () => setBuffering(false);

    const markEntered = () => {
      clearFallbackTimer();
      fsEnteredRef.current = true;
      fsAttemptRef.current = false;
      setLandingLayoutFrozen(true);
    };

    const onBeginFs = () => {
      markEntered();
      setOverlay(false);
      popOverlayHistory();
    };

    const syncFsExit = () => {
      const fsEl = getFullscreenElement();
      const inNativeFs =
        fsEl === video ||
        fsEl === shellRef.current ||
        Boolean(video.webkitDisplayingFullscreen);

      if (inNativeFs) {
        markEntered();
        return;
      }

      if (overlayFsRef.current) return;

      fsAttemptRef.current = false;
      fsEnteredRef.current = false;
      setLandingLayoutFrozen(false);

      if (video.paused) {
        setPlaying(false);
        setBuffering(false);
      }
    };

    video.addEventListener("ended", onEnded);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlayingEvt);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("webkitbeginfullscreen", onBeginFs);
    video.addEventListener("webkitendfullscreen", syncFsExit);
    document.addEventListener("fullscreenchange", syncFsExit);
    document.addEventListener("webkitfullscreenchange", syncFsExit);

    return () => {
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlayingEvt);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("webkitbeginfullscreen", onBeginFs);
      video.removeEventListener("webkitendfullscreen", syncFsExit);
      document.removeEventListener("fullscreenchange", syncFsExit);
      document.removeEventListener("webkitfullscreenchange", syncFsExit);
    };
  }, [
    clearFallbackTimer,
    overlayFs,
    popOverlayHistory,
    setOverlay,
    stopPlayback,
  ]);

  useEffect(() => {
    if (!overlayFs) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopPlayback();
    };
    const onPopState = () => {
      if (!overlayFsRef.current) return;
      historyPushedRef.current = false;
      stopPlayback();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPopState);
    };
  }, [overlayFs, stopPlayback]);

  useEffect(() => {
    return () => {
      clearFallbackTimer();
      setLandingLayoutFrozen(false);
      exitDocumentFullscreen();
      if (historyPushedRef.current) {
        historyPushedRef.current = false;
        if (window.history.state?.quoteVideoOverlay === OVERLAY_HISTORY_KEY) {
          window.history.back();
        }
      }
    };
  }, [clearFallbackTimer]);

  const start = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const video = videoRef.current;
    if (!video) return;

    if (!sourceAttached) {
      video.src = landingAssets.video.intro;
      video.load();
      setSourceAttached(true);
    }

    setPlaying(true);
    setBuffering(video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);

    const playAttempt = video.play();
    if (playAttempt !== undefined) {
      void playAttempt.catch(() => {
        setPlaying(false);
        setBuffering(false);
        leavePresentation();
      });
    }

    if (enterFullscreenOnPlay) {
      enterMobileFullscreen(video);
    }
  };

  const shellClassName = [
    "quote-video-shell relative overflow-hidden bg-black",
    overlayFs ? "quote-video-shell--overlay-fs" : "",
    !overlayFs ? (className ?? "") : "",
  ]
    .filter(Boolean)
    .join(" ");

  const player = (
    <div
      ref={shellRef}
      className={shellClassName}
      data-fs={overlayFs ? "overlay" : undefined}
    >
      <div className="quote-video-stage">
        <video
          ref={videoRef}
          className="quote-video absolute inset-0 size-full bg-black object-contain"
          src={sourceAttached ? landingAssets.video.intro : undefined}
          poster={landingAssets.photos.videoPreview}
          controls={playing}
          playsInline
          preload="none"
          controlsList="nodownload"
          style={{ opacity: playing || overlayFs ? 1 : 0 }}
          aria-labelledby={titleId}
        />
      </div>

      {!playing && (
        <>
          <img
            src={landingAssets.photos.videoPreview}
            alt=""
            className="absolute inset-0 size-full object-cover"
            draggable={false}
          />
          <button
            type="button"
            aria-label="Смотреть видео"
            onClick={start}
            className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transition hover:brightness-110"
            style={{ width: playButtonSize, height: playButtonSize }}
          >
            <img
              src={landingAssets.video.playButton}
              alt=""
              className="size-full"
              draggable={false}
            />
          </button>
        </>
      )}

      {playing && buffering && (
        <div
          className="quote-video-buffering pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35"
          aria-hidden
        >
          <span className="quote-video-spinner" />
        </div>
      )}

      {overlayFs && (
        <button
          type="button"
          aria-label="Закрыть видео"
          className="quote-video-close"
          onClick={stopPlayback}
        >
          <span aria-hidden>✕</span>
        </button>
      )}

      <span id={titleId} className="quote-video-sr-only">
        Видео: как будем исследовать танго
      </span>
    </div>
  );

  /* Portal only for overlay FS — inline player stays in the canvas (no scroll lag). */
  if (overlayFs && portalReady) {
    return (
      <>
        <div
          className={`relative overflow-hidden bg-black ${className ?? ""}`}
          aria-hidden
        />
        {createPortal(player, document.body)}
      </>
    );
  }

  return player;
}

/* Figma Главная_360: Frame 2421 (20,2160,320×625) */
function QuoteVideoMobile() {
  return (
    <section className="absolute left-[20px] top-[2160px] flex h-[625px] w-[320px] flex-col gap-[20px] rounded-[40px] bg-light-gray p-[15px]">
      <div className="flex flex-col gap-[30px] rounded-[10px] bg-white p-[15px]">
        <img
          src={landingAssets.photos.quoteAvatar}
          alt="Дмитрий Васин"
          className="size-[60px] rounded-full object-cover"
          width={60}
          height={60}
        />
        <div className="flex w-full flex-col gap-[10px]">
          <p className="text-[16px] font-medium leading-[1.2] text-text">
            Иногда одно новое наблюдение меняет танец сильнее, чем десятки
            новых движений.
          </p>
          <p className="text-[13px] font-normal leading-[1.5] text-text">
            Потому что многие ответы появляются не тогда, когда мы узнаём
            больше. А тогда, когда начинаем смотреть на танец внимательнее.
          </p>
        </div>
        <img
          src={landingAssets.quote.marks}
          alt=""
          className="size-[20px]"
          width={20}
          height={20}
        />
      </div>

      <div className="flex w-full flex-col gap-[10px]">
        <QuoteVideoPlayer
          playButtonSize={50}
          enterFullscreenOnPlay
          className="h-[163px] w-full rounded-[10px]"
        />
        <p className="text-center text-[20px] font-medium leading-[1.1] tracking-[-0.6px] text-text">
          В этом коротком видео рассказываю, как именно будем исследовать танго
        </p>
      </div>
    </section>
  );
}

/* Figma: Frame 2421 (240,2110,1442x663) */
function QuoteVideoDesktop() {
  return (
    <section className="absolute left-[240px] top-[2110px] flex h-[663px] w-[1442px] gap-[20px] rounded-[40px] bg-light-gray p-[60px]">
      <div className="relative h-[534px] w-[560px] shrink-0 rounded-[20px] bg-white p-[30px]">
        <img
          src={landingAssets.photos.quoteAvatar}
          alt="Дмитрий Васин"
          className="size-[126px] rounded-full object-cover"
        />
        <div className="mt-[44px] w-full">
          <p className="text-[24px] font-medium leading-[1.2] text-text">
            Иногда одно новое наблюдение меняет танец сильнее, чем десятки
            новых движений.
          </p>
          <p className="mt-[20px] text-[16px] font-normal leading-[1.5] text-text">
            Потому что многие ответы появляются не тогда, когда мы узнаём
            больше. А тогда, когда начинаем смотреть на танец внимательнее.
          </p>
        </div>
        <img
          src={landingAssets.quote.marks}
          alt=""
          className="absolute bottom-[30px] left-[30px] size-[35px]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
        <QuoteVideoPlayer
          playButtonSize={71}
          className="aspect-video h-auto max-h-[435px] w-full rounded-[30px]"
        />
        <p className="text-center text-[40px] font-medium leading-[1.1] tracking-[-1.2px] text-text">
          В этом коротком видео рассказываю, как именно будем исследовать танго
        </p>
      </div>
    </section>
  );
}

export function QuoteVideoSection() {
  const isMobile = useIsMobile();
  return isMobile ? <QuoteVideoMobile /> : <QuoteVideoDesktop />;
}
