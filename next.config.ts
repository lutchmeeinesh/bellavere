import path from "node:path";
import type { NextConfig } from "next";
// Must come before next-intl/plugin (see the file).
import "./i18n/swc-native-cache.cjs";
import createNextIntlPlugin from "next-intl/plugin";

/** next-intl: points `next-intl/config` at the request configuration. */
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * The messages are compiled ahead of time (i18n/messages.ts), so next-intl
 * formats them with its small precompiled-message formatter instead of
 * intl-messageformat and its ICU parser (about 9 kB gzipped less on every
 * page). This is what next-intl's own `experimental.messages.precompile`
 * does, which needs Next.js 16 for its build-time loader; the alias is the
 * same, with a relative path because Turbopack ignores an absolute one here
 * (vercel/next.js#88540).
 */
const PRECOMPILED_FORMATTER = require.resolve("use-intl/format-message/format-only");
const MESSAGE_FORMATTER_ALIAS = {
  "use-intl/format-message": `./${path
    .relative(process.cwd(), PRECOMPILED_FORMATTER)
    .split(path.sep)
    .join("/")}`,
};

/**
 * Content Security Policy, sent as a static header. It deliberately uses
 * 'unsafe-inline' rather than a per-request nonce: a nonce would force every
 * page to render dynamically, and the public pages are served static. Inline
 * style is needed for framer-motion, Recharts and the printable statement
 * window (an about:blank popup, which inherits this policy).
 *
 * Analytics: only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set (read at build
 * time, like the script tag in components/analytics/Analytics.tsx) may the
 * browser load Plausible's script and send it events; otherwise the policy
 * allows no third-party script or connection at all.
 */
const ANALYTICS_ORIGINS = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim()
  ? " https://plausible.io"
  : "";

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
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval'${ANALYTICS_ORIGINS}`
    : `script-src 'self' 'unsafe-inline'${ANALYTICS_ORIGINS}`,
  `connect-src 'self'${ANALYTICS_ORIGINS}`,
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
  // Precompiled messages (see MESSAGE_FORMATTER_ALIAS): Turbopack (npm run
  // dev / build), and webpack should anyone build without --turbopack.
  turbopack: { resolveAlias: MESSAGE_FORMATTER_ALIAS },
  webpack(config: { resolve: { alias: Record<string, string> } }) {
    config.resolve.alias["use-intl/format-message"] = PRECOMPILED_FORMATTER;
    return config;
  },
};

export default withNextIntl(nextConfig);
