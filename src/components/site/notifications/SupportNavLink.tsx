"use client";

import Link from "next/link";
import { notificationT } from "@/components/site/notifications/copy";
import { useUnreadNotifications } from "@/components/site/notifications/UnreadProvider";
import { useLocale } from "@/lib/catalog/locale-context";

export function SupportNavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const { supportUnread } = useUnreadNotifications();
  const copy = notificationT(useLocale());
  const unread = supportUnread > 0;

  return (
    <Link
      href={href}
      className={["inline-flex items-center gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      aria-label={unread ? `${label}, ${copy.supportUnread}` : undefined}
    >
      <span>{label}</span>
      {unread ? (
        <span className="relative inline-flex size-2 shrink-0" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-plum/40 motion-safe:animate-ping" />
          <span className="relative size-2 rounded-full bg-plum" />
        </span>
      ) : null}
    </Link>
  );
}
