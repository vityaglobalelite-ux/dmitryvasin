"use client";

import { useEffect, useRef } from "react";

/**
 * Fixed 1920px design canvas scaled to the viewport width via CSS zoom,
 * so the layout reproduces the Figma desktop frame 1:1 at any window size.
 */
export function FigCanvas({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.style.zoom = String(document.documentElement.clientWidth / 1920);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto h-[15131px] w-[1920px] overflow-hidden bg-white"
    >
      {children}
    </div>
  );
}
