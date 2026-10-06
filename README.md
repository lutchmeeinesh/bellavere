# Bellavere — demo website

A polished demo site for **Bellavere** (trading as Bellavere Property Care), a property management and syndic company working all around Mauritius: marketing site, owner dashboard and staff admin area, with mock data and signed-cookie auth. Prices and figures display in **EUR or MUR**, visitor's choice.

**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · lucide-react. A small backend (sign-in, the contact form via Resend), no database: owners and figures are mock data.

**Live:** https://www.bellaveremu.com (Vercel, deployed from GitHub `main`), since 30 Sep 2026.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 (French: http://localhost:3000/fr). Node 20+ required. `npm run build` passes with zero TypeScript/lint errors.

## Admin accounts (Bellavere staff)

Three administrators can see **every owner's information** at `/admin` and open any owner's portal ("Open portal", with an "Admin view" banner and a "Back to admin" button):

| Admin | Login email |
| --- | --- |
| Krit Goburdhan | kritgoburdhan@gmail.com |
| Ankit Dookhorun | zoodookhorun@gmail.com |
| Lutchmee Inesh | lutchmeeinesh@gmail.com |

Passwords are **not in the code**. Temporary passwords were generated into `ADMIN-CREDENTIALS.local.md` (git-ignored) and their scrypt hashes into `.env.local` (git-ignored). Hand each person their password privately, then delete that file. To change a password: `node scripts/hash-password.mjs "new password"`, then put the output in the matching `ADMIN_*_PASSWORD_HASH` variable locally and in Vercel.

## Demo accounts (owner dashboard)

Two demo owners let visitors try the portal: a private owner and a company. Their properties and figures are fictional and appear only inside the portal demo; there is no public property portfolio.

Every account sees **only its own properties** — server-side filtering plus 404s on foreign ids.

| Email | Password | Portfolio |
| --- | --- | --- |
| `sophie@demo.bellavere.com` | `demo1234` | Sophie Laurent — 2 villas + 1 apartment |
| `hamilton@demo.bellavere.com` | `demo1234` | Hamilton Estates Ltd — 5 apartments |

The login page lists these with one-click "Use" buttons.

## Where things live

| Area | Path |
| --- | --- |
| Design tokens (colors, type, radius, shadows) | `app/globals.css` |
| Company facts: names, numbers, contacts, ids (their wording, in both languages: messages `common.company.*`) | `data/company.ts` |
| Site-wide settings: public email, WhatsApp numbers, site URL | `data/site.ts` |
| Income estimator: every figure it uses / the calculation | `data/estimator-config.ts` / `lib/estimator.ts` (tests: `lib/estimator.test.ts`) |
| WhatsApp button and contact cards | `components/whatsapp/*` (numbers and default messages in `data/site.ts`) |
| Analytics (Plausible, off until configured) | `lib/analytics.ts`, `components/analytics/Analytics.tsx` |
| Public site (English `/…`, French `/fr/…`) | `app/[locale]/*` |
| Owner portal and sign-in (English only) | `app/(portal)/*` |
| Wording, both languages | `messages/en.json`, `messages/fr.json` (see "Internationalisation") |
| Mock data (clients, properties, bookings, tickets, documents) | `data/*.ts` |
| Derived numbers — charts, KPIs, statements all agree | `lib/metrics.ts` |
| Auth: signed sessions, hashed passwords, admins | `lib/session.ts`, `lib/password.ts`, `lib/auth.ts`, `data/admins.ts`, `app/api/auth/*`, `middleware.ts` |
| Admin area | `app/(portal)/admin/*`, `components/admin/*`, `app/api/admin/view-as` |
| Environment variables | `.env.example` (template), `.env.local` (your secrets, git-ignored) |
| Shared UI primitives | `components/ui/*` |
| Automated review script (screenshots + checks) | `scripts/review.mjs` |

## Company facts

**Confirmed by the client (22 Sep 2026)** and now live on the site:

