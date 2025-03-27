// @ts-check

const path = require('path');

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
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
      //Klevu uses a Geerative AI Endpoint to fetch images for products that have not uploaded images to the search index.
      //TODO Work with Klevu to use another image generation provider.
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  webpack(config, options) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    if (options.isServer) {
      config.externals = ['@tanstack/react-query', ...config.externals]
    }
    config.resolve.alias['@tanstack/react-query'] = path.resolve(
      './node_modules/@tanstack/react-query'
    );
    
    return config;
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
