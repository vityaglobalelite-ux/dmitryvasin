"use client";

import { KinescopePlayer } from "@/components/site/player/KinescopePlayer";

export type AccountPlayerProps = {
  productId: string;
  locale?: "ru" | "en";
};

export function AccountPlayer({
  productId,
  locale = "ru",
}: AccountPlayerProps) {
  return <KinescopePlayer productId={productId} locale={locale} />;
}
