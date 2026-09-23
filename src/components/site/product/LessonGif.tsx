"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { productUi } from "@/components/site/product/copy";
import { siteFocusRing } from "@/components/site/ui/Button";
import { CarouselArrow } from "@/components/site/ui/CarouselArrow";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { lessonClip, type LessonClip } from "@/lib/catalog/lesson-clip";
import { useLocale } from "@/lib/catalog/locale-context";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/** Start fetching a clip this far before it scrolls into view. */
const PRELOAD_MARGIN = "600px 0px";

/**
 * Splits "close enough to start downloading" from "actually on screen", so a
 * clip is ready by the time it is reached but only decodes while visible.
 *
 * `near` deliberately goes back to false once the gallery is well away: a long
 * programme has more clips than a browser will keep media pipelines for (iOS
 * caps them), so videos far from the viewport give their element back and the
 * poster holds the stage until they are approached again.
 */
function useViewport(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const approach = new IntersectionObserver(
      ([entry]) => setNear(Boolean(entry?.isIntersecting)),
      { rootMargin: PRELOAD_MARGIN },
    );
    const onScreen = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0.15 },
    );
    approach.observe(node);
    onScreen.observe(node);
    return () => {
      approach.disconnect();
      onScreen.disconnect();
    };
  }, [ref]);

  return { near, visible };
}

