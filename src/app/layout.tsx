import type { Metadata } from "next";
import { assets } from "@/lib/assets";
import { siteConfig } from "@/lib/site-data";
import "./globals.css";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    type: "website",
    images: [{ url: siteConfig.ogImage }],
  },
  icons: {
    icon: assets.favicon32,
    apple: assets.favicon180,
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
