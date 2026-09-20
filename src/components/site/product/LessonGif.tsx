"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
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

const warmed = new Set<string>();
const inflight = new Map<string, Promise<void>>();
const warmListeners = new Set<(url: string) => void>();
let warmGeneration = 0;
let warmKey = "";

function notifyWarmed(url: string) {
  warmed.add(url);
  for (const listener of warmListeners) listener(url);
}

function warmUrl(url: string): Promise<void> {
  if (!url || warmed.has(url)) return Promise.resolve();
  const pending = inflight.get(url);
  if (pending) return pending;
  const init: RequestInit & { priority?: RequestPriority } = {
    cache: "force-cache",
    credentials: "same-origin",
    priority: "high",
  };
  const task = fetch(url, init)
    .then(async (response) => {
      if (!response.ok) throw new Error(String(response.status));
      await response.arrayBuffer();
      notifyWarmed(url);
    })
    .catch(() => undefined)
    .finally(() => {
      inflight.delete(url);
    });
  inflight.set(url, task);
  return task;
}

function startTopDownWarm(urls: readonly string[]) {
  const key = urls.join("\n");
  if (key === warmKey) return;
  warmKey = key;
  const generation = ++warmGeneration;
  void (async () => {
    for (const url of urls) {
      if (generation !== warmGeneration) return;
      const still = gifPosterUrl(url);
      if (still) await warmUrl(still);
      if (generation !== warmGeneration) return;
      await warmUrl(url);
    }
  })();
}

function useWarmed(url: string) {
  const [ready, setReady] = useState(() => Boolean(url) && warmed.has(url));
  useEffect(() => {
    if (!url) {
      setReady(false);
      return;
    }
    if (warmed.has(url)) {
      setReady(true);
      return;
    }
    setReady(false);
    const onReady = (done: string) => {
      if (done === url) setReady(true);
    };
    warmListeners.add(onReady);
    return () => {
      warmListeners.delete(onReady);
    };
  }, [url]);
  return ready;
}

type Slot = { ratio: number; dist: number };

type PlaybackApi = {
  activeId: string | null;
  report: (id: string, slot: Slot) => void;
  forget: (id: string) => void;
};

const PlaybackContext = createContext<PlaybackApi | null>(null);

function pickActive(slots: Map<string, Slot>): string | null {
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [id, slot] of slots) {
    if (slot.ratio < 0.14) continue;
    if (slot.dist < bestDist) {
      bestDist = slot.dist;
      best = id;
    }
  }
  return best;
}

export function LessonGifPlaybackProvider({
  urls,
  children,
}: {
  urls: readonly string[];
  children: ReactNode;
}) {
  const slots = useRef(new Map<string, Slot>());
  const [activeId, setActiveId] = useState<string | null>(null);
  const raf = useRef(0);
  const key = urls.join("\n");
  const order = useMemo(
    () => [...new Set(key.split("\n").filter(Boolean))],
    [key],
  );

  useEffect(() => {
    startTopDownWarm(order);
  }, [order]);

  const flush = useCallback(() => {
    raf.current = 0;
    const next = pickActive(slots.current);
    setActiveId((prev) => (prev === next ? prev : next));
  }, []);

  const report = useCallback(
    (id: string, slot: Slot) => {
      slots.current.set(id, slot);
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(flush);
    },
    [flush],
  );

  const forget = useCallback(
    (id: string) => {
      slots.current.delete(id);
      if (raf.current) return;
      raf.current = window.requestAnimationFrame(flush);
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, []);

  const api = useMemo(
    () => ({ activeId, report, forget }),
    [activeId, report, forget],
  );

  return (
    <PlaybackContext.Provider value={api}>{children}</PlaybackContext.Provider>
  );
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

function usePlaybackFocus(ref: RefObject<HTMLDivElement | null>, id: string) {
  const playback = useContext(PlaybackContext);
  const playbackRef = useRef(playback);
  playbackRef.current = playback;
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        const api = playbackRef.current;
        if (!api) {
          setFallback(entry.isIntersecting);
          return;
        }
        const mid =
          (entry.boundingClientRect.top + entry.boundingClientRect.bottom) / 2;
        api.report(id, {
          ratio: entry.intersectionRatio,
          dist: Math.abs(mid - window.innerHeight / 2),
        });
      },
      { threshold: [0, 0.12, 0.28, 0.45, 0.6, 0.8, 1] },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      playbackRef.current?.forget(id);
    };
  }, [id, ref]);

  return playback ? playback.activeId === id : fallback;
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
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const skipScrollSync = useRef(false);
  const goTimer = useRef(0);
  const reduced = usePrefersReducedMotion();
  const focused = usePlaybackFocus(root, id);
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
      className="mx-auto flex w-full max-w-[480px] flex-col gap-2 max-[600px]:max-w-none"
      aria-label={label}
      aria-roledescription={count > 1 ? "carousel" : undefined}
    >
      <div className="relative overflow-hidden rounded-[10px] bg-[#141416] shadow-[0_10px_28px_rgba(20,20,22,0.14)]">
        {count === 1 ? (
          <div className="relative aspect-video w-full">
            <LessonFrame url={urls[0]} alt="" play={focused} />
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
                    play={active && focused}
                  />
                </div>
              );
            })}
          </div>
        )}
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
              src={gifPosterUrl(url) ?? url}
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
  const ready = useWarmed(src);
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
      {ready ? (
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-contain"
          aria-hidden
        />
      ) : null}
    </button>
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
  const still = poster ?? url;
  const stillReady = useWarmed(still);
  const animReady = useWarmed(url);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (!play) setLive(false);
  }, [play]);

  useEffect(() => {
    setLive(false);
    setPhase("loading");
  }, [url]);

  return (
    <>
      {phase !== "ready" && !live ? (
        <Skeleton className="absolute inset-0 rounded-[10px]" />
      ) : null}
      {!live && stillReady && phase !== "error" ? (
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
      {play && animReady ? (
        <img
          key={url}
          src={url}
          alt={alt}
          decoding="async"
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
