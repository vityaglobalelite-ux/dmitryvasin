"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AuthBanner } from "@/components/site/auth/AuthPrimitives";
import { accountAssets } from "@/components/site/account/assets";
import { supportAssets } from "@/components/site/support/assets";
import { supportT, type SupportCopy } from "@/components/site/support/copy";
import { SupportImageViewer } from "@/components/site/support/SupportImageViewer";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import {
  isSupportCompressibleImage,
  prepareSupportAttachment,
} from "@/lib/catalog/prepare-support-attachment";
import { useSessionUser } from "@/lib/catalog/hooks";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import { AuthRequiredError } from "@/lib/catalog/repo/internal";
import {
  createSupportAttachmentSignedUrl,
  isSupportImageFile,
  isSupportImagePath,
  listSupportMessages,
  relaySupportMessageReliable,
  sendSupportMessage,
  SUPPORT_MAX_BYTES,
  SUPPORT_PREVIEW_TRANSFORM,
  supportFilename,
  uploadSupportAttachment,
} from "@/lib/catalog/repo/support";
import { markSupportNotificationsRead } from "@/lib/catalog/repo/notifications";
import { isIdentifiedUser, type Locale, type SupportMessage } from "@/lib/catalog/types";
import { ensureSupportSession } from "@/lib/supabase/auth";
import { getSupabase } from "@/lib/supabase/client";

const POLL_MS = 5000;
const SIGNED_TTL_MS = 50 * 60 * 1000;
const LOCAL_PREVIEW_MS = 2 * 60 * 1000;

type DeliveryState = "pending" | "failed";
type DeliveryMap = Record<string, DeliveryState>;

type SignedEntry = {
  preview: string;
  full?: string;
  at: number;
  local?: boolean;
};

type SignedCache = Map<string, SignedEntry>;

type ViewerState = {
  path: string;
  previewUrl: string;
  filename: string;
};

