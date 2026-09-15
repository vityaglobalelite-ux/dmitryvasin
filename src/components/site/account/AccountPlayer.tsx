"use client";

import { KinescopePlayer } from "@/components/site/player/KinescopePlayer";

export type AccountPlayerProps = {
  productId: string;
  locale?: "ru" | "en";
  posterUrl?: string | null;
};

export function AccountPlayer({
  productId,
  locale = "ru",
  posterUrl = null,
}: AccountPlayerProps) {
  return (
    <KinescopePlayer
      productId={productId}
      locale={locale}
      posterUrl={posterUrl}
    />
  );
}
