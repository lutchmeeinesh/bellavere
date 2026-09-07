# BellaVere website — handoff brief

Paste this whole file into a new chat to bring it fully up to speed. It describes what exists, how it is put together, the conventions to keep, and exactly what remains before the site can go live.

---

## 1. What this is

A polished **demo website for BellaVere**, a villa and apartment management company operating on the north and west coasts of Mauritius. Two halves:

- **Marketing site** — home, services, properties portfolio + per-property detail pages, about, contact, login, 404.
- **Owner dashboard** (`/dashboard/*`, auth-protected) — every owner logs in and sees **only** their own properties: occupancy, bookings, revenue, maintenance, statements, documents, settings.

It is a **demo**: no backend, no database. All data is mock data in `data/*.ts`; auth is a mock cookie layer. It is feature-complete and visually finished, but **not safe to put in front of real owners yet** — see §11.

**Location:** `C:\Users\user\bellavere` (its own git repo, 4 commits).
*Note: the original session had been started inside `C:\Users\user\QS ESTIMATOR\.git` — the internals of an unrelated repo — so the project was deliberately created in a clean folder instead. It has no relationship to the QS ESTIMATOR project.*

**Run it:**

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # passes with 0 TypeScript errors, 0 lint errors
```

Node 20+ required (built and tested on Node 24).

**Demo logins** (all password `demo1234`, listed on the login page with one-click fill):

| Email | Owner | Portfolio |
|---|---|---|
| `sophie@demo.bellavere.com` | Sophie Laurent | 2 villas + 1 apartment |
| `ravi@demo.bellavere.com` | Ravi Naidoo | 1 villa |
| `hamilton@demo.bellavere.com` | Hamilton Estates Ltd | 5 apartments |

---

## 2. Stack (fixed by the original brief — do not substitute)

- **Next.js 15.5.24** (App Router) · **React 19.1** · **TypeScript 5** (strict)
- **Tailwind CSS v4** (CSS-first config — tokens live in `app/globals.css` via `@theme inline`, there is **no `tailwind.config.js`**)
- **Framer Motion 13** · **Recharts 3** · **lucide-react 1.x** · `next/font` (no external font links)
- Dev-only: **Playwright** + **Lighthouse** for the automated review script
- Images: `next/image`, Unsplash remote pattern whitelisted in `next.config.ts`

⚠️ **lucide-react v1 removed all brand icons.** Instagram/Facebook/LinkedIn are hand-rolled inline SVGs in `components/site/SocialIcons.tsx`. If you need an icon, verify it exists first: `node -e "console.log('IconName' in require('lucide-react'))"`.

---

## 3. How it was built (provenance)

1. **Phase 0 — foundation, built first and carefully.** Scaffold, design tokens, fonts, motion primitives, the shared UI kit, mock data, the metrics engine, mock auth, middleware, header/footer. Everything else depends on this.
2. **Phase 1 — five parallel agents**, each given the same written foundation brief so nothing was forked or duplicated: (A) Home+About, (B) Services+Properties, (C) Contact+Login+404+loading, (D) Dashboard shell+Overview+Properties, (E) Bookings+Maintenance+Statements+Documents+Settings. They shared only `components/ui`, `lib` and `data`.
3. **Phase 2/3 — integration + automated review.** A Playwright script opens every route logged out and as each demo account, screenshots desktop (1440) and mobile (390), and checks console errors, auth redirects, data isolation, alt text and content. One real bug was found and fixed (§8).

---

## 4. The four load-bearing ideas

Understand these and the codebase makes sense.

### a. Design tokens — "luxury coastal"

Defined once in `app/globals.css` as CSS variables and exposed to Tailwind through `@theme inline`. **Components must never use ad-hoc hex values.**

| Token | Hex | Use |
|---|---|---|
| `navy-900` | `#0B1F33` | headings, dark sections, dashboard sidebar |
| `navy-700` | `#163A5C` | secondary dark / hover |
| `sand-50` | `#FAF7F2` | page background |
| `sand-100` | `#F1EBE1` | cards, alternating sections |
| `sand-300` | `#D9CDB8` | borders, dividers |
| `gold-500` | `#C9A45C` | accent: buttons, links, active nav |
| `gold-600` | `#B08D45` | accent hover |
| `sea-500` | `#3C8DAD` | chart secondary, info badges |
| `ink-900` / `ink-500` | `#1C1C1C` / `#6B6B6B` | body / muted text |

