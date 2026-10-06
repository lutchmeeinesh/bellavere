import type { Formats } from "next-intl";
import { defineRouting } from "next-intl/routing";

/**
 * Locales and URL scheme of the public site (next-intl).
 *
 * - English is the default and keeps its URLs unprefixed ("/", "/services");
 *   French lives under "/fr" ("/fr", "/fr/services").
 * - No automatic detection: a visitor is never redirected because of their
 *   browser language (a one-time banner suggests French instead).
 * - next-intl never writes the locale cookie itself (`localeCookie: false`).
 *   The NEXT_LOCALE cookie is written only when the visitor picks a language
 *   (lib/i18n/localeCookie.ts), and middleware.ts reads it to send an
 *   unprefixed URL to its French version.
 * - hreflang alternates come from each page's metadata
 *   (lib/i18n/metadata.ts), so the middleware's `Link` header is off.
 *
 * The owner portal (/login, /dashboard, /admin) is English-only and is not
 * routed through next-intl at all (see middleware.ts).
 */
export const routing = defineRouting({
  locales: ["en", "fr"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
});

export type AppLocale = (typeof routing.locales)[number];

/** Time zone for every date next-intl formats: the Mauritius calendar. */
export const TIME_ZONE = "Indian/Mauritius";

/**
 * Named number styles used in messages ("{maxFee, number, percent}" →
 * "15%", "15 %"). The messages are precompiled (i18n/messages.ts), and the
 * precompiled formatter looks a named style up here rather than in ICU's
 * built-ins, so every style a message names must be listed. Given to both
 * the server (i18n/request.ts) and the browser (RootDocument).
 */
export const MESSAGE_FORMATS = {
  number: { percent: { style: "percent" } },
} satisfies Formats;
