"use client";

import { useEffect, useRef, useState } from "react";
import { landingAssets } from "@/lib/landing-assets";
import { useIsMobile } from "@/lib/landing-mode";

type QuoteVideoPlayerProps = {
  playButtonSize: number;
  className?: string;
  /** Open native fullscreen when playback starts (typical mobile UX). */
  enterFullscreenOnPlay?: boolean;
};

type VideoEl = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitDisplayingFullscreen?: boolean;
};

async function enterNativeFullscreen(video: VideoEl) {
  try {
    if (typeof video.webkitEnterFullscreen === "function") {
      video.webkitEnterFullscreen();
      return;
    }
    if (video.requestFullscreen) {
      await video.requestFullscreen();
      return;
    }
    const root = video.parentElement as (HTMLElement & {
      requestFullscreen?: () => Promise<void>;
    }) | null;
    if (root?.requestFullscreen) {
      await root.requestFullscreen();
    }
  } catch {
    /* user gesture / browser policy — stay inline */
  }
}

function QuoteVideoPlayer({
  playButtonSize,
  className,
  enterFullscreenOnPlay = false,
}: QuoteVideoPlayerProps) {
  const videoRef = useRef<VideoEl>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playing) return;

    const onEnded = () => {
      setPlaying(false);
    };
    const onFullscreenChange = () => {
      const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
      };
      const fsEl =
        document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
      const inFs =
        fsEl === video ||
        fsEl === video.parentElement ||
        Boolean(video.webkitDisplayingFullscreen);
      if (!inFs && video.paused) {
        setPlaying(false);
      }
    };

    video.addEventListener("ended", onEnded);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    video.addEventListener("webkitendfullscreen", onFullscreenChange);

    return () => {
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      video.removeEventListener("webkitendfullscreen", onFullscreenChange);
    };
  }, [playing]);

  const start = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      const video = videoRef.current;
      if (!video) return;

      void (async () => {
        try {
          await video.play();
        } catch {
          /* native controls remain if autoplay is blocked */
        }
        if (enterFullscreenOnPlay) {
          await enterNativeFullscreen(video);
        }
      })();
    });
  };

  return (
    <div
      className={`relative overflow-hidden bg-black ${className ?? ""}`}
    >
      {playing ? (
        <video
          ref={videoRef}
          className="quote-video absolute inset-0 size-full bg-black object-contain"
          src={landingAssets.video.intro}
          poster={landingAssets.photos.videoPreview}
          controls
          playsInline
          preload="metadata"
          controlsList="nodownload"
        />

      ) : (
        <>
          <img
            src={landingAssets.photos.videoPreview}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <button
            type="button"
            aria-label="Смотреть видео"
            onClick={start}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition hover:brightness-110"
            style={{ width: playButtonSize, height: playButtonSize }}
          >
            <img
              src={landingAssets.video.playButton}
              alt=""
              className="size-full"
            />
          </button>
        </>
      )}
    </div>
  );
}

/* Figma Главная_360: Frame 2421 (20,2160,320×625) */
function QuoteVideoMobile() {
  return (
    <section className="absolute left-[20px] top-[2160px] flex h-[650px] w-[320px] flex-col gap-[20px] rounded-[40px] bg-light-gray px-[15px] pb-[15px] pt-[40px]">
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
      {/* left quote card */}
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

      {/* right video column */}
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