Semantic: `success #3E8E5B`, `warning #D9902A`, `danger #C8443B`.

Type: headings **Cormorant Garamond** (500/600), body **Inter**. `h1`–`h4` are styled globally, so a plain `<h2>` is already correct. `.eyebrow` = small uppercase gold label, `0.12em` tracking.

Shape/rhythm: sections `py-24 lg:py-32`, content width 1200px via `<Container>`, cards `rounded-2xl` + 1px `sand-300` border, buttons pill-shaped, **shadows only on hover**. The feel is editorial hospitality, not SaaS.

### b. The metrics engine — one source of truth for every number

`lib/metrics.ts` derives **everything** from the same generated bookings, so KPI tiles, charts and statements can never disagree:

- Monthly revenue = bookings **pro-rated by nights actually stayed in that month**.
- Statement gross comes from that same series; fee = 18% of gross; expenses = resolved maintenance ticket costs + recurring upkeep (villa €220/mo, apartment €90/mo); net = gross − fee − expenses.
- Occupancy = booked nights ÷ days in month.

Key exports: `kpisForClient`, `monthlyRevenueForClient` / `...ForProperty`, `occupancyForPropertyMonth` / `...ForClientMonth`, `propertyStatusToday`, `upcomingBookings`, `statementsForClient`, `propertySummariesForClient`, `activityForClient`, `documentsExpiringSoon`, `ticketsByStatus`, `lastMonths`.

**Never hard-code a number in a component.** Pull it from here.

### c. Mock auth + data isolation

- `lib/auth.ts` (server-only): `getSessionClient()`, `requireClient()` (redirects to `/login`), `verifyCredentials()`, `SESSION_COOKIE = "bv_session"`.
- `POST /api/auth/login` sets an httpOnly cookie; `POST /api/auth/logout` clears it (a plain form POST, 303 redirect).
- `middleware.ts` redirects unauthenticated `/dashboard/*` → `/login?from=…` and authenticated `/login` → `/dashboard`.
- **Rule:** every dashboard server page starts with `const client = await requireClient()` and filters all data by `client.id`. Detail pages `notFound()` on anything not owned by that client.

### d. Motion primitives

- `app/(site)/template.tsx` and `app/dashboard/template.tsx` → `PageTransition` (fade + rise 12px, 0.45s easeOut on every route change).
- `<Reveal>` / `<RevealStagger>` + `<RevealItem>` — scroll reveals, 0.6s, once, 0.08s stagger. Applied to every section, grid and stat.
- `<CountUp>` — stats count up on reveal.
- `prefers-reduced-motion` is honoured three ways: a global CSS kill-switch in `globals.css`, `MotionConfig reducedMotion="user"` in `components/motion/MotionProvider.tsx`, and per-component guards (Ken Burns, count-ups, carousel auto-advance).

---

## 5. File map

