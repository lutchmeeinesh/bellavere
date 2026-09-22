import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are rendered per request (the root layout reads the currency
  // cookie), and Next.js 15 then streams <meta> tags into the body for most
  // user agents. Matching every agent keeps title, description and Open Graph
  // tags in <head>, so link previews and non-JS crawlers always see them.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
