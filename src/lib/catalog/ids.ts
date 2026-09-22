/** Stable catalog product ids (Wave 0 seed). */

export const POSTURE_COURSE_FULL_ID =
  "d0230001-0001-4000-8000-000000000001";
export const POSTURE_COURSE_BLOCK1_ID =
  "d0230001-0002-4000-8000-000000000002";
export const POSTURE_COURSE_BLOCK2_ID =
  "d0230001-0003-4000-8000-000000000003";
export const COURSE_2_ID = "d0230001-0004-4000-8000-000000000004";

export const LIFEHACK_1_ID = "d0230001-2001-4000-8000-000000000001";
export const LIFEHACK_2_ID = "d0230001-2001-4000-8000-000000000002";
export const LIFEHACK_3_ID = "d0230001-2001-4000-8000-000000000003";

export const LIFEHACK_IDS = [
  LIFEHACK_1_ID,
  LIFEHACK_2_ID,
  LIFEHACK_3_ID,
] as const;

export const POSTURE_BUNDLE = {
  fullId: POSTURE_COURSE_FULL_ID,
  block1Id: POSTURE_COURSE_BLOCK1_ID,
  block2Id: POSTURE_COURSE_BLOCK2_ID,
} as const;

export function peekProductId(index: number): string {
  if (!Number.isInteger(index) || index < 1 || index > 24) {
    throw new RangeError(`peek index must be 1..24, got ${index}`);
  }
  const suffix = index.toString(16).padStart(12, "0");
  return `d0230001-1001-4000-8000-${suffix}`;
}

export const PEEK_1_ID = peekProductId(1);
