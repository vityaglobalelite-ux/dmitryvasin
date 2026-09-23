"use client";

import { usePathname } from "next/navigation";
import { AuthModalProvider } from "@/components/site/auth/AuthModal";
import { UnreadProvider } from "@/components/site/notifications/UnreadProvider";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteMain, SiteSkipLink } from "@/components/site/SiteSkipLink";
import { SITE_MOBILE_MAX_WIDTH } from "@/lib/catalog/breakpoint";
import { CatalogCurrencyProvider } from "@/lib/catalog/currency-context";
import { LocaleProvider } from "@/lib/catalog/locale-context";
import { useRouteScrollTop } from "@/lib/catalog/scroll-top";

function isHomePath(pathname: string) {
  return pathname === "/" || pathname === "/en" || pathname === "/en/";
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  // Home draws its footer inside the Figma canvas; the header is shared
  const hideChrome = isHomePath(pathname);
  useRouteScrollTop();

  return (
    <LocaleProvider>
      <CatalogCurrencyProvider>
        <AuthModalProvider>
          <UnreadProvider>
            <div
              className="flex min-h-full flex-1 flex-col bg-white"
              data-site-chrome
              data-site-mobile-max={SITE_MOBILE_MAX_WIDTH}
              data-site-home={hideChrome ? "true" : undefined}
            >
              <SiteSkipLink />
              <SiteNav />
              <SiteMain>{children}</SiteMain>
              {hideChrome ? null : <SiteFooter />}
            </div>
          </UnreadProvider>
        </AuthModalProvider>
      </CatalogCurrencyProvider>
    </LocaleProvider>
  );
}
