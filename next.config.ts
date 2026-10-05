import type { NextConfig } from "next";
// Must come before next-intl/plugin (see the file).
import "./i18n/swc-native-cache.cjs";
import createNextIntlPlugin from "next-intl/plugin";

/** next-intl: points `next-intl/config` at the request configuration. */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Content Security Policy, sent as a static header. It deliberately uses
 * 'unsafe-inline' rather than a per-request nonce: a nonce would force every
 * page to render dynamically, and the public pages are served static. Inline
 * style is needed for framer-motion, Recharts and the printable statement
 * window (an about:blank popup, which inherits this policy).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  // React uses eval for its debugging tools in development, never in production.
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  // Only on Vercel (always HTTPS), so `next start` on http://localhost works.
  ...(process.env.VERCEL ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Standard features only, so the browser console stays free of warnings.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  // Same-origin popups (the statement window) keep their opener link.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The public pages are static, but the portals are rendered per request and
  // stream (dashboard/loading.tsx). Matching every agent makes metadata block
  // rendering instead of streaming into the body, so title, robots and Open
  // Graph tags are always in <head>. (Portal 404 statuses come from
  // middleware.ts, which rewrites unknown or foreign paths with status 404.)
  htmlLimitedBots: /.*/,
  images: {
    // 75 is the default; 40 is the faint photo behind the call-to-action band.
    // Listing them is required from Next.js 16.
    qualities: [40, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
