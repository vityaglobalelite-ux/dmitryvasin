import type { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={["site-shimmer rounded-[12px]", className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}

/** Catalog card geometry: cover + title lines + price. Figma 676:510 / 728:5537. */
export function ProductCardSkeleton() {
  return (
    <article
      aria-hidden
      className="flex w-full max-w-[467px] flex-col overflow-hidden rounded-[20px] bg-white"
    >
      <Skeleton className="aspect-[467/263] w-full rounded-none max-[600px]:aspect-[320/180]" />
      <div className="flex flex-col gap-4 p-5 max-[600px]:gap-3 max-[600px]:p-[15px]">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[144px] rounded-[10px] max-[600px]:h-6 max-[600px]:w-[104px]" />
          <Skeleton className="h-10 w-[102px] rounded-[10px] max-[600px]:h-6 max-[600px]:w-[74px]" />
        </div>
        <Skeleton className="h-[58px] w-full max-[600px]:h-[42px]" />
        <Skeleton className="h-[96px] w-full max-[600px]:h-[80px]" />
        <div className="flex items-end justify-between gap-4 pt-2">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-[21px] w-[90px]" />
            <Skeleton className="h-9 w-[118px]" />
          </div>
          <Skeleton className="h-[60px] w-[174px] rounded-[60px] max-[600px]:h-[50px] max-[600px]:w-[119px]" />
        </div>
      </div>
    </article>
  );
}
