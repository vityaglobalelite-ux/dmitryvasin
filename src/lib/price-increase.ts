"use client";

import { useEffect, useState } from "react";

const SETTING_KEY = "price_increase_at";

function parseTarget(raw: string | null | undefined): Date | null {
  if (!raw?.trim()) return null;
  const d = new Date(raw.trim());
  return Number.isFinite(d.getTime()) ? d : null;
}

async function fetchPriceIncreaseAt(): Promise<Date | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!base || !anon) return null;

  const url =
    `${base}/rest/v1/bot_settings` +
    `?select=value` +
    `&key=eq.${encodeURIComponent(SETTING_KEY)}` +
    `&limit=1`;

  try {
    const res = await fetch(url, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { value?: string }[];
    return parseTarget(rows[0]?.value);
  } catch {
    return null;
  }
}

/** Target from bot_settings.price_increase_at; active only while still in the future. */
export function usePriceIncreaseTarget(): {
  target: Date | null;
  ready: boolean;
  active: boolean;
} {
  const [target, setTarget] = useState<Date | null>(null);
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const d = await fetchPriceIncreaseAt();
      if (cancelled) return;
      setTarget(d);
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

  const active = Boolean(target && target.getTime() > now);

  return { target, ready, active };
}
