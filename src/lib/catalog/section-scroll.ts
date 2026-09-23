"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { smoothScrollToId, smoothScrollToY } from "@/lib/smooth-scroll";

/** Home anchors in page order; "top" is the hero. */
export const HOME_SECTION_IDS = ["reviews", "contacts"] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
export type HomeSection = "top" | HomeSectionId;

/** Air between the pinned site header and a section. */
const SECTION_GAP = 16;

/** Pause after a route change so the page is seen before the glide starts. */
const ARRIVAL_GLIDE_DELAY_MS = 260;

/**
 * Bottom edge of the pinned site header (`[data-site-header]`) plus air.
 * Measured live: header height differs between phone and desktop.
 */
export function siteSectionOffset(): number {
  const header = document.querySelector<HTMLElement>("[data-site-header]");
  if (!header) return SECTION_GAP;
  const { position } = window.getComputedStyle(header);
  if (position !== "fixed" && position !== "sticky") return SECTION_GAP;
  return Math.max(0, header.getBoundingClientRect().bottom) + SECTION_GAP;
}

function replaceHash(hash: string) {
  const next = `${window.location.pathname}${window.location.search}${hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) window.history.replaceState(null, "", next);
}

/** Glide to a section on the current page; the URL mirrors the target. */
export function scrollToSiteSection(
  id: string,
  opts?: { delayMs?: number },
): Promise<boolean> {
  replaceHash(`#${id}`);
  return smoothScrollToId(id, {
    updateHash: false,
    delayMs: opts?.delayMs,
    offset: siteSectionOffset,
  });
}

export function scrollToSiteTop(): Promise<void> {
  replaceHash("");
  return smoothScrollToY(0);
}

/** Arrived on a page via `/path#id` — glide once the page has painted. */
export function glideToHashOnArrival(hash: string): Promise<boolean> {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return Promise.resolve(false);
  return smoothScrollToId(id, {
    updateHash: false,
    delayMs: ARRIVAL_GLIDE_DELAY_MS,
    offset: siteSectionOffset,
  });
}

function readHomeSection(): HomeSection {
  const doc = document.documentElement;
  const present = HOME_SECTION_IDS.filter((id) => document.getElementById(id));
  // Footer is shorter than the viewport — it only "arrives" at the very end
  if (
    present.length > 0 &&
    window.scrollY + window.innerHeight >= doc.scrollHeight - 2
  ) {
    return present[present.length - 1];
  }
  const probe = siteSectionOffset() + window.innerHeight * 0.3;
  let active: HomeSection = "top";
  for (const id of present) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= probe) active = id;
  }
  return active;
}

/**
 * Scroll-spy for the home quick links.
 * `pin` holds the clicked target while its glide runs, so the indicator
 * moves once instead of ticking through every section it passes.
 */
export function useHomeSectionSpy(enabled: boolean) {
  const [active, setActive] = useState<HomeSection>("top");
  const pinToken = useRef(0);
  const pinned = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pinned.current) return;
      const next = readHomeSection();
      setActive((prev) => (prev === next ? prev : next));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled]);

  const pin = useCallback((section: HomeSection, glide: Promise<unknown>) => {
    const token = ++pinToken.current;
    pinned.current = true;
    setActive(section);
    void glide.finally(() => {
      if (token !== pinToken.current) return;
      pinned.current = false;
      const next = readHomeSection();
      setActive((prev) => (prev === next ? prev : next));
    });
  }, []);

  return { active, pin };
}
