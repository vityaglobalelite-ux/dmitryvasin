import { listPublishedProducts } from "@/lib/catalog/repo/products";

/**
 * Next.js 16 `output: "export"` treats `generateStaticParams() => []` as a
 * missing function and fails the whole static build (including `/privateclub/`).
 * Always include the `_` stub so empty env still builds. Real published ids
 * are appended when Supabase is reachable at build time.
 */
export const CATALOG_STATIC_PARAM_STUB = "_" as const;

export async function catalogIdStaticParams(): Promise<{ id: string }[]> {
  const ids = new Set<string>([CATALOG_STATIC_PARAM_STUB]);
  try {
    const products = await listPublishedProducts();
    for (const product of products) {
      if (product.id) ids.add(product.id);
    }
  } catch {
    // Unreachable API / empty env must not crash static export.
  }
  return [...ids].map((id) => ({ id }));
}
