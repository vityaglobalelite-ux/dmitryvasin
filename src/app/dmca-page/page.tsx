import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { legalDocs } from "@/lib/legal-docs";

const doc = legalDocs["dmca-page"];

export const metadata: Metadata = {
  title: `${doc.titleRu} — Дмитрий Васин`,
  description: doc.description,
  alternates: { canonical: `/${doc.slug}/` },
};

export default function Page() {
  return <LegalPage doc={doc} />;
}
