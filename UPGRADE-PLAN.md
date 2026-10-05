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
| Messages | One JSON file per namespace per locale (`messages/<locale>/<namespace>.json`) until phase 2 merges them into `messages/en.json` / `messages/fr.json`. |

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
    not-found.tsx               localized 404 ("Lost at sea?")
    error.tsx                   localized error boundary
    [...rest]/page.tsx          unknown public URL -> notFound() (404 status)
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
  site.ts                       SITE_URL, PUBLIC_EMAIL, WHATSAPP_NUMBERS/PRIMARY, WHATSAPP_DEFAULT_MESSAGE
  company.ts                    facts (+ ids); English prose fields @deprecated (removed in phase 2)
  siteImages.ts                 photo URLs only; alts in messages
i18n/
  routing.ts                    defineRouting + AppLocale + TIME_ZONE
  navigation.ts                 Link (portal paths stay unprefixed), usePathname, useRouter, getPathname, redirect
  request.ts                    getRequestConfig (next-intl plugin target)
  messages.ts                   static loader, Messages type, CLIENT_NAMESPACES, pickMessages
  swc-native-cache.cjs          Windows build fix, loaded by next.config.ts
lib/
  i18n/server.ts                getPageLocale(params), LocaleParams
  i18n/metadata.ts              localizedMetadata(), localizedPath(), openGraphImagePath()
  i18n/images.ts                getSiteImages() / useSiteImages()
  i18n/localeCookie.ts          LOCALE_COOKIE, writeLocaleCookie()
  format.ts                     every formatter takes an optional locale
  whatsapp.ts  analytics.ts     stubs with final signatures
  estimator.ts                  phase 1A
messages/{en,fr}/{common,home,services,about,contact,legal,estimator,whatsapp,locale}.json
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
- **404.** Unknown public URLs hit `app/[locale]/[...rest]` → `notFound()` → `app/[locale]/not-found.tsx` in the URL's language, status 404, title "Page not found · Bellavere". Known Next.js 15 behaviour: for `notFound()` thrown while rendering, the server sends an empty HTML shell and the browser renders the 404 UI from the page data (fine with JavaScript; blank without). URLs outside both roots (e.g. `/x.y`) get `app/not-found.tsx` (English).
- **Errors.** `app/[locale]/error.tsx` (localized) and `app/(portal)/error.tsx` (English) both render `SiteError`; the old `app/error.tsx` is gone (it would have had no `<html>` under a pass-through root). Layout-level failures reach `app/global-error.tsx` (own document, English, uses PUBLIC_EMAIL).
- **Client messages.** The public document sends only `CLIENT_NAMESPACES` = common, home, contact, estimator, whatsapp, locale to the browser; the portal sends `common` (English). services, about and legal are server-only: a client component on those pages gets its text as props.

## 4. Middleware (`middleware.ts`)

1. Portal paths (`/login`, `/dashboard`, `/dashboard/**`, `/admin`, `/admin/**`) → `portalMiddleware()`: the pre-Wave-1 code, unchanged (session check, redirects, `DASHBOARD_PAGES`, 404 rewrites).
2. `/<locale>/<portal path>` (e.g. `/fr/login`) → 307 to the unprefixed portal path.
3. Unprefixed public path and `NEXT_LOCALE` is a non-default locale → 307 to `/<locale><path>` (query kept).
4. Everything else → next-intl (`as-needed` rewrite to `/en/...`, `/en/...` → unprefixed redirect).

Matcher: the three old portal patterns (so dotted portal paths behave as before) plus `/((?!api|_next|_vercel|.*\..*).*)`. `/opengraph-image` (no extension) goes through next-intl like a page; `/robots.txt`, `/sitemap.xml`, `/icon.svg`, `/favicon.ico`, `/logo.png`, `/images/*` skip it. Edge-safe (next-intl's middleware, Web Crypto sessions).

**Adding a public page:** nothing to do in middleware (unknown paths 404 via `[...rest]`). **Adding a portal page:** add it to `DASHBOARD_PAGES` / the admin check as before.

---

## 5. Messages

### Layout and ownership

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
| `locale` | language switch, French banner | C | C |

Rules: a stream edits only its own namespace files, in **both** locales, in the same change (French may be an English copy only where the owner is C). Keys a stream needs in someone else's namespace (e.g. B's analytics paragraph in `legal`) are added under a clearly named sub-object to both `en` and `fr` (English copy in `fr`) and listed for C. `i18n/messages.ts` already imports every file: **adding keys never requires touching the loader**; adding a new namespace (not planned) would.

### Conventions

