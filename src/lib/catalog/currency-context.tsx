"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  currencyForCountry,
  detectCountryCode,
  isGeoCurrency,
} from "@/lib/geo-currency";
import type { Currency } from "@/lib/catalog/types";

type CatalogCurrencyValue = {
  currency: Currency;
  ready: boolean;
};

const CatalogCurrencyContext = createContext<CatalogCurrencyValue>({
  currency: "rub",
  ready: false,
});

export function CatalogCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("rub");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const country = await detectCountryCode();
      if (cancelled) return;
      const next = currencyForCountry(country);
      setCurrency(isGeoCurrency(next) ? next : "rub");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogCurrencyValue>(
    () => ({ currency, ready }),
    [currency, ready],
  );

  return (
    <CatalogCurrencyContext.Provider value={value}>
      {children}
    </CatalogCurrencyContext.Provider>
  );
}

export function useCatalogCurrency(): CatalogCurrencyValue {
  return useContext(CatalogCurrencyContext);
}
