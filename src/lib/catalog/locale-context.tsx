"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { catalogT, type CatalogCopy } from "@/lib/catalog/i18n";
import {
  localeFromPathname,
  localizedSiteRoutes,
  withLocalePrefix,
  type LocalizedSiteRoutes,
} from "@/lib/catalog/locale";
import type { Locale } from "@/lib/catalog/types";

type LocaleContextValue = {
  locale: Locale;
  t: CatalogCopy;
  routes: LocalizedSiteRoutes;
  href: (path: string) => string;
};

const defaultLocale: Locale = "ru";

const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  t: catalogT(defaultLocale),
  routes: localizedSiteRoutes(defaultLocale),
  href: (path) => withLocalePrefix(path, defaultLocale),
});

function LocaleEffects({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPathname(pathname);

  const value = useMemo<LocaleContextValue>(() => {
    return {
      locale,
      t: catalogT(locale),
      routes: localizedSiteRoutes(locale),
      href: (path: string) => withLocalePrefix(path, locale),
    };
  }, [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <LocaleEffects locale={locale} />
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext).locale;
}

export function useCatalogT(): CatalogCopy {
  return useContext(LocaleContext).t;
}

export function useLocalizedRoutes(): LocalizedSiteRoutes {
  return useContext(LocaleContext).routes;
}
