"use client";

import { useEffect, useState } from "react";
import { CLUB_CUTOVER_ISO } from "@/lib/tariff-stage3";

const SETTING_KEY = "price_increase_at";

export type SalesPhase = "countdown" | "closed" | "open";

function parseTarget(raw: string | null | undefined): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isFinite(d.getTime()) ? d : null;
}

const FALLBACK_TARGET = parseTarget(CLUB_CUTOVER_ISO);

async function fetchPriceIncreaseAt(): Promise<Date | null | undefined> {
  const base = (
    process.env.NEXT_PUBLIC_PUBLIC_DATA_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return undefined;

  const url =
    `${base}/rest/v1/bot_settings` +
    `?select=value` +
    `&key=eq.${encodeURIComponent(SETTING_KEY)}` +
    `&limit=1`;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const rows = (await res.json()) as { value?: string }[];
        return parseTarget(rows[0]?.value);
      }
      if (res.status < 500) return undefined;
    } catch {
      // Retry transient edge/origin failures below.
    }

    if (attempt < 2) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, 300 * (attempt + 1)),
      );
    }
  }

  return undefined;
}

function phaseFor(target: Date | null, now: number): SalesPhase {
  if (!target) return "open";
  return target.getTime() > now ? "countdown" : "closed";
}

/**
 * Cutover from bot_settings.price_increase_at (fallback: 21 Aug 2026 00:00 Miami).
 * countdown — sales open, timer banner
 * closed — sales closed, «Вход в клуб закрыт»
 * open — no timestamp (rolled back), no banner, sales open
 */
export function usePriceIncreaseTarget(): {
  target: Date | null;
  ready: boolean;
  active: boolean;
  closed: boolean;
  salesOpen: boolean;
  phase: SalesPhase;
} {
  const [target, setTarget] = useState<Date | null>(FALLBACK_TARGET);
  const [ready, setReady] = useState(Boolean(FALLBACK_TARGET));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await fetchPriceIncreaseAt();
      if (cancelled) return;
      if (d !== undefined) setTarget(d);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!target || target.getTime() <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  const phase = phaseFor(target, now);
  const active = phase === "countdown";
  const closed = phase === "closed";
  const salesOpen = phase !== "closed";

  return { target, ready, active, closed, salesOpen, phase };
}
