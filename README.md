# BellaVere — demo website

A polished demo site for **BellaVere**, a villa & apartment management company on the north and west coasts of Mauritius: marketing site + protected owner dashboard with mock data and mock auth.

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

## Placeholders waiting on company info

All demo-invented facts are marked in the source with `{/* TODO: confirm with client */}` (the JSX form of an HTML comment). Master list — most live in `data/company.ts`:

| Placeholder | Demo value used | Where |
| --- | --- | --- |
| Tagline | "Your property, perfectly managed." | `data/company.ts` |
| Location / market | North & west coast, Mauritius | `data/company.ts` |
| Founded | 2016 | `data/company.ts` |
| Team / founders | 3 invented principals + bios | `data/company.ts` |
| Phone | +230 5 728 4410 | `data/company.ts` |
| Email | hello@bellavere.mu | `data/company.ts` |
| Address | La Croisette Business Centre, Grand Baie | `data/company.ts` |
| Office hours | Mon–Sat 8:30–17:30 | `data/company.ts` |
| Social links | demo Instagram/Facebook/LinkedIn URLs | `data/company.ts` |
| Mission / story | 2–3 invented sentences | `data/company.ts` |
| Pricing model | 18% of gross rental income | `data/company.ts` (drives statement maths too) |
| Trust-bar stats | 68 properties, 81% occupancy, 10 years, 4.9/5 | `data/company.ts` |
| Currency | EUR | `lib/format.ts` |
| Testimonials | 3 invented owner quotes | `data/testimonials.ts` |
| Service response times & concierge yield claim | e.g. "under 4 hours" | `app/(site)/services/page.tsx` |
| FAQ answers (payout day, onboarding time, long lets) | see contact page | `app/(site)/contact/page.tsx` |
| Payout day | "by the 5th" | statements/settings pages |
| Imagery | Unsplash coastal/villa photos | `data/properties.ts`, `data/siteImages.ts` |
| Coverage map | stylised SVG placeholder | `components/site/MauritiusMap.tsx` |

Search the codebase for `TODO: confirm with client` to see every marked spot in place.

## Swapping the mocks for a real backend

Suggested: **Supabase** (auth + Postgres + storage).

1. **Auth** — replace `lib/auth.ts` and `app/api/auth/*` with Supabase Auth (email/password or magic link). Keep `requireClient()`'s contract: every dashboard page calls it and filters by the returned client id. `middleware.ts` swaps its cookie check for Supabase session validation.
2. **Data** — the `data/*.ts` modules and `lib/metrics.ts` are the only data surface. Recreate them as queries/views: tables `clients`, `properties`, `bookings`, `maintenance_tickets`, `documents`, `statements`. Row-level security on `client_id` gives you the same isolation guarantee the mock enforces in code.
3. **Contact form** — `app/api/contact/route.ts` currently logs and returns 200; the file comments show where to plug in Resend (or Formspree/CRM).
4. **Statements PDF** — replace the print-window with a real renderer (e.g. react-pdf or a server route) once statements come from the database.

## Deploying to Vercel

1. Push this repo to GitHub and import it in Vercel — the Next.js defaults are correct (build `next build`, Node 20+).
2. Set `NEXT_PUBLIC_SITE_URL` to the production URL (used for metadata).
3. Unsplash imagery is whitelisted in `next.config.ts` (`images.remotePatterns`); replace with your own CDN/domain when real photography lands.
4. The demo cookie auth works as-is on Vercel (the cookie is `secure` in production). Swap for real auth before letting real owners in.

## Review artifacts

- `ASSUMPTIONS.md` — every decision made where the brief was silent.
- `REVIEW.md` — automated review findings (console errors, isolation checks, responsive/screenshot pass) and fixes.
- `screenshots/` — desktop (1440) + mobile (390) captures of every route, regenerate with `node scripts/review.mjs` against a running build.
