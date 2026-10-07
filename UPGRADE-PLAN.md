# Wave 1 upgrade plan — estimator, WhatsApp, French

Branch `wave-1`. Three features: (1) a rental-income estimator at `/estimate`, (2) WhatsApp (floating button + contact cards), (3) French/English with next-intl. Plus one public contact-email constant, sitemap/robots for both languages and Plausible analytics behind `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`.

Phases: **0** foundation (done, this document) → **extraction** (one agent per page namespace moves the English copy into messages) → **1** three parallel streams (**A** estimator, **B** WhatsApp/analytics/SEO, **C** French translation + language switch/banner) → **2** consolidation → **3** verification and launch.

Read README.md, HANDOFF.md (§8 gotchas) and ASSUMPTIONS.md ("Update 8 — Wave 1") first.

---

## 1. Fixed decisions (do not re-decide)

| Topic | Decision |
|---|---|
| Brand | **Bellavere** (lowercase v) everywhere; the brief's "BellaVere" is not used. |
| Locales | `en` (default, British English) and `fr` (polished French, *vouvoiement*). |
| URLs | English unprefixed and unchanged: `/`, `/services`, `/about`, `/contact`, `/privacy`, `/terms`, `/estimate`. French under `/fr`: `/fr`, `/fr/services`, … (`localePrefix: "as-needed"`). `/en/...` redirects to the unprefixed URL. |
| Detection | None (`localeDetection: false`): never redirect on Accept-Language. A one-time dismissible banner suggests French (stream C). |
| Remembered choice | `NEXT_LOCALE` cookie, written **only** when the visitor picks a language (`writeLocaleCookie()`). With `NEXT_LOCALE=fr`, the middleware redirects an **unprefixed** public URL to its `/fr` version; explicit `/fr/...` URLs are never redirected away. Googlebot has no cookie and sees both versions. next-intl itself never writes the cookie (`localeCookie: false`). |
| Portal | `/login`, `/dashboard/**`, `/admin/**` stay English-only at their URLs, with unchanged auth, middleware isolation (real 404s via `DASHBOARD_PAGES`) and admin view-as. `/fr/login` etc. redirect to the English URL. No visual changes to login, dashboard or admin. |
| Rendering | Public pages stay static/ISR **in both languages** (home revalidate 3600, others 86400; `app/[locale]/(site)/layout.tsx` keeps `dynamic = "error"`). Every public page/layout calls `getPageLocale(params)` (wraps `setRequestLocale`); never read cookies/headers there. |
| Public email | One constant: `PUBLIC_EMAIL` in `data/site.ts` (`HELLO_MAILBOX_LIVE = false` → `BellavereLtd@gmail.com`; flip to `true` for `hello@bellaveremu.com` once Google Workspace exists — bellaveremu.com has no MX records yet). Contact-form delivery: `CONTACT_TO_EMAIL || PUBLIC_EMAIL`. |
| WhatsApp | Ankit Dookhorun `23055310734` (primary, floating button), Nihal Lutchmee `23058174529` (`WHATSAPP_NUMBERS` in `data/site.ts`). Default prefill per language in `WHATSAPP_DEFAULT_MESSAGE`. Nihal's mailbox stays executive@wwwbellavere.com. |
| English copy | Must not change: only moved into messages. English pages look identical to before Wave 1 except the header additions (EN \| FR switch, "Estimate my income") and the floating WhatsApp button. |
| Messages | One JSON file per locale, `messages/en.json` and `messages/fr.json`, each an object whose top-level keys are the namespaces (§5). Phases 0–1 used one file per namespace per locale (`messages/<locale>/<namespace>.json`); phase 2 merged them. |

---

## 2. File tree (Wave 1 target)

