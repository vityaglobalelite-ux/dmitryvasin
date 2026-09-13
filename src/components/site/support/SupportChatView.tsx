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
import { Button } from "@/components/site/ui/Button";
import { Skeleton } from "@/components/site/ui/Skeleton";
import {
  createSupportAttachmentSignedUrl,
  isSupportImagePath,
  listSupportMessages,
  relaySupportMessage,
  sendSupportMessage,
  SUPPORT_MAX_BYTES,
  supportFilename,
  uploadSupportAttachment,
} from "@/lib/catalog/repo/support";
import { getSupabase } from "@/lib/supabase/client";
import type { SupportMessage } from "@/lib/catalog/types";

const POLL_MS = 5000;
const SIGNED_TTL_MS = 50 * 60 * 1000;

type SignedCache = Map<string, { url: string; at: number }>;

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

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error("support");
}

export function SupportChatView() {
  const gate = useAccountGate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [signed, setSigned] = useState<Record<string, string>>({});
  const cacheRef = useRef<SignedCache>(new Map());

  const refresh = useCallback(async () => {
    const rows = await listSupportMessages();
    setMessages(rows);
    setError(null);
    const needed = rows
      .map((row) => row.storagePath)
      .filter((path): path is string => Boolean(path));
    const next: Record<string, string> = {};
    const now = Date.now();
    await Promise.all(
      needed.map(async (path) => {
        const cached = cacheRef.current.get(path);
        if (cached && now - cached.at < SIGNED_TTL_MS) {
          next[path] = cached.url;
          return;
        }
        const url = await createSupportAttachmentSignedUrl(path);
        if (url) {
          cacheRef.current.set(path, { url, at: now });
          next[path] = url;
        }
      }),
    );
    setSigned(next);
  }, []);

  const load = useCallback(async () => {
    try {
      await refresh();
      setLoading(false);
    } catch (err) {
      setError(toError(err));
      setMessages([]);
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (gate.pending) return;
    let cancelled = false;
    (async () => {
      try {
        await refresh();
        if (!cancelled) setLoading(false);
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
  }, [gate.pending, refresh]);

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
          />
        )}
      </div>
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
}: {
  messages: SupportMessage[];
  signed: Record<string, string>;
  onSent: () => void;
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
          />
        ))}
      </div>
      <SupportComposer onSent={onSent} />
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
}: {
  message: SupportMessage;
  signedUrl?: string;
}) {
  const mine = message.fromRole === "user";
  const filename = message.storagePath
    ? supportFilename(message.storagePath)
    : null;
  const image = Boolean(
    message.storagePath && isSupportImagePath(message.storagePath) && signedUrl,
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
          "rounded-[20px] px-5 py-4 text-[16px] leading-[1.5] max-[600px]:rounded-[16px] max-[600px]:px-4 max-[600px]:py-3 max-[600px]:text-[13px]",
          mine
            ? "bg-[image:var(--cta-gradient)] text-white"
            : "bg-white text-text",
        ].join(" ")}
      >
        {message.body ? (
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        ) : null}
            {image && signedUrl ? (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className={message.body ? "mt-3 block" : "block"}
          >
            <img
              src={signedUrl}
              alt={filename ?? ""}
              className="max-h-[280px] w-auto max-w-full rounded-[12px] object-contain"
            />
          </a>
        ) : null}
        {!image && signedUrl && filename ? (
          <a
            href={signedUrl}
            download={filename}
            className={[
              "inline-flex items-center gap-2 underline-offset-2 hover:underline",
              message.body ? "mt-3" : "",
              mine ? "text-white" : "text-plum",
            ].join(" ")}
          >
            {supportCopy.download} {filename}
          </a>
        ) : null}
      </div>
    </article>
  );
}

function SupportComposer({ onSent }: { onSent: () => void }) {
  const fileId = useId();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  function onPick(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    event.target.value = "";
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (next.size > SUPPORT_MAX_BYTES) {
      setFile(null);
      setError(supportCopy.fileTooLarge);
      return;
    }
    setFile(next);
  }

  async function submit() {
    const body = text.trim() || (file ? file.name : "");
    if (!body || busy) {
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

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-white/80 bg-white/40 p-4 max-[600px]:p-[15px]"
    >
      {file ? (
        <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-[10px] bg-white px-3 py-2 text-[13px] leading-[1.3] text-text">
          <span className="min-w-0 truncate">{file.name}</span>
          <button
            type="button"
            className="grid size-4 shrink-0 place-items-center"
            aria-label="Убрать файл"
            onClick={() => setFile(null)}
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
          disabled={busy}
          className="min-h-[60px] min-w-0 flex-1 resize-none rounded-[20px] border border-[#d9d9d9] bg-white px-5 py-4 text-[16px] leading-[1.5] text-text outline-none transition-colors duration-150 placeholder:text-[#d9d9d9] focus:border-[rgba(76,13,50,0.4)] max-[600px]:min-h-[50px] max-[600px]:px-4 max-[600px]:py-3 max-[600px]:text-[13px]"
        />
        <button
          type="submit"
          disabled={busy}
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
      <p className="mt-2 text-[13px] leading-[1.4] text-text/50">
        {supportCopy.attachHint}
      </p>
      {error ? (
        <p className="mt-2 text-[13px] leading-[1.4] text-accent-red">{error}</p>
      ) : null}
      {warning ? (
        <p className="mt-2 text-[13px] leading-[1.4] text-text/70">{warning}</p>
      ) : null}
    </form>
  );
}
