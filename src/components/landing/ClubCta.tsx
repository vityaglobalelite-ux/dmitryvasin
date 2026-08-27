"use client";

import type { CSSProperties, ReactNode } from "react";
import { useCountdownTail } from "@/lib/countdown-tail";
import { telegramBotUrl } from "@/lib/landing-data";
import { CLUB_CLOSED_ID } from "@/lib/tariff-stage3";

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Replace label when sales are closed. Ignored if preserveChildren. */
  closedLabel?: ReactNode;
  /** Keep the same children (icon-only control). */
  preserveChildren?: boolean;
};

export function ClubCta({
  children,
  className,
  style,
  closedLabel = "Вход закрыт",
  preserveChildren = false,
}: Props) {
  const { salesOpen } = useCountdownTail();

  if (salesOpen) {
    return (
      <a
        href={telegramBotUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={`#${CLUB_CLOSED_ID}`}
      className={className}
      style={style}
      aria-label="Вход в клуб закрыт"
    >
      {preserveChildren ? children : closedLabel}
    </a>
  );
}
