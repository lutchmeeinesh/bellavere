# Bellavere — demo website

A polished demo site for **Bellavere** (trading as Bellavere Property Care), a property management and syndic company on the north and west coasts of Mauritius: marketing site + protected owner dashboard with mock data and mock auth. Prices and figures display in **EUR or MUR**, visitor's choice.

**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · lucide-react. No backend, no database.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Node 20+ required. `npm run build` passes with zero TypeScript/lint errors.

## Demo accounts (owner dashboard)

Every account sees **only its own properties** — server-side filtering plus 404s on foreign ids.

| Email | Password | Portfolio |
| --- | --- | --- |
| `sophie@demo.bellavere.com` | `demo1234` | Sophie Laurent — 2 villas + 1 apartment |
| `ravi@demo.bellavere.com` | `demo1234` | Ravi Naidoo — 1 villa |
| `hamilton@demo.bellavere.com` | `demo1234` | Hamilton Estates Ltd — 5 apartments |

The login page lists these with one-click "Use" buttons.

## Where things live

| Area | Path |
| --- | --- |
| Design tokens (colors, type, radius, shadows) | `app/globals.css` |
| Company facts (single source for all placeholder copy) | `data/company.ts` |
| Mock data (clients, properties, bookings, tickets, documents) | `data/*.ts` |
| Derived numbers — charts, KPIs, statements all agree | `lib/metrics.ts` |
| Mock auth (cookie session) | `lib/auth.ts`, `app/api/auth/*`, `middleware.ts` |
| Shared UI primitives | `components/ui/*` |
| Automated review script (screenshots + checks) | `scripts/review.mjs` |

## Company facts

**Confirmed by the client (22 Sep 2026)** and now live on the site:

| Fact | Value | Where |
| --- | --- | --- |
| Name | Bellavere (trading name: Bellavere Property Care) | `data/company.ts` |
| Team | Krit Goburdhan — General Manager & Site Supervisor; Ankit Zoodookhorun — Client Relations | `data/company.ts` |
| Company email | BellavereLtd@gmail.com | `data/company.ts` |
| Mission | "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you." | `data/company.ts` |
| Currency | MUR and EUR, visitor chooses | `lib/format.ts` |
| Services incl. syndic | From the client's own prospect-list outreach copy | `app/(site)/services/page.tsx` |

Team members' personal emails are stored in `data/company.ts` for internal use (e.g. routing enquiries) but are **not shown on the public site**. Surnames were inferred from the email addresses — confirm spelling.

## Placeholders still waiting on company info

Every remaining demo-invented fact is marked in the source with `{/* TODO: confirm with client */}` (32 markers). Search for that string to see each one in place.

| Placeholder | Demo value used | Where |
| --- | --- | --- |
| Tagline | "Your property, perfectly managed." | `data/company.ts` |
| Legal name + BRN | "Bellavere Ltd" (inferred from the email), no BRN | `data/company.ts`, legal pages |
| Phone | +230 5 728 4410 | `data/company.ts` |
| Address | La Croisette Business Centre, Grand Baie | `data/company.ts` |
| Office hours | Mon–Sat 8:30–17:30 | `data/company.ts` |
| Social links | demo Instagram/Facebook/LinkedIn URLs | `data/company.ts` |
| Pricing model | 18% of gross rental income | `data/company.ts` (drives statement maths too) |
| EUR→MUR rate | €1 = Rs 52 (whole number on purpose — see `lib/format.ts`) | `lib/format.ts` |
| Surname spelling & bio wording | inferred from emails | `data/company.ts` |
| About-page story wording | written from the mission | `app/(site)/about/page.tsx` |
| Testimonials | 3 invented owner quotes | `data/testimonials.ts` |
| Service response times & concierge yield claim | "under 2 hours", "within 4 hours", "+9%" | `app/(site)/services/page.tsx` |
| FAQ answers (payout day, onboarding time, long lets) | see contact page | `components/contact/FaqAccordion.tsx` |
| Payout day | "by the 5th" | statements/settings pages |
| Legal pages | templates — need a lawyer's review | `app/(site)/privacy`, `app/(site)/terms` |
| Imagery | Unsplash stock (alt text verified against each photo) | `data/properties.ts`, `data/siteImages.ts` |
| Listings | 12 fictional properties, marked "Demo listings" | `data/properties.ts` |
| Coverage map | stylised SVG placeholder | `components/site/MauritiusMap.tsx` |

