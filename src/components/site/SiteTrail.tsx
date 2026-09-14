"use client";

import Link from "next/link";
import { Fragment } from "react";
import { siteAssets } from "@/lib/catalog/assets";
import { useCatalogT } from "@/lib/catalog/locale-context";

export type SiteCrumb = {
  label: string;
  href?: string;
};

export function SiteTrail({
  backHref,
  backDesktop,
  crumbs,
}: {
  backHref?: string;
  backDesktop?: string;
  crumbs: SiteCrumb[];
}) {
  const t = useCatalogT();
  return (
    <div className="flex flex-col gap-2.5 max-[600px]:gap-1.5">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex min-h-11 w-fit items-center gap-2.5 text-[16px] font-semibold leading-normal text-plum underline decoration-plum/35 underline-offset-[5px] transition-[opacity,text-decoration-color] duration-150 hover:opacity-80 hover:decoration-plum max-[600px]:min-h-10 max-[600px]:gap-1.5 max-[600px]:text-[13px] max-[600px]:leading-[1.5] min-[601px]:min-h-0"
        >
          <span className="flex h-2.5 w-[5px] shrink-0 items-center justify-center" aria-hidden>
            <img
              src={siteAssets.back}
              alt=""
              width={10}
              height={5}
              className="h-[5px] w-2.5 -rotate-90"
            />
          </span>
          <span className="hidden min-[601px]:inline">{backDesktop}</span>
          <span className="min-[601px]:hidden">{t.nav.back}</span>
        </Link>
      ) : null}
      <nav
        aria-label={t.product.breadcrumbAria}
        className="flex min-w-0 items-center gap-5 text-[14px] max-[600px]:gap-2.5 max-[600px]:text-[10px]"
      >
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 ? (
              <img
                src={siteAssets.breadcrumb}
                alt=""
                width={18}
                height={7}
                className="h-[7px] w-[18px] shrink-0"
              />
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="shrink-0 text-[rgba(37,37,37,0.5)] underline-offset-4 transition-[color,opacity] duration-150 hover:text-text hover:underline"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate text-text" aria-current="page">
                {crumb.label}
              </span>
            )}
          </Fragment>
        ))}
      </nav>
    </div>
  );
}
