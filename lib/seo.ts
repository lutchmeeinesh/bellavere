import type { Metadata } from "next";

/**
 * Open Graph fields shared by every page. A page that sets its own
 * `openGraph` replaces the root layout's object entirely (Next.js merges
 * metadata one key deep), so it spreads these in again.
 */
export const OPEN_GRAPH_BASE = {
  type: "website",
  siteName: "Bellavere",
  locale: "en_GB",
} as const satisfies NonNullable<Metadata["openGraph"]>;
