"use client";

import { accountAssets } from "@/components/site/account/assets";
import { accountT } from "@/components/site/account/copy";
import {
  remainingMeterBackground,
  type RemainingAccess,
} from "@/components/site/account/remaining";
import { useLocale } from "@/lib/catalog/locale-context";

type AccessMeterProps = {
  remaining: RemainingAccess;
  /** Show lock + expired copy (materials cards). Course page redirects when expired. */
  showExpiredIcon?: boolean;
};

export function AccessMeter({
  remaining,
  showExpiredIcon = false,
}: AccessMeterProps) {
  const copy = accountT(useLocale());
  const widthPct = Math.round(remaining.ratio * 100);
  const fill =
    remaining.expired || widthPct <= 0
      ? undefined
      : remainingMeterBackground(remaining.ratio);

  return (
    <div className="flex h-10 w-full flex-col justify-end gap-2.5">
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#e4e4e8]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={remaining.expired ? 0 : widthPct}
        aria-label={remaining.expired ? copy.expired : remaining.label}
      >
        {fill ? (
          <span
            className="absolute inset-y-0 left-0 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-[width] duration-500 ease-out"
            style={{ width: `${widthPct}%`, background: fill }}
          />
        ) : null}
      </div>
      <p className="flex min-h-4 items-center gap-1.5 text-[12px] font-medium leading-normal text-[#1a1a1a] max-[600px]:text-[10px] [font-variant-numeric:tabular-nums]">
        {remaining.expired && showExpiredIcon ? (
          <>
            <img
              src={accountAssets.lock}
              alt=""
              width={16}
              height={16}
              className="size-4"
            />
            {copy.expired}
          </>
        ) : remaining.expired ? (
          copy.expired
        ) : (
          remaining.label
        )}
      </p>
    </div>
  );
}
