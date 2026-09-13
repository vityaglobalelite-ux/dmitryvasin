import { LegalPage } from "@/components/legal/LegalPage";
import { legalDocs, legalMetadata } from "@/lib/legal-docs";

const doc = legalDocs["dmca-page"];

export const metadata = legalMetadata(doc);

export default function Page() {
  return <LegalPage doc={doc} />;
}
