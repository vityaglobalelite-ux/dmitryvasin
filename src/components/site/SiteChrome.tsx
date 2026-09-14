"use client";

import { usePathname } from "next/navigation";
import { AuthModalProvider } from "@/components/site/auth/AuthModal";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteMain, SiteSkipLink } from "@/components/site/SiteSkipLink";
import { SITE_MOBILE_MAX_WIDTH } from "@/lib/catalog/breakpoint";
import { LocaleProvider } from "@/lib/catalog/locale-context";
import { useRouteScrollTop } from "@/lib/catalog/scroll-top";

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "/en" || pathname === "/en/";
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const hideChrome = isHomePath(pathname);
  useRouteScrollTop();

  return (
    <LocaleProvider>
      <AuthModalProvider>
        <div
          className="flex min-h-full flex-1 flex-col bg-white"
          data-site-chrome
          data-site-mobile-max={SITE_MOBILE_MAX_WIDTH}
          data-site-home={hideChrome ? "true" : undefined}
        >
          <SiteSkipLink />
          {hideChrome ? null : <SiteNav />}
          <SiteMain>{children}</SiteMain>
          {hideChrome ? null : <SiteFooter />}
        </div>
      </AuthModalProvider>
    </LocaleProvider>
  );
}
