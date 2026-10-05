import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";
import { routing, type AppLocale } from "@/i18n/routing";
import { ANALYTICS_ENABLED, ANALYTICS_POLICY_DATE } from "@/lib/analytics";
import { localizedPath } from "@/lib/i18n/metadata";

/** Wave 1: the French pages, the estimator and the contact page's WhatsApp cards. */
const WAVE_1 = "2026-10-05";

/**
 * Every public page, in English and French, with the date its content last
 * really changed in each language (not the build time, which would tell
 * search engines everything changes on every deploy). Update a page's date
 * when you change its content; the privacy and terms dates match their
 * "Last updated" line in English. The owner portal (/login, /dashboard,
 * /admin) and the API are deliberately excluded.
 */
const PAGES: { path: string; lastModified: Record<AppLocale, string> }[] = [
  { path: "/", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
  { path: "/services", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
  { path: "/about", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
  { path: "/estimate", lastModified: { en: WAVE_1, fr: WAVE_1 } },
  { path: "/contact", lastModified: { en: WAVE_1, fr: WAVE_1 } },
  {
    path: "/privacy",
    // Matches the page's "Last updated" (app/[locale]/(site)/privacy).
    lastModified: ANALYTICS_ENABLED
      ? { en: ANALYTICS_POLICY_DATE, fr: ANALYTICS_POLICY_DATE }
      : { en: "2026-09-22", fr: WAVE_1 },
  },
  { path: "/terms", lastModified: { en: "2026-09-22", fr: WAVE_1 } },
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
