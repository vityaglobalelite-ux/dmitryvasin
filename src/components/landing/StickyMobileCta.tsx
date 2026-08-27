"use client";

import { ClubCta } from "@/components/landing/ClubCta";
import { useCountdownTail } from "@/lib/countdown-tail";
import { useIsMobile } from "@/lib/landing-mode";

/**
 * Mobile-only CTA pinned to the bottom of the viewport.
 * Outside FigCanvas zoom; full viewport width (mobile always fills width).
 */
export function StickyMobileCta() {
  const isMobile = useIsMobile();
  const { salesOpen } = useCountdownTail();
  if (!isMobile || !salesOpen) return null;

  return (
    <div className="sticky-cta" role="presentation">
      <ClubCta className="sticky-cta__btn">
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
      </ClubCta>
    </div>
  );
}