```
app/
  layout.tsx                 root: fonts, metadata, MotionProvider
  globals.css                ALL design tokens + keyframes  <- edit tokens here only
  not-found.tsx              branded 404 (standalone, no site chrome)
  icon.svg                   favicon
  (site)/                    marketing pages — Header + Footer + page transition
    layout.tsx  template.tsx  loading.tsx
    page.tsx                 HOME
    about/  services/  contact/
    properties/page.tsx      portfolio grid + animated filters
    properties/[slug]/       detail (generateStaticParams over all 12 slugs)
  (auth)/login/page.tsx      standalone full-screen login (no site chrome)
  dashboard/                 protected owner portal
    layout.tsx               shell: navy sidebar / topbar / mobile bottom nav
    template.tsx  loading.tsx  not-found.tsx
    page.tsx                 OVERVIEW (KPIs, charts, next 7 days, activity)
    properties/  properties/[id]/  bookings/  maintenance/
    statements/  documents/  settings/
  api/
    auth/login/route.ts  auth/logout/route.ts
    contact/route.ts         logs + returns 200; documents where to add Resend

components/
  ui/        Container Button Badge Card SectionHeading Reveal CountUp
             Input(+Field/Select/Textarea/Checkbox) Toggle Modal Tabs Skeleton
  site/      Header Footer Logo SocialIcons MauritiusMap
  motion/    MotionProvider PageTransition
  home/  about/  services/  properties/  contact/  auth/
  dashboard/ PageHeader ActivityIcon
             shell/ overview/ properties/ bookings/ maintenance/
             statements/ documents/ settings/

data/        company clients properties bookings maintenance
             documents testimonials siteImages
lib/         types auth metrics format dates rng utils img constants
middleware.ts              route protection + property-ownership 404
scripts/review.mjs         Playwright review + screenshot harness
screenshots/               32 PNGs: desktop + mobile of every route
README.md  ASSUMPTIONS.md  REVIEW.md
```

**60 components · 15 routes · 3 API routes.**

---

## 6. Data model

Types in `lib/types.ts`. All dates are ISO `yyyy-mm-dd` strings.

- **Client** — id, name, shortName, email, password (plain, demo only), initials, phone, payoutAccount.
- **Property** — id, slug, name, type (`villa|apartment`), location, bedrooms/bathrooms/sleeps, nightlyRate (EUR), `clientId` (**null = portfolio-only demo listing**), managedSince, featured, images[{src,alt}], amenities[], headline, description. **12 total; p-01…p-09 owned by demo clients, p-10…p-12 unowned.**
- **Booking** — propertyId, clientId, guest, checkIn/checkOut, nights, amount, channel (`Direct|Airbnb|Booking.com`), status (`completed|checked_in|confirmed|cancelled`).
- **MaintenanceTicket** — status (`reported|in_progress|resolved`), priority, category, contractor, cost.
- **OwnerDocument** — category (`contract|insurance|compliance|other`), issuedAt, expiresAt (nullable), fileSizeKb.
- **Statement** — derived, never stored: period, gross, fee, expenses, net.

**Bookings are generated, not hand-written.** `data/bookings.ts` walks each managed property from ~13 months back to ~2.5 months forward using a seeded PRNG (`lib/rng.ts`), so stays never overlap per property, occupancy lands in a realistic band, and pricing follows Mauritian seasonality (peaks Nov–Jan, secondary European-summer bump). `TODAY` in `lib/dates.ts` is frozen to midnight so server and client render identically (no hydration mismatch) — the data rolls forward day by day, which is intentional.

---

## 7. Verified quality bar

- `npm run build` — **0 TypeScript errors, 0 lint errors**; 12 property pages pre-rendered.
- Automated review — **0 errors, 0 warnings** across every route × all 3 accounts.
- **Lighthouse desktop on `/`: Performance 100 · Accessibility 96 · Best Practices 100.**
- Isolation verified: each account sees only its own properties; foreign/unknown property URLs return a **genuine HTTP 404**.
- Every `<img>` has `alt`; no lorem ipsum; no horizontal scroll at 390px or 1440px.

**Re-run the review** (needs a running production build):

```bash
npm run build
npx next start -p 3010
node scripts/review.mjs http://localhost:3010
```

Lighthouse note: `chrome-launcher` could not spawn Chrome in this environment. Workaround — launch Playwright's Chromium with `--headless=new --remote-debugging-port=9222`, then run `npx lighthouse http://localhost:3010/ --port=9222 --preset=desktop`.

---

