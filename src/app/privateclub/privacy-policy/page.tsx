import { LegalPage } from "@/components/legal/LegalPage";
import { legalDocs, legalMetadata } from "@/lib/legal-docs";

const doc = legalDocs["privacy-policy"];

export const metadata = legalMetadata(doc);

export default function Page() {
  return <LegalPage doc={doc} />;
}