- **Keys**: camelCase, nested by page section: `home.hero.title`, `services.sections.rental.paragraphs.first`, `contact.form.errors.nameMissing`. Metadata at `<ns>.meta.title` / `<ns>.meta.description`.
- **No arrays.** Lists are objects keyed by stable ids; the order lives in code: `const STEPS = ["onboard", "manage", "grow"] as const;` then `t(\`steps.${id}.title\`)` (typed: the union of literal keys type-checks).
- **Facts stay in data**, interpolated with ICU placeholders: `{name}`, `{phone}`, `{email}`, `{company}`, `{count, plural, one {# open ticket} other {# open tickets}}`, `{maxFee, number, percent}` (pass `company.pricing.maxFeeRate`). The brand name "Bellavere" may appear literally in prose. Never put a phone, email, URL or figure in a message.
- **Exact English**: copy characters exactly (’ “ ” — – · …). JSX entities become the characters (`&rsquo;` → `’`, `&amp;` → `&`). Adjacent JSX text joins with one space. ASCII `'` is fine except directly before `{`/`}`; never use `<` or `>` as text (they are tags).
- **Rich text** for links/bold inside sentences: `"…described in the <link>privacy policy</link>"` + `t.rich("consent", { link: (chunks) => <Link href="/privacy">{chunks}</Link> })`; `<strong>` likewise.
- **Everything user-visible**: text, `aria-label`, `alt`, `title`, `placeholder`, `aria-roledescription`, validation and error messages, `<option>` text, sr-only text, metadata.
- **Server components**: `const t = await getTranslations("ns")` (async) or `const t = useTranslations("ns")` (non-async). Pages already call `getPageLocale(params)`; keep it first. Need the locale? `const locale = await getPageLocale(params)` in pages, `useLocale()` elsewhere.
- **Client components**: `useTranslations("ns")` only for `CLIENT_NAMESPACES`; otherwise receive strings as props.
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

- `app/[locale]/(site)/estimate/page.tsx` (+ `generateMetadata` via `localizedMetadata(path "/estimate")`), `components/estimator/*`, `lib/estimator.ts` (pure calculation, EUR in, uses `EUR_TO_MUR` via `useMoney`), `messages/{en,fr}/estimator.json` (French written by A).
- On result: `track("Estimator Completed", {...})`; `useWhatsAppOverride({ message: t("whatsappMessage", {...}) })`.
- Tell B to add `/estimate` to the sitemap. The header link already exists.

### Phase 1B — WhatsApp, analytics, SEO

- `components/whatsapp/WhatsAppButton.tsx` redesign (WhatsApp glyph as an inline SVG like `SocialIcons`, motion, hide rules), `components/whatsapp/WhatsAppContactCards.tsx` (Ankit + Nihal via `WHATSAPP_NUMBERS`) inserted on the contact page, `messages/{en,fr}/whatsapp.json` (French written by B).
- `components/analytics/Analytics.tsx`: Plausible `<Script>` only when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set; `next.config.ts` CSP (`script-src`/`connect-src` for plausible.io); privacy-policy paragraph (legal namespace, see ownership rule) — Plausible is cookieless, so still no consent banner.
- `app/sitemap.ts`: both locales with `alternates.languages`, add `/estimate`; `app/robots.ts` unchanged apart from the sitemap URL. Optionally `.env.example` (variable already documented).

### Phase 1C — French and the language switch

- Translate every `messages/fr/*.json` owned by C (common, home, services, about, contact, legal, locale) — natural, polished *vouvoiement*; keep facts as placeholders; `npm run i18n:check` must show 0 untranslated except proper nouns (extend `IDENTICAL_VALUES` in the script when a value is legitimately the same).
- `components/site/LanguageToggle.tsx` final design; `components/site/LocaleBanner.tsx` (one-time, dismissible, shown when `navigator.languages` prefers French and no `NEXT_LOCALE`; remembers dismissal; never redirects; uses `writeLocaleCookie`).
- Check French layouts: header at 1024/1280/1440 (labels are longer), buttons, forms, 404/error pages, OG image text. Privacy page: mention the `NEXT_LOCALE` preference cookie.

### Phase 2 — consolidation

- Merge `messages/<locale>/*.json` into `messages/en.json` / `messages/fr.json` (top-level keys = namespaces); `i18n/messages.ts` imports the two files; `scripts/i18n-check.mjs` reads the merged files; delete the folders.
- Remove the `@deprecated` prose from `data/company.ts` once nothing public reads it (the portal keeps `hours`, `pricing.maxFeeRate`, facts).
- `npm run i18n:check -- --strict` passes (no hard-coded text, nothing untranslated).
- `scripts/review.mjs`: add the French routes (`/fr`, `/fr/services`, …), `lang` and hreflang checks, the cookie redirect, the localized 404. Update README, HANDOFF (file map, gotchas), REVIEW.

### Phase 3 — verification and launch

- `npm run build` (both locales ●), `node scripts/review.mjs http://localhost:3010` (and the admin flow by the user), visual diff of English pages against `screenshots/baseline`, Lighthouse on `/` and `/fr` pages.
- Client proofreads the French. Deploy; set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in Vercel; resubmit the sitemap in Search Console and check hreflang in URL Inspection; flip `HELLO_MAILBOX_LIVE` only when hello@bellaveremu.com receives mail.

---

## 8. Known limitations and gotchas

- **Portal is English-only** (`/fr/login` → `/login`).
- **404 body is client-rendered** for unknown public URLs (Next.js 15 sends an empty shell with status 404 for `notFound()` thrown while rendering; the page data renders "Lost at sea?" in the right language). Title and status are right without JavaScript.
- **global-error** stays English (it replaces the whole document and loads before any translation).
- **Typed keys**: `t("x.y")` is checked against the English files; template keys (`` t(`steps.${id}.title`) ``) need `id` typed as a union of literals.
- **Windows builds**: next-intl's plugin loads SWC's native addon; `i18n/swc-native-cache.cjs` keeps its cache in `node_modules/.cache/swc-native` because SWC refuses the default `%LOCALAPPDATA%\swc` on this machine ("Failed to load native binding").
- **Never** read cookies/headers in `[locale]` layouts/pages; never use `"./"` canonicals; never import `i18n/messages.ts` from client code (it would ship every message).
