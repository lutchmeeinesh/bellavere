# Bellavere website — handoff brief

Paste this whole file into a new chat to bring it fully up to speed. It covers what exists, how it fits together, the conventions to keep, and exactly what remains before the site can go live. **Last updated: 6 October 2026 (Wave 1: French, income estimator, WhatsApp).**

---

## 1. What this is

A polished **demo website for Bellavere** (trading as **Bellavere Property Care**), a property management and **syndic** company working **all around Mauritius** (north, west, east, south and the central plateau). It has two halves:

- **Marketing site:** home, services (five, including syndic & residence management), about, contact, privacy, terms, login, 404. There is deliberately **no public property portfolio** until real listings exist.
- **Owner dashboard** (`/dashboard/*`, auth-protected): each owner logs in and sees **only** their own properties (occupancy, bookings, revenue, maintenance, statements, documents, settings).
- **Admin area** (`/admin/*`): three Bellavere staff accounts see every owner, property, arrival, repair and document, and can open any owner's portal (§4c).

Every price and figure displays in **EUR or MUR**, at the visitor's choice (§4e).

**Wave 1 (October 2026)** added: the public site in **French** at `/fr/…` next to English at the unchanged URLs (§4f), a **rental-income estimator** at `/estimate` (five questions → a monthly and yearly range, the fee and the owner's net; it pre-fills the contact form and a WhatsApp message), **WhatsApp** (a floating button on every public page and a card each for Ankit and Nihal on the contact page), and **Plausible analytics**, off until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. The design is in `UPGRADE-PLAN.md`; the decisions in `ASSUMPTIONS.md` "Update 8".

It is still a **demo** for data: there's no database, and all owners and figures are mock data in `data/*.ts`. Auth, however, is now real in mechanism: HMAC-signed sessions, scrypt-hashed passwords, rate-limited sign-in (§4c). It is feature-complete and visually finished, but **not safe to put in front of real owners yet** (see §11).

**Location:** `C:\Users\user\bellavere` (its own git repo).
*Note: the original session had been started inside `C:\Users\user\QS ESTIMATOR\.git`, the internals of an unrelated repo, so the project was deliberately created in a clean folder. It has no relationship to QS ESTIMATOR.*

**Run it:**

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # passes with 0 TypeScript errors, 0 lint errors
```

Node 20+ required (built and tested on Node 24).

**Demo logins** (two accounts, password `demo1234`, listed on the login page with one-click fill so visitors can try the portal):

| Email | Owner | Portfolio | Paid in |
|---|---|---|---|
| `sophie@demo.bellavere.com` | Sophie Laurent | 2 villas + 1 apartment | EUR |
| `hamilton@demo.bellavere.com` | Hamilton Estates Ltd | 5 apartments | EUR |

### Confirmed company facts (from the client, 22 Sep 2026)

- **Legal entity:** **Bellavere Ltd**, Company No. **238321**, incorporated **19 August 2026** in Mauritius as a private company limited by shares (Certificate of Incorporation). Registered address not yet provided (not on the certificate).
- **Domain:** **bellaveremu.com** (Squarespace Domains), main address **www.bellaveremu.com**, on a fresh Vercel account from 30 Sep 2026. The first domain, **wwwbellavere.com**, stays registered **for email only**: Nihal's mailbox is and remains executive@wwwbellavere.com (client decision, 30 Sep 2026) on Google Workspace — keep the domain renewed, never touch its MX/SPF/DKIM records, and point its web address at the new site with Vercel redirects.
- **Name:** Bellavere (lowercase v; the original brief's "BellaVere" was retired). Trading name "Bellavere Property Care".
- **Team:** **Krit Goburdhan**, General Manager & Site Supervisor (surname confirmed by the client); **Ankit Dookhorun**, Client Relations (surname confirmed — his email is zoodookhorun@gmail.com); **Nihal Lutchmee** (no role given, so none shown).
- **Contacts (confirmed 22 Sep):** Ankit +230 5531 0734 and zoodookhorun@gmail.com; Nihal +230 5817 4529 and executive@wwwbellavere.com. Both reachable **every day, 24/7**. **Every query is answered the same day.** Social: Instagram and Facebook **bellavere.ltd**. Krit's email is **not** published.
- **Company email:** BellavereLtd@gmail.com
- **Mission:** "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you."
- **Currency:** MUR and EUR, user-selectable.
- **Fees:** negotiated and set after the first meeting, **never more than 15%**. Each owner's agreed rate is `Client.feeRate` and drives their statements (demo: Sophie 14%, Hamilton 12%).
- **Onboarding:** one to two weeks.
- **Coverage:** all around Mauritius, per the client's own map (`public/images/coverage-map.webp`, OpenStreetMap-based: keep the attribution caption).
- **No walk-in office:** no address on the contact page or in the footer.
- **Admins:** Krit (kritgoburdhan@gmail.com), Ankit (zoodookhorun@gmail.com), Inesh (lutchmeeinesh@gmail.com).
- **No fake filler (22 Sep 2026):** the client asked for every invented fact to be removed. Only the registered address remains `null` (and no BRN has been supplied) in `data/company.ts` and hidden until provided; no invented numbers, response times, service extras, policies or features; testimonials are kept (client's request) as clearly illustrative, initial-only names that differ from the demo owners.
- **Services:** also informed by the client's own syndic prospect list: syndic, common-area management, preventive maintenance, contractor coordination, inspections, pool/landscaping supervision, owner reporting, renovation follow-up. That list's third-party contact details are **not** used anywhere on the site.

---

## 2. Stack (fixed by the original brief; do not substitute)

- **Next.js 15.5.24** (App Router) · **React 19.1** · **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first config: the tokens live in `app/globals.css` via `@theme inline`; there is **no `tailwind.config.js`**)
- **Framer Motion 13** · **Recharts 3** · **lucide-react 1.x** · `next/font` (no external font links)
- **next-intl 4.14** (English/French; with `icu-minify`, its ahead-of-time message compiler) · **Vitest** (`npm test`: the estimator's calculation)
- Dev-only: **Playwright** + **Lighthouse** for the automated review script
- Images: `next/image`, with the Unsplash remote pattern whitelisted in `next.config.ts`

⚠️ **lucide-react v1 removed all brand icons.** The Instagram, Facebook and LinkedIn icons are hand-rolled SVGs in `components/site/SocialIcons.tsx`. Check an icon exists before using it: `node -e "console.log('IconName' in require('lucide-react'))"`.

⚠️ **`next/font/google` downloads the fonts at build time.** A network blip fails the build with a Turbopack "next/font/google import map" error; just rebuild.

---

## 3. How it was built (provenance)

1. **Phase 0 — foundation:** design tokens, fonts, motion primitives, the shared UI kit, mock data, the metrics engine, mock auth, middleware, header and footer.
2. **Phase 1 — five parallel agents,** each given the same written foundation brief: (A) Home+About, (B) Services+Properties, (C) Contact+Login+404, (D) Dashboard shell+Overview+Properties, (E) Bookings+Maintenance+Statements+Documents+Settings.
3. **Phase 2/3 — automated review:** a Playwright script (`scripts/review.mjs`) and Lighthouse. It found and fixed the streaming-404 isolation bug (§8).
4. **Round 2 (22 Sep 2026):** real company facts, the Bellavere spelling, the syndic service, the MUR/EUR switch, SEO (sitemap, robots, OG image, JSON-LD), privacy and terms pages, form spam protection, a newsletter endpoint, a photo/alt-text audit, and AA contrast fixes. See REVIEW.md "Round 2" and ASSUMPTIONS.md "Update — 22 September 2026".
8. **Round 6 (22 Sep 2026):** registration details from the Certificate of Incorporation, remaining facts confirmed (Krit's surname, 15% wording, Rs 52 rate, testimonials kept), **contact form now emails BellavereLtd@gmail.com via Resend** (17/17 end-to-end tests against a mock), `.env.vercel.local` prepared, deployment steps for wwwbellavere.com. See REVIEW.md "Round 6".
7. **Round 5 (22 Sep 2026):** real contacts (Ankit Dookhorun, Nihal Lutchmee, 24/7, same-day replies, Instagram/Facebook bellavere.ltd); an independent verification workflow caught a privacy leak (Krit's email in browser bundles), fixed along with the trust bar and count-up SSR values. See REVIEW.md "Round 5".
6. **Round 4 (22 Sep 2026):** every piece of fake filler stripped (multi-agent audit, 91 findings, three fix/verify rounds), public portfolio and newsletter removed, demo owners reduced to Sophie + Hamilton, testimonials renamed. See REVIEW.md "Round 4".
5. **Round 3 (22 Sep 2026):** three admin accounts and the `/admin` area, signed sessions + hashed passwords + login rate limit, negotiable fees (≤15%, per-owner rates), island-wide coverage with the client's map, "Visit us" removed, onboarding 1–2 weeks, pre-launch `SITE_INDEXABLE` / `DEMO_MODE` switches. See REVIEW.md "Round 3".
9. **Wave 1 (5–6 Oct 2026):** phase 0 foundation (next-intl, routing, two root documents, every string moved into messages), then three parallel streams (A estimator, B WhatsApp/analytics/SEO, C French + language switch), then an integration pass (localized 404 in the server HTML, client JavaScript cut back, accessibility fixes, layout sweep in both languages, docs). See `UPGRADE-PLAN.md` and ASSUMPTIONS.md "Update 8".

---

## 4. The five load-bearing ideas

### a. Design tokens — "luxury coastal"

These are defined once in `app/globals.css` and exposed to Tailwind. **Components must never use ad-hoc hex values.**

| Token | Hex | Use |
|---|---|---|
| `navy-900` / `navy-700` | `#0B1F33` / `#163A5C` | headings, dark sections, sidebar / hover |
| `sand-50` / `sand-100` / `sand-300` | `#FAF7F2` / `#F1EBE1` / `#D9CDB8` | page bg / cards & alt sections / borders |
| `gold-500` / `gold-600` | `#C9A45C` / `#B08D45` | accent: buttons, fills, active nav / hover |
| **`gold-700`** | `#7D6128` | **small gold text and icons** (eyebrows, badges) |
| `sea-500` / **`sea-700`** | `#3C8DAD` / `#2C6F8A` | charts, fills / **info text** |
| `ink-900` / `ink-500` | `#1C1C1C` / **`#666666`** | body / muted text |
| `success` `warning` `danger` | `#3E8E5B` `#D9902A` `#C8443B` | tints and fills |
| **`success-700` `warning-700` `danger-700`** | `#2F6E46` `#8F5A12` `#A8352D` | **semantic text** |

**Rule:** small text and icons use the `-700` tones. The brief's gold-600, sea-500 and semantic colours fall below WCAG AA (2.4–4.2:1) on light surfaces, and `ink-500` was nudged from `#6B6B6B` to `#666666` for the same reason. On navy backgrounds, use `gold-500` and white with opacity (at least `/60`).

Type: headings **Cormorant Garamond**, body **Inter**. `h1`–`h4` are styled globally. `.eyebrow` is the small uppercase gold-700 label (`.eyebrow-light` for navy backgrounds). Sections use `py-24 lg:py-32` and `<Container>` (1200px). Cards are `rounded-2xl` with a 1px sand-300 border, and shadows appear only on hover.

### b. The metrics engine — one source of truth for every number

`lib/metrics.ts` derives **everything** from the same generated bookings, so KPIs, charts and statements never disagree. Monthly revenue is bookings pro-rated by the nights stayed in each month; fee = the owner's agreed rate (`Client.feeRate`, capped at `company.pricing.maxFeeRate` = 15%); expenses = resolved ticket costs + recurring upkeep; net = gross − fee − expenses. `activityForClient(id, limit, formatAmount)` takes a money formatter so its sentences follow the visitor's currency. **Never hard-code a number in a component.**

### c. Auth, admins + data isolation

- **Signed sessions** (`lib/session.ts`, Web Crypto so it runs in middleware too): the cookie `bv_session` holds `{sub, role: "owner"|"admin", exp}` plus an HMAC-SHA256 signature keyed by `SESSION_SECRET`. Forged or tampered cookies fail verification. In production, a missing secret makes sign-in fail closed.
- **Passwords** (`lib/password.ts`): scrypt, format `scrypt:<salt>:<hash>` (colons on purpose, see §8). Demo owners' hashes are in `data/clients.ts`; **admin hashes only in env vars** named in `data/admins.ts`.
- **Admins** (`data/admins.ts`): `/admin` overview + `/admin/clients/[id]`. "Open portal" POSTs to `/api/admin/view-as`, which sets `bv_view_as`; the owner dashboard then renders that owner with an **Admin view** banner. `requireAdmin()` guards admin pages.
- `lib/auth.ts`: `getSession()`, `getAdmin()`, `getSessionClient()` (owner, or the admin's viewed owner), `requireClient()`, `requireAdmin()`, `verifyCredentials()`.
- `middleware.ts`: `/admin` admins only; `/dashboard` owners or admins with a viewed owner; property ownership 404 against the viewed owner (§8).
- **Rule:** every dashboard server page starts with `const client = await requireClient()` and filters everything by `client.id`.
- Switches: `DEMO_MODE=false` turns off the demo owners; `SITE_INDEXABLE=true` allows search indexing (default: noindex everywhere).

### d. Motion primitives

`template.tsx` → `PageTransition` (fade + rise 12px, 0.45s, a **CSS** animation). The hero's entrance is CSS too. `<Reveal>` / `<RevealStagger>` / `<RevealItem>` handle scroll reveals: they **render visible** and, after hydration, hide only blocks still below the fold until they scroll in — never render content at `opacity: 0` on the server (it stays blank until JavaScript loads; `review.mjs` checks this with JavaScript off). `<CountUp>` counts up stats. `prefers-reduced-motion` is honoured globally, through `MotionConfig` and the CSS, and per component.

### e. Currency — stored in EUR, shown in EUR or MUR

- **Every amount in `data/` is EUR.** Display goes through `lib/format.ts`: `formatMoney(eur, currency)`, `formatMoneyPrecise`, `formatMoneyCompact` ("Rs 624k"), and `EUR_TO_MUR = 52` (confirmed by the client; deliberately a **whole number** so converted statements still add up to the rupee).
- The choice lives in the **`bv_currency` cookie**, the single source of truth. **Public pages are static**, so the root `<CurrencyProvider>` reads the cookie in the browser (`useSyncExternalStore`): the server HTML is in EUR and switches to MUR while hydrating (only the home preview, below the fold, shows money). The **dashboard and admin layouts** read it on the server with `getCurrency()` and pass `initialCurrency` to their own provider, so the portals' first paint is already right. All providers stay in sync (a window event, plus `BroadcastChannel` for other tabs). **Never read cookies/headers in the root or `(site)` layout** — it makes every public page dynamic again (the `(site)` layout has `dynamic = "error"`, so the build fails instead).
- **Client components** use `useMoney()` → `{ currency, format, formatPrecise, formatCompact, convert, symbol, setCurrency }`. **Server components** render `<Money eur={x} />` (a client leaf), or call `formatMoney(x, await getCurrency())` when they need a string.
- `setCurrency` writes the cookie and notifies every provider; in the portals it also calls `router.refresh()` so server components re-render.
- The UI switch is `<CurrencyToggle>` (header on desktop and mobile, dashboard top bar, Settings → Display currency). `<ConversionNote>` shows "converted at €1 = Rs 52" whenever rupees are displayed.
- A **payout currency** per owner (`Client.payoutCurrency`) is separate from the display currency.
- **Never write a currency symbol by hand.**

### f. Internationalisation — English and French (next-intl)

- **URLs**: English unprefixed and unchanged (`/`, `/services`, …), French under `/fr` (`/fr`, `/fr/services`, …), `/en/…` redirects to the unprefixed URL. No browser-language redirect; a one-time card suggests French to French-speaking browsers on English pages. The `NEXT_LOCALE` cookie is written only when the visitor picks a language, and then sends unprefixed URLs to French (`middleware.ts`). The portal stays English at its URLs.
- **Two root documents** under a pass-through `app/layout.tsx`: `app/[locale]/layout.tsx` (public, `<html lang="en|fr">`) and `app/(portal)/layout.tsx` (English). Both build on `components/document/RootDocument.tsx` (fonts, CSS, client providers); `app/not-found.tsx` uses the bare `HtmlDocument`.
- **Static in both languages**: every public page/layout starts with `await getPageLocale(params)` (`lib/i18n/server.ts`, which calls `setRequestLocale`) and never reads cookies or headers; metadata comes from `localizedMetadata()` (canonical, hreflang en/fr/x-default, Open Graph per language).
- **Wording** in `messages/en.json` and `messages/fr.json`, one file per language whose top-level keys are the namespaces (common, home, services, about, contact, legal, estimator, whatsapp, analytics, locale), loaded by `i18n/messages.ts`; keys are typed from `messages/en.json` (`global.d.ts`). Facts stay in `data/*` and go in through placeholders. `npm run i18n:check` checks parity, placeholders and leftovers.
- **What the browser gets**: only the message keys its client components read: `SITE_CLIENT_MESSAGES` (root document) plus the page's `PAGE_CLIENT_MESSAGES` (`<ClientMessages>` around the page's client components). Messages are compiled ahead of time and formatted by next-intl's small precompiled formatter (no ICU parser in the bundle).
- **Formatting**: `lib/format.ts` and `useMoney()` take the locale ("24 960 €", "Rs 24 960", "22 septembre 2026"; English unchanged).
- **Links**: `Link`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/navigation` (hrefs written without a locale; portal paths stay unprefixed and are not prefetched); never `next/link` in public code.

---

## 5. File map

```
app/
  layout.tsx                 pass-through (the two root documents are below)
  globals.css                ALL design tokens + keyframes  <- edit tokens here only
  sitemap.ts robots.ts       SEO, both languages (robots: noindex until SITE_INDEXABLE=true)
  not-found.tsx  global-error.tsx  icon.svg   last-resort pages (English, own document)
  [locale]/                  PUBLIC SITE, en + fr: layout (root document), error, not-found,
                             opengraph-image (per language), page-not-found/ (static 404 page),
                             [...rest]/route.ts (unknown URL -> that page with status 404)
    (site)/                  Header + Footer + JsonLd + WhatsApp button + page transition
      page.tsx  about/  services/  contact/  privacy/  terms/  estimate/
  (portal)/                  OWNER PORTAL, English: layout (root document), error
    login/page.tsx           standalone login (owners -> /dashboard, admins -> /admin)
    admin/                   staff area: page.tsx (overview), clients/[id]/, layout, template
    dashboard/               protected owner portal (layout, template, loading, not-found)
      page.tsx  properties/  properties/[id]/  bookings/  maintenance/
      statements/  documents/  settings/
  api/
    auth/login  auth/logout    signed session, failed-attempt rate limit
    admin/view-as/route.ts   admin opens / leaves an owner's portal
    contact/route.ts         validate + honeypot + rate limit + consent log + Resend email (PUBLIC_EMAIL), with the enquirer's language

components/
  ui/        Container Button(+buttonClasses) Badge Card SectionHeading Reveal CountUp
             Input(+Field/Select/Textarea/Checkbox) Toggle Modal Tabs Skeleton
  currency/  CurrencyProvider(useMoney) Money(MoneyCountUp, ConversionNote) CurrencyToggle
  site/      Header Footer Logo(+LogoMark) SocialIcons JsonLd LanguageToggle LocaleBanner(+LocaleSuggestion)
             NotFoundScreen SiteError
  document/  RootDocument HtmlDocument          i18n/  ClientMessages MergeIntlMessages IntlClientProvider LocaleLink
  estimator/ EstimatorFlow EstimateResult ChoiceCards BedroomStepper FeatureChips WeeksSlider IslandMap …
  whatsapp/  WhatsAppProvider WhatsAppButton WhatsAppContactCards WhatsAppLink WhatsAppIcon
  analytics/ Analytics (Plausible script, only with NEXT_PUBLIC_PLAUSIBLE_DOMAIN)
  admin/     AdminHeader AdminTable ViewAsButton AdminViewBanner
  motion/    MotionProvider PageTransition
  home/ about/ services/ contact/ auth/
  dashboard/ PageHeader ActivityIcon shell/ overview/ properties/ bookings/
             maintenance/ statements/ documents/ settings/(incl. DisplayCurrencySettings)

data/        company site(PUBLIC_EMAIL, WhatsApp) estimator-config clients admins properties bookings
             maintenance documents testimonials siteImages
lib/         types auth session password currency format metrics dates rng rateLimit utils img constants
             estimator(+test) whatsapp analytics i18n/(server metadata images localeCookie paths)
i18n/        routing navigation request messages swc-native-cache.cjs
messages/    en.json fr.json                every word of the public site; top-level keys = namespaces
public/images/coverage-map.webp   the client's coverage map (keep the OSM attribution)
.env.example               every environment variable, documented
scripts/hash-password.mjs  generate an admin password hash
scripts/i18n-check.mjs     translations: key parity, placeholders, leftovers in English
middleware.ts              route protection + property-ownership 404 + language routing (next-intl)
scripts/review.mjs         Playwright review: routes, isolation, currency switch, 404s, screenshots
screenshots/               37 PNGs
README.md  ASSUMPTIONS.md  REVIEW.md  HANDOFF.md
```

---

## 6. Data model

The types are in `lib/types.ts`, and dates are ISO `yyyy-mm-dd` strings.

- **Client**: id, name, email, password (plain, demo only), payoutAccount, **payoutCurrency**.
- **Property**: 8 demo properties (p-01…p-03 Sophie, p-05…p-09 Hamilton), used only inside the portal demo; `managedSince` is 2026 so nothing implies history. nightlyRate is in EUR.
- **Booking / MaintenanceTicket / OwnerDocument**: statuses, costs and expiry dates as before.
- **Statement**: derived, never stored.

Bookings are **generated** by a seeded PRNG (`data/bookings.ts`) relative to `today()` (`lib/dates.ts`): the calendar day **in Mauritius**, whatever timezone the server or browser runs in, recomputed on every call. Date-relative mock data (bookings, documents, maintenance) is memoised per Mauritius day with `perDay()`, so it rolls forward at Mauritius midnight even on a long-running server, and server and browser agree (no hydration mismatches).

---

## 7. Verified quality bar (23 Sep 2026)

- `npm run build`: **0 TypeScript errors, 0 lint errors.**
- `node scripts/review.mjs`: **0 errors, 0 warnings across 33 checks.** Every route logged out and as both demo owners; brand fonts; every public page readable **without JavaScript**; cross-page section links; security headers; public pages static; hostile and malformed API requests (wrong shapes, cross-site posts, wrong methods, unknown endpoints); isolation (a real 404 status, no foreign names); logout; the currency switch; forged and tampered cookies rejected; owners kept out of `/admin`; wrong admin password refused; and the full admin flow (all owners listed, open an owner's portal with banner, isolation inside it, back to admin). Admin flow needs `ADMIN_TEST_EMAIL` / `ADMIN_TEST_PASSWORD`. Against a deployed URL it also scans the live JavaScript for secrets and checks the edge cache.
- **Lighthouse desktop:** every public page scores **99–100** in performance, accessibility, best practices and SEO. The dashboard scores 96–100 on accessibility. Login and dashboard SEO is 63–66 **by design**, because robots.txt blocks them.
- Statements in MUR reconcile exactly: Rs 847,704 − 152,568 − 31,980 = Rs 663,156.
- **Every photo has been visually checked against its alt text** (52 alts rewritten in round 2).

**Wave 1 integration (6 Oct 2026):**

- `npx tsc --noEmit`, `npm run lint`, `npm test` (42 estimator tests), `npm run i18n:check` (570 keys, 0 parity / placeholder errors, nothing untranslated or hard-coded) and `npm run build` (every public page ● in `en` and `fr`) all clean.
- `node scripts/review.mjs`: **0 errors, 0 warnings** (admin flow skipped without credentials), including the new check that `/no-such-page`, `/services/no-such-section` and `/fr/no-such-page` answer 404 with the localized page without JavaScript.
- **axe-core** (WCAG 2.2 AA + best practices): no violations on any public page in either language at 390 and 1280 px, the estimator's result and the 404 included.
- **First Load JS** (build output): `/` 204 kB, `/services` and `/about` 197, `/contact` 199, `/estimate` 205, `/privacy` and `/terms` 192 — down from 227–240 kB at the end of phase 1 (184–193 kB before Wave 1).
- **Lighthouse mobile** (simulated throttling, local `next start`): `/` 89–90, `/fr` 90–91, `/estimate` and `/fr/estimate` 93 in performance; accessibility and best practices 100; SEO 66–69 only because a local build is `noindex` (`SITE_INDEXABLE` unset). Pre-Wave-1 `/` scored 90–91 on the same machine.
- Estimator end to end in both languages (questions, deep links, keyboard, result, currency switch, contact pre-fill, WhatsApp message), and the French contact form (labels, validation, every server error code, success, and an enquiry through a stand-in for Resend showing "Language: French").
- **Phase 2 consolidation (6 Oct 2026):** messages merged into `messages/en.json` / `messages/fr.json`, 7 unused keys removed (563 keys). Re-run clean: `npx tsc --noEmit`, `npm run lint`, `npm test` (42), `npm run i18n:check -- --strict`, `npm run build` (same First Load JS as above), `node scripts/review.mjs` (0 errors, 0 warnings), and a Playwright pass over every public page in both languages at 1440 and 390 px (phone menu open, estimator walked to its result, contact form validation, the language suggestion): 0 console errors, no raw message keys or unformatted placeholders.

**Re-run:**

```bash
npm run build
npx next start -p 3010
node scripts/review.mjs http://localhost:3010
```

Lighthouse is no longer a dependency (it slowed every Vercel build): run `npx lighthouse@12 <url> --preset=desktop`. If `chrome-launcher` can't spawn Chrome, launch Playwright's Chromium with `--headless=new --remote-debugging-port=9222` and add `--port=9222`. Dashboard pages need a real signed session: sign in with Playwright (or `curl -c`) and pass its `bv_session` value with `--extra-headers='{"Cookie":"bv_session=<value>"}'`.

---

## 8. ⚠️ Non-obvious gotchas (fixed; do not regress)

1. **Streaming kills 404 status codes.** The dashboard has `loading.tsx`, so it streams, and once streaming starts Next.js 15 can't change the HTTP status — not even from `generateMetadata`. An in-page `notFound()` only swaps the UI (you get a 200). **`middleware.ts` therefore decides every portal 404**: unknown paths and other owners' property ids are rewritten, **with status 404**, to `/dashboard/__missing` (rendered inside the portal by `app/dashboard/[...missing]` under `next start`; **on Vercel the platform answers a 404 status with the site-wide "Lost at sea?" page** — verified live, and fine: the status is a real 404 and nothing about the other owner is shown), and unknown admin paths to `/admin/clients/__missing`. **Every new dashboard page must be added to `DASHBOARD_PAGES` in `middleware.ts`, and every new admin route to its admin check**, or it will answer with the portal 404.
2. **Streaming also moves `<meta>` into `<body>`.** The portals render per request, and Next.js 15 streams their metadata after `</head>`. `htmlLimitedBots: /.*/` in `next.config.ts` keeps it in `<head>`. **Don't remove it.**
3. **`Card` hard-codes `bg-white`.** Classes are joined with `cn()` (no tailwind-merge), so passing `bg-navy-900` does NOT override it; the white wins. For dark cards, use a plain element (see the syndic card in `components/home/ServicesOverview.tsx`).
6. **`data/company.ts` ships to the browser.** Client components (Hero, FaqAccordion) import it, so every value in it is public, even if never rendered — Krit's personal email leaked into the JS bundles this way until round 5. Keep private data in server-only modules (`data/admins.ts`, `.env`). `scripts/review.mjs` now scans the built bundles for secrets.
5. **Never use `$` inside values in `.env` files.** Next.js's loader expands `$name`, which silently corrupted the original `$`-separated password hashes (120 → 80 characters, logins failed). Hashes now use `:`.
4. **Rupee formatting uses a non-breaking space** ("Rs\u00a024,960"), everywhere including hand-built strings (`currencySymbol()`). Tests and greps must match `\u00a0` (or `\s`), not a normal space.
7. **The font variables belong on `<html>`.** The theme tokens `--font-serif` / `--font-sans` live on `:root` and reference the `next/font` variables; on `<body>` they resolve to nothing and the whole site silently falls back to the system font (it shipped like that until round 7).
8. **"Today" is the Mauritius date, recomputed on each call** (`today()` in `lib/dates.ts`). Never cache a date at module level (a warm server would go stale); mock data generated relative to today goes through `perDay()`. Parse `yyyy-mm-dd` with `parseISODate`, never `new Date(iso)` (that is UTC midnight: the previous day west of UTC).
9. **Forms need `method="post"`.** Pages are static, so a visitor can submit before the JavaScript loads; without it the browser would put the fields (including a password) in the URL.

**Wave 1 (English/French, estimator, WhatsApp):**

10. **`notFound()` on a public page sends an empty document.** In Next.js 15.5 a `notFound()` thrown while rendering escapes the server render (React has no error boundaries on the server): the response is a 404 with an empty `<html id="__next_error__">` shell and the not-found UI is drawn in the browser. Unknown public URLs therefore go to `app/[locale]/[...rest]/route.ts`, which returns the static `/<locale>/page-not-found` page's HTML with status 404 (`UPGRADE-PLAN.md` §8). Don't bring back a `[...rest]/page.tsx` (it would also conflict with the route) and don't answer public 404s with a middleware rewrite: Vercel replaces those with the site-wide English 404.
11. **Never read cookies or headers under `app/[locale]`.** The pages are static in both languages because every page and layout calls `getPageLocale(params)` (`setRequestLocale`) first; `getLocale()`, `cookies()` or `headers()` there make every public page dynamic (the `(site)` layout's `dynamic = "error"` fails the build instead).
12. **A client component only sees the messages sent to the browser.** `useTranslations` in a `"use client"` file reads `SITE_CLIENT_MESSAGES` plus the page's `PAGE_CLIENT_MESSAGES` (`i18n/messages.ts`, `<ClientMessages>`); anything else shows the key and logs `MISSING_MESSAGE`. Add the key path to the list, or pass the text as a prop. Never import `i18n/messages.ts` from client code (it would ship every message).
13. **Messages are precompiled.** `next.config.ts` aliases `use-intl/format-message` to next-intl's precompiled formatter and `i18n/messages.ts` compiles every message: `t.raw()` throws, and a named number style (`{n, number, percent}`) must be declared in `MESSAGE_FORMATS` (`i18n/routing.ts`), or it prints "0.15".
14. **Windows: SWC's native cache path.** next-intl's plugin loads SWC's native addon while `next.config.ts` loads; `i18n/swc-native-cache.cjs` points its cache at `node_modules\.swc` of the main checkout (the default `%LOCALAPPDATA%\swc` is refused on this machine, and a worktree's own `node_modules` would pass 260 characters). Keep it imported first in `next.config.ts`.
15. **Public links: `@/i18n/navigation`, never `next/link`.** Its `Link` adds `/fr` on French pages, leaves portal paths unprefixed and does not prefetch them. URLs for metadata come from `localizedPath()` / `getPathname()`, never from the route path (English pages are served from `/en/…` internally).
16. **Hide the WhatsApp button from the server HTML too.** `useWhatsAppOverride({ hidden: true })` only acts after hydration; a page that hides the button from its first paint also renders `data-whatsapp-hidden` (see the estimator; `app/globals.css`).
17. **French typography in messages:** no-break spaces (U+00A0) before `: ; ! ?` and `%` and inside « », and between words that must stay together ("A à Z"); `npm run i18n:check` checks parity and placeholders, not typography.

---

## 9. Conventions to keep

- Server components by default; `"use client"` only where needed. `params` and `searchParams` are Promises in Next 15, so await them.
- Reuse `components/ui/*` and never fork it. Money goes through the currency helpers (§4e). Small text uses the `-700` tokens (§4a).
- No ad-hoc hex; no `any`; lint is part of the build.
- **Every image's alt text must describe what the photo actually shows.** Look at the image; a URL returning 200 proves nothing about its content.
- No gendered pronouns for the team; use names or roles.
- Invented company facts get `{/* TODO: confirm with client */}`. **Don't publish track-record claims** (property counts, years, ratings, testimonials) until they are real.

---

## 10. Deliberate limitations of the demo

- The maintenance "Report an issue" button and the settings forms only change local state; nothing is saved or sent (the UI says so).
- The contact endpoint emails each enquiry through Resend; `RESEND_API_KEY` is required in production — without it (or if Resend fails) the visitor is shown the direct contacts.
- Rate limiting is in-memory, so it is per server instance.
- Statement "Download PDF" opens a print window, and the document downloads are decorative.
- Email notifications don't exist yet; the Settings card says so rather than showing fake toggles.
- Imagery is Unsplash stock. The testimonials are illustrative, not real people.
- The owner portal, `global-error` and the 404 outside the site's languages are English only.
- The estimator's figures are demo defaults (`[CONFIRM]` in `data/estimator-config.ts`): an indicative range, not a valuation.

---

# 11. WHAT'S LEFT TO GO LIVE

✅ = done. 🔴 = hard blocker before real owner data.

## 🟡 A. Auth — mostly done

- ✅ Signed, expiring sessions; scrypt-hashed passwords; failed-login rate limit; three real admin accounts with env-held hashes; `DEMO_MODE` switch.
- ⬜ Owners still live in `data/clients.ts`. Real owners need a database-backed account system with **password reset and email verification** (Supabase Auth recommended; keep the `requireClient()` / `requireAdmin()` contract so pages don't change).
- ⬜ Rate limiter is in-memory → Upstash on Vercel. Consider 2FA for admins.

## 🔴 B. Real database + staff admin

Recreate `data/*.ts` + `lib/metrics.ts` as Supabase tables and queries, keeping the maths identical, with **row-level security on `client_id`**. Decide the booking source: manual entry, or a channel-manager sync (Beds24 / Smoobu / Hostaway; usually the largest single job). ✅ A **read-only staff admin area** exists (`/admin`). ⬜ Admins still can't *edit* anything (add bookings, update tickets, upload documents, publish statements) — that needs the database. Syndic clients (residences) will likely need a co-owner / common-area data model that the current owner-centric model doesn't cover.

## 🟡 C. Content — 8 `TODO: confirm with client` markers

- ✅ Name, team, email, mission, currency, syndic service, fees (negotiable, ≤15%), onboarding (1–2 weeks), island-wide coverage + map, no walk-in office.
- ✅ All fake filler stripped: placeholder contact details hidden, invented metrics/response times/service extras/policies/features removed, public portfolio removed, demo owners reduced to two.
- ✅ Phone numbers, 24/7 availability, same-day replies, Instagram and Facebook (round 5).
- ✅ Legal name Bellavere Ltd, Company No. 238321, incorporated 19 Aug 2026 (private company limited by shares); Krit's surname; the 15% wording.
- ⬜ In `data/company.ts`: **registered address and BRN** (neither is on the certificate), tagline, bios, and a role for Nihal if there is one.
- ✅ EUR→MUR rate confirmed at €1 = Rs 52 (storing real dual prices per record stays optional).
- ✅ Testimonials kept as they are by client decision (22 Sep 2026); swap in real quotes if any arrive.
- ⬜ Real photography.
- ⬜ A public portfolio page once there are real listings (the old one is in git history: commit `cdb2f9f`).
- ✅ Ankit's email is published (client's request); Krit's stays private.

## 🟡 D. Wire up the stubs

| Stub | Status |
|---|---|
| Contact form | ✅ Honeypot, rate limit, consent record, same-site JSON only, delivery via Resend. ⬜ Verified sending domain (`CONTACT_FROM_EMAIL`) |
| Newsletter | Removed (Bellavere doesn't send one yet). Restore from git history when it does |
| Rate limiting | ⬜ Move to Upstash Redis on Vercel |
| Date-range selector | ✅ Removed (replaced by the currency switch) |
| Statement PDF / document downloads | ⬜ Server-side PDFs; Supabase Storage with signed URLs |
| Maintenance tickets, settings | ⬜ Persist to the DB |
| Map | ⬜ Embedded map once the address is confirmed |

## 🟢 E. Infrastructure & SEO

- ✅ `sitemap.ts`, `robots.ts`, OG image, Organization JSON-LD with logo, canonical + Open Graph URLs, metadata kept in `<head>`.
- ✅ Ran live on Vercel (GitHub `main` auto-deploys) at wwwbellavere.com; functions in **cpt1**; public pages served from the edge cache; security headers + CSP; `[env]` start-up check (Vercel → Logs).
- ⬜ **Move to www.bellaveremu.com on a new Vercel account** (30 Sep 2026): steps in README → "Deploying"; `.env.vercel.local` already holds the new address and a fresh `SESSION_SECRET`. ✅ Done 30 Sep 2026: new Vercel project live at www.bellaveremu.com (cpt1), Resend verified on `bellaveremu.com`, contact form delivering (test accepted). ⬜ Add `wwwbellavere.com` + `www.wwwbellavere.com` to the Vercel project as redirects to www.bellaveremu.com (the old address currently shows Vercel's DEPLOYMENT_NOT_FOUND).
- ✅ **Indexing switched on 30 Sep 2026:** `SITE_INDEXABLE=true`, Google Search Console (Domain property `bellaveremu.com`, verified by DNS TXT), sitemap submitted, home page indexing requested. The three illustrative testimonials are therefore public — replace them with real quotes.
- ✅ Analytics ready (Wave 1): Plausible, cookieless, so no consent banner; switch it on with `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and the three goals (README → "Analytics"). ⬜ Replace the Unsplash remote pattern with self-hosted photos; Sentry, an uptime monitor (the audit saw a 2–3 minute `DEPLOYMENT_NOT_FOUND` during domain changes); Google Business Profile.
- ⬜ Instagram and Facebook: `bellavere.ltd` does not appear to exist publicly on either yet — create/publish them or correct the handles in `data/company.ts`.

## 🟢 F. Legal & compliance

- ✅ `/privacy` (Mauritius DPA 2017 + GDPR) and `/terms` templates; consent checkbox links to the privacy policy.
- ⬜ **Lawyer review** of both pages; BRN, registered address and retention periods; the real management agreement.

## 🟢 G. Nice-to-have

Owner date-blocking (the FAQ promises it), ✅ a French version (Wave 1; the client should proofread it), in-dashboard messaging with Ankit, owner document upload, email notifications matching the settings toggles, and syndic-specific portal views (common-area tickets, co-owner statements).

---

## Suggested sequencing

1. **Now, in parallel:** the client supplies the ⬜ facts in C plus photography, **while** a developer builds auth + database (A, B).
2. **Then:** the staff admin side, channel-manager sync, Resend, and persistence (D).
3. **Then:** domain, analytics (Plausible, no banner needed), the legal review (E, F).
4. **Launch:** remove the demo disclaimers and demo accounts, re-run `scripts/review.mjs` + Lighthouse, verify isolation with real accounts.
