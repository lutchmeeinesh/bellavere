import { routing, type AppLocale } from "@/i18n/routing";

/**
 * A public page's URL in a language, for plain <a> links: localeHref("fr",
 * "/contact") is "/fr/contact", localeHref("en", "/") is "/". The same
 * result as next-intl's getPathname (the site has no translated pathnames),
 * without loading next-intl's navigation helpers. Used where a page must
 * stay light: the 404 page (no client JavaScript at all) and the error page.
 */
export function localeHref(locale: AppLocale, path: string): string {
  if (locale === routing.defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
