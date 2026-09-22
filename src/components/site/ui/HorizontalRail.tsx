"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CarouselArrow } from "@/components/site/ui/CarouselArrow";
import { useLocale } from "@/lib/catalog/locale-context";

const railLabels = {
  ru: { prev: "Предыдущие карточки", next: "Следующие карточки" },
  en: { prev: "Previous cards", next: "Next cards" },
} as const;

/** Vertical center of the desktop ProductCard cover (263px). Phones scroll the rail. */
const railControlTop = "top-[131.5px] max-[600px]:hidden";

/** Stop a sideways drag past the ends from becoming Chrome pull-to-refresh. */
export function useContainHorizontalOverscroll(
  ref: React.RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0;
    let startY = 0;
    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
    };
    const onMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || !event.cancelable) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) <= Math.abs(dy)) return;
      const max = el.scrollWidth - el.clientWidth;
      const pastStart = el.scrollLeft <= 0 && dx > 0;
      const pastEnd = el.scrollLeft >= max - 1 && dx < 0;
      if (pastStart || pastEnd) event.preventDefault();
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
    };
  }, [ref]);
}

function useRailEdges(ref: React.RefObject<HTMLDivElement | null>, token: string) {
  const [edges, setEdges] = useState({ prev: false, next: false });

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      prev: el.scrollLeft > 8,
      next: max > 8 && el.scrollLeft < max - 8,
    });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [ref, sync, token]);

  return { edges, sync };
}

export function HorizontalRail({
  children,
  token,
  className,
  scrollerClassName,
  fade = true,
}: {
  children: ReactNode;
  /** Changes when the slide set is replaced, so edges and scroll reset. */
  token: string;
  className?: string;
  scrollerClassName?: string;
  fade?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const { edges } = useRailEdges(scroller, token);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
  }, [token]);

  useContainHorizontalOverscroll(scroller);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-rail-card]");
    const delta = (card?.offsetWidth ?? Math.round(el.clientWidth * 0.8)) + 20;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * delta, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={["relative min-w-0", className].filter(Boolean).join(" ")}>
      <div
        ref={scroller}
        className={[
          "flex h-full snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-none scroll-smooth",
          "max-[600px]:scroll-auto max-[600px]:gap-3",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          scrollerClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>
      {fade && edges.prev ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-white to-transparent max-[600px]:hidden"
        />
      ) : null}
      {fade && edges.next ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-white to-transparent max-[600px]:hidden"
        />
      ) : null}
      {edges.prev ? (
        <CarouselArrow
          dir="prev"
          variant="rail"
          label={railLabels[locale].prev}
          className={`left-3 ${railControlTop}`}
          onClick={() => scrollByDir(-1)}
        />
      ) : null}
      {edges.next ? (
        <CarouselArrow
          dir="next"
          variant="rail"
          label={railLabels[locale].next}
          className={`right-3 ${railControlTop}`}
          onClick={() => scrollByDir(1)}
        />
      ) : null}
    </div>
  );
}
