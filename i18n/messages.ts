import "server-only";
import type { AppLocale } from "@/i18n/routing";

import enAbout from "@/messages/en/about.json";
import enAnalytics from "@/messages/en/analytics.json";
import enCommon from "@/messages/en/common.json";
import enContact from "@/messages/en/contact.json";
import enEstimator from "@/messages/en/estimator.json";
import enHome from "@/messages/en/home.json";
import enLegal from "@/messages/en/legal.json";
import enLocale from "@/messages/en/locale.json";
import enServices from "@/messages/en/services.json";
import enWhatsapp from "@/messages/en/whatsapp.json";

import frAbout from "@/messages/fr/about.json";
import frAnalytics from "@/messages/fr/analytics.json";
import frCommon from "@/messages/fr/common.json";
import frContact from "@/messages/fr/contact.json";
import frEstimator from "@/messages/fr/estimator.json";
import frHome from "@/messages/fr/home.json";
import frLegal from "@/messages/fr/legal.json";
import frLocale from "@/messages/fr/locale.json";
import frServices from "@/messages/fr/services.json";
import frWhatsapp from "@/messages/fr/whatsapp.json";

/**
 * Every message of the site, one JSON file per namespace per locale:
 * messages/<locale>/<namespace>.json. All files are imported statically, so
 * a missing file fails the build, and the English files define the message
 * types (global.d.ts): a key that does not exist is a TypeScript error.
 *
 *   common     header, footer, buttons, currency, 404/error pages, company
 *              prose (tagline, mission, pricing, team, commitments, hours),
 *              structured data, Open Graph, image alt texts
 *   home services about contact legal   one per public page (legal = privacy + terms)
 *   estimator  /estimate (phase 1, stream A)
 *   whatsapp   WhatsApp button and contact cards (phase 1, stream B)
 *   analytics  privacy wording for Plausible analytics (phase 1, stream B; server only)
 *   locale     language switch and French-suggestion banner (phase 1, stream C)
 *
 * Server only: the browser receives just CLIENT_NAMESPACES, through the
 * NextIntlClientProvider in the root documents.
 */
const en = {
  common: enCommon,
  home: enHome,
  services: enServices,
  about: enAbout,
  contact: enContact,
  legal: enLegal,
  estimator: enEstimator,
  whatsapp: enWhatsapp,
  analytics: enAnalytics,
  locale: enLocale,
};

export type Messages = typeof en;
export type Namespace = keyof Messages;

// French files keep the English shape (scripts/i18n-check.mjs checks the
// keys and placeholders); the types come from English only.
const fr = {
  common: frCommon,
  home: frHome,
  services: frServices,
  about: frAbout,
  contact: frContact,
  legal: frLegal,
  estimator: frEstimator,
  whatsapp: frWhatsapp,
  analytics: frAnalytics,
  locale: frLocale,
} satisfies Record<Namespace, unknown> as unknown as Messages;

const MESSAGES: Record<AppLocale, Messages> = { en, fr };

/**
 * Namespaces that client components read with useTranslations(). Only these
 * are sent to the browser (pages about, services and legal are rendered on
 * the server only: a client component there gets its text as props).
 */
export const CLIENT_NAMESPACES = [
  "common",
  "home",
  "contact",
  "estimator",
  "whatsapp",
  "locale",
] as const satisfies readonly Namespace[];

/** Same for the English-only owner portal: shared chrome (Logo, currency switch, error page). */
export const PORTAL_CLIENT_NAMESPACES = ["common"] as const satisfies readonly Namespace[];

export function getAllMessages(locale: AppLocale): Messages {
  return MESSAGES[locale];
}

/** The given namespaces of a locale's messages, for NextIntlClientProvider. */
export function pickMessages(
  locale: AppLocale,
  namespaces: readonly Namespace[],
): Partial<Messages> {
  const all = MESSAGES[locale];
  return Object.fromEntries(namespaces.map((ns) => [ns, all[ns]]));
}
