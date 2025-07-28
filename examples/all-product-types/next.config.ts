import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  // allow images from https://files-na.epusercontent.com/
  images: {
    remotePatterns: [
      {
        hostname: "files-na.epusercontent.com",
      },
      {
        hostname: "image.josbank.com",
      },
    ],
  },
}

export default nextConfig
