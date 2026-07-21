"use client";

import type { ReactNode } from "react";
import { useIsMobile } from "@/lib/landing-mode";

/**
 * Nudges absolute-positioned mobile sections up to tighten white gaps.
 * Does not change desktop layout. Nested shifts stack with ProgramTail.
 */
export function MobileYShift({
  y,
  children,
}: {
  y: number;
  children: ReactNode;
}) {
  const isMobile = useIsMobile();
  if (!isMobile || y === 0) return children;

  return (
    <div
      className="absolute left-0 top-0 w-full"
      style={{ transform: `translate3d(0, ${y}px, 0)` }}
    >
      {children}
    </div>
  );
}