| Fact | Value | Where |
| --- | --- | --- |
| Name | Bellavere (trading name: Bellavere Property Care) | `data/company.ts` |
| Legal entity | **Bellavere Ltd**, Company No. **238321**, incorporated 19 Aug 2026 in Mauritius as a private company limited by shares (Certificate of Incorporation, CB No 82650) | `data/company.ts` |
| Enquiries | Contact form emails **BellavereLtd@gmail.com** (via Resend) | `app/api/contact/route.ts`, `PUBLIC_EMAIL` in `data/site.ts` |
| Team | Krit Goburdhan — General Manager & Site Supervisor; Ankit Dookhorun — Client Relations; Nihal Lutchmee | `data/company.ts` (names), messages `common.company.team` (roles, bios) |
| Contacts | Ankit Dookhorun +230 5531 0734, zoodookhorun@gmail.com · Nihal Lutchmee +230 5817 4529, executive@wwwbellavere.com — both reachable every day, 24/7 | `data/company.ts` (`contacts`) |
| Response time | Every query answered the same day | messages `common.company.responseTime` |
| Social | Instagram and Facebook: bellavere.ltd | `data/company.ts` (`social`) |
| Company email | BellavereLtd@gmail.com (hello@bellaveremu.com once it has a mailbox: flip `HELLO_MAILBOX_LIVE`) | `PUBLIC_EMAIL` in `data/site.ts` |
| Mission | "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you." | messages `common.company.mission` |
| Currency | MUR and EUR, visitor chooses | `lib/format.ts` |
| Fees | Negotiated and set after the first meeting; never more than 15% (each owner's agreed rate drives their statements) | `data/company.ts` (`pricing.maxFeeRate`), `data/clients.ts`, messages `common.company.pricing` |
| Onboarding | One to two weeks | `components/contact/FaqAccordion.tsx` |
| Coverage | All around Mauritius (the client's own map) | `public/images/coverage-map.webp`, About page |
| Services incl. syndic | From the client's own prospect-list outreach copy | `app/[locale]/(site)/services/page.tsx` |

Ankit's and Nihal's emails and both phone numbers are published on the contact page at the client's request. **Krit's email is not published** and is kept only in `data/admins.ts` (server-side) — `data/company.ts` is bundled into browser code, so it must never hold private data. Krit's surname (Goburdhan) was confirmed by the client on 22 Sep 2026.

## Placeholders still waiting on company info

**All fake filler was stripped on 22 Sep 2026.** Anything unconfirmed is either removed or hidden until real. 8 `{/* TODO: confirm with client */}` markers remain; search for that string to see each one.

| Still needed | Currently | Where |
| --- | --- | --- |
| Registered address | not shown (it isn't on the Certificate of Incorporation); legal pages list it once set | `data/company.ts` |
| Tagline | "Your property, perfectly managed." | messages `common.company.tagline` |
| Bios | written from the confirmed roles | messages `common.company.team.<id>.bio` |
| Testimonials | **kept by client decision (22 Sep 2026)** — 3 illustrative quotes (Élise M., Deepak R., Nathalie C. — not real people, not the demo owners). Replace with real quotes, with permission, before the site is public | `data/testimonials.ts` |
| Legal pages | templates for a lawyer to review; retention periods TODO | `app/[locale]/(site)/privacy`, `app/[locale]/(site)/terms` |
| Imagery | Unsplash stock (marketing pages + the portal demo) | `data/siteImages.ts`, `data/properties.ts` |

## Currency (EUR / MUR)

- All amounts are **stored in EUR**; the visitor picks EUR or MUR with the switch in the site header, the dashboard top bar, or Settings → Display currency.
- The choice is saved in the `bv_currency` cookie (1 year). The root layout reads it on the server, so every page renders in the chosen currency from the first paint — no flash.
- MUR is converted at `EUR_TO_MUR` in `lib/format.ts`. Because it is a whole number and all stored amounts are whole euros, converted statements still add up to the rupee. When rupee amounts are shown, a small note states the rate (transparency is part of the brand).
- Always format money through `formatMoney` / `useMoney()` / `<Money eur={…} />` — never hard-code a symbol.
- Each owner also has a separate **payout currency** (e.g. the Mauritian owner is paid in MUR), shown in Settings.
- To use real dual prices instead of conversion later, store both amounts per record and have `formatMoney` pick the matching one.
- French pages default to EUR like English ones; the visitor's choice applies to both languages.

## Income estimator (`/estimate`)

Five questions (type, region, bedrooms, features, availability), then a monthly and yearly range, the fee and what the owner keeps, with a call to action that pre-fills the contact form and a WhatsApp message carrying the estimate. The home page has a short teaser that deep-links into it (`/estimate?region=north&bedrooms=3`).

**Tuning the figures** — everything the calculation uses is in `data/estimator-config.ts`, in EUR (the site converts to rupees for display); `lib/estimator.ts` holds only the formula:

```
nightly rate  = baseNightly[type] × regionMultiplier[region]
                × (1 + perBedroomAbove × max(0, bedrooms − included))
                × (1 + sum of featureUplift for the chosen features)
occupancy     = share of high-season months × occupancy.high + the rest × occupancy.low
gross a year  = nightly rate × available weeks × 7 × occupancy, shown as ± rangeSpread
fee           = up to maxFeeRate (company.pricing.maxFeeRate, 15%) · net = gross × (1 − fee)
```

| To change | Edit in `ESTIMATOR_CONFIG` |
| --- | --- |
| Nightly rate of a 2-bedroom property in the South | `baseNightly.villa / apartment / penthouse` |
| How much each region earns compared with the South | `regionMultiplier` (South = 1) |
| Value of extra bedrooms | `bedrooms.perBedroomAbove` (and `included`, `min`, `max`, `default`) |
| Value of a pool, sea view, beachfront, air conditioning, housekeeping | `featureUplift` |
| Occupancy and the high season | `occupancy.high`, `occupancy.low`, `occupancy.highSeasonMonths` (1 = January) |
| The part-year slider | `weeks` |
| The width of the range shown | `rangeSpread` (0.15 = ±15%) |

The page's "How the estimate works" section reads the same numbers, so it stays true. The values are marked `[CONFIRM] demo defaults`: replace them with real market knowledge. After a change, `npm test` fails on the hand-worked examples in `lib/estimator.test.ts` (the arithmetic is written out at the top of that file): update the expected values to the new figures. Adding a property type, region or feature (the lists at the top of the file) also needs its wording under `estimator` in `messages/en.json` and `messages/fr.json`, with the same id, plus an icon for a type (`components/estimator/icons.ts`) or a point on the island map for a region (`REGION_POINTS` in `components/estimator/IslandMap.tsx`); TypeScript and `npm run i18n:check` list what is missing.

## WhatsApp

A floating button on every public page (hidden on the estimator's questions, carrying the estimate on its result) opens a chat with Ankit; the contact page has a card each for Ankit and Nihal. Numbers (`WHATSAPP_NUMBERS`, `WHATSAPP_PRIMARY`) and the default pre-filled message per language (`WHATSAPP_DEFAULT_MESSAGE`) are in `data/site.ts`; other wording is under `whatsapp` in `messages/en.json` and `messages/fr.json`.

## SEO, legal and spam protection

- `app/sitemap.ts`, `app/robots.ts` (dashboard, admin and API blocked from indexing; the login page carries `noindex`), `app/[locale]/opengraph-image.tsx` (one per language), canonical, hreflang and Open Graph URLs, and Organization JSON-LD with a logo (`components/site/JsonLd.tsx`).
- Public pages are prerendered and cached at the edge; the owner and admin portals render per request. `htmlLimitedBots: /.*/` in `next.config.ts` keeps the portals' `<meta>` tags in `<head>`.
- Security headers and a Content-Security-Policy are set in `next.config.ts`; `instrumentation.ts` logs missing or malformed environment variables at start-up (`[env]` in Vercel → Logs).
- `/privacy` (Mauritius Data Protection Act 2017 + GDPR) and `/terms` — templates, to be reviewed by a lawyer. No cookie banner: the site sets only a strictly necessary session cookie and the user-requested currency and language preferences. Add a consent banner as soon as analytics or marketing cookies are introduced. The privacy policy also covers contact through WhatsApp (messages carried by WhatsApp/Meta under its own terms; kept like other enquiries) — part of the lawyer's review. Their "Last updated" dates, also their sitemap dates, are `LEGAL_LAST_UPDATED` in `data/site.ts`: move a date forward whenever that page's content changes.
- Contact form: honeypot field + IP rate limit (`lib/rateLimit.ts`; in-memory, so use Upstash Redis on Vercel), consent record logged with timestamp.
- Unknown URLs answer a real 404 with the "Lost at sea?" page in the URL's language, complete without JavaScript, whatever the HTTP method (`app/[locale]/[...rest]/route.ts`, see `UPGRADE-PLAN.md` §8).

## Analytics (Plausible)

Off until configured: nothing is loaded and the privacy policy says the site uses no analytics. Plausible sets no cookies and stores no personal data, so no consent banner is needed.

1. Create the site in Plausible (plausible.io) with the domain `www.bellaveremu.com`.
2. In Plausible → Site settings → Goals → **Add goal → Custom event**, add the three events the site sends, spelled exactly:
   - `WhatsApp Clicked` (props: `placement` = `floating`, `contact-card`, `estimator`…, and `locale`),
   - `Estimator Completed` (sent when the estimator shows a result),
   - `Contact Submitted` (sent after an enquiry was delivered).
3. In Vercel → Settings → Environment Variables (Production), set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` = `www.bellaveremu.com`, then **redeploy** (the variable is read at build time).

With the variable set, the script loads on the public site only (page views, including client-side navigations), the Content-Security-Policy allows `https://plausible.io` (`next.config.ts`), and the privacy policy gains its analytics paragraph (messages `analytics.privacy.*`; "Last updated" shows `ANALYTICS_POLICY_DATE` from `lib/analytics.ts` if it is later than the policy's own date). Events are sent through `track()` in `lib/analytics.ts`.

## Internationalisation (English / French)

The public site is in **English** (default, British English, unprefixed URLs: `/`, `/services`, …) and **French** (`/fr`, `/fr/services`, …), with [next-intl](https://next-intl.dev). The owner portal (`/login`, `/dashboard`, `/admin`) is English only. The full design is in `UPGRADE-PLAN.md`.

- **Locales and URLs**: `i18n/routing.ts` (`as-needed` prefixes, no browser-language redirects). `middleware.ts` maps unprefixed URLs to English, and sends them to French while the `NEXT_LOCALE` cookie says `fr` — a cookie written only when the visitor chooses a language (`en` or `fr`), with the header switch or the French-suggestion card (`writeLocaleCookie()` in `lib/i18n/localeCookie.ts`). `/en/…` and upper-case prefixes (`/FR/…`, `/EN/…`) redirect to the lower-case, canonical address.
- **Where text lives**: one JSON file per language, `messages/en.json` and `messages/fr.json`, loaded by `i18n/messages.ts`. Each is an object whose top-level keys are the namespaces, in this order: `common` (header, footer, buttons, 404/error pages, company wording, structured data, image alt texts), one per page (`home`, `services`, `about`, `contact`, `legal` — the last holds the privacy policy and the terms), `estimator` (the estimator and the home page's teaser), `whatsapp`, `analytics` (the privacy policy's analytics wording) and `locale` (language switch and suggestion). Both files keep the same keys in the same order, formatted with a 2-space indent (UTF-8, LF line endings, characters such as `é`, `’` and the no-break space written as themselves rather than `\u` escapes). Facts (names, phones, emails, numbers) stay in `data/company.ts` and `data/site.ts` and are inserted with placeholders.
- **Adding a translation string**, step by step:
  1. Add the key to `messages/en.json`, inside the right namespace and nested by page section (the services page's hero note: `"services": { "hero": { "note": "…" } }`, used as `t("hero.note")` with the `services` namespace). Keys are camelCase; no arrays (lists are objects keyed by id, the order lives in code). Facts (names, phones, emails, figures) stay in `data/*` and go in as placeholders: `"Call {name} on {phone}"`, `"{maxFee, number, percent}"`.
  2. Add the same key at the same place in `messages/fr.json`, translated in the site's French conventions: *vous*, sentence case, a no-break space (U+00A0) before `: ; ! ?` and `%` and inside « », " – " where English has " — ", and the established terms (gestion locative, frais de gestion, espace propriétaire, relevé, taux d'occupation…; check the existing French messages).
  3. Use it. In a server component: `const t = await getTranslations("services")` (or `useTranslations` in a non-async one) → `t("hero.note")`. Rich text: `"See our <link>privacy policy</link>"` → `t.rich("x", { link: (c) => <Link href="/privacy">{c}</Link> })`. In a client component (`"use client"`): `useTranslations("services")` works only for keys the browser receives — add the key's path to the page's list in `PAGE_CLIENT_MESSAGES` (or to `SITE_CLIENT_MESSAGES` for the shared header, footer and buttons) in `i18n/messages.ts`, otherwise the browser console shows `MISSING_MESSAGE`; or pass the text in as a prop from a server component.
  4. Check: `npx tsc --noEmit` (keys are typed from `messages/en.json`, so a typo fails) and `npm run i18n:check` (both languages have the key, same placeholders, nothing left in English).
  To **remove** a string, delete it from both files. TypeScript flags code that still reads it by a literal key, but not keys built at run time (`` t(`steps.${id}.title`) ``, ids or key names kept in data such as the footer links, and the image alt texts, which mirror `data/siteImages.ts`), so search the code for the key's last segment first.
  Messages are compiled ahead of time (see `UPGRADE-PLAN.md` §8): a message must be valid ICU, `t.raw()` is not available, and a named number style other than `percent` must be added to `MESSAGE_FORMATS` in `i18n/routing.ts`.
- **Links, pages, metadata**: import `Link` from `@/i18n/navigation` (never `next/link` on public pages) and write hrefs without a locale; `<Button href>` does this already. Every page under `app/[locale]` starts with `await getPageLocale(params)` (keeps it static) and builds its metadata with `localizedMetadata()` (canonical, hreflang, Open Graph per language).
- **Numbers and dates**: `useMoney()` and the helpers in `lib/format.ts` take the page's locale ("24 960 €", "Rs 24 960", "22 septembre 2026" in French; English unchanged).
- **Check**: `npm run i18n:check` — key parity and ICU placeholders between English and French (must be clean), French values still identical to English, and user-facing text still hard-coded in components (`--strict` makes those fail too). `node scripts/review.mjs <url>` checks both languages on a running build: every page answers 200 with the right `lang` and no console errors, canonical and hreflang links, the `NEXT_LOCALE` and `/en/…` redirects, the localized 404s and the estimator.
- **Visual check**: `node scripts/visual-snapshot.mjs <url> <dir>` then `npm run visual:diff -- screenshots/baseline <dir> --ignore-top=72`.

## Security model

- **Sessions are signed** (HMAC-SHA256 with `SESSION_SECRET`), so editing the `bv_session` cookie no longer impersonates anyone; forged or tampered cookies are rejected and cleared. Sessions expire (12 hours, or 30 days for owners / 7 days for admins with "Remember me").
- **Passwords are scrypt hashes**, never plain text; admin hashes live only in environment variables.
- **Failed sign-ins are rate-limited** (10 per 15 minutes per IP; successful sign-ins don't count).
- **Owners never reach `/admin`**; admins reach an owner's dashboard only via "Open portal", with a visible banner, and property isolation (real 404s) still applies inside that view.
- Launch switches: `DEMO_MODE=false` disables the three demo owner accounts and hides them on the login page; `SITE_INDEXABLE=true` lets search engines in (until then `robots.txt` and a `noindex` tag keep the demo out of Google).
- Still demo-grade: owners live in `data/clients.ts`, and the rate limiter is in-memory. Move owners to a database (Supabase) and the limiter to Upstash before real owners sign up.

## Swapping the mocks for a real backend

Suggested: **Supabase** (auth + Postgres + storage).

1. **Auth** — replace `lib/auth.ts` and `app/api/auth/*` with Supabase Auth (email/password or magic link). Keep `requireClient()`'s contract: every dashboard page calls it and filters by the returned client id. `middleware.ts` swaps its cookie check for Supabase session validation.
2. **Data** — the `data/*.ts` modules and `lib/metrics.ts` are the only data surface. Recreate them as queries/views: tables `clients`, `properties`, `bookings`, `maintenance_tickets`, `documents`, `statements`. Row-level security on `client_id` gives you the same isolation guarantee the mock enforces in code.
3. **Contact form** — `app/api/contact/route.ts` validates, rate-limits and emails each enquiry to BellavereLtd@gmail.com through Resend (see "Contact form email"). A CRM can be added later next to the Resend call.
4. **Statements PDF** — replace the print-window with a real renderer (e.g. react-pdf or a server route) once statements come from the database.

## Deploying (www.bellaveremu.com)

The site's domain is **bellaveremu.com**, registered at **Squarespace Domains** (domains.squarespace.com); the main address is **www.bellaveremu.com** and the bare domain redirects to it. (Until 30 Sep 2026 the site ran on a first Vercel account at wwwbellavere.com. That domain is **kept** — it carries Nihal's Google Workspace mailbox, executive@wwwbellavere.com — so keep it renewed and never touch its `MX`, SPF `TXT` or `google._domainkey` records; its web address should redirect to www.bellaveremu.com: add `wwwbellavere.com` and `www.wwwbellavere.com` to the Vercel project as redirects.)

1. **Retire the old setup first:** in the old Vercel account, remove every domain from the `bellavere` project (Settings → Domains), then delete the project (Settings → General → Delete Project). Otherwise the new account can't take `bellaveremu.com`, and every push would deploy twice.
2. **New Vercel account:** sign up (with the business email if possible). If Vercel says your GitHub account is already linked to another Vercel account, sign up with email instead, or delete the old Vercel account.
3. **Import:** Add New → Project → Import Git Repository → `lutchmeeinesh/bellavere` (allow the Vercel GitHub app access to that repository). Keep the Next.js defaults.
4. **Environment variables, before the first deploy:** expand "Environment Variables" and paste the contents of **`.env.vercel.local`** (git-ignored: the site address, a fresh `SESSION_SECRET`, the three admin password hashes, `DEMO_MODE=true`, `SITE_INDEXABLE=false`, `CONTACT_TO_EMAIL`). `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are added once Resend is set up (below). Without `SESSION_SECRET`, sign-in is refused (fail-closed).
5. **Deploy**, then test the temporary address: `node scripts/review.mjs https://<project>.vercel.app`.
6. **Domain:** Settings → Domains → add `bellaveremu.com` and accept Vercel's recommendation to add `www.bellaveremu.com` and redirect the bare domain to it.
7. **DNS at domains.squarespace.com → bellaveremu.com → DNS → DNS Settings:** delete the **Squarespace Defaults** (four `A` records starting `198.` and the `www` CNAME to `ext-sq.squarespace.com`), then add the records Vercel shows — normally `A  @  216.198.79.1` and `CNAME  www  cname.vercel-dns.com`. Leave `_domainconnect`, the SPF `TXT` and `_dmarc` alone. HTTPS certificates are issued once DNS has propagated (minutes to a few hours; Squarespace's defaults were cached for up to 4 hours).
8. **Launch** (done 30 Sep 2026): `SITE_INDEXABLE=true` and redeploy; Google Search Console → Domain property `bellaveremu.com` (verify with the DNS `TXT` record it gives), submit `https://www.bellaveremu.com/sitemap.xml`, then URL Inspection → Request indexing for the home page.

Notes: Vercel's free **Hobby** plan is for personal, non-commercial use — a business site needs **Pro**. `vercel.json` pins functions to `cpt1` (Cape Town). `next/font/google` downloads fonts at build time; a transient network failure shows up as a Turbopack `next/font/google` import-map error — simply redeploy. Changing `DEMO_MODE` needs a redeploy (the sign-in page is prerendered).

## Contact form email (Resend)

Enquiries are emailed to **BellavereLtd@gmail.com** with *Reply-To* set to the enquirer, so replying answers the customer directly.

1. Sign up at **resend.com with BellavereLtd@gmail.com** (free tier: 3,000 emails/month).
2. Resend → **Domains → Add** `bellaveremu.com`, add the DNS records it shows at Squarespace (a DKIM `TXT` on `resend._domainkey` and records on the `send` subdomain), then **Verify**. `bellaveremu.com` carries a strict `_dmarc` policy (`p=reject`), so mail from the domain must be DKIM-signed — which the verified Resend domain does.
3. Resend → **API Keys** → create a key with sending access → in Vercel set `RESEND_API_KEY` to it (never into chat or the code) and `CONTACT_FROM_EMAIL` to `Bellavere website <website@bellaveremu.com>` → **Redeploy**.

If sending fails, the visitor is shown the company email and both phone numbers, and the reason is logged (Vercel → Logs → search `Delivery failed`; `[env]` lines list missing settings).

Each enquiry email lists the enquirer's language ("Language: French" or "English", from the page the form was sent from), and the logged consent record holds the consent sentence in that language.

### Switching the public address to hello@bellaveremu.com

The site shows one company address everywhere (contact page, error pages, legal pages, structured data, the form's fallbacks) and sends enquiries to it by default: `PUBLIC_EMAIL` in `data/site.ts`. It is BellavereLtd@gmail.com while `HELLO_MAILBOX_LIVE = false`, because bellaveremu.com has no mailbox yet (no MX records, so mail to hello@ would be lost).

1. Create the mailbox (e.g. Google Workspace on bellaveremu.com) and send a test message to hello@bellaveremu.com from another account; it must arrive.
2. In `data/site.ts`, set `const HELLO_MAILBOX_LIVE = true;`, commit and deploy.
3. If `CONTACT_TO_EMAIL` is set in Vercel, it still decides where enquiries go: change it to hello@bellaveremu.com (or remove it to use `PUBLIC_EMAIL`), then redeploy.

## Known limitations

- **The owner portal is English only** (`/login`, `/dashboard`, `/admin`; `/fr/login` redirects to `/login`), and so is the last-resort error page (`app/global-error.tsx`) and the 404 for addresses outside the site's languages (e.g. `/x.y`).
- **The localized 404** is served by a route handler that fetches the static 404 page from the deployment itself (`UPGRADE-PLAN.md` §8): `/page-not-found` and `/fr/page-not-found` exist as pages (noindex, linked nowhere), and a deployment that cannot fetch itself (a preview behind Vercel Authentication) shows a plain, unstyled localized 404 instead.
- **Messages are precompiled** (`UPGRADE-PLAN.md` §8): `t.raw()` is not available and named number styles must be declared in `MESSAGE_FORMATS`.
- **Page weight**: the public pages load 192–205 kB of JavaScript (First Load JS in `npm run build`) against 184–193 kB before the French version, the estimator and WhatsApp; the difference is next-intl's client runtime, the language switch, the WhatsApp button and the estimator teaser. Lighthouse (mobile) scores 89–91 on the home pages (90–91 before Wave 1) and 93 on the estimator: the home pages' largest paint is the hero text, which appears after its entrance animation, so all the JavaScript loaded by then counts against it.
- **Links to the owner portal are not prefetched** on public pages, so the sign-in page loads on click.
- **Analytics is off** until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set (see "Analytics").

## Review artifacts

- `ASSUMPTIONS.md` — every decision made where the brief was silent.
- `REVIEW.md` — automated review findings (console errors, isolation checks, responsive/screenshot pass) and fixes.
- `screenshots/` — desktop (1440) + mobile (390) captures of every route, regenerate with `node scripts/review.mjs` against a running build.
