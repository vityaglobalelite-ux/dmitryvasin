/** Cinematic in-page scroll for the zoomed Figma canvas. */

import {
  getCanvasZoom,
  isMobileViewport,
  MOBILE_CANVAS,
} from "@/lib/landing-mode";
import { isPageScrollLocked } from "@/lib/scroll-lock";

let activeRaf = 0;
let scrollToken = 0;

/** Ken Perlin smootherstep — soft ease-in, silky ease-out */
function smootherstep(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function stickyOffset(): number {
  if (!isMobileViewport()) return 28;
  const zoom = getCanvasZoom(MOBILE_CANVAS.w, "mobile");
  return Math.round(56 * zoom + 16);
}

/**
 * Visual scrollY so the element sits just below the sticky nav.
 * getBoundingClientRect is reliable with CSS zoom (matches window.scrollY units).
 * `offset` defaults to the privateclub landing nav.
 */
export function getSectionScrollTop(
  el: Element,
  offset: number = stickyOffset(),
): number {
  const top = window.scrollY + el.getBoundingClientRect().top - offset;
  const max =
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ) - window.innerHeight;
  return Math.max(0, Math.min(top, max));
}

/** Settles the running glide's promise — a cancelled glide must not hang awaiters. */
let stopActive: (() => void) | null = null;

export function cancelSmoothScroll() {
  if (activeRaf) {
    cancelAnimationFrame(activeRaf);
    activeRaf = 0;
  }
  scrollToken += 1;
  const stop = stopActive;
  stopActive = null;
  stop?.();
}

const SCROLL_KEYS = new Set([
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowUp",
  "ArrowDown",
]);

/** The user takes over mid-glide: wheel, touch or a scroll key cancels it. */
function yieldToUserInput(): () => void {
  const onInput = () => cancelSmoothScroll();
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) cancelSmoothScroll();
  };
  window.addEventListener("wheel", onInput, { passive: true });
  window.addEventListener("touchstart", onInput, { passive: true });
  window.addEventListener("keydown", onKey);
  return () => {
    window.removeEventListener("wheel", onInput);
    window.removeEventListener("touchstart", onInput);
    window.removeEventListener("keydown", onKey);
  };
}

function setScrollBehavior(value: string) {
  document.documentElement.style.scrollBehavior = value;
  document.body.style.scrollBehavior = value;
}

function writeScrollY(y: number) {
  // Direct writes — avoid window.scrollTo({ behavior }) entirely
  document.documentElement.scrollTop = y;
  document.body.scrollTop = y;
  window.scrollTo(0, y);
}

