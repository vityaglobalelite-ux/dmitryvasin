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
  const [broken, setBroken] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [photoReady, setPhotoReady] = useState(() => Boolean(src && loadedPhotos.has(src)));
  const photo = src && !broken ? src : null;

  useEffect(() => {
    setBroken(false);
    if (!src) {
      setPhotoReady(false);
      return;
    }
    if (loadedPhotos.has(src)) {
      setPhotoReady(true);
      return;
    }
    setPhotoReady(false);
    let cancelled = false;
    const img = new Image();
    const done = () => {
      if (cancelled) return;
      loadedPhotos.add(src);
      setPhotoReady(true);
    };
    img.onload = done;
    img.onerror = () => {
      if (!cancelled) setBroken(true);
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) done();
    return () => {
      cancelled = true;
    };
  }, [src]);

  useEffect(() => {
    if (revealKey === 0) return;
    setRevealing(true);
    const timer = window.setTimeout(() => setRevealing(false), 1100);
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
              onLoad={() => {
                if (src) loadedPhotos.add(src);
                setPhotoReady(true);
              }}
              onError={() => setBroken(true)}
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
