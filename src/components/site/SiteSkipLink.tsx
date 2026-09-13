"use client";

import type { ReactNode } from "react";
import { useCatalogT } from "@/lib/catalog/locale-context";

export function SiteSkipLink() {
  const t = useCatalogT();
  return (
    <a href="#main-content" className="site-skip-link">
      {t.a11y.skipToContent}
    </a>
  );
}

export function SiteMain({ children }: { children: ReactNode }) {
  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="flex min-h-0 flex-1 flex-col outline-none"
    >
      {children}
    </div>
  );
}