```
app/
  layout.tsx                    pass-through (two root documents below)
  not-found.tsx                 last-resort 404, own English document
  global-error.tsx              last-resort error page, own document (English)
  globals.css  favicon.ico  icon.svg  robots.ts  sitemap.ts
  api/**                        unchanged (contact uses PUBLIC_EMAIL)
  [locale]/                     PUBLIC SITE, en + fr
    layout.tsx                  root document: <html lang>, fonts, providers, NextIntlClientProvider, <Analytics/>; generateStaticParams; default metadata
    not-found.tsx               localized 404 boundary (for a page that calls notFound(); none does)
    error.tsx                   localized error boundary
    [...rest]/route.ts          unknown public URL -> the static 404 page's HTML, status 404 (§8)
    page-not-found/page.tsx     the localized 404 page, static (/page-not-found, /fr/page-not-found; noindex)
    opengraph-image.tsx         social image per language (/opengraph-image, /fr/opengraph-image)
    (site)/
      layout.tsx                Header, Footer, JsonLd, WhatsAppProvider, WhatsAppButton, LocaleBanner; dynamic="error"; revalidate 86400
      template.tsx
      page.tsx  about/  services/  contact/  privacy/  terms/
      estimate/page.tsx         phase 1A
  (portal)/                     OWNER PORTAL, English, URLs unchanged
    layout.tsx                  root document (lang="en"), portal metadata
    error.tsx                   error page for /login and the portal layouts
    login/  dashboard/**  admin/**   moved unchanged (one import path fixed)
components/
  document/RootDocument.tsx     the shared <html>/<body>/fonts/providers (both roots + root 404)
  i18n/LocaleLink.tsx           client locale-aware Link (Button, Logo)
  i18n/IntlClientProvider.tsx   NextIntlClientProvider from a client module
  site/  Header Footer Logo JsonLd SocialIcons LanguageToggle LocaleBanner NotFoundScreen SiteError
  whatsapp/WhatsAppProvider.tsx WhatsAppButton.tsx   (+ phase 1B: contact cards)
  analytics/Analytics.tsx       (phase 1B: Plausible script)
  estimator/**                  phase 1A
data/
  site.ts                       SITE_URL, PUBLIC_EMAIL, WHATSAPP_NUMBERS/PRIMARY, WHATSAPP_DEFAULT_MESSAGE, LEGAL_LAST_UPDATED
  company.ts                    facts and ids only (its English prose was removed in phase 3)
  siteImages.ts                 photo URLs only; alts in messages
i18n/
  routing.ts                    defineRouting + AppLocale + TIME_ZONE
  navigation.ts                 Link (portal paths stay unprefixed), usePathname, useRouter, getPathname, redirect
  request.ts                    getRequestConfig (next-intl plugin target)
  messages.ts                   loads messages/en.json + fr.json, Messages type, SITE_/PAGE_/PORTAL_CLIENT_MESSAGES, pickMessages, getAllMessages
  swc-native-cache.cjs          Windows build fix, loaded by next.config.ts
lib/
  i18n/server.ts                getPageLocale(params), LocaleParams
  i18n/metadata.ts              localizedMetadata(), localizedPath(), openGraphImagePath()
  i18n/images.ts                getSiteImages() / useSiteImages()
  i18n/localeCookie.ts          LOCALE_COOKIE, writeLocaleCookie()
  format.ts                     every formatter takes an optional locale
  whatsapp.ts  analytics.ts     wa.me link builder; Plausible switch and track() (does nothing while off)
  estimator.ts                  phase 1A
messages/en.json  messages/fr.json   one file per locale; top-level keys = namespaces:
                                common home services about contact legal estimator whatsapp analytics locale
global.d.ts                     next-intl AppConfig: typed locales and message keys
middleware.ts                   portal logic unchanged + NEXT_LOCALE redirect + next-intl
scripts/i18n-check.mjs  scripts/visual-diff.mjs   (npm run i18n:check / visual:diff)
```

---

## 3. Routing and layouts

