/**
 * Mobile inter-section white-space compression (Figma canvas px).
 * Target gap ≈ 40px. MyView → Directions (arrow scribble) is NOT compressed.
 *
 * Cumulative translateY applied via MobileYShift in page.tsx.
 */
export const MOBILE_GAP_SHIFT = {
  /** QuoteVideo → MyView was 120px */
  myViewAndDirections: -80,
  /** + Directions → Program was 60px */
  programAndLessons: -100,
  /** + Lessons → Telegram was 120px */
  telegram: -180,
  /** + Telegram → Tariffs was 134px */
  tariffsAndCountdown: -274,
  /** + Countdown → Payment was 120px */
  payment: -354,
  /** + Payment → Reviews was 60px */
  reviews: -374,
  /** + Reviews → Footer was 58px */
  footer: -392,
} as const;

/** How much shorter the mobile canvas becomes after compression */
export const MOBILE_CANVAS_HEIGHT_SHRINK = -MOBILE_GAP_SHIFT.footer;
