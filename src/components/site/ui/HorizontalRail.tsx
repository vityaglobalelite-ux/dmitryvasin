"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CarouselArrow } from "@/components/site/ui/CarouselArrow";

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
  const { edges } = useRailEdges(scroller, token);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: 0, behavior: "auto" });
  }, [token]);

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
          "flex h-full snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain scroll-smooth",
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
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-10 bg-gradient-to-r from-white to-transparent max-[600px]:w-6"
        />
      ) : null}
      {fade && edges.next ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-white to-transparent max-[600px]:w-8"
        />
      ) : null}
      {edges.prev ? (
        <CarouselArrow dir="prev" onClick={() => scrollByDir(-1)} />
      ) : null}
      {edges.next ? (
        <CarouselArrow dir="next" onClick={() => scrollByDir(1)} />
      ) : null}
    </div>
  );
}
