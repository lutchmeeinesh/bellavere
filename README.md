# Bellavere — demo website

A polished demo site for **Bellavere** (trading as Bellavere Property Care), a property management and syndic company working all around Mauritius: marketing site, owner dashboard and staff admin area, with mock data and signed-cookie auth. Prices and figures display in **EUR or MUR**, visitor's choice.

**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · lucide-react. No backend, no database.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Node 20+ required. `npm run build` passes with zero TypeScript/lint errors.

## Admin accounts (Bellavere staff)

Three administrators can see **every owner's information** at `/admin` and open any owner's portal ("Open portal", with an "Admin view" banner and a "Back to admin" button):

| Admin | Login email |
| --- | --- |
| Krit Goburdhan | kritgoburdhan@gmail.com |
| Ankit Zoodookhorun | zoodookhorun@gmail.com |
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
| Company facts (single source for all placeholder copy) | `data/company.ts` |
| Mock data (clients, properties, bookings, tickets, documents) | `data/*.ts` |
| Derived numbers — charts, KPIs, statements all agree | `lib/metrics.ts` |
| Auth: signed sessions, hashed passwords, admins | `lib/session.ts`, `lib/password.ts`, `lib/auth.ts`, `data/admins.ts`, `app/api/auth/*`, `middleware.ts` |
| Admin area | `app/admin/*`, `components/admin/*`, `app/api/admin/view-as` |
| Environment variables | `.env.example` (template), `.env.local` (your secrets, git-ignored) |
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
| Fees | Negotiated and set after the first meeting; never more than 15% (each owner's agreed rate drives their statements) | `data/company.ts`, `data/clients.ts` |
| Onboarding | One to two weeks | `components/contact/FaqAccordion.tsx` |
| Coverage | All around Mauritius (the client's own map) | `public/images/coverage-map.webp`, About page |
| Services incl. syndic | From the client's own prospect-list outreach copy | `app/(site)/services/page.tsx` |

Team members' personal emails are stored in `data/company.ts` for internal use (e.g. routing enquiries) but are **not shown on the public site**. Surnames were inferred from the email addresses — confirm spelling.

## Placeholders still waiting on company info

**All fake filler was stripped on 22 Sep 2026.** Anything unconfirmed is either removed or hidden until real. 15 `{/* TODO: confirm with client */}` markers remain; search for that string to see each one.

| Still needed | Currently | Where |
| --- | --- | --- |
| Phone, office hours, social links | **not shown anywhere** — they appear automatically once set | `data/company.ts` |
| Registered address, BRN | not shown; legal pages list them once set | `data/company.ts`, legal pages |
| Legal name | "Bellavere Ltd" (inferred from the email) | `data/company.ts` |
| Tagline | "Your property, perfectly managed." | `data/company.ts` |
| Fee basis | 15% cap assumed to be of gross rental income | `data/company.ts` |
| EUR→MUR rate | €1 = Rs 52 | `lib/format.ts` |
| Surname spelling & bios | inferred from emails | `data/company.ts` |
| Testimonials | 3 **illustrative** quotes (Élise M., Deepak R., Nathalie C. — not real people, not the demo owners). Replace with real quotes, with permission, before the site is public | `data/testimonials.ts` |
| Legal pages | templates for a lawyer to review; retention periods TODO | `app/(site)/privacy`, `app/(site)/terms` |
| Imagery | Unsplash stock (marketing pages + the portal demo) | `data/siteImages.ts`, `data/properties.ts` |

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
- Contact form: honeypot field + IP rate limit (`lib/rateLimit.ts`; in-memory, so use Upstash Redis on Vercel), consent record logged with timestamp.

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
3. **Contact form** — `app/api/contact/route.ts` validates, rate-limits and logs; the file comments show where to plug in Resend (or Formspree/CRM).
4. **Statements PDF** — replace the print-window with a real renderer (e.g. react-pdf or a server route) once statements come from the database.

## Deploying to Vercel

1. Push this repo to a **private** GitHub repository and import it in Vercel — the Next.js defaults are correct (build `next build`, Node 20+).
2. In Vercel → Settings → Environment Variables, add every variable from `.env.example`: `NEXT_PUBLIC_SITE_URL` (your domain), a new random `SESSION_SECRET`, the three `ADMIN_*_PASSWORD_HASH` values, `DEMO_MODE`, `SITE_INDEXABLE`. Without `SESSION_SECRET`, sign-in is refused in production (fail-closed).
3. Vercel → Settings → Domains: add the domain and `www`, then create the DNS records Vercel shows at your registrar.
4. `next/font/google` downloads fonts at build time — a transient network failure shows up as a Turbopack `next/font/google` import-map error; simply rebuild.
5. Unsplash imagery is whitelisted in `next.config.ts` (`images.remotePatterns`); replace with your own CDN/domain when real photography lands.
6. Cookies are `secure` in production automatically. Move owner accounts to a database before real owners sign up.

## Review artifacts

- `ASSUMPTIONS.md` — every decision made where the brief was silent.
- `REVIEW.md` — automated review findings (console errors, isolation checks, responsive/screenshot pass) and fixes.
- `screenshots/` — desktop (1440) + mobile (390) captures of every route, regenerate with `node scripts/review.mjs` against a running build.
