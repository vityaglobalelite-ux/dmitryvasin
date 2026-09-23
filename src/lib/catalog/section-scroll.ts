"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  smoothScrollToId,
  smoothScrollToY,
  type GlideDuration,
} from "@/lib/smooth-scroll";

/** Home anchors in page order; "top" is the hero. */
export const HOME_SECTION_IDS = ["reviews", "contacts"] as const;
export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
export type HomeSection = "top" | HomeSectionId;

/** Air between the pinned site header and a section. */
const SECTION_GAP = 16;

/** Pause after a route change so the page is seen before the glide starts. */
const ARRIVAL_GLIDE_DELAY_MS = 260;

/**
 * Navigation glide: grows with √distance, so a hop between neighbours is
 * quick (~0.6 s) and the full home page never takes longer than 1.2 s.
 */
const siteGlideDuration: GlideDuration = (distance) =>
  Math.min(1200, Math.max(600, 400 + Math.sqrt(distance) * 9));

function isHomeSectionId(id: string): id is HomeSectionId {
  return (HOME_SECTION_IDS as readonly string[]).includes(id);
}

/* ---- Glide target ----
   While a glide runs, the quick links show where it is going instead of
   ticking through every section it passes. Every site glide goes through
   `pinDuring`, so in-page clicks and cross-page arrivals behave the same. */

let glideTarget: HomeSection | null = null;
let glideToken = 0;
const glideListeners = new Set<() => void>();

function setGlideTarget(next: HomeSection | null) {
  glideTarget = next;
  glideListeners.forEach((listener) => listener());
}

function subscribeGlideTarget(listener: () => void) {
  glideListeners.add(listener);
  return () => {
    glideListeners.delete(listener);
  };
}

/** Relies on smooth-scroll settling every glide — finished or cancelled. */
function pinDuring<T>(section: HomeSection, glide: Promise<T>): Promise<T> {
  const token = ++glideToken;
  setGlideTarget(section);
  void glide.finally(() => {
    if (token === glideToken) setGlideTarget(null);
  });
  return glide;
}

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

function glideToId(id: string, delayMs?: number): Promise<boolean> {
  const glide = smoothScrollToId(id, {
    updateHash: false,
    delayMs,
    offset: siteSectionOffset,
    duration: siteGlideDuration,
  });
  return isHomeSectionId(id) ? pinDuring(id, glide) : glide;
}

/** Glide to a section on the current page; the URL mirrors the target. */
export function scrollToSiteSection(id: string): Promise<boolean> {
  replaceHash(`#${id}`);
  return glideToId(id);
}

export function scrollToSiteTop(): Promise<void> {
  replaceHash("");
  return pinDuring("top", smoothScrollToY(0, { duration: siteGlideDuration }));
}

/** Arrived on a page via `/path#id` — glide once the page has painted. */
export function glideToHashOnArrival(hash: string): Promise<boolean> {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return Promise.resolve(false);
  return glideToId(id, ARRIVAL_GLIDE_DELAY_MS);
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

/** Scroll-spy for the home quick links; a running glide shows its target. */
export function useHomeSection(enabled: boolean): HomeSection {
  const [spied, setSpied] = useState<HomeSection>("top");
  const target = useSyncExternalStore(
    subscribeGlideTarget,
    () => glideTarget,
    () => null,
  );

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const next = readHomeSection();
      setSpied((prev) => (prev === next ? prev : next));
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
      // Next visit starts clean — never replays the previous position
      setSpied("top");
    };
  }, [enabled]);

  return target ?? spied;
}
