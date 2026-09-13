import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteMain, SiteSkipLink } from "@/components/site/SiteSkipLink";
import { SITE_MOBILE_MAX_WIDTH } from "@/lib/catalog/breakpoint";
import { LocaleProvider } from "@/lib/catalog/locale-context";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <div
        className="flex min-h-full flex-1 flex-col bg-white"
        data-site-chrome
        data-site-mobile-max={SITE_MOBILE_MAX_WIDTH}
      >
        <SiteSkipLink />
        <SiteNav />
        <SiteMain>{children}</SiteMain>
        <SiteFooter />
      </div>
    </LocaleProvider>
  );
}