## 8. ⚠️ The one non-obvious gotcha (already fixed — do not regress it)

**Symptom:** requesting another owner's property (`/dashboard/properties/p-04` as Sophie) returned **HTTP 200** even though it correctly rendered the not-found UI and leaked no data.

**Cause:** the dashboard has a `loading.tsx`, so the route **streams**. Once streaming begins, Next.js 15 cannot change the HTTP status — an in-page `notFound()` (and even one inside `generateMetadata`, since Next 15 streams metadata too) only swaps the UI, leaving a 200.

**Fix:** ownership of `/dashboard/properties/[id]` is enforced in **`middleware.ts`**, before rendering starts — a foreign or unknown id is rewritten to an unmatched route, producing the branded 404 page with a real 404 status. The page keeps its own `notFound()` check as defence in depth.

**If you add more streamed detail routes that must 404 (bookings, documents, statements), replicate this middleware pattern.** A page-level `notFound()` alone is not enough.

---

## 9. Conventions to keep

- Server components by default; `"use client"` only where interaction demands it. Server pages fetch data and pass **plain serializable props** down.
- Next 15: `params` and `searchParams` are **Promises** — always `await` them.
- Reuse `components/ui/*` — never fork a copy. New genuinely-generic primitives go there.
- No ad-hoc hex; no `any`; no unused imports (lint is part of the build).
- Every image needs meaningful `alt`; icon-only buttons need `aria-label`; decorative icons get `aria-hidden`.
- Focus states come free from `globals.css` (gold outline) — don't suppress them.
- Currency always via `lib/format.ts` helpers; dates via `formatDate` and friends.
- Any invented company fact gets a `{/* TODO: confirm with client */}` marker.

---

## 10. Deliberate limitations of the demo

- Maintenance "Report an issue" adds to local state only (stated in the UI); resets on refresh.
- Settings forms are mock — they flash "Saved — demo only".
- Statement "Download PDF" opens a branded print-ready window and calls `window.print()` (no PDF library).
- Document "Download" buttons are decorative — no files exist behind them.
- Topbar date-range selector is decorative; the Overview revenue chart has its own working 3M/6M/12M toggle.
- Newsletter input in the footer is not wired.
- The Mauritius coverage map is a stylised SVG placeholder, not a real map.
- Property images are Unsplash stock.

---

# 11. WHAT'S MISSING TO GO LIVE

Ordered by what blocks what. Items marked 🔴 are hard blockers before any real owner data touches this.

## 🔴 A. Replace the mock auth (the single biggest blocker)

The current session cookie stores the **client id in plain text** — anyone can set `bv_session=c-hamilton` in devtools and open that portfolio. Passwords are plain text in `data/clients.ts`. Fine for a demo; unacceptable for real data.

**Do:** adopt Supabase Auth (or Auth.js / Clerk). Keep the existing contract — `requireClient()` returns a client, pages filter by `client.id` — and replace only the internals of `lib/auth.ts`, `app/api/auth/*`, and the cookie check in `middleware.ts`. **None of the ~15 dashboard pages need to change.** Add password reset, email verification, and session expiry. Roughly one day of work.

## 🔴 B. Real database behind the dashboard

`data/*.ts` + `lib/metrics.ts` are the entire data surface, which keeps this contained.

**Do:** create tables `clients, properties, bookings, maintenance_tickets, documents, statements`; reimplement the `lib/metrics.ts` function signatures as queries (keep the pro-rating and fee/expense maths identical so figures still reconcile); enable **row-level security on `client_id`** so isolation is enforced by the database, not only by application code. Then decide where bookings come from:

- manual entry by BellaVere staff, **or**
- a channel-manager sync (Airbnb / Booking.com via Beds24, Smoobu or Hostaway) — **usually the largest single piece of work in the project**; scope it early.

Also needed: an **admin/staff side**. Owners can only read today; someone has to create bookings, update ticket status, upload documents and publish statements.

