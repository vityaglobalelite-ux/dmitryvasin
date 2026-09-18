"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { notificationT } from "@/components/site/notifications/copy";
import { useSessionUser } from "@/lib/catalog/hooks";
import { stripLocalePrefix } from "@/lib/catalog/locale";
import { useLocale, useLocalizedRoutes } from "@/lib/catalog/locale-context";
import {
  SUPPORT_REPLY_TYPE,
  UNREAD_CHANGED_EVENT,
  countUnreadNotifications,
  peekUnreadSupportReply,
} from "@/lib/catalog/repo/notifications";
import { getSupabase } from "@/lib/supabase/client";

const POLL_MS = 15000;
const TOAST_MS = 8000;

type UnreadValue = {
  unread: number;
  supportUnread: number;
  refresh: () => Promise<void>;
};

const UnreadContext = createContext<UnreadValue | null>(null);

export function useUnreadNotifications(): UnreadValue {
  return (
    useContext(UnreadContext) ?? {
      unread: 0,
      supportUnread: 0,
      refresh: async () => {},
    }
  );
}

function onSupportPath(pathname: string): boolean {
  return stripLocalePrefix(pathname).startsWith("/support");
}

export function UnreadProvider({ children }: { children: ReactNode }) {
  const { data: user, loading } = useSessionUser();
  const pathname = usePathname() ?? "/";
  const locale = useLocale();
  const routes = useLocalizedRoutes();
  const copy = notificationT(locale);
  const [unread, setUnread] = useState(0);
  const [supportUnread, setSupportUnread] = useState(0);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(
    null,
  );
  const supportUnreadRef = useRef(0);
  const primedRef = useRef(false);
  const toastTimer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnread(0);
      setSupportUnread(0);
      supportUnreadRef.current = 0;
      primedRef.current = false;
      return;
    }
    try {
      const [all, support] = await Promise.all([
        countUnreadNotifications(),
        countUnreadNotifications(SUPPORT_REPLY_TYPE),
      ]);
      const previous = supportUnreadRef.current;
      const primed = primedRef.current;
      primedRef.current = true;
      supportUnreadRef.current = support;
      setUnread(all);
      setSupportUnread(support);
      if (primed && support > previous && !onSupportPath(pathname)) {
        let body = copy.toastBody;
        try {
          const latest = await peekUnreadSupportReply();
          if (latest?.body.trim()) body = latest.body.trim();
        } catch {
          /* keep fallback */
        }
        setToast({ title: copy.toastTitle, body });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => {
          setToast(null);
        }, TOAST_MS);
      }
    } catch {
      /* keep last counts */
    }
  }, [copy.toastBody, copy.toastTitle, pathname, user]);

  useEffect(() => {
    if (loading) return;
    void refresh();
    const id = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    const onChanged = () => {
      void refresh();
    };
    window.addEventListener(UNREAD_CHANGED_EVENT, onChanged);
    return () => {
      window.clearInterval(id);
      window.removeEventListener(UNREAD_CHANGED_EVENT, onChanged);
    };
  }, [loading, refresh]);

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
          void refresh();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, user]);

  useEffect(() => {
    const raw = document.title.replace(/^[●•]\s+/, "");
    if (supportUnread > 0 && !onSupportPath(pathname)) {
      document.title = `● ${raw}`;
    } else {
      document.title = raw;
    }
  }, [pathname, supportUnread]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ unread, supportUnread, refresh }),
    [refresh, supportUnread, unread],
  );

  return (
    <UnreadContext.Provider value={value}>
      {children}
      {toast ? (
        <Link
          href={routes.support}
          className="fixed bottom-6 right-6 z-[80] w-[min(calc(100vw-40px),360px)] rounded-[20px] bg-white p-5 shadow-[0_18px_50px_rgba(76,13,50,0.18)] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] max-[600px]:bottom-4 max-[600px]:right-4"
          onClick={() => setToast(null)}
        >
          <span className="flex items-start gap-3">
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-plum"
              aria-hidden
            />
            <span>
              <span className="block text-[16px] font-semibold leading-[1.3] text-plum">
                {toast.title}
              </span>
              <span className="mt-1 block text-[13px] leading-[1.45] text-text/70">
                {toast.body}
              </span>
            </span>
          </span>
        </Link>
      ) : null}
    </UnreadContext.Provider>
  );
}