## Currency (EUR / MUR)

- All amounts are **stored in EUR**; the visitor picks EUR or MUR with the switch in the site header, the dashboard top bar, or Settings → Display currency.
- The choice is saved in the `bv_currency` cookie (1 year). The root layout reads it on the server, so every page renders in the chosen currency from the first paint — no flash.
- MUR is converted at `EUR_TO_MUR` in `lib/format.ts`. Because it is a whole number and all stored amounts are whole euros, converted statements still add up to the rupee. When rupee amounts are shown, a small note states the rate (transparency is part of the brand).
- Always format money through `formatMoney` / `useMoney()` / `<Money eur={…} />` — never hard-code a symbol.
- Each owner also has a separate **payout currency** (e.g. the Mauritian owner is paid in MUR), shown in Settings.
- To use real dual prices instead of conversion later, store both amounts per record and have `formatMoney` pick the matching one.

## SEO, legal and spam protection

- `app/sitemap.ts`, `app/robots.ts` (dashboard, login and API blocked from indexing), `app/opengraph-image.tsx`, and LocalBusiness JSON-LD (`components/site/JsonLd.tsx`).
- `htmlLimitedBots: /.*/` in `next.config.ts` keeps `<meta>`/Open Graph tags in `<head>` for every visitor (pages are dynamic, and Next.js 15 would otherwise stream them into the body).
- `/privacy` (Mauritius Data Protection Act 2017 + GDPR) and `/terms` — templates, to be reviewed by a lawyer. No cookie banner: the site sets only a strictly necessary session cookie and the user-requested currency preference. Add a consent banner as soon as analytics or marketing cookies are introduced.
- Contact form and newsletter: honeypot field + IP rate limit (`lib/rateLimit.ts`; in-memory, so use Upstash Redis on Vercel), consent record logged with timestamp.

## Swapping the mocks for a real backend

Suggested: **Supabase** (auth + Postgres + storage).

1. **Auth** — replace `lib/auth.ts` and `app/api/auth/*` with Supabase Auth (email/password or magic link). Keep `requireClient()`'s contract: every dashboard page calls it and filters by the returned client id. `middleware.ts` swaps its cookie check for Supabase session validation.
2. **Data** — the `data/*.ts` modules and `lib/metrics.ts` are the only data surface. Recreate them as queries/views: tables `clients`, `properties`, `bookings`, `maintenance_tickets`, `documents`, `statements`. Row-level security on `client_id` gives you the same isolation guarantee the mock enforces in code.
3. **Contact form & newsletter** — `app/api/contact/route.ts` and `app/api/newsletter/route.ts` validate, rate-limit and log; the file comments show where to plug in Resend (or Formspree/CRM/Mailchimp).
4. **Statements PDF** — replace the print-window with a real renderer (e.g. react-pdf or a server route) once statements come from the database.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel — the Next.js defaults are correct (build `next build`, Node 20+).
2. Set `NEXT_PUBLIC_SITE_URL` to the production URL (used for metadata).
3. `next/font/google` downloads fonts at build time — a transient network failure shows up as a Turbopack `next/font/google` import-map error; simply rebuild.
4. Unsplash imagery is whitelisted in `next.config.ts` (`images.remotePatterns`); replace with your own CDN/domain when real photography lands.
5. The demo cookie auth works as-is on Vercel (the cookie is `secure` in production). Swap for real auth before letting real owners in.

## Review artifacts

- `ASSUMPTIONS.md` — every decision made where the brief was silent.
- `REVIEW.md` — automated review findings (console errors, isolation checks, responsive/screenshot pass) and fixes.
- `screenshots/` — desktop (1440) + mobile (390) captures of every route, regenerate with `node scripts/review.mjs` against a running build.
