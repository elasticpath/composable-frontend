import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.epusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**.cm.elasticpath.com",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    unoptimized: process.env.DISABLE_IMAGE_OPTIMIZATION === "true",
  },
};

export default nextConfig;
