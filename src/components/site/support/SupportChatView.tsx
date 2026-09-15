"use client";

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
import {
  AccountShell,
  AccountShellSkeleton,
} from "@/components/site/account/AccountShell";
import { useAccountGate } from "@/components/site/account/use-account-gate";
import { supportAssets } from "@/components/site/support/assets";
import { supportCopy } from "@/components/site/support/copy";
import { SupportImageViewer } from "@/components/site/support/SupportImageViewer";
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import {
  isSupportCompressibleImage,
  prepareSupportAttachment,
} from "@/lib/catalog/prepare-support-attachment";
import {
  createSupportAttachmentSignedUrl,
  isSupportImageFile,
  isSupportImagePath,
  listSupportMessages,
  relaySupportMessage,
  sendSupportMessage,
  SUPPORT_MAX_BYTES,
  SUPPORT_PREVIEW_TRANSFORM,
  supportFilename,
  uploadSupportAttachment,
} from "@/lib/catalog/repo/support";
import { getSupabase } from "@/lib/supabase/client";
import type { SupportMessage } from "@/lib/catalog/types";

const POLL_MS = 5000;
const SIGNED_TTL_MS = 50 * 60 * 1000;
const LOCAL_PREVIEW_MS = 2 * 60 * 1000;

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

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
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
  const gate = useAccountGate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
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
  }, [hydrateSigned]);

  const load = useCallback(async () => {
    try {
      const rows = await listSupportMessages();
      setMessages(rows);
      setError(null);
      setLoading(false);
      await hydrateSigned(rows);
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
    if (gate.pending) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await listSupportMessages();
        if (cancelled) return;
        setMessages(rows);
        setError(null);
        setLoading(false);
        await hydrateSigned(rows);
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
  }, [gate.pending, hydrateSigned]);

  useEffect(() => {
    if (gate.pending || error) return;
    const id = window.setInterval(() => {
      void refresh().catch(() => {
        /* keep last good thread */
      });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [error, gate.pending, refresh]);

  useEffect(() => {
    if (gate.pending || !gate.user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`catalog_support_messages:${gate.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "catalog_support_messages",
          filter: `user_id=eq.${gate.user.id}`,
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
  }, [gate.pending, gate.user, refresh]);

  if (gate.pending) {
    return <AccountShellSkeleton variant="form" />;
  }

  return (
    <AccountShell email={gate.user?.email} active="support">
      <div className="flex min-h-[min(72vh,760px)] flex-col gap-5">
        <h1 className="text-[50px] font-medium leading-[1.1] tracking-[-1.5px] text-text max-[600px]:text-[28px] max-[600px]:tracking-[-0.84px]">
          {supportCopy.title}
        </h1>

        {loading ? (
          <SupportThreadSkeleton />
        ) : error ? (
          <div className="max-w-[640px] rounded-[20px] bg-light-gray p-10 max-[600px]:rounded-[10px] max-[600px]:p-[15px]">
            <p className="text-[24px] font-medium leading-[1.2] text-text max-[600px]:text-[16px]">
              {supportCopy.errorTitle}
            </p>
            <p className="mt-4 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
              {supportCopy.errorBody}
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
              {supportCopy.retry}
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
    </AccountShell>
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
  const empty = messages.length === 0;

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

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
            signedUrl={
              message.storagePath ? signed[message.storagePath] : undefined
            }
            onOpenPhoto={onOpenPhoto}
            onPreviewError={onPreviewError}
          />
        ))}
      </div>
      <SupportComposer onSent={onSent} onLocalFile={onLocalFile} />
    </div>
  );
}

function SupportEmpty() {
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
          {supportCopy.emptyTitle}
        </p>
        <p className="mt-3 text-[16px] leading-[1.5] text-text/70 max-[600px]:text-[13px]">
          {supportCopy.emptyBody}
        </p>
      </div>
    </div>
  );
}

function SupportBubble({
  message,
  signedUrl,
  onOpenPhoto,
  onPreviewError,
}: {
  message: SupportMessage;
  signedUrl?: string;
  onOpenPhoto: (path: string, filename: string, previewUrl: string) => void;
  onPreviewError: (path: string) => void;
}) {
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
        {mine ? supportCopy.you : supportCopy.agent}
        <span className="tabular-nums"> · {formatTime(message.createdAt)}</span>
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
        {!imagePath && signedUrl && filename ? (
          <a
            href={signedUrl}
            download={filename}
            className={[
              "inline-flex items-center gap-2 underline-offset-2 hover:underline",
              showBody ? "mt-3" : "",
              mine ? "text-white" : "text-plum",
            ].join(" ")}
          >
            {supportCopy.download} {filename}
          </a>
        ) : null}
        {!imagePath && message.storagePath && !signedUrl ? (
          <Skeleton
            className={["h-5 w-40", showBody ? "mt-3" : ""].join(" ")}
          />
        ) : null}
      </div>
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
      aria-label={supportCopy.openPhoto}
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

function SupportComposer({
  onSent,
  onLocalFile,
}: {
  onSent: () => void;
  onLocalFile: (path: string, file: File) => void;
}) {
  const fileId = useId();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const pickId = useRef(0);

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
      setError(supportCopy.fileTooLarge);
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
        setError(supportCopy.fileTooLarge);
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
      if (!body) setError(supportCopy.composerNeedContent);
      return;
    }
    setBusy(true);
    setError(null);
    setWarning(null);
    try {
      let storagePath: string | null = null;
      if (file) {
        storagePath = await uploadSupportAttachment(file);
        onLocalFile(storagePath, file);
      }
      const saved = await sendSupportMessage(body, storagePath);
      setText("");
      setFile(null);
      onSent();
      if (saved?.id) {
        try {
          await relaySupportMessage(saved.id);
        } catch {
          setWarning(supportCopy.relayWarning);
        }
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(
        code === "file_too_large"
          ? supportCopy.fileTooLarge
          : supportCopy.sendError,
      );
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
              {preparing ? supportCopy.preparing : formatSize(file.size)}
            </span>
          </span>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-70"
            aria-label={supportCopy.removeFile}
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
          className="inline-flex h-[60px] shrink-0 cursor-pointer items-center justify-center rounded-[20px] border border-[#d9d9d9] bg-white px-4 text-[16px] font-medium text-text transition-opacity hover:opacity-80 max-[600px]:h-[50px] max-[600px]:px-3 max-[600px]:text-[13px]"
        >
          {supportCopy.attach}
          <input
            id={fileId}
            type="file"
            className="sr-only"
            disabled={busy}
            onChange={onPick}
          />
        </label>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={supportCopy.placeholder}
          rows={1}
          disabled={locked}
          className="min-h-[60px] min-w-0 flex-1 resize-none rounded-[20px] border border-[#d9d9d9] bg-white px-5 py-4 text-[16px] leading-[1.5] text-text outline-none transition-colors duration-150 placeholder:text-[#d9d9d9] focus:border-[rgba(76,13,50,0.4)] max-[600px]:min-h-[50px] max-[600px]:px-4 max-[600px]:py-3 max-[600px]:text-[13px]"
        />
        <button
          type="submit"
          disabled={locked}
          aria-label={busy ? supportCopy.sending : supportCopy.send}
          className="grid size-[60px] shrink-0 place-items-center rounded-full bg-[image:var(--cta-gradient)] text-white transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.98] disabled:opacity-50 max-[600px]:size-[50px]"
        >
          <img
            src={supportAssets.send}
            alt=""
            width={24}
            height={24}
            className="size-6 max-[600px]:size-5"
          />
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-[13px] leading-[1.4] text-accent-red">{error}</p>
      ) : null}
      {warning ? (
        <p className="mt-2 text-[13px] leading-[1.4] text-text/70">{warning}</p>
      ) : null}
    </form>
  );
}
