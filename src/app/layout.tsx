import type { Metadata, Viewport } from "next";
import { assets } from "@/lib/assets";
import { shareOpenGraph, shareTwitter, siteConfig } from "@/lib/site-config";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // The keyboard overlays the page instead of shrinking the layout viewport:
  // the Figma canvases pick 360 vs 1920 from it, and dialogs track the
  // visible part themselves.
  interactiveWidget: "resizes-visual",
};

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.canonical }],
  creator: siteConfig.name,
  publisher: siteConfig.publisher,
  metadataBase: new URL(siteConfig.canonical),
  icons: {
    icon: assets.favicon32,
    apple: assets.favicon180,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: shareOpenGraph({
    title: siteConfig.ogTitle,
    description: siteConfig.description,
    url: siteConfig.canonical,
  }),
  twitter: shareTwitter({
    title: siteConfig.ogTitle,
    description: siteConfig.description,
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={siteConfig.localeLang} className="h-full">
      <body className="min-h-full flex flex-col bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
