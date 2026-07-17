/** Cinematic in-page scroll for the zoomed Figma canvas. */

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
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  if (!mobile) return 28;
  const zoom = document.documentElement.clientWidth / 360;
  return Math.round(56 * zoom + 16);
}

/**
 * Visual scrollY so the element sits just below the sticky nav.
 * getBoundingClientRect is reliable with CSS zoom (matches window.scrollY units).
 */
export function getSectionScrollTop(el: Element): number {
  const top = window.scrollY + el.getBoundingClientRect().top - stickyOffset();
  const max =
    Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ) - window.innerHeight;
  return Math.max(0, Math.min(top, max));
}

export function cancelSmoothScroll() {
  if (activeRaf) {
    cancelAnimationFrame(activeRaf);
    activeRaf = 0;
  }
  scrollToken += 1;
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

export function smoothScrollToY(targetY: number): Promise<void> {
  cancelSmoothScroll();
  const token = scrollToken;
  const startY =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  const distance = targetY - startY;

  if (Math.abs(distance) < 1) {
    writeScrollY(targetY);
    return Promise.resolve();
  }

  // Reduced motion: short fade, not a hard snap
  const duration = prefersReducedMotion()
    ? 280
    : Math.min(2200, Math.max(900, Math.abs(distance) * 0.75));

  setScrollBehavior("auto");

  return new Promise((resolve) => {
    let startTime: number | null = null;

    const step = (now: number) => {
      if (token !== scrollToken) {
        resolve();
        return;
      }
      if (startTime === null) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      writeScrollY(startY + distance * smootherstep(t));

      if (t < 1) {
        activeRaf = requestAnimationFrame(step);
      } else {
        activeRaf = 0;
        writeScrollY(targetY);
        resolve();
      }
    };

    activeRaf = requestAnimationFrame(step);
  });
}

export function smoothScrollToId(
  id: string,
  opts?: { updateHash?: boolean; delayMs?: number },
): Promise<boolean> {
  const updateHash = opts?.updateHash ?? true;
  const delayMs = opts?.delayMs ?? 0;

  const run = async () => {
    const el = document.getElementById(id);
    if (!el) return false;

    // Ensure page can scroll (mobile menu may still be unlocking)
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }

    // Re-measure after delay (menu close / layout settle)
    await smoothScrollToY(getSectionScrollTop(el));

    if (updateHash) {
      const next = `#${id}`;
      if (window.location.hash !== next) {
        history.pushState(null, "", next);
      }
    }
    return true;
  };

  if (delayMs > 0) {
    return new Promise((resolve) => {
      window.setTimeout(() => {
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

function isMenuLikelyOpen(): boolean {
  return document.body.style.overflow === "hidden";
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