function readScrollY(): number {
  return (
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
}

/**
 * Short correction pass after the animation: layout may still be moving
 * (in-app browser bars collapsing, accordion height easing, canvas re-zoom),
 * so keep converging on the re-measured target. Aborts on user input.
 */
function settleScrollY(getTarget: () => number, token: number) {
  const startedAt = performance.now();
  let cancelled = false;
  const abort = () => {
    cancelled = true;
  };
  window.addEventListener("touchstart", abort, { passive: true, once: true });
  window.addEventListener("wheel", abort, { passive: true, once: true });

  const tick = () => {
    if (cancelled || token !== scrollToken) {
      window.removeEventListener("touchstart", abort);
      window.removeEventListener("wheel", abort);
      return;
    }
    const target = getTarget();
    if (Math.abs(readScrollY() - target) > 2) {
      writeScrollY(target);
    }
    if (performance.now() - startedAt < 400) {
      requestAnimationFrame(tick);
    } else {
      window.removeEventListener("touchstart", abort);
      window.removeEventListener("wheel", abort);
    }
  };
  requestAnimationFrame(tick);
}

/** Glide length in ms for a distance in px. */
export type GlideDuration = (distance: number) => number;

/** Landing default — slow, cinematic travel. */
const cinematicDuration: GlideDuration = (distance) =>
  Math.min(2200, Math.max(900, distance * 0.75));

export function smoothScrollToY(
  target: number | (() => number),
  opts?: { duration?: GlideDuration },
): Promise<void> {
  cancelSmoothScroll();
  const token = scrollToken;
  const getTarget = typeof target === "function" ? target : () => target;
  const startY = readScrollY();
  const distance = getTarget() - startY;

  if (Math.abs(distance) < 1) {
    writeScrollY(getTarget());
    return Promise.resolve();
  }

  // Reduced motion: short fade, not a hard snap
  const duration = prefersReducedMotion()
    ? 280
    : (opts?.duration ?? cinematicDuration)(Math.abs(distance));

  setScrollBehavior("auto");

  return new Promise((resolve) => {
    let startTime: number | null = null;
    let stalledFrames = 0;
    let done = false;
    let releaseInput = () => {};

    /* Cancelled (newer glide, route change, user input): stop where we are */
    const stop = () => {
      if (done) return;
      done = true;
      window.clearTimeout(failSafe);
      releaseInput();
      resolve();
    };

    const finish = (y: number) => {
      if (done) return;
      done = true;
      window.clearTimeout(failSafe);
      releaseInput();
      if (stopActive === stop) stopActive = null;
      activeRaf = 0;
      writeScrollY(y);
      settleScrollY(getTarget, token);
      resolve();
    };

    /* In-app webviews (Telegram iOS) can starve rAF entirely — without this
       the click moves the page a few px and the animation silently dies */
    const failSafe = window.setTimeout(() => {
      if (token !== scrollToken || done) return;
      if (activeRaf) cancelAnimationFrame(activeRaf);
      finish(getTarget());
    }, duration + 300);

    stopActive = stop;
    releaseInput = yieldToUserInput();

    const step = (now: number) => {
      if (token !== scrollToken || done) {
        stop();
        return;
      }
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      /* Re-measure every frame: the layout can shift mid-flight (collapsing
         browser chrome, accordion easing), so a frozen target lands wrong */
      const y = startY + (getTarget() - startY) * smootherstep(t);
      writeScrollY(y);

      // WKWebView in-app browsers may drop programmatic scroll writes
      if (Math.abs(readScrollY() - y) > 24) {
        stalledFrames += 1;
        if (stalledFrames >= 5) {
          finish(getTarget());
          return;
        }
      } else {
        stalledFrames = 0;
      }

      if (t < 1) {
        activeRaf = requestAnimationFrame(step);
      } else {
        finish(getTarget());
      }
    };

    activeRaf = requestAnimationFrame(step);
  });
}

export function smoothScrollToId(
  id: string,
  opts?: {
    updateHash?: boolean;
    delayMs?: number;
    /** Sticky chrome height, re-read every frame; defaults to the landing nav. */
    offset?: () => number;
    duration?: GlideDuration;
  },
): Promise<boolean> {
  const updateHash = opts?.updateHash ?? true;
  const delayMs = opts?.delayMs ?? 0;
  const offset = opts?.offset;

  const run = async () => {
    const el = document.getElementById(id);
    if (!el) return false;

    /* No unlock here: a scroll lock belongs to its overlay, and programmatic
       scrolling works while the page is locked. The menu releases its own. */

    // Live target — re-measured every frame (menu close / layout settle)
    await smoothScrollToY(
      () => getSectionScrollTop(el, offset ? offset() : stickyOffset()),
      { duration: opts?.duration },
    );

    if (updateHash) {
      const next = `#${id}`;
      if (window.location.hash !== next) {
        history.pushState(null, "", next);
      }
    }
    return true;
  };

  if (delayMs > 0) {
    // Any scroll started or cancelled meanwhile — or the user scrolling
    // by hand during the pause — supersedes this one
    const token = scrollToken;
    const releaseInput = yieldToUserInput();
    return new Promise((resolve) => {
      window.setTimeout(() => {
        releaseInput();
        if (token !== scrollToken) {
          resolve(false);
          return;
        }
        void run().then(resolve);
      }, delayMs);
    });
  }

  return run();
}

function eventElement(target: EventTarget | null): Element | null {
  if (target instanceof Element) return target;
  if (target instanceof Text) return target.parentElement;
  return null;
}

/** An overlay (the landing menu) holds the page — let it close first. */
function isMenuLikelyOpen(): boolean {
  return isPageScrollLocked();
}

/**
 * Navigate to a section from a click handler.
 * Safe to call from React onClick — always preventDefault first.
 */
export function handleSectionLinkClick(
  event: { preventDefault: () => void },
  href: string,
  opts?: { delayMs?: number },
) {
  event.preventDefault();

  if (!href || href === "#") {
    void smoothScrollToY(0).then(() => {
      if (window.location.hash) {
        history.pushState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
      }
    });
    return;
  }

  if (!href.startsWith("#")) return;
  const id = decodeURIComponent(href.slice(1));
  if (!id) return;

  const delayMs =
    opts?.delayMs ?? (isMenuLikelyOpen() ? 320 : 0);
  void smoothScrollToId(id, { delayMs });
}

/**
 * Capture-phase fallback for any in-page anchors (CTAs, footer, etc.).
 */
export function bindSectionScroll(root: ParentNode = document): () => void {
  setScrollBehavior("auto");

  const onClick = (event: Event) => {
    const e = event as MouseEvent;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    const el = eventElement(e.target);
    const anchor = el?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (href == null) return;

    // Only intercept real section ids (or top)
    if (href !== "#") {
      const id = decodeURIComponent(href.slice(1));
      if (!id || !document.getElementById(id)) return;
    }

    e.preventDefault();
    // Do not stopPropagation — mobile menu still needs its onClick to close
    handleSectionLinkClick(e, href);
  };

  root.addEventListener("click", onClick, true);

  const boot = window.setTimeout(() => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (id && document.getElementById(id)) {
      void smoothScrollToId(id, { updateHash: false, delayMs: 40 });
    }
  }, 120);

  return () => {
    root.removeEventListener("click", onClick, true);
    window.clearTimeout(boot);
    cancelSmoothScroll();
  };
}
