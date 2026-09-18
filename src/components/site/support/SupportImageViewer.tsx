"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { supportAssets } from "@/components/site/support/assets";
import { supportT } from "@/components/site/support/copy";
import { Skeleton } from "@/components/site/ui/Skeleton";
import { useLocale } from "@/lib/catalog/locale-context";

const CLOSE_MS = 240;

export type SupportImageViewerProps = {
  open: boolean;
  previewUrl: string | null;
  fullUrl: string | null;
  alt: string;
  onClose: () => void;
};

export function SupportImageViewer({
  open,
  previewUrl,
  fullUrl,
  alt,
  onClose,
}: SupportImageViewerProps) {
  const copy = supportT(useLocale());
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [shown, setShown] = useState(open);
  const [closing, setClosing] = useState(false);
  const [fullReady, setFullReady] = useState(false);
  const last = useRef({ previewUrl, fullUrl, alt });
  if (open && (previewUrl || fullUrl)) {
    last.current = { previewUrl, fullUrl, alt };
  }
  const shownPreview = previewUrl ?? last.current.previewUrl;
  const shownFull = fullUrl ?? last.current.fullUrl;
  const shownAlt = alt || last.current.alt;
  const src = fullReady && shownFull ? shownFull : shownPreview || shownFull;

  useEffect(() => {
    setHost(document.body);
  }, []);

  useEffect(() => {
    if (open) {
      setShown(true);
      setClosing(false);
      setFullReady(false);
      return;
    }
    if (!shown) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setShown(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open, shown]);

  useEffect(() => {
    if (!shownPreview || !shownFull || shownPreview === shownFull) {
      if (shownFull) setFullReady(true);
      return;
    }
    const image = document.createElement("img");
    image.decoding = "async";
    image.onload = () => setFullReady(true);
    image.onerror = () => setFullReady(false);
    image.src = shownFull;
    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [shownFull, shownPreview]);

  useEffect(() => {
    if (!shown || closing) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [shown, closing, onClose]);

  if (!shown || !host) return null;

  const ready = Boolean(src);

  return createPortal(
    <div
      className={`fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(37,37,37,0.78)] p-5 backdrop-blur-[10px] max-[600px]:p-3 ${
        closing ? "auth-backdrop-out" : "auth-backdrop-in"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <h2 id={titleId} className="sr-only">
        {shownAlt || copy.openPhoto}
      </h2>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={copy.closePhoto}
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.97] max-[600px]:right-3 max-[600px]:top-3"
      >
        <img
          src={supportAssets.remove}
          alt=""
          width={16}
          height={16}
          className="size-4"
        />
      </button>
      <div
        className={`relative flex max-h-full max-w-full items-center justify-center ${
          closing ? "auth-panel-out" : "auth-panel-in"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        {!ready ? (
          <Skeleton className="h-[min(70vh,520px)] w-[min(92vw,720px)] rounded-[24px]" />
        ) : (
          <img
            src={src ?? undefined}
            alt={shownAlt}
            draggable={false}
            className="max-h-[min(88vh,920px)] max-w-[min(92vw,1200px)] rounded-[24px] object-contain shadow-[0_28px_80px_rgba(0,0,0,0.35)] max-[600px]:rounded-[16px]"
          />
        )}
      </div>
    </div>,
    host,
  );
}
