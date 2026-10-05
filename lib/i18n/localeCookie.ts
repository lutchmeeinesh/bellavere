import type { AppLocale } from "@/i18n/routing";

/**
 * The visitor's language choice. Written only when they pick a language
 * (the EN | FR switch, the French-suggestion banner) and read by
 * middleware.ts, which sends an unprefixed public URL ("/services") to its
 * French version ("/fr/services") while the cookie says "fr". Explicit /fr
 * URLs are never redirected away, and search engines (no cookies) always see
 * both versions.
 *
 * Same shape as the currency preference (bv_currency): a first-party
 * preference the visitor sets themselves, kept for a year.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Browser only: remembers the visitor's language choice. */
export function writeLocaleCookie(locale: AppLocale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}
