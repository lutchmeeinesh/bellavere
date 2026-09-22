# Bellavere website — handoff brief

Paste this whole file into a new chat to bring it fully up to speed. It covers what exists, how it fits together, the conventions to keep, and exactly what remains before the site can go live. **Last updated: 22 September 2026.**

---

## 1. What this is

A polished **demo website for Bellavere** (trading as **Bellavere Property Care**), a property management and **syndic** company working **all around Mauritius** (north, west, east, south and the central plateau). It has two halves:

- **Marketing site:** home, services (five, including syndic & residence management), about, contact, privacy, terms, login, 404. There is deliberately **no public property portfolio** until real listings exist.
- **Owner dashboard** (`/dashboard/*`, auth-protected): each owner logs in and sees **only** their own properties (occupancy, bookings, revenue, maintenance, statements, documents, settings).
- **Admin area** (`/admin/*`): three Bellavere staff accounts see every owner, property, arrival, repair and document, and can open any owner's portal (§4c).

Every price and figure displays in **EUR or MUR**, at the visitor's choice (§4e).

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

- **Name:** Bellavere (lowercase v; the original brief's "BellaVere" was retired). Trading name "Bellavere Property Care".
- **Team:** **Krit Goburdhan**, General Manager & Site Supervisor (surname inferred from the email); **Ankit Dookhorun**, Client Relations (surname confirmed — his email is zoodookhorun@gmail.com); **Nihal Lutchmee** (no role given, so none shown).
- **Contacts (confirmed 22 Sep):** Ankit +230 5531 0734 and zoodookhorun@gmail.com; Nihal +230 5817 4529 and executive@wwwbellavere.com. Both reachable **every day, 24/7**. **Every query is answered the same day.** Social: Instagram and Facebook **bellavere.ltd**. Krit's email is **not** published.
- **Company email:** BellavereLtd@gmail.com
- **Mission:** "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you."
- **Currency:** MUR and EUR, user-selectable.
- **Fees:** negotiated and set after the first meeting, **never more than 15%**. Each owner's agreed rate is `Client.feeRate` and drives their statements (demo: Sophie 14%, Hamilton 12%).
- **Onboarding:** one to two weeks.
- **Coverage:** all around Mauritius, per the client's own map (`public/images/coverage-map.webp`, OpenStreetMap-based: keep the attribution caption).
- **No walk-in office:** no address on the contact page or in the footer.
- **Admins:** Krit (kritgoburdhan@gmail.com), Ankit (zoodookhorun@gmail.com), Inesh (lutchmeeinesh@gmail.com).
- **No fake filler (22 Sep 2026):** the client asked for every invented fact to be removed. Only the registered address (and BRN) remain `null` in `data/company.ts` and hidden until provided; no invented numbers, response times, service extras, policies or features; testimonials are kept (client's request) as clearly illustrative, initial-only names that differ from the demo owners.
- **Services:** also informed by the client's own syndic prospect list: syndic, common-area management, preventive maintenance, contractor coordination, inspections, pool/landscaping supervision, owner reporting, renovation follow-up. That list's third-party contact details are **not** used anywhere on the site.

---

## 2. Stack (fixed by the original brief; do not substitute)

- **Next.js 15.5.24** (App Router) · **React 19.1** · **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first config: the tokens live in `app/globals.css` via `@theme inline`; there is **no `tailwind.config.js`**)
- **Framer Motion 13** · **Recharts 3** · **lucide-react 1.x** · `next/font` (no external font links)
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
7. **Round 5 (22 Sep 2026):** real contacts (Ankit Dookhorun, Nihal Lutchmee, 24/7, same-day replies, Instagram/Facebook bellavere.ltd); an independent verification workflow caught a privacy leak (Krit's email in browser bundles), fixed along with the trust bar and count-up SSR values. See REVIEW.md "Round 5".
6. **Round 4 (22 Sep 2026):** every piece of fake filler stripped (multi-agent audit, 91 findings, three fix/verify rounds), public portfolio and newsletter removed, demo owners reduced to Sophie + Hamilton, testimonials renamed. See REVIEW.md "Round 4".
5. **Round 3 (22 Sep 2026):** three admin accounts and the `/admin` area, signed sessions + hashed passwords + login rate limit, negotiable fees (≤15%, per-owner rates), island-wide coverage with the client's map, "Visit us" removed, onboarding 1–2 weeks, pre-launch `SITE_INDEXABLE` / `DEMO_MODE` switches. See REVIEW.md "Round 3".

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

`template.tsx` → `PageTransition` (fade + rise 12px, 0.45s). `<Reveal>` / `<RevealStagger>` / `<RevealItem>` handle scroll reveals, and `<CountUp>` counts up stats. `prefers-reduced-motion` is honoured globally, through `MotionConfig`, and per component.

### e. Currency — stored in EUR, shown in EUR or MUR

- **Every amount in `data/` is EUR.** Display goes through `lib/format.ts`: `formatMoney(eur, currency)`, `formatMoneyPrecise`, `formatMoneyCompact` ("Rs 624k"), and `EUR_TO_MUR = 52` (TODO; deliberately a **whole number** so converted statements still add up to the rupee).
- The choice lives in the **`bv_currency` cookie**. `app/layout.tsx` reads it with `getCurrency()` (`lib/currency.ts`) and passes it to `<CurrencyProvider>`, so the **first paint is already in the right currency**. Side effect: every route renders per request (not static). It is measured and negligible.
- **Client components** use `useMoney()` → `{ currency, format, formatPrecise, formatCompact, convert, symbol, setCurrency }`. **Server components** render `<Money eur={x} />` (a client leaf), or call `formatMoney(x, await getCurrency())` when they need a string.
- `setCurrency` updates the context, writes the cookie and calls `router.refresh()`, so client components update instantly and server components re-render.
- The UI switch is `<CurrencyToggle>` (header on desktop and mobile, dashboard top bar, Settings → Display currency). `<ConversionNote>` shows "converted at €1 = Rs 52" whenever rupees are displayed.
- A **payout currency** per owner (`Client.payoutCurrency`) is separate from the display currency.
- **Never write a currency symbol by hand.**

---

## 5. File map

```
app/
  layout.tsx                 root: fonts, metadata, MotionProvider, CurrencyProvider (reads bv_currency)
  globals.css                ALL design tokens + keyframes  <- edit tokens here only
  sitemap.ts robots.ts opengraph-image.tsx   SEO (robots: noindex until SITE_INDEXABLE=true)
  not-found.tsx  icon.svg
  (site)/                    marketing: Header + Footer + JsonLd + page transition
    page.tsx  about/  services/  contact/  privacy/  terms/
  (auth)/login/page.tsx      standalone login (owners -> /dashboard, admins -> /admin)
  admin/                     staff area: page.tsx (overview), clients/[id]/, layout, template
  dashboard/                 protected owner portal (layout, template, loading, not-found)
    page.tsx  properties/  properties/[id]/  bookings/  maintenance/
    statements/  documents/  settings/
  api/
    auth/login  auth/logout    signed session, failed-attempt rate limit
    admin/view-as/route.ts   admin opens / leaves an owner's portal
    contact/route.ts         validate + honeypot + rate limit + consent log (Resend TODO)

components/
  ui/        Container Button Badge Card SectionHeading Reveal CountUp
             Input(+Field/Select/Textarea/Checkbox) Toggle Modal Tabs Skeleton
  currency/  CurrencyProvider(useMoney) Money(MoneyCountUp, ConversionNote) CurrencyToggle
  site/      Header Footer Logo SocialIcons(+publishedSocialLinks) JsonLd
  admin/     AdminHeader AdminTable ViewAsButton AdminViewBanner
  motion/    MotionProvider PageTransition
  home/ about/ services/ contact/ auth/
  dashboard/ PageHeader ActivityIcon shell/ overview/ properties/ bookings/
             maintenance/ statements/ documents/ settings/(incl. DisplayCurrencySettings)

data/        company clients admins properties bookings maintenance documents testimonials siteImages
lib/         types auth session password currency format metrics dates rng rateLimit utils img constants
public/images/coverage-map.webp   the client's coverage map (keep the OSM attribution)
.env.example               every environment variable, documented
scripts/hash-password.mjs  generate an admin password hash
middleware.ts              route protection + property-ownership 404
scripts/review.mjs         Playwright review: routes, isolation, currency switch, screenshots
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

Bookings are **generated** by a seeded PRNG (`data/bookings.ts`) relative to `TODAY` (frozen at midnight), so the data rolls forward daily with no hydration mismatches.

---

## 7. Verified quality bar (22 Sep 2026)

- `npm run build`: **0 TypeScript errors, 0 lint errors.**
- `node scripts/review.mjs`: **0 errors, 0 warnings across 23 checks.** Routes × 3 owners, isolation 404s, logout, the currency switch, and security: forged and tampered cookies rejected, owners kept out of `/admin`, wrong admin password refused, plus the full admin flow (all owners listed, open an owner's portal with banner, isolation inside it, back to admin). Admin flow needs `ADMIN_TEST_EMAIL` / `ADMIN_TEST_PASSWORD`.
- **Lighthouse desktop:** every public page scores **99–100** in performance, accessibility, best practices and SEO. The dashboard scores 96–100 on accessibility. Login and dashboard SEO is 63–66 **by design**, because robots.txt blocks them.
- Statements in MUR reconcile exactly: Rs 847,704 − 152,568 − 31,980 = Rs 663,156.
- **Every photo has been visually checked against its alt text** (52 alts rewritten in round 2).

**Re-run:**

```bash
npm run build
npx next start -p 3010
node scripts/review.mjs http://localhost:3010
```

Lighthouse: `chrome-launcher` can't spawn Chrome in this environment. Launch Playwright's Chromium with `--headless=new --remote-debugging-port=9222`, then run `npx lighthouse <url> --port=9222 --preset=desktop`. For dashboard pages, add `--extra-headers='{"Cookie":"bv_session=c-sophie"}'`.

---

## 8. ⚠️ Non-obvious gotchas (fixed; do not regress)

1. **Streaming kills 404 status codes.** The dashboard has `loading.tsx`, so it streams, and once streaming starts Next.js 15 can't change the HTTP status. An in-page `notFound()` only swaps the UI (you get a 200). Property ownership is therefore enforced in **`middleware.ts`**, which rewrites foreign or unknown ids to a genuine 404. **Any new streamed detail route that must 404 needs the same middleware pattern.**
2. **Streaming also moves `<meta>` into `<body>`.** Because pages are dynamic, Next.js 15 streams metadata after `</head>` for browsers and even Googlebot. `htmlLimitedBots: /.*/` in `next.config.ts` keeps it in `<head>`. **Don't remove it**, or link previews and SEO degrade.
3. **`Card` hard-codes `bg-white`.** Classes are joined with `cn()` (no tailwind-merge), so passing `bg-navy-900` does NOT override it; the white wins. For dark cards, use a plain element (see the syndic card in `components/home/ServicesOverview.tsx`).
6. **`data/company.ts` ships to the browser.** Client components (Hero, FaqAccordion) import it, so every value in it is public, even if never rendered — Krit's personal email leaked into the JS bundles this way until round 5. Keep private data in server-only modules (`data/admins.ts`, `.env`). `scripts/review.mjs` now scans the built bundles for secrets.
5. **Never use `$` inside values in `.env` files.** Next.js's loader expands `$name`, which silently corrupted the original `$`-separated password hashes (120 → 80 characters, logins failed). Hashes now use `:`.
4. **Rupee formatting uses a non-breaking space** ("Rs\u00a024,960"). Tests and greps must match `\u00a0`, not a normal space.

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
- The contact endpoint validates, rate-limits and **logs**, but sends no email yet.
- Rate limiting is in-memory, so it is per server instance.
- Statement "Download PDF" opens a print window, and the document downloads are decorative.
- Email notifications don't exist yet; the Settings card says so rather than showing fake toggles.
- Imagery is Unsplash stock. The testimonials are illustrative, not real people.

---

# 11. WHAT'S LEFT TO GO LIVE

✅ = done. 🔴 = hard blocker before real owner data.

## 🟡 A. Auth — mostly done

- ✅ Signed, expiring sessions; scrypt-hashed passwords; failed-login rate limit; three real admin accounts with env-held hashes; `DEMO_MODE` switch.
- ⬜ Owners still live in `data/clients.ts`. Real owners need a database-backed account system with **password reset and email verification** (Supabase Auth recommended; keep the `requireClient()` / `requireAdmin()` contract so pages don't change).
- ⬜ Rate limiter is in-memory → Upstash on Vercel. Consider 2FA for admins.

## 🔴 B. Real database + staff admin

Recreate `data/*.ts` + `lib/metrics.ts` as Supabase tables and queries, keeping the maths identical, with **row-level security on `client_id`**. Decide the booking source: manual entry, or a channel-manager sync (Beds24 / Smoobu / Hostaway; usually the largest single job). ✅ A **read-only staff admin area** exists (`/admin`). ⬜ Admins still can't *edit* anything (add bookings, update tickets, upload documents, publish statements) — that needs the database. Syndic clients (residences) will likely need a co-owner / common-area data model that the current owner-centric model doesn't cover.

## 🟡 C. Content — 15 `TODO: confirm with client` markers

- ✅ Name, team, email, mission, currency, syndic service, fees (negotiable, ≤15%), onboarding (1–2 weeks), island-wide coverage + map, no walk-in office.
- ✅ All fake filler stripped: placeholder contact details hidden, invented metrics/response times/service extras/policies/features removed, public portfolio removed, demo owners reduced to two.
- ✅ Phone numbers, 24/7 availability, same-day replies, Instagram and Facebook (round 5).
- ⬜ In `data/company.ts`: **registered address, BRN** (they appear on the legal pages once set), legal name, tagline, the 15% basis, Krit's surname spelling, and bios — including a role for Nihal if there is one.
- ⬜ The **EUR→MUR rate** in `lib/format.ts`, or store real dual prices per record.
- ⬜ **Real testimonials** (with permission) to replace the illustrative ones, and real photography.
- ⬜ A public portfolio page once there are real listings (the old one is in git history: commit `cdb2f9f`).
- ✅ Ankit's email is published (client's request); Krit's stays private.

## 🟡 D. Wire up the stubs

| Stub | Status |
|---|---|
| Contact form | ✅ Honeypot, rate limit and consent record. ⬜ Send via Resend |
| Newsletter | Removed (Bellavere doesn't send one yet). Restore from git history when it does |
| Rate limiting | ⬜ Move to Upstash Redis on Vercel |
| Date-range selector | ✅ Removed (replaced by the currency switch) |
| Statement PDF / document downloads | ⬜ Server-side PDFs; Supabase Storage with signed URLs |
| Maintenance tickets, settings | ⬜ Persist to the DB |
| Map | ⬜ Embedded map once the address is confirmed |

## 🟢 E. Infrastructure & SEO

- ✅ `sitemap.ts`, `robots.ts`, OG image, LocalBusiness JSON-LD, metadata kept in `<head>`.
- ✅ Domain purchased. ⬜ Private GitHub repo → Vercel → env vars (`.env.example`) → add domain + DNS records; replace the Unsplash remote pattern; analytics (**requires adding a cookie-consent banner**), Sentry, uptime; Google Search Console + Business Profile.

## 🟢 F. Legal & compliance

- ✅ `/privacy` (Mauritius DPA 2017 + GDPR) and `/terms` templates; consent checkbox links to the privacy policy.
- ⬜ **Lawyer review** of both pages; BRN, registered address and retention periods; the real management agreement.

## 🟢 G. Nice-to-have

Owner date-blocking (the FAQ promises it), a French version, in-dashboard messaging with Ankit, owner document upload, email notifications matching the settings toggles, and syndic-specific portal views (common-area tickets, co-owner statements).

---

## Suggested sequencing

1. **Now, in parallel:** the client supplies the ⬜ facts in C plus photography, **while** a developer builds auth + database (A, B).
2. **Then:** the staff admin side, channel-manager sync, Resend, and persistence (D).
3. **Then:** domain, analytics + consent banner, the legal review (E, F).
4. **Launch:** remove the demo disclaimers and demo accounts, re-run `scripts/review.mjs` + Lighthouse, verify isolation with real accounts.
