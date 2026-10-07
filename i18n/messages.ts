import "server-only";
import compile from "icu-minify/compile";
import type { AbstractIntlMessages } from "next-intl";
import type { AppLocale } from "@/i18n/routing";

import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

/**
 * Every message of the site, one JSON file per locale: messages/en.json and
 * messages/fr.json, each an object whose top-level keys are the namespaces.
 * Both files are imported statically, so a missing file fails the build,
 * and the English file defines the message types (global.d.ts): a key that
 * does not exist is a TypeScript error.
 *
 *   common     header, footer, buttons, currency, 404/error pages, company
 *              prose (tagline, mission, pricing, team, commitments, hours),
 *              structured data, Open Graph, image alt texts
 *   home services about contact legal   one per public page (legal = privacy + terms)
 *   estimator  /estimate and the home page's estimator teaser
 *   whatsapp   WhatsApp button and contact cards
 *   analytics  privacy wording for Plausible analytics (server only)
 *   locale     language switch and the language-suggestion card
 *
 * Server only. The browser receives only what its client components read:
 * SITE_CLIENT_MESSAGES on every public page (root document), plus the
 * page's own PAGE_CLIENT_MESSAGES (<ClientMessages> in the page); the
 * portal gets PORTAL_CLIENT_MESSAGES. Server components read everything.
 *
 * Precompiled: every message is parsed once here (icu-minify, next-intl's
 * ahead-of-time ICU compiler) and next.config.ts points
 * `use-intl/format-message` at next-intl's small formatter for precompiled
 * messages, so neither the server nor the browser bundles the ICU parser
 * (intl-messageformat, about 9 kB gzipped on every page). Consequences: a
 * message must be valid ICU (it fails the build otherwise), `t.raw()` is not
 * available, and number styles other than a skeleton or a plain
 * `{n, number}` must be declared in MESSAGE_FORMATS (i18n/routing.ts).
 */
export type Messages = typeof en;
export type Namespace = keyof Messages;

// The French file keeps the English shape (scripts/i18n-check.mjs checks the
// keys and placeholders); the types come from English only. `satisfies`
// still fails the build if French loses a whole namespace.
const frMessages = fr satisfies Record<Namespace, unknown> as unknown as Messages;

/**
 * Plain arrays and objects all the way down: icu-minify builds plural and
 * select branches as null-prototype objects, which React refuses to pass
 * from server to client components.
 */
function plain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(plain);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, plain(child)]),
    );
  }
  return value;
}

/** A message tree with every string compiled (see above). */
function compileTree(tree: object): object {
  return Object.fromEntries(
    Object.entries(tree).map(([key, value]) => [
      key,
      typeof value === "string" ? plain(compile(value)) : compileTree(value),
    ]),
  );
}

// Compiled messages keep the files' nesting, so the English types still
// describe their keys (the leaves are compiled messages, not strings).
const MESSAGES: Record<AppLocale, Messages> = {
  en: compileTree(en) as Messages,
  fr: compileTree(frMessages) as Messages,
};

type Leaf = string;
type KeysOf<T> = Extract<keyof T, string>;
/**
 * A namespace or a key path up to three levels deep, checked against the
 * English messages: "locale", "common.nav", "common.company.hoursInline".
 */
export type MessagePath = {
  [N in Namespace]:
    | N
    | {
        [K in KeysOf<Messages[N]>]:
          | `${N}.${K}`
          | (Messages[N][K] extends Leaf
              ? never
              : `${N}.${K}.${KeysOf<Messages[N][K]>}`);
      }[KeysOf<Messages[N]>];
}[Namespace];

/**
 * What the public site's shared client components read, sent with every
 * public page (app/[locale]/layout.tsx): the header (nav, actions, EN | FR
 * and currency switches), the logo, the French suggestion, the floating
 * WhatsApp button, Money/ConversionNote and the error page.
 */
export const SITE_CLIENT_MESSAGES = [
  "common.nav",
  "common.actions",
  "common.logo",
  "common.currency",
  "common.social.newTab",
  "common.error",
  "common.company.hoursInline",
  "locale",
  "whatsapp.button",
] as const satisfies readonly MessagePath[];

/**
 * What each public page's own client components read on top, sent only
 * with that page (wrap them in <ClientMessages paths={…}>). A client
 * component that reads anything else gets its text as props, or its keys
 * are added here; next-intl logs MISSING_MESSAGE in the browser console
 * otherwise (scripts/review.mjs reports console errors).
 */
export const PAGE_CLIENT_MESSAGES = {
  /** DashboardPreview, Testimonials, EstimatorTeaser (+ BedroomStepper). */
  home: [
    "home.dashboardPreview",
    "home.testimonials",
    "estimator.teaser",
    "estimator.regions",
    "estimator.bedrooms",
  ],
  /** ContactForm (+ the estimate summary, useEstimatePrefill), FaqAccordion. */
  contact: [
    "contact.form",
    "contact.faq",
    "common.company.pricing",
    "estimator.regions",
    "estimator.bedrooms",
    "estimator.features",
    "estimator.contactSummary",
  ],
  /** EstimatorFlow and its screens (the page's header and method are server-rendered). */
  estimate: [
    "estimator.flow",
    "estimator.steps",
    "estimator.types",
    "estimator.regions",
    "estimator.bedrooms",
    "estimator.features",
    "estimator.availability",
    "estimator.result",
    "estimator.whatsappMessage",
  ],
} as const satisfies Record<string, readonly MessagePath[]>;

/** The English-only owner portal: logo, currency switch and Money, error page. */
export const PORTAL_CLIENT_MESSAGES = [
  "common.logo",
  "common.currency",
  "common.error",
  "common.company.hoursInline",
] as const satisfies readonly MessagePath[];

/** A locale's (compiled) messages, for next-intl's request configuration and createTranslator. */
export function getAllMessages(locale: AppLocale): Messages {
  return MESSAGES[locale];
}

/** A compiled message (a string or an array) or a nested group of them. */
type Tree = { [key: string]: Tree | Leaf | unknown[] };

const isGroup = (node: Tree[string]): node is Tree =>
  typeof node === "object" && !Array.isArray(node);

/**
 * The given parts of a locale's messages, nested as in messages/<locale>.json,
 * for a NextIntlClientProvider. A path that does not exist throws (it fails
 * the build, since every public page is prerendered).
 */
export function pickMessages(
  locale: AppLocale,
  paths: readonly MessagePath[],
): AbstractIntlMessages {
  const picked: Tree = {};
  for (const path of paths) {
    const keys = path.split(".");
    let source: Tree[string] = MESSAGES[locale] as unknown as Tree;
    let target = picked;
    keys.forEach((key, index) => {
      if (!isGroup(source) || !(key in source)) {
        throw new Error(`pickMessages: no messages at "${path}" (${locale})`);
      }
      source = source[key];
      if (index === keys.length - 1) {
        target[key] = source;
      } else {
        const next = target[key];
        target = isGroup(next) ? next : (target[key] = {});
      }
    });
  }
  // Compiled leaves are arrays where next-intl's type expects strings.
  return picked as AbstractIntlMessages;
}
