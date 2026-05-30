import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
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
    ],
  },
};

export default nextConfig;
