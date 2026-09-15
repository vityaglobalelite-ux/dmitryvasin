import type { Metadata } from "next";
import { AccountLayoutChrome } from "@/components/site/account/AccountShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutChrome>{children}</AccountLayoutChrome>;
}
