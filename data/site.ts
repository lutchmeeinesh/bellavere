import type { AppLocale } from "@/i18n/routing";

/**
 * Site-wide settings that are facts rather than copy: addresses, numbers
 * and switches. Bundled into browser code (the WhatsApp button reads it), so
 * everything here is public. Wording lives in messages/<locale>.json.
 */

/** Absolute site URL without a trailing slash (metadata, JSON-LD, sitemap). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

// TODO: goes live once Google Workspace is set up — revert constant to Gmail if not yet active
// bellaveremu.com has no mail server yet (no MX records), so mail sent to
// hello@bellaveremu.com would be lost. Flipping HELLO_MAILBOX_LIVE to true
// switches every public mention of the company email (footer, contact page,
// error pages, legal pages, structured data, contact-form fallbacks) and the
// default recipient of contact-form enquiries in one go.
const HELLO_MAILBOX_LIVE = false;

/** The one public company email address. Never write the address by hand. */
export const PUBLIC_EMAIL = HELLO_MAILBOX_LIVE
  ? "hello@bellaveremu.com"
  : "BellavereLtd@gmail.com";

/**
 * WhatsApp numbers in wa.me format (country code + number, digits only),
 * confirmed by the client with the phone numbers in data/company.ts. Keyed
 * by the contact ids of `company.contacts`, so the contact page's cards
 * (components/whatsapp/WhatsAppContactCards.tsx) find each person's number.
 */
export const WHATSAPP_NUMBERS = {
  /** Ankit Dookhorun, Client Relations: +230 5531 0734. */
  ankit: "23055310734",
  /** Nihal Lutchmee: +230 5817 4529. */
  nihal: "23058174529",
} as const;

/** The number behind the floating WhatsApp button (Ankit, Client Relations). */
export const WHATSAPP_PRIMARY = WHATSAPP_NUMBERS.ankit;

/**
 * Text pre-filled in WhatsApp when a visitor opens a chat from the floating
 * button without a more specific message (pages can set their own, see
 * WhatsAppProvider; the contact cards greet each person by name, messages
 * `whatsapp.contactCards.prefill`). The visitor can edit it before sending.
 */
export const WHATSAPP_DEFAULT_MESSAGE: Record<AppLocale, string> = {
  en: "Hello Bellavere, I’d like to know more about your property management services.",
  fr: "Bonjour Bellavere, je souhaiterais en savoir plus sur vos services de gestion de propriétés.",
};

/**
 * When what the legal pages say last changed (ISO dates): their "Last
 * updated" line in both languages and their lastmod in app/sitemap.ts.
 * Move a date forward whenever that page's content changes. With analytics
 * on, the privacy policy shows the later of its date and
 * ANALYTICS_POLICY_DATE (lib/analytics.ts), the day its analytics wording
 * was added.
 */
export const LEGAL_LAST_UPDATED = {
  /** Wave 1: the language cookie, the French suggestion's note and WhatsApp. */
  privacy: "2026-10-06",
  terms: "2026-09-22",
} as const;