- **Two root documents.** `app/[locale]/layout.tsx` (public, `<html lang="en|fr">`) and `app/(portal)/layout.tsx` (portal, `lang="en"`) both render `<RootDocument>` (fonts on `<html>`, `globals.css`, `IntlClientProvider`, `MotionProvider`, `CurrencyProvider locale=…`). `app/layout.tsx` only passes children through, so `app/not-found.tsx` can render its own document (next-intl's documented pattern).
- **Static both languages.** `[locale]/layout.tsx` has `generateStaticParams` (en, fr) and validates the locale (`notFound()` otherwise). Every page, layout and `generateMetadata` under `[locale]` starts with `await getPageLocale(params)`. The build lists `/[locale]` with `/en` and `/fr` (●, ISR) for every public page; the portal stays ƒ, `/login` ○.
- **Internal vs public URLs.** English pages are served from `/en/...` internally (middleware rewrite) and `/` publicly. Never derive URLs from the route path: use `localizedPath()` / `getPathname()` and `usePathname()` from `@/i18n/navigation` (returns the path without the locale).
- **Metadata.** `[locale]/layout.tsx` sets `metadataBase`, the title template `%s · Bellavere`, the default title/description (`common.meta`), robots (`SITE_INDEXABLE`), the Open Graph base and Twitter card. Each page returns `localizedMetadata({ locale, path, title?, description? })`: explicit canonical (never `"./"`, which would resolve against `/en/...`; this also keeps the vercel/next.js#95648 fix), `alternates.languages` (en, fr, x-default→English), og:url/og:locale/og:locale:alternate and the per-language og:image with a translated alt.
- **404.** Unknown public URLs hit the route handler `app/[locale]/[...rest]/route.ts`, which answers with the HTML of the static page `app/[locale]/page-not-found` in the URL's language and status 404 (title "Page not found · Bellavere", noindex), complete without JavaScript. Pages always win over this catch-all, so a new public page needs nothing here. Why not `notFound()`: see §8. URLs outside both roots, or whose first segment is not a language (`dynamicParams = false` in `app/[locale]/layout.tsx`; e.g. `/x.y`), get `app/not-found.tsx` (English, static).
- **Errors.** `app/[locale]/error.tsx` (localized) and `app/(portal)/error.tsx` (English) both render `SiteError`; the old `app/error.tsx` is gone (it would have had no `<html>` under a pass-through root). Layout-level failures reach `app/global-error.tsx` (own document, English, uses PUBLIC_EMAIL).
- **Client messages.** The browser gets only the keys its client components read (`i18n/messages.ts`): `SITE_CLIENT_MESSAGES` from the public root document on every page, plus `PAGE_CLIENT_MESSAGES.<page>` wrapped around a page's own client components with `<ClientMessages locale paths>` (home, contact, estimate); the portal gets `PORTAL_CLIENT_MESSAGES` (English). A client component that reads a key outside these lists logs `MISSING_MESSAGE` in the browser console: add the key path to the right list (or pass the text as a prop). Messages are precompiled (§8).

## 4. Middleware (`middleware.ts`)

1. Portal paths (`/login`, `/dashboard`, `/dashboard/**`, `/admin`, `/admin/**`) → `portalMiddleware()`: the pre-Wave-1 code, unchanged (session check, redirects, `DASHBOARD_PAGES`, 404 rewrites).
2. `/<locale>/<portal path>` (e.g. `/fr/login`, also `/FR/login`) → 307 to the unprefixed portal path.
3. A language prefix not in lower case (`/FR/services`, `/Fr`, `/EN/services`) → 307 to the canonical address (`/fr/services`, `/fr`, `/services`) in one step, before the cookie is read (otherwise step 4 would take `/FR/...` for an unprefixed path and send it to `/fr/FR/...`, a 404).
4. Unprefixed public path and `NEXT_LOCALE` is a non-default locale → 307 to `/<locale><path>` (query kept).
5. Everything else → next-intl (`as-needed` rewrite to `/en/...`, `/en/...` → unprefixed redirect).

Matcher: the three old portal patterns (so dotted portal paths behave as before) plus `/((?!api|_next|_vercel|.*\..*).*)`. `/opengraph-image` (no extension) goes through next-intl like a page; `/robots.txt`, `/sitemap.xml`, `/icon.svg`, `/favicon.ico`, `/logo.png`, `/images/*` skip it. Edge-safe (next-intl's middleware, Web Crypto sessions).

**Adding a public page:** nothing to do in middleware (unknown paths 404 via `[...rest]`). **Adding a portal page:** add it to `DASHBOARD_PAGES` / the admin check as before.

---

## 5. Messages

### Layout and ownership

All wording is in two files, `messages/en.json` and `messages/fr.json`. Each is an object whose top-level keys are the namespaces, in the order of the table below; inside a namespace, keys are nested by page section. Both files have the same keys in the same order and are formatted alike: 2-space indent, UTF-8, LF line endings, a final newline, and characters written as themselves (`é`, `’`, the no-break space U+00A0), not as `\u` escapes — i.e. `JSON.stringify(messages, null, 2) + "\n"`. `i18n/messages.ts` imports both files; the English one defines the types (`global.d.ts`).

| Namespace | Holds | Filled by (en) | French by |
|---|---|---|---|
| `common` | nav, header, footer, buttons, currency labels, 404/error, logo, social labels, service names, company prose (`company.*`: tagline, market, mission, pricing, team roles/bios, commitments, hours, response time, country, company type), JSON-LD, Open Graph, `meta`, image alts (`images.*`) | phase 0 (done) | C |
| `home` | home page (Hero, TrustBar, ServicesOverview, HowItWorks, DashboardTeaser/Preview, Testimonials incl. `data/testimonials.ts`, CtaBand defaults) + `meta` | extraction | C |
| `services` | services page, ServiceSection, ComparisonTable + `meta` | extraction | C |
| `about` | about page, TeamGrid wording (roles/bios come from `common.company.team`), coverage map alt + `meta` | extraction | C |
| `contact` | contact page, ContactForm (labels, placeholders, validation, statuses, errors), FaqAccordion + `meta`; the API's visitor-facing errors | extraction | C |
| `legal` | `privacy.*` and `terms.*` + their `meta` | extraction | C |
| `estimator` | /estimate | A | A (French included) |
| `whatsapp` | button, contact cards, page-specific prefills | B | B (French included) |
| `analytics` | the privacy policy's Plausible paragraphs (server only) | B | B, polished by C |
| `locale` | language switch, language-suggestion card | C | C |

Rules: every change to a message is made in **both** files in the same change (same key, same place). During phase 1 each stream edited only its own namespaces (French could be an English copy only where the owner was C), and keys a stream needed in someone else's namespace went under a clearly named sub-object in both locales and were listed for C. **Adding keys never requires touching the loader**; adding a namespace means adding a top-level key to both files (TypeScript and `npm run i18n:check` pick it up). Removing a key: delete it from both files after checking that no code reads it, including keys built at run time (`` t(`steps.${id}.title`) ``, key names kept in data such as the footer's links, the image alts that mirror `data/siteImages.ts`).

### Conventions

- **Keys**: camelCase, nested by page section: `home.hero.title`, `services.sections.rental.paragraphs.first`, `contact.form.errors.nameMissing`. Metadata at `<ns>.meta.title` / `<ns>.meta.description`.
- **No arrays.** Lists are objects keyed by stable ids; the order lives in code: `const STEPS = ["onboard", "manage", "grow"] as const;` then `t(\`steps.${id}.title\`)` (typed: the union of literal keys type-checks).
- **Facts stay in data**, interpolated with ICU placeholders: `{name}`, `{phone}`, `{email}`, `{company}`, `{count, plural, one {# open ticket} other {# open tickets}}`, `{maxFee, number, percent}` (pass `company.pricing.maxFeeRate`). The brand name "Bellavere" may appear literally in prose. Never put a phone, email, URL or figure in a message.
- **Exact English**: copy characters exactly (’ “ ” — – · …). JSX entities become the characters (`&rsquo;` → `’`, `&amp;` → `&`). Adjacent JSX text joins with one space. ASCII `'` is fine except directly before `{`/`}`; never use `<` or `>` as text (they are tags).
- **Rich text** for links/bold inside sentences: `"…described in the <link>privacy policy</link>"` + `t.rich("consent", { link: (chunks) => <Link href="/privacy">{chunks}</Link> })`; `<strong>` likewise.
- **Everything user-visible**: text, `aria-label`, `alt`, `title`, `placeholder`, `aria-roledescription`, validation and error messages, `<option>` text, sr-only text, metadata.
- **Server components**: `const t = await getTranslations("ns")` (async) or `const t = useTranslations("ns")` (non-async). Pages already call `getPageLocale(params)`; keep it first. Need the locale? `const locale = await getPageLocale(params)` in pages, `useLocale()` elsewhere.
- **Client components**: `useTranslations("ns")` only for keys listed in `SITE_CLIENT_MESSAGES` or the page's `PAGE_CLIENT_MESSAGES` (`i18n/messages.ts`); otherwise receive strings as props.
- **Links**: `import { Link } from "@/i18n/navigation"` (never `next/link` in public code); `<Button href="/contact">` is already locale-aware; hrefs are written without a locale; portal paths stay unprefixed automatically.
- **Money and dates**: `useMoney()` already formats in the page's language; `<Money>` likewise. Server-side: `formatMoney(eur, currency, locale)`, `formatDate(d, locale)` ("22 septembre 2026"), `formatDateLong`, `formatMonthShort`, `formatPercent(v, decimals, locale)`, `formatNumber(n, locale)`, `conversionRateLabel(locale)`. `lib/metrics` month labels are English: on public pages format `MonthPoint.year/month` with `formatMonthShort(new Date(year, month, 1), locale)`.
- **Images**: `const images = await getSiteImages()` / `useSiteImages()` → `images.services.rental.{src,alt}`; other alts (e.g. the coverage map) go in the page namespace.
- **Check**: `npm run i18n:check` (0 parity/placeholder errors required; its "hard-coded text" list is the extraction to-do list).

### Worked examples (from phase 0)

1. *Server component* — `components/site/Footer.tsx`:
   ```tsx
   const t = useTranslations("common");
   <p>{t("footer.blurb", { tagline: t("company.tagline") })}</p>
   <p>{t("footer.copyright", { year: String(new Date().getFullYear()), legalName: company.legalName })}</p>
   <Link href="/privacy">{t("footer.privacy")}</Link>          // Link from @/i18n/navigation
   ```
   `"blurb": "{tagline} Property management and syndic services all around Mauritius — …"`
2. *Client component* — `components/currency/CurrencyToggle.tsx`:
   ```tsx
   "use client";
   const t = useTranslations("common.currency");
   <div role="radiogroup" aria-label={t("label")}> … aria-label={t(`names.${code}`)} … {code} </div>
   ```
3. *Rich text* — `components/site/SiteError.tsx`:
   ```tsx
   {t.rich("error.writeTo", { email: PUBLIC_EMAIL, link: (chunks) => <a href={`mailto:${PUBLIC_EMAIL}`} className={LINK}>{chunks}</a> })}
   ```
   `"writeTo": "or write to <link>{email}</link>"`
4. *Image alt* — `components/home/Hero.tsx`:
   ```tsx
   const images = useSiteImages();
   <Image src={images.homeHero.src} alt={images.homeHero.alt} … />
   ```
   `common.images.homeHero`; the key path mirrors `data/siteImages.ts`.
5. *Page metadata* — the pattern every page uses (title/description literals are still English; the extraction agent replaces them with `t("meta.title")` etc.):
   ```tsx
   export async function generateMetadata({ params }: { params: LocaleParams }): Promise<Metadata> {
     const locale = await getPageLocale(params);
     const t = await getTranslations({ locale, namespace: "services.meta" });
     return localizedMetadata({ locale, path: "/services", title: t("title"), description: t("description") });
   }
   ```

---

## 6. Shared APIs (final signatures; phase 1 builds on these)

```ts
// lib/whatsapp.ts
export function whatsappUrl(number: string, message: string): string;     // https://wa.me/<number>?text=<encoded>

// components/whatsapp/WhatsAppProvider.tsx ("use client")
export type WhatsAppState = { hidden: boolean; message: string | null };
export function WhatsAppProvider({ children }): JSX.Element;               // in app/[locale]/(site)/layout.tsx
export function useWhatsAppOverride(override: { hidden?: boolean; message?: string } | null): void;
//   set while the caller is mounted, cleared on unmount; hidden if any override hides;
//   message = most recently mounted override with a message; no-op outside the provider
export function useWhatsAppState(): WhatsAppState;                         // {hidden:false,message:null} outside

// components/whatsapp/WhatsAppButton.tsx ("use client") — minimal floating link, after <Footer/>
//   href = whatsappUrl(WHATSAPP_PRIMARY, state.message ?? WHATSAPP_DEFAULT_MESSAGE[locale]);
//   track("WhatsApp Clicked", { placement: "floating" }); null when state.hidden

// lib/analytics.ts
export type AnalyticsEvent = "Estimator Completed" | "WhatsApp Clicked" | "Contact Submitted";
export function track(event: AnalyticsEvent, props?: Record<string, string | number | boolean>): void;
// components/analytics/Analytics.tsx — renders null (in app/[locale]/layout.tsx)

// components/site/LanguageToggle.tsx ("use client")
export function LanguageToggle(props: { tone?: "default" | "light"; compact?: boolean; className?: string }): JSX.Element;
// components/site/LocaleBanner.tsx ("use client") — renders null (in the (site) layout)

// lib/i18n/localeCookie.ts
export const LOCALE_COOKIE = "NEXT_LOCALE";
export function writeLocaleCookie(locale: AppLocale): void;                // 1 year, path=/, samesite=lax

// data/site.ts
export const SITE_URL: string; export const PUBLIC_EMAIL: string;
export const WHATSAPP_NUMBERS: { ankit: "23055310734"; nihal: "23058174529" };
export const WHATSAPP_PRIMARY: string;
export const WHATSAPP_DEFAULT_MESSAGE: Record<AppLocale, string>;

// i18n + helpers
import { Link, usePathname, useRouter, getPathname, redirect } from "@/i18n/navigation";
import { routing, type AppLocale, TIME_ZONE } from "@/i18n/routing";
getPageLocale(params: LocaleParams): Promise<AppLocale>                     // lib/i18n/server.ts
localizedMetadata({ locale, path, title?, description? }): Promise<Metadata> // lib/i18n/metadata.ts
localizedPath(locale, path): string; openGraphImagePath(locale): string
getSiteImages(locale?): Promise<SiteImages>; useSiteImages(): SiteImages   // lib/i18n/images.ts
useMoney() → { currency, setCurrency, locale, format, formatPrecise, formatCompact, convert, symbol, affixes }
```

---

## 7. File-level changes per phase

Phases 0 and 1 worked in per-namespace files: where they name `messages/<locale>/<ns>.json` (or `en/<ns>.json`), read the `<ns>` namespace of `messages/<locale>.json` today.

### Phase 0 — foundation (done)

- next-intl 4.14.9; `next.config.ts` wraps the config with `createNextIntlPlugin("./i18n/request.ts")` (headers, CSP, `htmlLimitedBots`, images, `poweredByHeader` unchanged) and first loads `i18n/swc-native-cache.cjs`.
- New: `i18n/*`, `global.d.ts`, `messages/{en,fr}/*.json` (common filled; page namespaces `{}`; whatsapp/locale seeded with the stubs' keys; estimator `{}`), `lib/i18n/*`, `data/site.ts`, `components/document/RootDocument.tsx`, `components/i18n/*`, `components/site/{LanguageToggle,LocaleBanner,NotFoundScreen,SiteError}.tsx`, `components/whatsapp/*`, `components/analytics/Analytics.tsx`, `lib/whatsapp.ts`, `lib/analytics.ts`, `scripts/i18n-check.mjs`, `scripts/visual-diff.mjs`, `app/[locale]/{layout,not-found,error}.tsx`, `app/[locale]/[...rest]/page.tsx`, `app/(portal)/{layout,error}.tsx`.
- Moved: `app/(site)/**` → `app/[locale]/(site)/**`; `app/(auth)/login` → `app/(portal)/login`; `app/dashboard`, `app/admin` → `app/(portal)/…`; `app/opengraph-image.tsx` → `app/[locale]/opengraph-image.tsx` (localized). Removed `app/error.tsx` (now `SiteError`).
- Changed: `app/layout.tsx` (pass-through), `app/not-found.tsx` (own document), `middleware.ts`, Header (EN\|FR switch next to the currency switch on desktop and phone — inside the menu below 360px; "Estimate my income" link; owner-login button hidden between 1024 and 1279px where the bar is full), Footer, Logo (client, localized label), SocialIcons, JsonLd, CurrencyProvider/useMoney, CurrencyToggle, Money, CountUp, Button (locale-aware links), `lib/format.ts`, `lib/seo.ts`, `data/company.ts` (ids, PUBLIC_EMAIL, @deprecated prose), `data/siteImages.ts` (alts → messages), contact API (PUBLIC_EMAIL), global-error (PUBLIC_EMAIL). Public pages: `getPageLocale` + `localizedMetadata` (English literals left for extraction), `next/link` → `@/i18n/navigation`, PUBLIC_EMAIL, localized image alts. Login page: alt from messages (no visual change).

### Extraction (one agent per namespace; English must stay byte-identical)

| Agent | Files | Namespace |
|---|---|---|
| home | `app/[locale]/(site)/page.tsx` (meta), `components/home/*`, `data/testimonials.ts` (quotes/roles → messages, keep ids) | home |
| services | `app/[locale]/(site)/services/page.tsx`, `components/services/*` | services |
| about | `app/[locale]/(site)/about/page.tsx`, `components/about/TeamGrid.tsx` (use `common.company.team.<id>`) | about |
| contact | `app/[locale]/(site)/contact/page.tsx`, `components/contact/*`, visitor-facing errors of `app/api/contact/route.ts` (return an error **code** + let the form show `contact.form.errors.<code>`, or send the locale in the body), `track("Contact Submitted")` on success | contact |
| legal | `app/[locale]/(site)/privacy/page.tsx`, `terms/page.tsx` (dates via `formatDateLong`; company type via `common.company.companyType`) | legal |

Each copies its finished `en/<ns>.json` to `fr/<ns>.json`, runs `npm run i18n:check` (its files must leave the hard-coded list), `npx tsc --noEmit`, `npm run lint`, `npm run build`, and compares screenshots (`visual-snapshot` + `visual-diff --ignore-top=72` against `screenshots/baseline`).

### Phase 1A — estimator

- `app/[locale]/(site)/estimate/page.tsx` (+ `generateMetadata` via `localizedMetadata(path "/estimate")`), `components/estimator/*`, `lib/estimator.ts` (pure calculation, EUR in, uses `EUR_TO_MUR` via `useMoney`), the `estimator` namespace in both locales (French written by A).
- On result: `track("Estimator Completed", {...})`; `useWhatsAppOverride({ message: t("whatsappMessage", {...}) })`.
- Tell B to add `/estimate` to the sitemap. The header link already exists.

### Phase 1B — WhatsApp, analytics, SEO

- `components/whatsapp/WhatsAppButton.tsx` redesign (WhatsApp glyph as an inline SVG like `SocialIcons`, motion, hide rules), `components/whatsapp/WhatsAppContactCards.tsx` (Ankit + Nihal via `WHATSAPP_NUMBERS`) inserted on the contact page, the `whatsapp` namespace in both locales (French written by B).
- `components/analytics/Analytics.tsx`: Plausible `<Script>` only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set; `next.config.ts` CSP (`script-src`/`connect-src` for plausible.io); privacy-policy paragraph (legal namespace, see ownership rule) — Plausible is cookieless, so still no consent banner.
- `app/sitemap.ts`: both locales with `alternates.languages`, add `/estimate`; `app/robots.ts` unchanged apart from the sitemap URL. Optionally `.env.example` (variable already documented).

### Phase 1C — French and the language switch

- Translate every French namespace owned by C (common, home, services, about, contact, legal, locale) — natural, polished *vouvoiement*; keep facts as placeholders; `npm run i18n:check` must show 0 untranslated except proper nouns (extend `IDENTICAL_VALUES` in the script when a value is legitimately the same).
- `components/site/LanguageToggle.tsx` final design; `components/site/LocaleBanner.tsx` (one-time, dismissible, shown when `navigator.languages` prefers French and no `NEXT_LOCALE`; remembers dismissal; never redirects; uses `writeLocaleCookie`).
- Check French layouts: header at 1024/1280/1440 (labels are longer), buttons, forms, 404/error pages, OG image text. Privacy page: mention the `NEXT_LOCALE` preference cookie.

### Phase 2 — consolidation

- **Done (6 Oct 2026):** `messages/<locale>/*.json` merged into `messages/en.json` / `messages/fr.json` (top-level keys = namespaces, key order kept, values unchanged apart from the edits below); `i18n/messages.ts` imports the two files; `scripts/i18n-check.mjs` reads them (and reports a leftover `messages/<locale>/` folder as an error); `scripts/review.mjs` reads the 404 heading from them; the folders are deleted. README ("Internationalisation"), HANDOFF and this plan describe the single-file layout.
- **Done:** unused keys removed from both locales after checking every dynamic key in the code (template keys, key names kept in data, translators passed as arguments): `common.actions.contactUs`, `common.company.market`, `common.company.hours` (pages use `hoursInline`), `common.company.pricing.short`, `contact.details.call`, `contact.details.callWithHours` (the contact cards replaced them), `estimator.bedrooms.label` (the teaser uses `teaser.bedrooms`, the flow its step title). 570 → 563 keys.
- **Done:** polish-stage French edits: no-break spaces in "de A à Z" (`estimator.result.approach.items.rental.title`, `home.services.items.rental`, `services.hero.intro`); `home.howItWorks.steps.grow.title` "Vous le voyez prospérer" → "Vous le voyez grandir" (one line from 768 px, like the other two steps; keeps "You watch it grow").
- **Done:** `npm run i18n:check -- --strict` passes (no hard-coded text, nothing untranslated).
- **Done (phase 3):** the `@deprecated` prose is gone from `data/company.ts` (tagline, coverage, mission, company type, response time, pricing wording, team roles and bios, commitment labels, the country's English name); `tsc` confirms nothing read it. It keeps the facts, `hours` (portal) and `pricing.maxFeeRate`.
- **Done (phase 3):** `scripts/review.mjs` covers French: every public page in both languages (200, `lang`, no console errors, canonical and hreflang, static caching), the `NEXT_LOCALE` and `/en/...` redirects (upper-case prefixes included), the localized 404s for every method, and the estimator in both languages.

### Phase 3 — verification and launch

- **Done (6 Oct 2026, review fixes, platform):** upper-case prefixes (`/FR/...`) redirect to the lower-case address instead of a 404 under `NEXT_LOCALE=fr`; the 404 handler answers 404 to every method and stops waiting for the static 404 page after 3 s; the privacy policy covers WhatsApp and says when the language cookie is set, and its "Last updated" date and the sitemap dates of the pages Wave 1 changed are 6 October 2026 (`LEGAL_LAST_UPDATED` in `data/site.ts`, `WAVE_1` in `app/sitemap.ts`); the French JSON-LD names the country "Maurice"; French no-break spaces in "7j/7, 24h/24"; the French registration line names its subject ("Société n° …, constituée à Maurice le …"); the home page's third step reads "Vous suivez tout"; the English default WhatsApp message uses ’.

- `npm run build` (both locales ●), `node scripts/review.mjs http://localhost:3010` (and the admin flow by the user), visual diff of English pages against `screenshots/baseline`, Lighthouse on `/` and `/fr` pages.
- Client proofreads the French. Deploy; set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in Vercel; resubmit the sitemap in Search Console and check hreflang in URL Inspection; flip `HELLO_MAILBOX_LIVE` only when hello@bellaveremu.com receives mail.

---

## 8. Known limitations and gotchas

- **Portal is English-only** (`/fr/login` → `/login`).
- **404s and `notFound()` (Next.js 15.5).** React has no error boundaries on the server, so a `notFound()` thrown while a page renders escapes the server render: `renderToStream` catches it, sets the 404 status and sends an empty `<html id="__next_error__">` document, and the browser draws the nearest `not-found.tsx` from the page data (blank without JavaScript; `next/dist/server/app-render/app-render.js`, `getErrorRSCPayload`). Next.js renders a not-found page on the server only when it knows the route is a 404 before rendering (no route matches → `/_not-found`, a parameter outside `generateStaticParams` with `dynamicParams = false`, or a middleware rewrite with a 404 status) — and those all lead to the one site-wide `app/not-found.tsx` (English), which is also what Vercel serves for a middleware rewrite with a 404 status. So unknown public URLs go to `app/[locale]/[...rest]/route.ts`, which fetches the static `/<locale>/page-not-found` page from the deployment itself (prerendered, served from the edge cache) and returns its HTML with status 404 and `cache-control: private, no-store`; if that fetch fails or takes more than 3 seconds (e.g. a preview protected by Vercel Authentication) it returns a plain localized 404 page. Every method gets the 404 (POST, PUT, PATCH, DELETE and OPTIONS too, not a 405 or 204). The fetch goes to the server's own origin: under `next start` `request.url` is built from the server's host and port, on Vercel from the routed domain, never from a visitor's Host header. Not yet checked on Vercel: after the deploy, `curl -sI https://www.bellaveremu.com/fr/no-such-page` must say 404 and the body must read "Vous avez pris le large ?".
- **Messages are precompiled.** `i18n/messages.ts` compiles every message with icu-minify when the server starts, and `next.config.ts` aliases `use-intl/format-message` to next-intl's precompiled-message formatter (what next-intl's `experimental.messages.precompile` does, which needs Next.js 16 for its loader). Consequences: an invalid ICU message fails the build; `t.raw()` is not available; a named number style (`{n, number, percent}`) must be declared in `MESSAGE_FORMATS` (`i18n/routing.ts`), skeletons (`::MMMM`) and plain `{n, number}` work as before. Once on Next.js 16, the alias can be replaced by `experimental.messages.precompile` (with the merged message files).
- **global-error** stays English (it replaces the whole document and loads before any translation).
- **Typed keys**: `t("x.y")` is checked against `messages/en.json`; template keys (`` t(`steps.${id}.title`) ``) need `id` typed as a union of literals.
- **Windows builds**: next-intl's plugin loads SWC's native addon; `i18n/swc-native-cache.cjs` keeps its cache in `node_modules\.swc` of the main checkout (also for agent worktrees in `.claude\worktrees\<name>`, whose own path would pass 260 characters) because SWC refuses the default `%LOCALAPPDATA%\swc` on this machine ("Failed to load native binding").
- **Portal links are not prefetched** from public pages (`Link` in `i18n/navigation.ts`), to keep the portal's code off every public page load.
- **Never** read cookies/headers in `[locale]` layouts/pages; never use `"./"` canonicals; never import `i18n/messages.ts` from client code (it would ship every message).
