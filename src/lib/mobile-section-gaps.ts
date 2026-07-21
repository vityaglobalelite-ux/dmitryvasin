/**
 * Mobile inter-section spacing (Figma canvas px).
 *
 * Gaps BETWEEN section backgrounds (where colors meet), not inner padding.
 * MyView → Directions (arrow) keeps its relative gap.
 */
const TARGET_GAP = 40;

const ORIGINAL = {
  /** Noticed full-bleed gray ends exactly where Quote rounded block starts */
  noticedToQuote: 0,
  quoteToMyView: 120,
  directionsToProgram: 60,
  lessonsToTelegram: 120,
  telegramToTariffs: 134,
  countdownToPayment: 120,
  paymentToReviews: 60,
  reviewsToFooter: 58,
} as const;

function delta(original: number) {
  return TARGET_GAP - original;
}

const sQuote = delta(ORIGINAL.noticedToQuote);
const sMyView = sQuote + Math.min(0, delta(ORIGINAL.quoteToMyView));
const sProgram = sMyView + delta(ORIGINAL.directionsToProgram);
const sTelegram = sProgram + Math.min(0, delta(ORIGINAL.lessonsToTelegram));
const sTariffs = sTelegram + Math.min(0, delta(ORIGINAL.telegramToTariffs));
const sPayment = sTariffs + Math.min(0, delta(ORIGINAL.countdownToPayment));
const sReviews = sPayment + delta(ORIGINAL.paymentToReviews);
const sFooter = sReviews + delta(ORIGINAL.reviewsToFooter);

export const MOBILE_GAP_SHIFT = {
  /** Push Quote (and the gap of white) below Noticed gray */
  quote: sQuote,
  myViewAndDirections: sMyView,
  programAndLessons: sProgram,
  telegram: sTelegram,
  tariffsAndCountdown: sTariffs,
  payment: sPayment,
  reviews: sReviews,
  footer: sFooter,
} as const;

export const MOBILE_CANVAS_HEIGHT_SHRINK = -MOBILE_GAP_SHIFT.footer;
