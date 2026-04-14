import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.thortful.com',
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "d1x8q4k9bawcu3.cloudfront.net",
      },
      {
        protocol: 'https',
        hostname: 'images-fe.thortful.com',
      },
      {
        protocol: 'https',
        hostname: 'strapi-media.thortful.com',
      },
    ],
  },
};

export default nextConfig;
