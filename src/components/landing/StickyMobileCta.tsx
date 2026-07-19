"use client";

import { useIsMobile } from "@/lib/landing-mode";
import { telegramBotUrl } from "@/lib/landing-data";

/**
 * Mobile-only CTA pinned to the bottom of the viewport.
 * Rendered outside FigCanvas so it is not affected by the canvas `zoom`
 * scaling and stays 1:1 with the real viewport.
 */
export function StickyMobileCta() {
  const isMobile = useIsMobile();
  if (!isMobile) return null;

  return (
    <div className="sticky-cta" role="presentation">
      <a
        href={telegramBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="sticky-cta__btn"
      >
        <span>Присоединиться</span>
        <svg
          className="sticky-cta__arrow"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 9h9m0 0-3.5-3.5M13 9l-3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    </div>
  );
}