export function LessonGifRow({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return <LessonGifGallery urls={urls} />;
}

function LessonGifGallery({ urls }: { urls: string[] }) {
  const locale = useLocale();
  const ui = productUi(locale);
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const skipScrollSync = useRef(false);
  const goTimer = useRef(0);
  const reduced = usePrefersReducedMotion();
  const { near, visible } = useViewport(root);
  const [index, setIndex] = useState(0);
  const count = urls.length;
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  // Read asynchronously by the resize snap below, so an effect write is enough.
  const indexRef = useRef(safeIndex);
  useEffect(() => {
    indexRef.current = safeIndex;
  }, [safeIndex]);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      const target = (next + count) % count;
      setIndex(target);
      const el = scroller.current;
      if (!el || el.clientWidth === 0) return;
      skipScrollSync.current = true;
      el.scrollTo({
        left: target * el.clientWidth,
        behavior: reduced ? "auto" : "smooth",
      });
      window.clearTimeout(goTimer.current);
      goTimer.current = window.setTimeout(() => {
        skipScrollSync.current = false;
      }, 480);
    },
    [count, reduced],
  );

  useEffect(() => {
    return () => window.clearTimeout(goTimer.current);
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el || count < 2) return;
    let snapTimer = 0;
    const snap = () => {
      skipScrollSync.current = true;
      el.scrollTo({
        left: indexRef.current * el.clientWidth,
        behavior: "auto",
      });
      window.clearTimeout(snapTimer);
      snapTimer = window.setTimeout(() => {
        skipScrollSync.current = false;
      }, 50);
    };
    const observer = new ResizeObserver(snap);
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(snapTimer);
    };
  }, [count]);

  if (count === 0) return null;

  const label = ui.lessonClips;

  return (
    <div
      ref={root}
      className="mx-auto flex w-full max-w-[480px] flex-col gap-2 max-[600px]:max-w-none"
      aria-label={label}
      aria-roledescription={count > 1 ? "carousel" : undefined}
    >
      <div className="relative overflow-hidden rounded-[10px] bg-[#141416] shadow-[0_10px_28px_rgba(20,20,22,0.14)]">
        {count === 1 ? (
          <div className="relative aspect-video w-full">
            <LessonFrame
              key={urls[0]}
              url={urls[0]}
              alt=""
              load={near && !reduced}
              play={visible && !reduced}
            />
          </div>
        ) : (
          <div
            ref={scroller}
            className="flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onScroll={() => {
              const el = scroller.current;
              if (!el || skipScrollSync.current || el.clientWidth === 0) return;
              const next = Math.round(el.scrollLeft / el.clientWidth);
              if (next !== safeIndex && next >= 0 && next < count) setIndex(next);
            }}
          >
            {urls.map((url, i) => {
              const active = i === safeIndex;
              // Keep the neighbours buffered as well, so stepping through the
              // thumbs never tears the element down and refetches it.
              const staged =
                active ||
                i === (safeIndex + 1) % count ||
                i === (safeIndex + count - 1) % count;
              return (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-video w-full shrink-0 snap-center"
                  aria-hidden={!active}
                >
                  <LessonFrame
                    url={url}
                    alt={active ? ui.coverDot.replace("{n}", String(i + 1)) : ""}
                    // Only the slide on stage plays; the rest hold their poster
                    // so swiping never lands on an empty frame.
                    load={near && staged && !reduced}
                    play={visible && active && !reduced}
                  />
                </div>
              );
            })}
          </div>
        )}
        {count > 1 ? (
          <>
            <CarouselArrow
              dir="prev"
              tone="glass"
              label={ui.coverPrev}
              onClick={() => go(safeIndex - 1)}
            />
            <CarouselArrow
              dir="next"
              tone="glass"
              label={ui.coverNext}
              onClick={() => go(safeIndex + 1)}
            />
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0, 1fr))`,
          }}
          role="tablist"
          aria-label={label}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const next =
              event.key === "ArrowLeft" ? safeIndex - 1 : safeIndex + 1;
            const target = (next + count) % count;
            go(next);
            const tabs = event.currentTarget.querySelectorAll<HTMLElement>(
              '[role="tab"]',
            );
            tabs[target]?.focus();
          }}
        >
          {urls.map((url, i) => (
            <LessonGifThumb
              key={`${url}-thumb-${i}`}
              src={lessonClip(url)?.poster ?? url}
              active={i === safeIndex}
              label={ui.coverDot.replace("{n}", String(i + 1))}
              onSelect={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LessonGifThumb({
  src,
  active,
  label,
  onSelect,
}: {
  src: string;
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      aria-label={label}
      onClick={onSelect}
      className={[
        "relative aspect-video overflow-hidden rounded-[8px] bg-[#141416] transition-[opacity,box-shadow] duration-200",
        siteFocusRing,
        active
          ? "ring-2 ring-plum ring-offset-2 ring-offset-white"
          : "opacity-55 hover:opacity-100",
      ].join(" ")}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className="absolute inset-0 size-full object-contain"
        aria-hidden
      />
    </button>
  );
}

/**
 * The poster is the floor of the stage: it stays put for the whole life of the
 * frame, so whenever the video is absent, still buffering or refused, what
 * shows is the clip's first frame rather than a hole.
 */
function LessonFrame({
  url,
  alt,
  load,
  play,
}: {
  url: string;
  alt: string;
  /** Mount the video element and let it start buffering. */
  load: boolean;
  /** Run playback; pausing offscreen keeps decoders free for visible clips. */
  play: boolean;
}) {
  const clip = lessonClip(url);
  const poster = clip?.poster ?? url;
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <>
      {!posterLoaded && !posterFailed ? (
        <Skeleton className="absolute inset-0 rounded-[10px]" />
      ) : null}
      {!posterFailed ? (
        <img
          src={poster}
          alt={play ? "" : alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className={[
            "absolute inset-0 size-full object-contain transition-opacity duration-200",
            posterLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onLoad={() => setPosterLoaded(true)}
          onError={() => setPosterFailed(true)}
        />
      ) : null}
      {clip && load ? (
        <LessonVideo clip={clip} alt={alt} play={play} />
      ) : null}
    </>
  );
}

/**
 * Owns its own readiness, so unmounting when the gallery scrolls away resets it
 * and the element never reappears opaque before it has a frame to show.
 */
function LessonVideo({
  clip,
  alt,
  play,
}: {
  clip: LessonClip;
  alt: string;
  play: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [decoded, setDecoded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    // React does not always reflect `muted` onto the element, and an unmuted
    // video is blocked by autoplay policies.
    el.muted = true;
    if (!play) {
      el.pause();
      return;
    }
    const started = el.play();
    // Autoplay can still be refused (iOS Low Power Mode); the poster stays up.
    if (started) started.catch(() => undefined);
  }, [play]);

  if (failed) return null;

  return (
    <video
      ref={video}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      className={[
        "absolute inset-0 size-full object-contain transition-opacity duration-200",
        decoded ? "opacity-100" : "opacity-0",
      ].join(" ")}
      onLoadedData={() => setDecoded(true)}
      onError={() => setFailed(true)}
    >
      <source src={clip.webm} type="video/webm" />
      {/* Last candidate: if this one errors, every source has been tried. A
          media element with <source> children fires no error of its own when
          the candidate list runs out, so it has to be caught here. */}
      <source
        src={clip.mp4}
        type="video/mp4"
        onError={() => setFailed(true)}
      />
    </video>
  );
}
