import type { Metadata } from "next";
import type { AppLocale } from "@/i18n/routing";

/**
 * Open Graph fields shared by every page. A page that sets its own
 * `openGraph` replaces the root layout's object entirely (Next.js merges
 * metadata one key deep), so it spreads these in again. Public pages get
 * them through localizedMetadata() (lib/i18n/metadata.ts).
 */
export const OPEN_GRAPH_BASE = {
  type: "website",
  siteName: "Bellavere",
  locale: "en_GB",
} as const satisfies NonNullable<Metadata["openGraph"]>;

/** og:locale for each site language (British English, France French). */
export const OPEN_GRAPH_LOCALE: Record<AppLocale, string> = {
  en: "en_GB",
  fr: "fr_FR",
};
