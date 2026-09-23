"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { glideToHashOnArrival } from "@/lib/catalog/section-scroll";
import { cancelSmoothScroll } from "@/lib/smooth-scroll";

/** Instant jump — same surfaces as landing smooth-scroll writes. */
export function scrollWindowToTop(): void {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
}

/**
 * Forward route changes start at the top; `/path#section` then glides to the
 * section (links pass `scroll={false}` so Next does not jump there first).
 * Back/forward keep browser restoration so catalog position is not lost
 * after a product.
 */
export function useRouteScrollTop(): void {
  const pathname = usePathname();
  const popped = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      popped.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useLayoutEffect(() => {
    // A glide must not outlive the page it was started on
    cancelSmoothScroll();
    if (popped.current) {
      popped.current = false;
      return;
    }
    scrollWindowToTop();
    if (window.location.hash) void glideToHashOnArrival(window.location.hash);
  }, [pathname]);
}
