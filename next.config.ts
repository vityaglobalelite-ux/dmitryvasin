import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.tildacdn.pro",
      },
      {
        protocol: "https",
        hostname: "thb.tildacdn.pro",
      },
      {
        protocol: "https",
        hostname: "media.publit.io",
      },
      {
        protocol: "https",
        hostname: "api.betango.dance",
      },
    ],
  },
};

export default nextConfig;
