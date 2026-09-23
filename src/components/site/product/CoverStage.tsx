"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { siteFocusRing } from "@/components/site/ui/Button";
import { CarouselArrow } from "@/components/site/ui/CarouselArrow";
import { lessonClip, type LessonClip } from "@/lib/catalog/lesson-clip";
import { productAssets } from "@/components/site/product/assets";
import { productUi } from "@/components/site/product/copy";
import { useLocale } from "@/lib/catalog/locale-context";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

const FRAME =
  "group/cover relative h-[564px] w-full overflow-hidden rounded-[20px] bg-light-gray max-[600px]:h-[180px] max-[600px]:rounded-[10px] min-[601px]:row-span-2";

export function CoverStage({
  urls,
  alt,
  locked,
  unlockDate,
}: {
  urls: string[];
  alt: string;
  locked: boolean;
  unlockDate: string;
}) {
  return (
    <div className={FRAME}>
      {urls.length > 1 ? (
        <CoverCarousel
          urls={urls}
          alt={alt}
          sizes="(max-width: 600px) 320px, 710px"
          tone="light"
          eager
        />
      ) : urls[0] ? (
        <Image
          src={urls[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 600px) 320px, 710px"
          unoptimized
          priority
        />
      ) : null}
      {locked ? <PeekLockFill date={unlockDate} dimmed={urls.length > 0} /> : null}
    </div>
  );
}

function coverPosterUrl(url: string): string | undefined {
  if (!url.includes("/gifs/")) return undefined;
  return url.replace(/(\.[a-z0-9]+)$/i, "-still$1");
}

function useInView(ref: RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export function CoverCarousel({
  urls,
  alt,
  sizes,
  autoPlay = true,
  intervalMs = 5200,
  tone = "brand",
  hoverZoom = false,
  eager = false,
  controls = "stage",
}: {
  urls: string[];
  alt: string;
  sizes: string;
  autoPlay?: boolean;
  intervalMs?: number;
  tone?: "light" | "brand";
  hoverZoom?: boolean;
  eager?: boolean;
  /** stage: always-on hero arrows. frame: quiet card arrows, shown on hover. */
  controls?: "stage" | "frame";
}) {
  const locale = useLocale();
  const ui = productUi(locale);
  const root = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const inView = useInView(root);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeIndex = urls.length === 0 ? 0 : Math.min(index, urls.length - 1);
  const count = urls.length;

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    const node = root.current?.parentElement;
    if (!node) return;
    const enter = () => setPaused(true);
    const leave = () => setPaused(false);
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);
    return () => {
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
    };
  }, []);

  useEffect(() => {
    if (!autoPlay || reduced || paused || !inView || count < 2) return;
    const id = window.setInterval(() => go(safeIndex + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [autoPlay, count, go, inView, intervalMs, paused, reduced, safeIndex]);

  if (count === 0) return null;

  return (
    <div
      ref={root}
      className="absolute inset-0 z-20 pointer-events-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      aria-roledescription="carousel"
      aria-label={alt}
    >
      {urls.map((url, i) => {
        const active = i === safeIndex;
        const clip = lessonClip(url);
        const poster = clip?.poster ?? coverPosterUrl(url);
        const zoom = hoverZoom
          ? "transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          : "";
        return (
          <div
            key={`${url}-${i}`}
            className={[
              "absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none",
              active ? "opacity-100" : "pointer-events-none opacity-0",
            ].join(" ")}
            aria-hidden={!active}
          >
            <img
              src={poster ?? url}
              alt={active ? alt : ""}
              sizes={sizes}
              className={["absolute inset-0 size-full object-cover", zoom].join(" ")}
              draggable={false}
              loading={eager && active ? "eager" : "lazy"}
              decoding="async"
            />
            {clip && active && inView && !reduced ? (
              <CoverClipVideo clip={clip} zoom={zoom} />
            ) : null}
          </div>
        );
      })}

      {count > 1 ? (
        <>
          <CarouselArrow
            dir="prev"
            label={ui.coverPrev}
            variant={controls === "frame" ? "frame" : "stage"}
            reveal={controls === "frame"}
            tone={tone === "light" ? "glass" : "solid"}
            onClick={() => go(safeIndex - 1)}
          />
          <CarouselArrow
            dir="next"
            label={ui.coverNext}
            variant={controls === "frame" ? "frame" : "stage"}
            reveal={controls === "frame"}
            tone={tone === "light" ? "glass" : "solid"}
            onClick={() => go(safeIndex + 1)}
          />
          <div
            className={[
              "pointer-events-auto absolute bottom-[14px] left-1/2 z-20 flex -translate-x-1/2 items-center max-[600px]:bottom-2.5",
              controls === "frame" ? "gap-1.5" : "gap-2",
            ].join(" ")}
            role="tablist"
            aria-label={alt}
          >
            {count > 8 ? (
              <CoverProgress
                count={count}
                index={safeIndex}
                tone={tone}
                onSelect={go}
                label={ui.coverDot}
              />
            ) : (
              urls.map((_, i) => {
                const active = i === safeIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={ui.coverDot.replace("{n}", String(i + 1))}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      go(i);
                    }}
                    className={[
                      "size-2 rounded-full transition-[transform,opacity,background-color] duration-200",
                      siteFocusRing,
                      active
                        ? tone === "brand"
                          ? "scale-110 bg-[image:var(--brand-gradient)] shadow-[0_0_0_1.5px_rgba(255,255,255,0.92)]"
                          : "scale-110 bg-white"
                        : tone === "brand"
                          ? "bg-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.35)] hover:bg-white"
                          : "bg-white/45 hover:bg-white/70",
                    ].join(" ")}
                  />
                );
              })
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CoverClipVideo({ clip, zoom }: { clip: LessonClip; zoom: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [decoded, setDecoded] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.muted = true;
    const started = el.play();
    if (started) started.catch(() => undefined);
    return () => el.pause();
  }, []);

  return (
    <video
      ref={video}
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
      className={[
        "absolute inset-0 size-full object-cover transition-opacity duration-300",
        decoded ? "opacity-100" : "opacity-0",
        zoom,
      ].join(" ")}
      onLoadedData={() => setDecoded(true)}
    >
      <source src={clip.webm} type="video/webm" />
      <source src={clip.mp4} type="video/mp4" />
    </video>
  );
}

function CoverProgress({
  count,
  index,
  tone,
  onSelect,
  label,
}: {
  count: number;
  index: number;
  tone: "light" | "brand";
  onSelect: (next: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={[
          "flex h-1.5 w-[min(220px,46vw)] overflow-hidden rounded-full",
          tone === "brand" ? "bg-black/15" : "bg-white/30",
        ].join(" ")}
      >
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={label.replace("{n}", String(i + 1))}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onSelect(i);
            }}
            className={[
              "h-full min-w-0 flex-1 transition-colors duration-200",
              i === index
                ? tone === "brand"
                  ? "bg-[image:var(--brand-gradient)]"
                  : "bg-white"
                : "bg-transparent",
            ].join(" ")}
          />
        ))}
      </div>
      <span
        className={[
          "rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums leading-none backdrop-blur-[10px]",
          tone === "brand"
            ? "bg-white/88 text-text-dark"
            : "bg-black/35 text-white",
        ].join(" ")}
      >
        {index + 1}/{count}
      </span>
    </div>
  );
}

function PeekLockFill({
  date,
  dimmed,
}: {
  date: string;
  dimmed: boolean;
}) {
  const ui = productUi(useLocale());
  return (
    <div
      className={[
        "absolute inset-0 z-[2] flex flex-col items-center justify-center gap-5 px-6 text-center max-[600px]:gap-3",
        dimmed ? "bg-[#f4f4f6]/92 backdrop-blur-[8px]" : "bg-light-gray",
        "pointer-events-none transition-colors duration-200 ease-out group-hover/cover:bg-[#f4f4f6]/80",
      ].join(" ")}
    >
      <img
        src={productAssets.lock}
        alt=""
        width={62}
        height={78}
        className="max-[600px]:h-[39px] max-[600px]:w-[31px] origin-center transition-transform duration-200 ease-out group-hover/cover:scale-110 motion-reduce:transition-none motion-reduce:group-hover/cover:scale-100"
      />
      <p className="text-[16px] leading-[1.5] text-text max-[600px]:text-[13px]">
        <span>{ui.peekOpens}</span>
        {date ? (
          <>
            <br />
            <strong className="font-bold">{date}</strong>
          </>
        ) : null}
      </p>
    </div>
  );
}
