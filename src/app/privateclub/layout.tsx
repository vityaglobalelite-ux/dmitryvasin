import type { Metadata } from "next";
import { clubConfig } from "@/lib/club-config";
import { shareOpenGraph, shareTwitter } from "@/lib/site-config";

export const metadata: Metadata = {
  title: clubConfig.title,
  description: clubConfig.description,
  applicationName: clubConfig.name,
  authors: [{ name: clubConfig.name, url: clubConfig.canonical }],
  creator: clubConfig.name,
  publisher: clubConfig.publisher,
  alternates: {
    canonical: clubConfig.canonical,
  },
  openGraph: shareOpenGraph(
    {
      title: clubConfig.ogTitle,
      description: clubConfig.description,
      url: clubConfig.canonical,
    },
    clubConfig,
  ),
  twitter: shareTwitter(
    {
      title: clubConfig.ogTitle,
      description: clubConfig.description,
    },
    clubConfig,
  ),
};

export default function ClubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
