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
 *
 * Imported by the middleware too: nothing here may touch `document` or
 * `window` outside the browser-only functions.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Fired on `window` (detail: the locale) whenever the visitor picks a
 * language, so other components (the French-suggestion banner) can react
 * without a reload.
 */
export const LOCALE_CHOICE_EVENT = "bellavere:locale-choice";

/**
 * localStorage key the French-suggestion banner sets once it is closed, so it
 * is not shown again (named in the privacy policy).
 */
export const LOCALE_SUGGESTION_DISMISSED_KEY = "bv_locale_suggestion";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Browser only: remembers the visitor's language choice. */
export function writeLocaleCookie(locale: AppLocale) {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
  window.dispatchEvent(
    new CustomEvent<AppLocale>(LOCALE_CHOICE_EVENT, { detail: locale }),
  );
}

/** Browser only: whether the visitor has picked a language before. */
export function hasLocaleCookie(): boolean {
  try {
    return document.cookie
      .split(";")
      .some((part) => part.trim().startsWith(`${LOCALE_COOKIE}=`));
  } catch {
    return false;
  }
}