## 🟡 C. Real content (35 `TODO: confirm with client` markers)

Most resolve by editing **one file — `data/company.ts`**: tagline, market, founded, team + bios, phone, email, address, office hours, socials, mission, pricing %, trust-bar stats.

Remaining markers: `app/(site)/services/page.tsx` (3 — response times, concierge yield claim), `app/(site)/contact/page.tsx` + `components/contact/FaqAccordion.tsx` (4 — payout day, long-let offering, onboarding timeline), `app/(site)/about/page.tsx` (5 — values, founding story, contractor vetting, notice period), `components/home/ServicesOverview.tsx` (2), `app/dashboard/statements/page.tsx`, `components/dashboard/settings/PayoutSettings.tsx`, `components/site/Footer.tsx`, `data/testimonials.ts`, `lib/format.ts`.

Decide early: **EUR vs MUR** (`lib/format.ts`) — it flows through every statement, chart and price on the site.

Also required before launch:

- **Real photography.** Unsplash stock is placeholder-grade for a luxury brand, and commercial marketing use needs licence review. Replace images in `data/properties.ts` and `data/siteImages.ts`.
- **Real owner testimonials with written permission** (`data/testimonials.ts`).
- **Real property listings** — the 12 current ones are fictional. Remove the "Demo listings for illustration" disclaimers on `/properties` and the detail pages, and the "Demo website" line in the footer, once real.

## 🟡 D. Wire up the stubs

| Stub | Work |
|---|---|
| `app/api/contact/route.ts` | Add Resend (the file's comment block shows exactly where) + rate limiting + honeypot field; persist enquiries so none are lost if email fails |
| Footer newsletter | Connect to Mailchimp / Resend audience |
| Statement PDF | Generate server-side once statements come from the DB |
| Document downloads | Needs file storage (Supabase Storage / S3) with signed, per-owner URLs |
| Maintenance tickets, settings forms | Persist to the database; add optimistic UI |
| Dashboard date-range selector | Either wire it globally or remove it |
| `components/site/MauritiusMap.tsx` | Swap for an embedded map once the real address exists |

## 🟢 E. Infrastructure & SEO

- Domain + DNS → Vercel project (defaults are correct: `next build`, Node 20+).
- Set `NEXT_PUBLIC_SITE_URL` (used by `metadataBase`).
- Replace the Unsplash entry in `next.config.ts` `images.remotePatterns` with the real image host.
- **Missing and needed:** `app/sitemap.ts`, `app/robots.ts`, OG/Twitter images (`opengraph-image.tsx`), structured data (`LocalBusiness` / `LodgingBusiness` JSON-LD).
- Analytics (Plausible or GA4), error tracking (Sentry), uptime monitoring.
- Re-run Lighthouse after swapping in real photography — the 100 score was achieved with the current image set.

## 🟢 F. Legal & compliance

- Privacy policy, cookie consent banner (GDPR applies to European owners), terms of service.
- The real management agreement as a downloadable document.
- A genuine consent trail for contact-form submissions (store timestamp + IP + consent text).
- Mauritius-specific: tourist accommodation licensing references in the copy should be checked by the client.

## 🟢 G. Nice-to-have next features

Owner date-blocking (the FAQ already promises it), multi-language (French is the obvious second language for Mauritius), guest-facing booking flow, in-dashboard messaging with the account manager, per-property document upload by owners, email notifications matching the settings toggles.

---

## Suggested sequencing

1. **Now, in parallel:** the client fills in `data/company.ts` and supplies photography (no code dependency) **while** a developer starts auth + database.
2. **Then:** channel-manager integration, staff admin side, wire the stubs.
3. **Then:** SEO, analytics, legal pages.
4. **Launch:** remove all demo disclaimers, re-run `scripts/review.mjs` and Lighthouse, verify isolation with real accounts.

Estimated: roughly 1–2 weeks for a solid backend and auth; longer if channel-manager sync is in scope. Content and photography are the usual long pole — start them today.
