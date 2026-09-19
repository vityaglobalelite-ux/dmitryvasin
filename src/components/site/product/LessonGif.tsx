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
import { Skeleton } from "@/components/site/ui/Skeleton";
import { useLocale } from "@/lib/catalog/locale-context";

function gifPosterUrl(url: string): string | undefined {
  if (!url.includes("/gifs/") || url.includes("-still.")) return undefined;
  return url.replace(/(\.[a-z0-9]+)$/i, "-still$1");
}

const warmedGifs = new Set<string>();

function warmUrl(url: string) {
  if (!url || warmedGifs.has(url)) return;
  warmedGifs.add(url);
  const init: RequestInit & { priority?: RequestPriority } = {
    cache: "force-cache",
    credentials: "same-origin",
    priority: "low",
  };
  void fetch(url, init).catch(() => {
    warmedGifs.delete(url);
  });
}

/** Cache stills immediately, then clip bytes at idle so the program is warm on scroll. */
export function usePrefetchLessonGifs(urls: readonly string[]) {
  const key = urls.join("\n");
  useEffect(() => {
    const unique = [...new Set(key.split("\n").filter(Boolean))];
    if (unique.length === 0) return;

    for (const url of unique) {
      const poster = gifPosterUrl(url);
      if (poster) warmUrl(poster);
    }

    let idleId = 0;
    let timeoutId = 0;
    const warmAnims = () => {
      for (const url of unique) warmUrl(url);
    };
    const start = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(warmAnims, { timeout: 900 });
      } else {
        timeoutId = window.setTimeout(warmAnims, 180);
      }
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      window.removeEventListener("load", start);
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [key]);
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function useInView(ref: RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(Boolean(entry?.isIntersecting)),
      { rootMargin: "160px 0px", threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export function LessonGif({ src }: { src: string }) {
  return <LessonGifGallery urls={[src]} />;
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
  const inView = useInView(root);
  const [index, setIndex] = useState(0);
  const count = urls.length;
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const indexRef = useRef(safeIndex);
  indexRef.current = safeIndex;

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
      className="flex flex-col gap-2.5"
      aria-label={label}
      aria-roledescription={count > 1 ? "carousel" : undefined}
    >
      <div className="relative overflow-hidden rounded-[10px] bg-[#141416]">
        {count === 1 ? (
          <div className="relative aspect-video w-full">
            <LessonFrame
              url={urls[0]}
              alt=""
              play={inView}
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
              return (
                <div
                  key={`${url}-${i}`}
                  className="relative aspect-video w-full shrink-0 snap-center"
                  aria-hidden={!active}
                >
                  <LessonFrame
                    url={url}
                    alt={active ? ui.coverDot.replace("{n}", String(i + 1)) : ""}
                    play={active && inView}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {count > 1 ? (
        <div
          className="grid gap-2"
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
          {urls.map((url, i) => {
            const active = i === safeIndex;
            const poster = gifPosterUrl(url) ?? url;
            return (
              <button
                key={`${url}-thumb-${i}`}
                type="button"
                role="tab"
                aria-selected={active}
                tabIndex={active ? 0 : -1}
                aria-label={ui.coverDot.replace("{n}", String(i + 1))}
                onClick={() => go(i)}
                className={[
                  "relative aspect-video overflow-hidden rounded-[8px] bg-[#141416] transition-[opacity,box-shadow] duration-200",
                  siteFocusRing,
                  active
                    ? "ring-2 ring-plum ring-offset-2 ring-offset-white"
                    : "opacity-55 hover:opacity-100",
                ].join(" ")}
              >
                <img
                  src={poster}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 size-full object-contain"
                  aria-hidden
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function LessonFrame({
  url,
  alt,
  play,
}: {
  url: string;
  alt: string;
  play: boolean;
}) {
  const poster = gifPosterUrl(url);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!play) setLive(false);
  }, [play]);

  useEffect(() => {
    setLive(false);
  }, [url]);

  const still = poster ?? url;

  return (
    <>
      {phase !== "ready" && !live ? (
        <Skeleton className="absolute inset-0 rounded-[10px]" />
      ) : null}
      {!live && phase !== "error" ? (
        <img
          src={still}
          alt={play ? "" : alt}
          decoding="async"
          draggable={false}
          className={[
            "absolute inset-0 size-full object-contain",
            phase === "ready" ? "opacity-100" : "opacity-0",
          ].join(" ")}
          onLoad={() => setPhase("ready")}
          onError={() => setPhase("error")}
        />
      ) : null}
      {play ? (
        <img
          key={url}
          src={url}
          alt={alt}
          draggable={false}
          className="absolute inset-0 size-full object-contain"
          onLoad={() => {
            setLive(true);
            setPhase("ready");
          }}
          onError={() => {
            setLive(false);
            if (!poster) setPhase("error");
          }}
        />
      ) : null}
    </>
  );
}
