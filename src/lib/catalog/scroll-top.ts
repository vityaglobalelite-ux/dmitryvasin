"use client";

import { useLayoutEffect, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Instant jump — same surfaces as landing smooth-scroll writes. */
export function scrollWindowToTop(): void {
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
}

/**
 * Forward route changes start at the top. Back/forward keep browser restoration
 * so catalog position is not lost after a product.
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
    if (popped.current) {
      popped.current = false;
      return;
    }
    scrollWindowToTop();
  }, [pathname]);
}