function formatTime(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} МБ`;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("support");
}

function isRedundantCaption(body: string, filename: string | null): boolean {
  if (!filename) return false;
  return body.trim().toLowerCase() === filename.trim().toLowerCase();
}

export function SupportChatView() {
  const copy = supportT(useLocale());
  const routes = useLocalizedRoutes();
  const session = useSessionUser();
  const identified = isIdentifiedUser(session.data);
  const visitorId = session.data?.id ?? null;
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [fullSigned, setFullSigned] = useState<Record<string, string>>({});
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const cacheRef = useRef<SignedCache>(new Map());
  const localUrlsRef = useRef<string[]>([]);
  const recoveredRef = useRef(new Set<string>());

  const hydrateSigned = useCallback(async (rows: SupportMessage[]) => {
    const needed = rows
      .map((row) => row.storagePath)
      .filter((path): path is string => Boolean(path));
    if (needed.length === 0) {
      setSigned({});
      return;
    }

    const now = Date.now();
    const nextPreview: Record<string, string> = {};
    const nextFull: Record<string, string> = {};

    await Promise.all(
      needed.map(async (path) => {
        const cached = cacheRef.current.get(path);
        if (cached && now - cached.at < SIGNED_TTL_MS) {
          nextPreview[path] = cached.preview;
          if (cached.full) nextFull[path] = cached.full;
          if (cached.local && now - cached.at < LOCAL_PREVIEW_MS) return;
          if (cached.preview && !cached.local) return;
        }

        const preview = await createSupportAttachmentSignedUrl(
          path,
          isSupportImagePath(path) && !recoveredRef.current.has(path)
            ? SUPPORT_PREVIEW_TRANSFORM
            : null,
        );
        if (!preview) return;
        const previous = cacheRef.current.get(path);
        cacheRef.current.set(path, {
          preview,
          full: previous?.full,
          at: now,
        });
        nextPreview[path] = preview;
      }),
    );

    setSigned((prev) => {
      const merged = { ...prev, ...nextPreview };
      for (const path of needed) {
        if (!merged[path] && prev[path]) merged[path] = prev[path];
      }
      return merged;
    });
    if (Object.keys(nextFull).length) {
      setFullSigned((prev) => ({ ...prev, ...nextFull }));
    }
  }, []);

  const refresh = useCallback(async () => {
    const rows = await listSupportMessages();
    setMessages(rows);
    setError(null);
    await hydrateSigned(rows);
    await markSupportNotificationsRead().catch(() => {
      /* unread badge can retry on next poll */
    });
  }, [hydrateSigned]);

  const load = useCallback(async () => {
    try {
      const rows = await listSupportMessages();
      setMessages(rows);
      setError(null);
      setLoading(false);
      await hydrateSigned(rows);
      await markSupportNotificationsRead().catch(() => {
        /* unread badge can retry on next poll */
      });
    } catch (err) {
      setError(toError(err));
      setMessages([]);
      setLoading(false);
    }
  }, [hydrateSigned]);

  const rememberLocal = useCallback((path: string, file: File) => {
    const url = URL.createObjectURL(file);
    localUrlsRef.current.push(url);
    cacheRef.current.set(path, {
      preview: url,
      full: url,
      at: Date.now(),
      local: true,
    });
    setSigned((prev) => ({ ...prev, [path]: url }));
    setFullSigned((prev) => ({ ...prev, [path]: url }));
  }, []);

  const recoverPreview = useCallback(async (path: string) => {
    if (recoveredRef.current.has(path)) return;
    recoveredRef.current.add(path);
    const full = await createSupportAttachmentSignedUrl(path);
    if (!full) return;
    cacheRef.current.set(path, {
      preview: full,
      full,
      at: Date.now(),
    });
    setSigned((prev) => ({ ...prev, [path]: full }));
    setFullSigned((prev) => ({ ...prev, [path]: full }));
  }, []);

  const openViewer = useCallback(
    async (path: string, filename: string, previewUrl: string) => {
      setViewer({ path, previewUrl, filename });
      const cached = cacheRef.current.get(path);
      if (cached?.full && Date.now() - cached.at < SIGNED_TTL_MS) {
        setFullSigned((prev) => ({ ...prev, [path]: cached.full as string }));
        return;
      }
      const full = await createSupportAttachmentSignedUrl(path);
      if (!full) return;
      const previous = cacheRef.current.get(path);
      cacheRef.current.set(path, {
        preview: previous?.preview ?? full,
        full,
        at: Date.now(),
        local: previous?.local,
      });
      setFullSigned((prev) => ({ ...prev, [path]: full }));
    },
    [],
  );

  useEffect(() => {
    return () => {
      for (const url of localUrlsRef.current) URL.revokeObjectURL(url);
      localUrlsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (session.loading) return;
    if (!visitorId) {
      setMessages([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    (async () => {
      try {
        const rows = await listSupportMessages();
        if (cancelled) return;
        setMessages(rows);
        setError(null);
        setLoading(false);
        await hydrateSigned(rows);
        await markSupportNotificationsRead().catch(() => {
          /* unread badge can retry on next poll */
        });
      } catch (err) {
        if (cancelled) return;
        setError(toError(err));
        setMessages([]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrateSigned, session.loading, visitorId]);

  useEffect(() => {
    if (session.loading || !visitorId || error) return;
    const id = window.setInterval(() => {
      void refresh().catch(() => {
        /* keep last good thread */
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [error, refresh, session.loading, visitorId]);

  useEffect(() => {
    if (session.loading || !visitorId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`catalog_support_messages:${visitorId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "catalog_support_messages",
          filter: `user_id=eq.${visitorId}`,
        },
        () => {
          void refresh().catch(() => {
            /* polling remains */
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, session.loading, visitorId]);

  const pending = session.loading;

  if (pending) {
    return (
      <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-[75px] max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
        <div className="flex min-h-[min(72vh,760px)] flex-col gap-5">
          <Skeleton className="h-[55px] w-[min(80%,280px)] rounded-[12px] max-[600px]:h-8" />
          <Skeleton className="h-4 w-[min(90%,520px)] rounded-[8px]" />
          <SupportThreadSkeleton />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full flex-1 px-[12.5%] pb-24 pt-[75px] max-[600px]:px-5 max-[600px]:pb-16 max-[600px]:pt-6">
      <div className="flex min-h-[min(72vh,760px)] flex-col gap-5">
        {identified ? (
          <Link
            href={routes.account}
            className="inline-flex items-center gap-2.5 text-[16px] font-semibold leading-normal text-plum transition-opacity duration-150 hover:opacity-80 max-[600px]:gap-1.5 max-[600px]:text-[13px]"
          >
            <span className="flex h-2.5 w-[5px] items-center justify-center">
              <img
                src={accountAssets.back}
                alt=""
                width={10}
                height={5}
                className="h-[5px] w-2.5 -rotate-90"
              />
            </span>
            {copy.backToAccount}
          </Link>
        ) : null}

        <header className="flex max-w-[720px] flex-col gap-3">
          <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
            {copy.title}
          </h1>
          <p className="text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
            {copy.lede}
          </p>
        </header>

        {loading ? (
          <SupportThreadSkeleton />
        ) : error ? (
          <div className="max-w-[640px] rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
            <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
              {copy.errorTitle}
            </p>
            <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {copy.errorBody}
            </p>
            <Button
              type="button"
              className="mt-8"
              onClick={() => {
                setError(null);
                setLoading(true);
                void load();
              }}
            >
              {copy.retry}
            </Button>
          </div>
        ) : (
          <SupportThread
            messages={messages}
            signed={signed}
            onSent={() => void refresh()}
            onLocalFile={rememberLocal}
            onOpenPhoto={openViewer}
            onPreviewError={recoverPreview}
          />
        )}
      </div>

      <SupportImageViewer
        open={Boolean(viewer)}
        previewUrl={viewer?.previewUrl ?? null}
        fullUrl={
          viewer ? (fullSigned[viewer.path] ?? viewer.previewUrl) : null
        }
        alt={viewer?.filename ?? ""}
        onClose={() => setViewer(null)}
      />
    </main>
  );
}

function SupportThreadSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-[min(56vh,620px)] flex-col overflow-hidden rounded-[30px] bg-light-gray max-[600px]:rounded-[10px]"
    >
      <div className="flex flex-1 flex-col gap-4 p-6 max-[600px]:p-[15px]">
        <Skeleton className="h-16 w-[68%] rounded-[20px]" />
        <Skeleton className="ml-auto h-12 w-[52%] rounded-[20px]" />
        <Skeleton className="h-20 w-[74%] rounded-[20px]" />
        <Skeleton className="ml-auto h-14 w-[46%] rounded-[20px]" />
      </div>
      <div className="border-t border-white/80 p-4 max-[600px]:p-[15px]">
        <Skeleton className="h-[60px] w-full rounded-[20px]" />
      </div>
    </div>
  );
}

