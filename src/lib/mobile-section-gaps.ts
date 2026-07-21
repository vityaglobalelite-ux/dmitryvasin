/**
 * Mobile inter-section spacing (Figma canvas px).
 * Compress gaps that are larger than TARGET; leave smaller ones alone.
 * MyView → Directions (arrow scribble) is NOT compressed.
 */
const TARGET_GAP = 80;

const ORIGINAL = {
  quoteToMyView: 120,
  directionsToProgram: 60,
  lessonsToTelegram: 120,
  telegramToTariffs: 134,
  countdownToPayment: 120,
  paymentToReviews: 60,
  reviewsToFooter: 58,
} as const;

/** Only pull up when original gap is larger than target */
function pull(original: number) {
  return Math.min(0, TARGET_GAP - original);
}

const s0 = pull(ORIGINAL.quoteToMyView);
const s1 = s0 + pull(ORIGINAL.directionsToProgram);
const s2 = s1 + pull(ORIGINAL.lessonsToTelegram);
const s3 = s2 + pull(ORIGINAL.telegramToTariffs);
const s4 = s3 + pull(ORIGINAL.countdownToPayment);
const s5 = s4 + pull(ORIGINAL.paymentToReviews);
const s6 = s5 + pull(ORIGINAL.reviewsToFooter);

export const MOBILE_GAP_SHIFT = {
  myViewAndDirections: s0,
  programAndLessons: s1,
  telegram: s2,
  tariffsAndCountdown: s3,
  payment: s4,
  reviews: s5,
  footer: s6,
} as const;

export const MOBILE_CANVAS_HEIGHT_SHRINK = -MOBILE_GAP_SHIFT.footer;
