"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { notificationCopy } from "@/components/site/notifications/copy";
import { supportAssets } from "@/components/site/support/assets";
import { siteAssets } from "@/lib/catalog/assets";
import { useAuthUser } from "@/lib/catalog/hooks";
import {
  countUnreadNotifications,
  listNotifications,
  markNotificationRead,
} from "@/lib/catalog/repo/notifications";
import { getSupabase } from "@/lib/supabase/client";
import type { Notification } from "@/lib/catalog/types";

const POLL_MS = 15000;

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

export function NotificationBell() {
  const { data: user, loading } = useAuthUser();
  const router = useRouter();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [listError, setListError] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!user) return;
    try {
      setUnread(await countUnreadNotifications());
    } catch {
      /* keep last count */
    }
  }, [user]);

  const refreshList = useCallback(async () => {
    if (!user) return;
    try {
      const rows = await listNotifications();
      setItems(rows);
      setUnread(rows.filter((row) => !row.read).length);
      setListError(false);
    } catch {
      setListError(true);
    } finally {
      setListLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const count = await countUnreadNotifications();
        if (!cancelled) setUnread(count);
      } catch {
        /* keep last count */
      }
    })();
    const id = window.setInterval(() => {
      void refreshCount();
    }, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [loading, refreshCount, user]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await listNotifications();
        if (cancelled) return;
        setItems(rows);
        setUnread(rows.filter((row) => !row.read).length);
        setListError(false);
      } catch {
        if (!cancelled) setListError(true);
      } finally {
        if (!cancelled) setListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user]);

  useEffect(() => {
    if (!user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`catalog_notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "catalog_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void refreshCount();
          if (open) void refreshList();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [open, refreshCount, refreshList, user]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onItemClick(item: Notification) {
    try {
      if (!item.read) await markNotificationRead(item.id);
    } catch {
      /* still navigate */
    }
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, read: true } : row)),
    );
    setUnread((value) => Math.max(0, item.read ? value : value - 1));
    setOpen(false);
    if (item.href) router.push(item.href);
  }

  if (loading || !user) return null;

  const badge = unread > 9 ? "9+" : String(unread);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="relative block size-[35px] transition-transform duration-150 hover:scale-[1.04] active:scale-95 max-[600px]:size-8"
        aria-label={notificationCopy.label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          if (!open) setListLoading(true);
          setOpen((value) => !value);
        }}
      >
        <img
          src={siteAssets.cartCircle}
          alt=""
          width={35}
          height={35}
          className="absolute inset-0 size-full"
        />
        <img
          src={supportAssets.mail}
          alt=""
          width={18}
          height={18}
          className="absolute left-1/2 top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 max-[600px]:size-4"
        />
        {unread > 0 ? (
          <span className="pointer-events-none absolute -right-0.5 -top-0.5 grid size-3 place-items-center">
            <img
              src={siteAssets.cartBadge}
              alt=""
              width={12}
              height={12}
              className="absolute inset-0 size-3"
            />
            <span className="relative font-bold text-[8px] leading-none text-white">
              {badge}
            </span>
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label={notificationCopy.label}
          className="absolute right-0 z-[60] mt-3 w-[min(calc(100vw-40px),360px)] overflow-hidden rounded-[20px] border border-[#ececec] bg-white"
        >
          <div className="border-b border-[#ececec] px-5 py-3">
            <p className="text-[16px] font-semibold leading-[1.3] text-text">
              {notificationCopy.label}
            </p>
          </div>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto">
            {listLoading ? (
              <div className="flex flex-col gap-3 p-5">
                <span className="site-shimmer h-12 rounded-[12px]" />
                <span className="site-shimmer h-12 rounded-[12px]" />
                <span className="site-shimmer h-12 rounded-[12px]" />
              </div>
            ) : listError ? (
              <p className="p-5 text-[13px] leading-[1.5] text-text/70">
                {notificationCopy.error}
              </p>
            ) : items.length === 0 ? (
              <p className="p-5 text-[13px] leading-[1.5] text-text/70">
                {notificationCopy.empty}
              </p>
            ) : (
              <ul>
                {items.map((item) => (
                  <li key={item.id} className="border-t border-[#ececec] first:border-t-0">
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="block px-5 py-3 text-left transition-colors hover:bg-light-gray"
                        onClick={(event) => {
                          event.preventDefault();
                          void onItemClick(item);
                        }}
                      >
                        <NotificationRow item={item} />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="block w-full px-5 py-3 text-left transition-colors hover:bg-light-gray"
                        onClick={() => void onItemClick(item)}
                      >
                        <NotificationRow item={item} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NotificationRow({ item }: { item: Notification }) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span
          className={[
            "text-[16px] leading-[1.3]",
            item.read ? "font-medium text-text" : "font-bold text-plum",
          ].join(" ")}
        >
          {item.title}
        </span>
        <span className="shrink-0 text-[13px] tabular-nums text-text/50">
          {formatTime(item.createdAt)}
        </span>
      </span>
      <span className="mt-1 block text-[13px] leading-[1.4] text-text/70">
        {item.body}
      </span>
    </>
  );
}
