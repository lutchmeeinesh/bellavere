import type { MetadataRoute } from "next";
import { LEGAL_LAST_UPDATED, SITE_URL } from "@/data/site";
import { routing, type AppLocale } from "@/i18n/routing";
import { ANALYTICS_ENABLED, ANALYTICS_POLICY_DATE } from "@/lib/analytics";
import { localizedPath } from "@/lib/i18n/metadata";

/**
 * Wave 1: every French page, the estimator, and the English pages it
 * changed (the home page's estimator teaser, the contact page's WhatsApp
 * cards, the privacy policy's language cookie and WhatsApp wording).
 */
const WAVE_1 = "2026-10-06";

/** The privacy policy's "Last updated" date (app/[locale]/(site)/privacy). */
const PRIVACY =
  ANALYTICS_ENABLED && ANALYTICS_POLICY_DATE > LEGAL_LAST_UPDATED.privacy
    ? ANALYTICS_POLICY_DATE
    : LEGAL_LAST_UPDATED.privacy;

/**
 * Every public page, in English and French, with the date its content last
 * really changed in each language (not the build time, which would tell
 * search engines everything changes on every deploy). Update a page's date
 * when you change its content; the privacy and terms dates are their "Last
 * updated" line (LEGAL_LAST_UPDATED in data/site.ts). The owner portal
 * (/login, /dashboard, /admin) and the API are deliberately excluded.
 */
const PAGES: { path: string; lastModified: Record<AppLocale, string> }[] = [
  { path: "/", lastModified: { en: WAVE_1, fr: WAVE_1 } },
  { path: "/services", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
  { path: "/about", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
  { path: "/estimate", lastModified: { en: WAVE_1, fr: WAVE_1 } },
  { path: "/contact", lastModified: { en: WAVE_1, fr: WAVE_1 } },
  { path: "/privacy", lastModified: { en: PRIVACY, fr: PRIVACY } },
  {
    path: "/terms",
    lastModified: { en: LEGAL_LAST_UPDATED.terms, fr: WAVE_1 },
  },
];

/**
 * The absolute public URL of a page in a language, spelled exactly like the
 * page's canonical link: "https://…/" → "https://…" for the English home
 * page, "https://…/fr/services" for French.
 */
function pageUrl(locale: AppLocale, path: string): string {
  const localized = localizedPath(locale, path);
  return `${SITE_URL}${localized === "/" ? "" : localized}`;
}

/**
 * /sitemap.xml: one entry per page and language, each listing all its
 * language versions (hreflang en, fr and x-default → English), the same
 * alternates as the pages' own <link rel="alternate"> tags
 * (lib/i18n/metadata.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap(({ path, lastModified }) => {
    const languages: Record<string, string> = Object.fromEntries(
      routing.locales.map((locale) => [locale, pageUrl(locale, path)]),
    );
    languages["x-default"] = pageUrl(routing.defaultLocale, path);
    return routing.locales.map((locale) => ({
      url: pageUrl(locale, path),
      lastModified: lastModified[locale],
      alternates: { languages },
    }));
  });
}
