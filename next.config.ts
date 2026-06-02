import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [      {
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