function SupportThread({
  messages,
  signed,
  onSent,
  onLocalFile,
  onOpenPhoto,
  onPreviewError,
}: {
  messages: SupportMessage[];
  signed: Record<string, string>;
  onSent: () => void;
  onLocalFile: (path: string, file: File) => void;
  onOpenPhoto: (path: string, filename: string, previewUrl: string) => void;
  onPreviewError: (path: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [delivery, setDelivery] = useState<DeliveryMap>({});
  const empty = messages.length === 0;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length, delivery]);

  const deliver = useCallback(async (messageId: string) => {
    setDelivery((prev) => ({ ...prev, [messageId]: "pending" }));
    try {
      await relaySupportMessageReliable(messageId);
      setDelivery((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
    } catch {
      setDelivery((prev) => ({ ...prev, [messageId]: "failed" }));
    }
  }, []);

  return (
    <div className="flex min-h-[min(56vh,620px)] flex-1 flex-col overflow-hidden rounded-[30px] bg-light-gray max-[600px]:rounded-[10px]">
      <div
        ref={scrollerRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6 max-[600px]:p-[15px]"
      >
        {empty ? <SupportEmpty /> : null}
        {messages.map((message) => (
          <SupportBubble
            key={message.id}
            message={message}
            delivery={delivery[message.id]}
            signedUrl={
              message.storagePath ? signed[message.storagePath] : undefined
            }
            onOpenPhoto={onOpenPhoto}
            onPreviewError={onPreviewError}
            onRetryDelivery={() => void deliver(message.id)}
          />
        ))}
      </div>
      <SupportComposer
        onLocalFile={onLocalFile}
        onSaved={(saved) => {
          onSent();
          if (saved?.id) void deliver(saved.id);
        }}
      />
    </div>
  );
}

function SupportEmpty() {
  const copy = supportT(useLocale());
  return (
    <div className="flex flex-1 flex-col items-start justify-center gap-5 py-6">
      <span className="grid size-[60px] place-items-center rounded-full bg-[image:var(--brand-gradient)]">
        <img
          src={supportAssets.person}
          alt=""
          width={30}
          height={30}
          className="size-[30px]"
        />
      </span>
      <div className="max-w-[520px]">
        <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px] max-[600px]:leading-[1.3]">
          {copy.emptyTitle}
        </p>
        <p className="mt-3 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
          {copy.emptyBody}
        </p>
      </div>
    </div>
  );
}

function SupportBubble({
  message,
  signedUrl,
  delivery,
  onOpenPhoto,
  onPreviewError,
  onRetryDelivery,
}: {
  message: SupportMessage;
  signedUrl?: string;
  delivery?: DeliveryState;
  onOpenPhoto: (path: string, filename: string, previewUrl: string) => void;
  onPreviewError: (path: string) => void;
  onRetryDelivery: () => void;
}) {
  const copy = supportT(useLocale());
  const locale = useLocale();
  const mine = message.fromRole === "user";
  const filename = message.storagePath
    ? supportFilename(message.storagePath)
    : null;
  const imagePath = Boolean(
    message.storagePath && isSupportImagePath(message.storagePath),
  );
  const showBody = Boolean(
    message.body && !isRedundantCaption(message.body, filename),
  );

  return (
    <article
      className={[
        "max-w-[min(100%,560px)]",
        mine ? "ml-auto" : "mr-auto",
      ].join(" ")}
    >
      <p
        className={[
          "mb-1.5 text-[13px] leading-[1.4] text-text/50",
          mine ? "text-right" : "text-left",
        ].join(" ")}
      >
        {mine ? copy.you : copy.agent}
        <span className="tabular-nums"> · {formatTime(message.createdAt, locale)}</span>
      </p>
      <div
        className={[
          "overflow-hidden rounded-[20px] text-[16px] leading-[1.5] max-[600px]:rounded-[16px] max-[600px]:text-[13px]",
          mine
            ? "bg-[image:var(--cta-gradient)] text-white"
            : "bg-white text-text",
          imagePath && !showBody
            ? "p-1.5"
            : "px-5 py-4 max-[600px]:px-4 max-[600px]:py-3",
          delivery === "failed" ? "ring-2 ring-accent-red/35" : "",
          delivery === "pending" ? "opacity-90" : "",
        ].join(" ")}
      >
        {showBody ? (
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        ) : null}
        {imagePath ? (
          <SupportPhoto
            signedUrl={signedUrl}
            filename={filename ?? ""}
            padded={showBody}
            onOpen={() => {
              if (!message.storagePath || !signedUrl) return;
              onOpenPhoto(message.storagePath, filename ?? "", signedUrl);
            }}
            onBroken={() => {
              if (message.storagePath) onPreviewError(message.storagePath);
            }}
          />
        ) : null}
        {!imagePath && message.storagePath && signedUrl ? (
          <a
            href={signedUrl}
            download={filename}
            className={[
              "mt-3 inline-flex items-center gap-2 text-[14px] font-medium underline-offset-2 hover:underline",
              mine ? "text-white/90" : "text-plum",
            ].join(" ")}
          >
            {copy.download} {filename}
          </a>
        ) : null}
        {!imagePath && message.storagePath && !signedUrl ? (
          <Skeleton className="mt-3 h-5 w-40 rounded-md" />
        ) : null}
      </div>
      {mine && delivery === "pending" ? (
        <p
          role="status"
          className="mt-1.5 text-right text-[12px] leading-[1.3] text-text/45"
        >
          {copy.deliveryPending}
        </p>
      ) : null}
      {mine && delivery === "failed" ? (
        <div className="mt-1.5 flex items-center justify-end gap-2">
          <p role="alert" className="text-[12px] leading-[1.3] text-accent-red">
            {copy.deliveryFailed}
          </p>
          <button
            type="button"
            onClick={onRetryDelivery}
            className="text-[12px] font-semibold leading-[1.3] text-plum underline-offset-2 transition-opacity hover:underline hover:opacity-80"
          >
            {copy.deliveryRetry}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function SupportPhoto({
  signedUrl,
  filename,
  padded,
  onOpen,
  onBroken,
}: {
  signedUrl?: string;
  filename: string;
  padded: boolean;
  onOpen: () => void;
  onBroken: () => void;
}) {
  const copy = supportT(useLocale());
  const [loaded, setLoaded] = useState(false);
  const [src, setSrc] = useState(signedUrl);
  const triedFallback = useRef(false);

  useEffect(() => {
    setSrc(signedUrl);
    setLoaded(false);
  }, [signedUrl]);

  if (!src) {
    return (
      <Skeleton
        className={[
          "h-[180px] w-[min(100%,280px)] rounded-[14px]",
          padded ? "mt-3" : "",
        ].join(" ")}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={copy.openPhoto}
        className={[
        "group relative block max-w-full overflow-hidden rounded-[14px] text-left outline-none transition-[filter] duration-200 hover:brightness-[1.03] focus-visible:ring-2 focus-visible:ring-[rgba(76,13,50,0.4)]",
        padded ? "mt-3" : "",
        loaded ? "" : "min-h-[180px] min-w-[min(100%,220px)]",
      ].join(" ")}
    >
      {!loaded ? (
        <Skeleton className="absolute inset-0 rounded-[14px]" />
      ) : null}
      <img
        src={src}
        alt={filename}
        draggable={false}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (!triedFallback.current) {
            triedFallback.current = true;
            onBroken();
            return;
          }
          setLoaded(true);
        }}
        className={[
          "max-h-[280px] w-auto max-w-full cursor-zoom-in object-contain",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </button>
  );
}

function mapSendError(err: unknown, copy: SupportCopy): string {
  if (err instanceof AuthRequiredError) return copy.sendErrorAuth;
  const code = err instanceof Error ? err.message : "";
  if (code === "file_too_large") return copy.fileTooLarge;
  if (code === "empty_file") return copy.sendErrorEmpty;
  if (/anonymous|guest session|non-2xx|not found/i.test(code)) {
    return copy.sendErrorGuest;
  }
  if (/invalid key/i.test(code)) return copy.sendError;
  return copy.sendError;
}

function SupportComposer({
  onSaved,
  onLocalFile,
}: {
  onSaved: (message: SupportMessage | null) => void;
  onLocalFile: (path: string, file: File) => void;
}) {
  const copy = supportT(useLocale());
  const fileId = useId();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickId = useRef(0);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!file || !isSupportImageFile(file)) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";
    setError(null);
    const id = ++pickId.current;
    if (!next) {
      setFile(null);
      setPreparing(false);
      return;
    }
    if (next.size > SUPPORT_MAX_BYTES) {
      setFile(null);
      setError(copy.fileTooLarge);
      return;
    }

    if (!isSupportCompressibleImage(next)) {
      setFile(next);
      return;
    }

    setPreparing(true);
    setFile(next);
    try {
      const prepared = await prepareSupportAttachment(next);
      if (id !== pickId.current) return;
      if (prepared.size > SUPPORT_MAX_BYTES) {
        setFile(null);
        setError(copy.fileTooLarge);
        return;
      }
      setFile(prepared);
    } catch {
      if (id !== pickId.current) return;
      setFile(next);
    } finally {
      if (id === pickId.current) setPreparing(false);
    }
  }

  function clearFile() {
    pickId.current += 1;
    setFile(null);
    setPreparing(false);
  }

  async function submit() {
    const body = text.trim() || (file ? file.name : "");
    if (!body || busy || preparing) {
      if (!body) setError(copy.composerNeedContent);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await ensureSupportSession();
      let storagePath: string | null = null;
      if (file) {
        storagePath = await uploadSupportAttachment(file);
        onLocalFile(storagePath, file);
      }
      const saved = await sendSupportMessage(body, storagePath);
      setText("");
      setFile(null);
      onSaved(saved);
      queueMicrotask(() => textRef.current?.focus());
    } catch (err) {
      console.error("support send failed", err);
      setError(mapSendError(err, copy));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void submit();
  }

  const locked = busy || preparing;

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-white/80 bg-white/40 p-4 max-[600px]:p-[15px]"
    >
      {file ? (
        <div className="mb-3 inline-flex max-w-full items-center gap-3 rounded-[14px] bg-white px-2.5 py-2 text-[13px] leading-[1.3] text-text shadow-[0_8px_24px_rgba(76,13,50,0.06)]">
          {preview ? (
            <span className="relative size-12 shrink-0 overflow-hidden rounded-[10px] bg-light-gray">
              {preparing ? (
                <Skeleton className="size-full rounded-[10px]" />
              ) : (
                <img
                  src={preview}
                  alt=""
                  className="size-full object-cover"
                />
              )}
            </span>
          ) : null}
          <span className="min-w-0">
            <span className="block max-w-[220px] truncate">{file.name}</span>
            <span className="text-text/50">
              {preparing ? copy.preparing : formatSize(file.size)}
            </span>
          </span>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-70"
            aria-label={copy.removeFile}
            onClick={clearFile}
            disabled={busy}
          >
            <img
              src={supportAssets.remove}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-3 max-[600px]:gap-2">
        <label
          htmlFor={fileId}
          className={[
            "inline-flex h-[60px] shrink-0 cursor-pointer items-center justify-center rounded-[20px] border bg-white px-4 text-[16px] font-medium text-text transition-[border-color,opacity] duration-150 hover:opacity-80 max-[600px]:h-[50px] max-[600px]:px-3 max-[600px]:text-[13px]",
            error ? "border-accent-red/50" : "border-[#d9d9d9]",
            locked ? "pointer-events-none opacity-50" : "",
          ].join(" ")}
        >
          {copy.attach}
          <input
            id={fileId}
            type="file"
            className="sr-only"
            disabled={busy}
            onChange={onPick}
          />
        </label>
        <textarea
          ref={textRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={onKeyDown}
          placeholder={copy.placeholder}
          rows={1}
          disabled={locked}
          aria-invalid={error ? true : undefined}
          className={[
            "min-h-[60px] min-w-0 flex-1 resize-none rounded-[20px] border bg-white px-5 py-4 text-[16px] leading-[1.5] text-text outline-none transition-colors duration-150 placeholder:text-[#d9d9d9] max-[600px]:min-h-[50px] max-[600px]:px-4 max-[600px]:py-3",
            error
              ? "border-accent-red focus:border-accent-red"
              : "border-[#d9d9d9] focus:border-[rgba(76,13,50,0.4)]",
          ].join(" ")}
        />
        <button
          type="submit"
          disabled={locked}
          aria-label={busy ? copy.sending : copy.send}
          className="grid size-[60px] shrink-0 place-items-center rounded-full bg-[image:var(--cta-gradient)] text-white transition-[filter,transform,opacity] duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50 max-[600px]:size-[50px]"
        >
          {busy ? (
            <span
              aria-hidden
              className="size-5 animate-spin rounded-full border-2 border-white/30 border-t-white"
            />
          ) : (
            <img
              src={supportAssets.send}
              alt=""
              width={24}
              height={24}
              className="size-6 max-[600px]:size-5"
            />
          )}
        </button>
      </div>
      {error ? (
        <div className="mt-3">
          <AuthBanner tone="error">{error}</AuthBanner>
        </div>
      ) : null}
    </form>
  );
}
