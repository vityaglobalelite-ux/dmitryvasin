import type { Metadata } from "next";
import Link from "next/link";
import { clubConfig, clubPath } from "@/lib/club-config";
import { shareOpenGraph, shareTwitter } from "@/lib/site-config";

const clubHref = clubPath();

export const metadata: Metadata = {
  title: clubConfig.title,
  description: clubConfig.description,
  robots: { index: false, follow: true },
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

export default function Home() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${clubHref}`} />
      <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6">
        <p className="text-[16px] text-text">
          <Link
            href={clubHref}
            className="font-semibold text-plum underline underline-offset-4"
          >
            Перейти в закрытый клуб
          </Link>
        </p>
      </main>
    </>
  );
}
