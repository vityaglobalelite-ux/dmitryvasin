/**
 * Shared page scroll lock.
 *
 * Overlays nest (a menu under a sign-in dialog, a video over a review sheet),
 * so a counter owns `body.style.overflow`: the first lock saves it, the last
 * release restores it. Save/restore per component races — whoever releases
 * last restores a stale value and the page stays frozen or unlocked.
 * Never write `body.style.overflow` directly; take a lock.
 */

let locks = 0;
let savedOverflow = "";

/** Lock page scroll; returns the release (idempotent). */
export function lockPageScroll(): () => void {
  if (locks === 0) {
    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.body.style.overflow = savedOverflow;
  };
}

export function isPageScrollLocked(): boolean {
  return locks > 0;
}
