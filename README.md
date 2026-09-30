# Bellavere — demo website

A polished demo site for **Bellavere** (trading as Bellavere Property Care), a property management and syndic company working all around Mauritius: marketing site, owner dashboard and staff admin area, with mock data and signed-cookie auth. Prices and figures display in **EUR or MUR**, visitor's choice.

**Stack**: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · lucide-react. A small backend (sign-in, the contact form via Resend), no database: owners and figures are mock data.

**Live:** https://www.bellaveremu.com (Vercel, deployed from GitHub `main`), since 30 Sep 2026.

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
| Legal entity | **Bellavere Ltd**, Company No. **238321**, incorporated 19 Aug 2026 in Mauritius as a private company limited by shares (Certificate of Incorporation, CB No 82650) | `data/company.ts` |
| Enquiries | Contact form emails **BellavereLtd@gmail.com** (via Resend) | `app/api/contact/route.ts` |
| Team | Krit Goburdhan — General Manager & Site Supervisor; Ankit Dookhorun — Client Relations; Nihal Lutchmee | `data/company.ts` |
| Contacts | Ankit Dookhorun +230 5531 0734, zoodookhorun@gmail.com · Nihal Lutchmee +230 5817 4529, executive@wwwbellavere.com — both reachable every day, 24/7 | `data/company.ts` (`contacts`) |
| Response time | Every query answered the same day | `data/company.ts` (`responseTime`) |
| Social | Instagram and Facebook: bellavere.ltd | `data/company.ts` (`social`) |
| Company email | BellavereLtd@gmail.com | `data/company.ts` |
| Mission | "Our mission is to provide the best service while maintaining full transparency. No hidden fees — and there will always be a human to answer you." | `data/company.ts` |
| Currency | MUR and EUR, visitor chooses | `lib/format.ts` |
| Fees | Negotiated and set after the first meeting; never more than 15% (each owner's agreed rate drives their statements) | `data/company.ts`, `data/clients.ts` |
| Onboarding | One to two weeks | `components/contact/FaqAccordion.tsx` |
| Coverage | All around Mauritius (the client's own map) | `public/images/coverage-map.webp`, About page |
| Services incl. syndic | From the client's own prospect-list outreach copy | `app/(site)/services/page.tsx` |

Ankit's and Nihal's emails and both phone numbers are published on the contact page at the client's request. **Krit's email is not published** and is kept only in `data/admins.ts` (server-side) — `data/company.ts` is bundled into browser code, so it must never hold private data. Krit's surname (Goburdhan) was confirmed by the client on 22 Sep 2026.

## Placeholders still waiting on company info

**All fake filler was stripped on 22 Sep 2026.** Anything unconfirmed is either removed or hidden until real. 8 `{/* TODO: confirm with client */}` markers remain; search for that string to see each one.

| Still needed | Currently | Where |
| --- | --- | --- |
| Registered address | not shown (it isn't on the Certificate of Incorporation); legal pages list it once set | `data/company.ts` |
| Tagline | "Your property, perfectly managed." | `data/company.ts` |
| Bios | written from the confirmed roles | `data/company.ts` |
| Testimonials | **kept by client decision (22 Sep 2026)** — 3 illustrative quotes (Élise M., Deepak R., Nathalie C. — not real people, not the demo owners). Replace with real quotes, with permission, before the site is public | `data/testimonials.ts` |
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

- `app/sitemap.ts`, `app/robots.ts` (dashboard, admin and API blocked from indexing; the login page carries `noindex`), `app/opengraph-image.tsx`, canonical and Open Graph URLs, and Organization JSON-LD with a logo (`components/site/JsonLd.tsx`).
- Public pages are prerendered and cached at the edge; the owner and admin portals render per request. `htmlLimitedBots: /.*/` in `next.config.ts` keeps the portals' `<meta>` tags in `<head>`.
- Security headers and a Content-Security-Policy are set in `next.config.ts`; `instrumentation.ts` logs missing or malformed environment variables at start-up (`[env]` in Vercel → Logs).
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

## Review artifacts

- `ASSUMPTIONS.md` — every decision made where the brief was silent.
- `REVIEW.md` — automated review findings (console errors, isolation checks, responsive/screenshot pass) and fixes.
- `screenshots/` — desktop (1440) + mobile (390) captures of every route, regenerate with `node scripts/review.mjs` against a running build.
