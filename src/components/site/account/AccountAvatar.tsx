"use client";

import { useEffect, useState } from "react";
import { siteAssets } from "@/lib/catalog/assets";

const loadedPhotos = new Set<string>();

export function AccountAvatar({
  src,
  size,
  className,
  tone = "onLight",
  interactive = false,
  busy = false,
  revealKey = 0,
  label,
  onClick,
}: {
  src: string | null;
  size: number;
  className?: string;
  tone?: "onLight" | "onBrand";
  interactive?: boolean;
  busy?: boolean;
  revealKey?: number;
  label?: string;
  onClick?: () => void;
}) {
  // Load outcome of one src — a new src starts clean without a reset.
  const [outcome, setOutcome] = useState<{ src: string; ok: boolean } | null>(null);
  const [revealedKey, setRevealedKey] = useState(0);
  const settled = src && outcome?.src === src ? outcome : null;
  const broken = settled?.ok === false;
  const photoReady = src ? loadedPhotos.has(src) || settled?.ok === true : false;
  const revealing = revealKey !== 0 && revealedKey !== revealKey;
  const photo = src && !broken ? src : null;

  const markLoaded = (loaded: string) => {
    loadedPhotos.add(loaded);
    setOutcome({ src: loaded, ok: true });
  };

  useEffect(() => {
    if (!src || loadedPhotos.has(src)) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) markLoaded(src);
    };
    img.onerror = () => {
      if (!cancelled) setOutcome({ src, ok: false });
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (revealKey === 0) return;
    const timer = window.setTimeout(() => setRevealedKey(revealKey), 1100);
    return () => window.clearTimeout(timer);
  }, [revealKey]);

  const frameClass = [
    "account-avatar",
    tone === "onBrand" ? "account-avatar-brand" : "account-avatar-light",
    interactive ? "account-avatar-interactive" : "",
    busy ? "is-busy" : "",
    revealing && photo ? "is-revealing" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      <span className="account-avatar-clip">
        {photo ? (
          <>
            {!photoReady ? (
              <span
                aria-hidden
                className={
                  tone === "onBrand"
                    ? "site-shimmer-on-brand absolute inset-0 rounded-full"
                    : "site-shimmer absolute inset-0 rounded-full"
                }
              />
            ) : null}
            <img
              key={src}
              src={photo}
              alt=""
              width={size}
              height={size}
              className="account-avatar-photo"
              style={{ opacity: photoReady ? 1 : 0 }}
              onLoad={() => markLoaded(photo)}
              onError={() => setOutcome({ src: photo, ok: false })}
            />
          </>
        ) : (
          <span className="account-avatar-empty">
            <img
              src={siteAssets.user}
              alt=""
              width={Math.round(size * 0.38)}
              height={Math.round(size * 0.38)}
              className="account-avatar-empty-icon"
            />
          </span>
        )}
        {revealing && photo ? <span className="account-avatar-shine" aria-hidden /> : null}
        {interactive ? (
          <span className="account-avatar-hint">
            <span>{label}</span>
          </span>
        ) : null}
      </span>
      {revealing && photo ? <span className="account-avatar-ring" aria-hidden /> : null}
      {busy ? <span className="account-avatar-busy" aria-hidden /> : null}
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={frameClass} onClick={onClick} aria-label={label}>
        {inner}
      </button>
    );
  }

  return (
    <span className={frameClass} aria-hidden={!photo}>
      {inner}
    </span>
  );
}
