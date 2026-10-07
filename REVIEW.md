# Review findings (Phase 3)

Automated review: `scripts/review.mjs` (Playwright) opens every route logged out and as each of the three demo accounts, screenshots desktop (1440) + mobile (390) into `/screenshots`, collects console/page errors and failed requests, and verifies auth redirects, logout, cross-client data isolation, `alt` attributes, broken images and leftover lorem ipsum. Lighthouse runs separately against the production build.

## Findings & fixes

### 1. Foreign property ids returned HTTP 200 instead of 404 (fixed)

**Found:** logged in as any account, requesting another client's `/dashboard/properties/[id]` rendered the branded not-found UI and leaked no data — but the HTTP status was **200**, failing the QA requirement of a real 404.

**Cause:** the dashboard has a `loading.tsx`, so the route streams; once streaming starts, Next.js 15 cannot change the status code, and an in-page `notFound()` (and even one in `generateMetadata`, since Next 15 streams metadata too) only switches the UI, not the status.

**Fix:** ownership of `/dashboard/properties/[id]` is now enforced in `middleware.ts` — before rendering starts — by rewriting foreign/unknown ids to an unmatched route, which renders the branded 404 page with a genuine 404 status. The page keeps its own `notFound()` check as defence in depth.

**Verified after fix:** as Sophie — `p-04` (Ravi's) → **404**, `p-99` (unknown) → **404**, `p-01` (own) → **200**. Same pattern for the other two accounts.

### 2. Review-script false positive on the 404 page (fixed in the script)

The first pass flagged a console error on the custom 404 page; it was Chromium logging the page's own 404 network status — expected behaviour, not a defect. The script now excludes that route from the console-error check.

## Checks that passed

- **Build**: `npm run build` — 0 TypeScript errors, 0 lint errors; all 15 routes compile, 12 property pages pre-rendered via `generateStaticParams`.
- **Console**: no console errors, page errors or failed requests on any public or dashboard route (all three accounts).
- **Auth**: unauthenticated `/dashboard/*` redirects to `/login?from=…`; authenticated `/login` redirects to `/dashboard`; logout clears the session and `/dashboard` bounces back to `/login` (verified per account).
- **Data isolation**: each account's `/dashboard/properties` lists exactly its own properties; probes confirmed foreign property names are absent from the rendered pages of every other account.
- **Images**: every `<img>` has an `alt`; no broken images (all Unsplash photo ids were also HTTP-verified at build time).
- **Content**: no lorem ipsum anywhere; no horizontal page scroll at 390 px or 1440 px.
- **Custom 404**: unknown URLs render the branded 404 page.

## Screenshots

`/screenshots/*-desktop.png` (1440) and `*-mobile.png` (390) for: home, services, properties, property detail, about, contact, login, 404, and all seven dashboard routes plus a dashboard property detail (captured as Sophie).

## Lighthouse (production build, desktop, `/`)

**Performance 100 · Accessibility 96 · Best Practices 100** (targets: ≥ 90 / ≥ 95 / ≥ 95 — all met). Full report in `lighthouse.json`. Note: in this environment `chrome-launcher` could not spawn Chrome itself; the report was produced by launching Playwright's Chromium with `--remote-debugging-port=9222` and running `npx lighthouse --port=9222 --preset=desktop`.

## Known limitations (accepted for a demo)

- Maintenance "Report an issue" tickets, settings edits and the contact form live in local state / a logging route handler — nothing persists (stated in the UI where relevant).
- Statement "Download PDF" opens a print-ready window rather than generating a binary PDF.
- ~~The topbar date-range selector is decorative~~ — replaced by the EUR/MUR switch in round 2; the overview revenue chart keeps its own 3M/6M/12M toggle.
- `prefers-reduced-motion` is handled globally (CSS kill-switch + `MotionConfig reducedMotion="user"` + per-component guards for Ken Burns, count-ups and the testimonial auto-advance).

---

## Round 2 — 22 September 2026 (company facts, MUR/EUR, SEO & legal)

### Findings & fixes

1. **Alt text described the wrong photos (fixed).** A visual contact-sheet audit of all 30 Unsplash images found about 18 whose alt text described something else. Examples: a living room labelled as a bedroom (Bain Bœuf's cover photo), a dark facade labelled as a "bright living room", a *scuba diver* labelled "aerial view of a lagoon" (home CTA band), and a *forest dome tent* labelled "pool deck with parasols". Root cause: the original check only verified HTTP 200. All 52 alt entries were rewritten from the actual images, and the diver and dome photos were replaced.
2. **The syndic card rendered blank (fixed).** The new navy card inherited `bg-white` from `Card`, so its white text was invisible. It now uses its own navy container.
3. **Map labels collided (fixed).** Adding Grand Gaube and Pointe aux Piments made the north-coast labels overlap. Labels now have per-marker placement (right, left, above or none). Unlabelled dots are still listed in the chips beside the map.
4. **Metadata was streamed into `<body>` (fixed).** Once pages became dynamic (because of the currency cookie), Next.js 15 streamed `<meta>` and Open Graph tags after `</head>` for browsers *and Googlebot*. That is fragile for link previews and non-JS crawlers, and Lighthouse flagged it. `htmlLimitedBots: /.*/` keeps them in `<head>` for every user agent (verified with Chrome, Googlebot and WhatsApp user agents).
5. **Colour contrast was below AA (fixed).** Affected: eyebrow labels (gold-600, 2.9:1), gold, sea and semantic badges (2.4–4.2:1), muted grey on sand-100 (4.49:1), footer small print (3.75:1) and the newsletter error text (red on navy, 3.5:1). Fixed with text-safe `-700` tokens, a slightly darker ink-500, and light error text with a red icon. See ASSUMPTIONS.md.
6. **Heading order on /properties (fixed).** A visually hidden `h2` now precedes the card `h3`s.
7. **Transient build failure (not a code issue).** One build failed with a Turbopack `next/font/google` import-map error, and the identical code then rebuilt cleanly. `next/font/google` fetches fonts at build time, so a network blip fails the build; just rebuild. Noted in the README.

### Verification

- `npm run build`: 0 TypeScript errors, 0 lint errors.
- `scripts/review.mjs`: **0 errors, 0 warnings.** It covers all public and dashboard routes for all three accounts, the isolation 404s and logout. New currency checks: clicking MUR re-renders prices in rupees, the choice persists across navigation (Villa Azure shows "from Rs 24,960", which is €480 × 52), and the dashboard statements follow it.
- MUR statements reconcile exactly, e.g. Rs 847,704 − 152,568 − 31,980 = Rs 663,156 (the net shown).
- **Lighthouse (desktop), all 16 routes** (performance / accessibility / best practices / SEO):

| Route | Perf | A11y | BP | SEO |
| --- | --- | --- | --- | --- |
| `/` | 99 | 100 | 100 | 100 |
| `/services` | 100 | 100 | 100 | 100 |
| `/properties` | 99 | 100 | 100 | 100 |
| `/properties/villa-azure` | 100 | 100 | 100 | 100 |
| `/about`, `/contact`, `/privacy`, `/terms` | 100 | 100 | 100 | 100 |
| `/login` | 100 | 100 | 100 | 66* |
| `/dashboard/*` (7 pages) | 100 | 96–100 | 100 | 63–66* |

\* Intentional: `robots.txt` blocks the login page and the owner portal from search engines, which Lighthouse scores as "blocked from indexing".

- 37 screenshots in `/screenshots`, including the new legal pages and a statements page in MUR.

---

## Round 3 — 22 September 2026 (admins, signed sessions, fees, coverage)

### Findings & fixes

1. **Forgeable session cookie (fixed).** Setting `bv_session=c-hamilton` by hand used to open Hamilton's portal. Sessions are now HMAC-signed; the review now proves a hand-set cookie *and* a genuine token with an edited payload are both rejected.
2. **`.env` loader corrupted the password hashes (fixed).** Admin logins initially failed: Next.js expands `$name` in `.env` values, turning the 120-character `scrypt$salt$hash` into 80 characters. Verified with `@next/env`, then switched the format to `scrypt:salt:hash`; all four secrets now load intact and all three admins sign in.
3. **Rate limit would have locked out legitimate users (fixed before shipping).** The first version counted successful sign-ins; it now counts failures only.
4. Cosmetic: headings now use `text-wrap: balance` (the new team heading had left "to" alone on a line).

### Verification

- `npm run build`: 0 TypeScript errors, 0 lint errors.
- `scripts/review.mjs`: **0 errors, 0 warnings, 23 checks** — adds forged cookie, tampered token, owner blocked from `/admin` and from view-as (403), wrong admin password (401), admin sign-in → `/admin`, overview lists all owners, open an owner's portal (banner, only that owner's data), isolation inside admin view (foreign property 404), leave view-as → `/admin`.
- All three admin accounts sign in (200 → `/admin`), checked without printing any password.
- Note for Lighthouse: with `SITE_INDEXABLE=false` (the default until launch) SEO scores are intentionally low because every page is `noindex`.

---

## Round 4 — 22 September 2026 (fake filler stripped)

### Method

A multi-agent workflow: three independent auditors, each with a different lens (numbers & history; service scope & features; promises & policies), swept every public-copy and portal-UI file against the list of confirmed facts. Findings were deduplicated, fixed by one agent per file (so no edits collided), then re-audited by a fresh-eyes critic, looping until clean (3 rounds, 91 distinct findings). The critic's last 7 findings were applied by hand (6 accepted, 1 rejected: "developers" is in the client's own prospect list).

### Notable fixes

- Services: response-time and yield claims replaced with confirmed statements; "What's included" lists trimmed to the confirmed scope; comparison table's empty owner column removed.
- FAQ: invented payout date, long-lets answer and date-blocking feature removed; onboarding "one to two weeks from our first meeting".
- Settings: fake notification toggles replaced with an honest "not available yet" notice; payout "by the 5th" removed.
- Maintenance: the demo confirmation no longer claims the team "will be in touch" — it says it's a demo and isn't sent.
- Newsletter removed (Bellavere doesn't send one); privacy policy updated to match.
- Public portfolio (`/properties`, featured section) removed; `/properties` now 404s.

### Verification

- `npm run build`: 0 TypeScript errors, 0 lint errors.
- `scripts/review.mjs`: **0 errors, 0 warnings.** New checks: a **fake-filler guard** scans the full HTML of every public page for the removed content (placeholder phone/address, response times, "+9%", "by the 5th", old testimonial names, "since 20xx", portfolio links); the sign-in page offers exactly **2** demo accounts; `/properties` returns 404. All earlier currency, security, admin and isolation checks still pass.
- `TODO: confirm with client` markers: 30 → 15, all for facts only the client can supply.

---

## Round 5 — 22 September 2026 (real contact details)

### Independent verification

A read-only workflow ran three reviewers with different lenses (exactness of the new facts, coverage on the site, honesty/overclaiming) plus a skeptic who re-checked every report against the files: 22 issues confirmed, 13 rejected.

### Findings & fixes

1. **Privacy leak (fixed).** `data/company.ts` is imported by client components, so its `team[].email` fields — including **Krit's personal email, which is never displayed** — were shipped in two browser JS bundles. Emails were removed from the team list (admin logins keep them server-side in `data/admins.ts`). The review script now **scans every built browser bundle** for password hashes, admin env names, the session secret and private emails: 41 bundles clean.
2. **Count-ups showed "0" to crawlers and screen readers (fixed).** Server HTML rendered "0%" for "100% human answers" (and would have shown "0/7"). `CountUp` now renders the real figure first, with a screen-reader copy; only the visible digits animate. 24/7 and "Same day" are fixed text.
3. **"1 point of contact" contradicted the two published contacts** — replaced in the trust bar.
4. **Organisation-wide 24/7 `openingHours`** implied premises — removed; 24/7 stays on the contact points.
5. **Contact intro bundled same-day replies with a same-day valuation** — separated.
6. **Nihal missing from "The main people you will speak to"** — added (name, availability, number; no invented role).
7. **Footer showed only Ankit's number without a name** — now both people, by name.
8. My own fake-filler guard flagged the real `instagram.com/bellavere.ltd` (it matched any `instagram.com/bellavere…`) — narrowed to the old invented `.mu` handles.
9. Grammar ("coordinates" → "coordinate"), stale code comment, and every doc reference to the old surname.

### Verification

- `npm run build`: 0 TypeScript errors, 0 lint errors.
- `scripts/review.mjs`: **0 errors, 0 warnings** — adds: bundle secret scan; contact page must show Ankit Dookhorun, +230 5531 0734, zoodookhorun@gmail.com, Nihal Lutchmee, +230 5817 4529, 24/7, same-day, and both bellavere.ltd social links; the old surname must not reappear.

---

## Round 6 — 22 September 2026 (registration, contact-form email, go-live prep)

### What changed

- Registration details from the Certificate of Incorporation (Bellavere Ltd, Company No. 238321, incorporated 19 Aug 2026, private company limited by shares) replace the visible "BRN: to be confirmed" placeholder on the legal pages, and appear in the footer and structured data. The certificate has no registered address, so none is shown.
- The contact form now emails **BellavereLtd@gmail.com** through Resend, with Reply-To set to the enquirer.
- `.env.vercel.local` (git-ignored) was prepared with a fresh production `SESSION_SECRET`.

### Independent review (security + accuracy, skeptic-adjudicated): 12 confirmed, 9 rejected — all fixed

1. **Raw control bytes in the contact route** made git treat the file as binary (no diffs on GitHub, skipped by search). Rewritten with escaped hex code points; 0 control bytes remain and git shows normal line diffs. (Cause: an editing tool decoded unicode escape sequences into real characters.)
2. **Cross-site posting:** a third-party page could submit through its visitors' browsers, dodging the per-IP limit and burning Resend's 100-emails/day free quota. The route now accepts only same-site JSON (415 for other content types, 403 for a foreign Origin).
3. **Honeypot named "company_website"** could be autofilled by browsers, silently discarding a real enquiry. Renamed to a neutral field, and a hit now leaves a one-line trace.
4. **Length limits** existed only on the server with a misleading "complete the required fields" error. Limits are now shared (`lib/contactLimits.ts`), enforced in the form with field-level messages, and the server explains over-long input.
5. **Email typos** (double dot, trailing dot, comma) would have made Resend reject the send. The shared pattern now rejects them up front.
6. **Log retention overstated:** Vercel keeps runtime logs about 1 hour on Hobby, so the docs no longer call the log a recovery mechanism. The direct contacts shown to the visitor are the safeguard.
7–12. Stale doc lines (TODO counts, Krit's surname, Resend status, HANDOFF go-live list).

### Verification

- `npm run build`: 0 TypeScript errors, 0 lint errors.
- **Contact delivery, end to end against a mock Resend: 24/24 pass on fresh servers.** Covers delivery to BellavereLtd@gmail.com, bearer key, reply-to, subject, all fields, HTML escaping, outage (direct contacts shown), missing key (loud failure), honeypot, validation, same-site-only, over-long input, email typos, and real browser submissions. A repeated run showed 2 browser failures; these were the form's own 5-per-10-minutes rate limit correctly blocking the repeated test submissions, and they don't occur on fresh servers.
- `scripts/review.mjs`: **0 errors, 0 warnings**; 41 browser bundles contain no secrets or private emails.

---

## Round 7 — 23 September 2026 (post-deployment audit of the live site)

Four independent read-only audits ran against https://bellavere.vercel.app (functional QA, security, backend code, performance + SEO). They confirmed that sessions can't be forged, cookies are HttpOnly/Secure/Lax, there is no open redirect, no secrets are in the 31 live JS chunks, source maps are not served, the contact hardening works, isolation holds live, accessibility scores 96–100 and desktop performance 92–100. The defects they found, and the fixes (four agents on disjoint files plus the lead):

### High

| Finding | Fix |
|---|---|
| **Brand fonts never applied**: every heading and paragraph rendered in the system font. The `next/font` variables were on `<body>`, but the theme tokens that use them (`--font-serif`, `--font-sans`) are defined on `:root`, so they resolved to nothing. | Font variable classes moved to `<html>` (`app/layout.tsx`). `review.mjs` now asserts Cormorant on `h1` and Inter on `body` for every public page. |
| **Every page rendered per request in iad1 (Washington), never cached**, because the root layout read the currency cookie. | The root layout reads nothing per request. All public pages and `/login` are prerendered (ISR: home hourly for the dashboard preview, others daily; `dynamic = "error"` in `app/(site)/layout.tsx` fails the build if one ever turns dynamic again). The currency provider now reads the cookie in the browser (`useSyncExternalStore`), while the dashboard and admin layouts still read it on the server so the portals paint in the right currency. Providers stay in sync through an event and a `BroadcastChannel` (other tabs). Functions moved to **cpt1 (Cape Town)**, the nearest region to Mauritius (`vercel.json`). |
| **Content invisible until JavaScript loaded** (blank page without JS; 1–1.9 s LCP delay): `PageTransition` and every `Reveal` rendered `opacity:0` in the server HTML. | `PageTransition` and the hero are now CSS animations (they start with the first paint). `Reveal` renders visible; after hydration it hides only blocks still below the fold and reveals them on scroll. `review.mjs` checks every public page with JavaScript disabled. |
| **No security headers**; `X-Powered-By: Next.js` on every page. | `next.config.ts`: a static Content-Security-Policy (no nonce, which would force dynamic rendering; `'unsafe-eval'` only in development, `upgrade-insecure-requests` only on Vercel), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`; `poweredByHeader: false`. |

### Medium

- **Login CSRF / forced logout:** a cross-site `text/plain` form could sign a visitor into the demo account, and any site could log users out. Login now requires same-origin JSON; logout and view-as refuse cross-site posts (`lib/http.ts`).
- **500s on valid JSON of the wrong shape** (`[]`, `{"name":5}`) in `/api/contact` and `/api/auth/login`: every field is now read as a string and non-objects get 400. Empty sign-ins get 400 without counting towards the lockout. The contact rate limit now only counts enquiries that would actually be sent.
- **"Today" was frozen when the server started, in UTC**: warm servers went stale and Mauritius saw yesterday's date between midnight and 4 am. `today()` is now the Mauritius calendar date, recomputed on each call; the mock data is rebuilt once per Mauritius day (`perDay` in `lib/dates.ts`). Dates stored as `yyyy-mm-dd` are read as local dates, so browsers west of UTC no longer show the previous day.
- **No error pages**: `app/error.tsx`, `app/global-error.tsx`, `app/dashboard/error.tsx` and `app/admin/error.tsx` now exist, all with the direct contacts.
- **No environment check**: `instrumentation.ts` + `lib/env.ts` log `[env]` errors and warnings at start-up (names only, never values).
- **Links to a section of another page landed at the top** (the site-wide `loading.tsx` skeleton replaced the page while it scrolled) and caused a 0.166 layout shift: the skeleton was removed.
- **"Report an issue" modal unreachable on small phones**: it now scrolls; the modal also traps focus and gives it back on close. Tabs follow the WAI-ARIA pattern, the notification bell is a disclosure (not a fake menu), Escape closes the mobile menus.
- **SEO:** canonical URLs, `og:url/type/site_name/locale`, `twitter:card`; sharper page titles; LCP images load first (`priority` + `fetchPriority="high"` on /, /about, /services, /login); JSON-LD is an `Organization` with a logo (no street address yet); real sitemap dates; after launch `/login` is crawlable so its `noindex` is seen.

### Low

Portal titles ("Bookings · Owner dashboard · Bellavere"), portal 404s decided in `middleware.ts` for every unknown path and foreign id (a real 404 status; the in-portal page from `app/dashboard/[...missing]` shows under `next start`, while Vercel serves its site-wide 404 page for any 404 status), heading order on the dashboard, round chart axis ticks in both currencies, occupancy-chart property names wrapped to fit their bar (five names used to run into each other; the "100%" label was clipped), lining figures in the serif KPIs, select chevrons, form errors linked to their fields, `?from=` deep links limited to plain portal paths, JSON 404 for unknown `/api/*` paths and 405 with `Allow`, one rupee spacing everywhere, dead code removed (`Toggle`, `endOfMonth`, `formatMonthShort`), `lighthouse` dropped from devDependencies (use `npx lighthouse`), Next.js 15.5.24 → 15.5.26. Forms now use `method="post"`, so a submit before the JavaScript loads can never put a password or personal details in the URL.

### Not changed (deliberately)

- **Instagram and Facebook links** stay, as the client asked — but neither https://www.instagram.com/bellavere.ltd/ nor https://www.facebook.com/bellavere.ltd appears to exist publicly yet (both return the same generic page as a made-up handle). Create or publish them, or confirm the exact handles.
- **Charts load with the dashboard** (recharts, ~100 KB). Lazy-loading them would make the chart cards pop in; revisit if dashboard mobile performance matters.
- **Admin 404s** are rendered in the browser (Next sends an empty 404 shell because the admin page throws before streaming), so they need JavaScript. The status is a real 404.

### Verification

- `npm run build` (Next.js 15.5.26): 0 type errors, 0 lint errors or warnings. Every public page and `/login` is listed as static (○); the portals and API routes as dynamic (ƒ).
- `node scripts/review.mjs` on the production build, with the admin flow: **0 errors, 0 warnings, 33 checks**. New in this round: brand fonts on every public page, every public page readable with JavaScript off (no `opacity:0` in the server HTML), footer links to `/services#syndic` and `/contact#faq` land on their section, the six security headers present and `X-Powered-By` gone, public pages not rendered per request, 13 hostile/malformed API requests answered 400/403/404/405/415 (never 500), and isolation 404s that must be real 404 statuses (the old check also accepted a 404-looking page).
- `test-contact-delivery.mjs` (a mock Resend): 24/24, unchanged behaviour after the API refactor.
- Portal 404s (curl, signed in as Sophie): `/dashboard/properties/p-05` (Hamilton's), `p-99`, `/dashboard/nope` and `/dashboard/properties/p-01/x` all return **404** with "Nothing here" inside the portal shell and no trace of the other owner's property; `p-01` returns 200.
- Targeted browser tests: values typed into the sign-in form before the JavaScript loads are kept; `?from=` deep links are followed and junk ones ignored; an empty sign-in is caught without a request; a currency switch in one tab moves a dashboard open in another tab entirely to rupees (server-formatted activity text included); the mobile "More" sheet closes on a same-page link.
- The `[env]` start-up check recognises the three admin password hashes as well-formed.
- **Independent adversarial review of the diff** (4 finders, one skeptic per finding): 9 findings, 8 confirmed, all low severity, all fixed and re-tested — the sign-in form was rebuilt on load (typed or autofilled values could be lost), a currency switch in another tab left server-formatted amounts in the old currency, the mobile "More" sheet stayed open on a same-page link and could trap focus past the desktop breakpoint, the "Upcoming check-ins" KPI left out today's arrivals that the "Next 7 days" list shows, and a stale paragraph in HANDOFF.md. One was rejected (UTC date parsing in `lib/metrics.ts`, which only runs on the server).
- **Live, after deploying (https://wwwbellavere.com):** `review.mjs` 0 errors, 0 warnings, 28 checks (the admin flow is not run against the live site, by policy); the 19 JavaScript chunks the live pages load contain no secrets; all 7 public pages are served from Vercel's edge cache (`x-vercel-cache: HIT`/`PRERENDER`) and functions run in `cpt1`; the security headers and CSP (with `upgrade-insecure-requests`) are present and `X-Powered-By` is gone; other owners' properties and unknown portal paths return a real 404 (Vercel shows its site-wide 404 page for them).
- **Lighthouse on the live site** (Lighthouse 12, simulated throttling): mobile `/` 95, `/services` 98, `/contact` 100 performance; desktop `/` and `/about` 100. Accessibility and best practices 100 on all five; CLS 0 everywhere; LCP 0.5–0.7 s on desktop, 1.5–2.8 s on a throttled phone; the server answers in 80 ms (it took ~450–530 ms per page before, rendered in Washington). SEO 66–69 is by design until `SITE_INDEXABLE=true` (the pages carry `noindex`).
- Test harness note: on a repeat visit the Next.js router can hold background prefetch responses open for ~30 s (clicks still navigate in ~100 ms), so `review.mjs` waits for `load` plus a short settle instead of `networkidle`.

---

## Round 8 — 5–7 October 2026 (Wave 1: income estimator, WhatsApp, French)

Wave 1 added three features to the live site, built on branch `wave-1` and released only after the checks below:

1. **Rental income estimator** at `/estimate` (five questions, a monthly and yearly *range*, the fee "at most 15%" and the net "at least", the mandatory disclaimer, a free-assessment call to action that pre-fills the contact form, a WhatsApp call to action) and a quick-start teaser on the home page.
2. **WhatsApp**: a floating button on every public page (hidden on the estimator's questions, carrying the estimate on its result) and WhatsApp + call cards for Ankit and Nihal on the contact page.
3. **French / English** with next-intl: English at `/`, French under `/fr`, an "EN | FR" switch, a one-time suggestion for French-preferring browsers (never a redirect), localized metadata, hreflang, a bilingual sitemap, and every user-facing string in `messages/en.json` / `messages/fr.json`.

Also: one public email constant (`PUBLIC_EMAIL`, still the Gmail address until hello@bellaveremu.com has a mailbox), Plausible analytics behind `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (off until set), localized 404 pages with a real 404 status.

### How it was built

- **Phase 0** (one agent): routing restructure (`app/[locale]/(site)`, `app/(portal)`), middleware merge, shared interfaces; then five agents moved every existing English string into messages — English output byte-identical (visual diff against the pre-Wave-1 baseline: ≤ 0.32% per page, header only).
- **Phase 1** (three feature streams in isolated git worktrees + four French translators following a shared style guide and glossary).
- **Phase 2**: a French editor and an English editor unified the copy; an integration engineer fixed the 404 rendering (server HTML without JavaScript), cut the client JavaScript back to near pre-Wave-1 levels (home 239 → 204 kB), and cleared every axe finding; messages were consolidated into the two files.
- **Phase 3**: an independent review by four reviewers (functional QA in both locales, visual/performance/accessibility, code review, native French), fixes by three fixers, and an independent re-verification.

### Phase 3 review: 39 findings (0 blocker, 3 major, 18 minor, 18 nit)

| Major finding | Fix |
|---|---|
| Leaving the estimator's result (EN ↔ FR switch, or Back from the contact page) lost every answer | The answers live in the URL (`history.replaceState`, `step=result` on the result); the switch (also in a new tab), Back and a reload reopen the same result |
| The inactive language link fell to 3.56:1 when the frosted header passed over navy sections | New `ink-700` token: worst case 5.16:1 across 1,482 scroll positions |
| Home page mobile Lighthouse median 89 (target ≥ 90) | The hero intro (the page's largest paint on phones) rises without a fade from the first paint; the page-change fade skips the home page |

Minor and nit findings fixed include: the fee could show above 15% of the rounded gross (now rounded down to its own step: never above the cap, fee + net = gross); the free-assessment call to action now lands on the pre-filled form (`#enquiry`); WhatsApp links from the result carry `rel="noopener noreferrer"` and the locale in analytics; upper-case locale prefixes (`/FR`, `/Fr`) redirect instead of 404; unknown URLs answer 404 to every HTTP method; the self-fetch of the static 404 page has a 3-second timeout; the privacy policy now covers WhatsApp, lists four cookies plus the suggestion card's local-storage note, and carries the 6 October 2026 date; focus rings are ≥ 3:1 on every surface (gold-700 on light, gold-500 on navy, white on the hero photo, two-tone on the WhatsApp button); focus never ends under the fixed header; the phone menu never leaves focus on hidden content; the owner-login button is back from 1024 px in English; the navy strip under the footer only appears where the floating button needs it (< 1296 px); French wording and typography corrections (plurals such as « d’une chambre », no-break spaces in « 7j/7, 24h/24 », the registration sentence, the JSON-LD country name); the English WhatsApp prefill uses ’; stale docs and dead company prose removed; `scripts/review.mjs` now checks every French page, hreflang/canonical, the cookie and upper-case redirects, 404s for every method and the sitemap.

**Accepted, documented exception:** the white WhatsApp glyph on WhatsApp's brand green is 1.98:1 — it is WhatsApp's own mark, the 2 px teal ring keeps the button boundary at 3.9:1 or more, and the link's name carries the meaning (ASSUMPTIONS.md).

### Re-verification and final fixes

An independent re-verification against the fixed build confirmed 37 of the 39 as fixed and #34 as accepted; the last two partial items (one French no-break space, the phone menu when the page is scrolled) and six small new items it found were then fixed: the fee is rounded down to its own three-significant-figure step (understated by less than one step, never above the cap), the fee row states the cap once ("at most 15%"), Escape dismisses the French-suggestion card from anywhere and focus keeps clear of it (WCAG 2.4.11), the sign-in page has a `<main>` landmark, the estimator's card text avoids lone words, `scripts/visual-snapshot.mjs` waits for lazy images, and the deliverable screenshots were regenerated from the final build (`screenshots/wave1/<en|fr>/`).

Known and accepted: switching language in the middle of the questions keeps the answers but restarts at question 1.

### Verification (final build, 7 October 2026)

- `npx tsc --noEmit` and `npm run lint`: 0 errors. `npm test`: **49/49** estimator tests (hand-computed cases incl. 1 bedroom, 6+ bedrooms, all features, minimum weeks, ±15% range, fee cap and rounding, URL parsing). `npm run i18n:check -- --strict`: **566** keys, 0 parity / placeholder / untranslated / hard-coded issues. `npm run build`: every public page prerendered in `en` and `fr`, portal dynamic as before.
- `node scripts/review.mjs` on the production build: **0 errors, 0 warnings, 39 checks**, admin flow included (all French pages, hreflang/canonical, cookie and upper-case redirects, 404 for every method, sitemap, isolation, security, currency).
- **axe-core**: 0 violations on every public page in both locales at 390 and 1280, in every header scroll state, with the phone menu, the French-suggestion card, the estimator steps and result, and the 404.
- **Lighthouse mobile** medians (6–10 runs, local `next start`): `/` **91**, `/estimate` **91.5**, `/fr` 87.5; accessibility 100.
- **Estimator figures** matched hand calculations in every checked combination in EUR and MUR (672 assertions in review, 24 in re-verification; 529,920 displayed lines checked for the fee cap).
- **Contact prefill, WhatsApp links (decoded, accents included), language switch with the estimate, 404 pages without JavaScript**: verified end to end in both locales at 1440 and 390.

### Brief QA checklist

| Item | Status |
|---|---|
| `npm run build` clean, 0 TS/lint errors, no console errors on any route in either locale | ✅ |
| Estimator: unit tests pass; result always a range + disclaimer; Back keeps answers; deep-link prefill; currency switch updates the result live | ✅ (49 tests) |
| Contact form receives and displays the estimator prefill | ✅ both locales |
| Every WhatsApp link opens wa.me with the right number and a readable, correctly encoded prefill (accented French included) | ✅ |
| `/fr` mirrors every public page; no untranslated strings; no hard-coded strings in components; the switch keeps the page | ✅ (`i18n:check --strict`: 566 keys, 0 issues) |
| Existing pages pixel-equivalent to before except the specified additions | ✅ (differences only: header additions, WhatsApp button and the strip under the footer on small screens, home estimator teaser, contact cards, deeper step numbers, wider testimonial dots, focus colours, the home intro without its fade) |
| Lighthouse `/` and `/estimate` ≥ 90 performance, ≥ 95 accessibility | ✅ medians 91 and 91.5; accessibility 100 (`/fr` 87.5, not in the brief) |
| Floating button never traps focus or covers form controls on mobile | ✅ |
| `prefers-reduced-motion` respected in all new animation | ✅ |

### Waiting on real data or the client

- **Estimator rates** in `data/estimator-config.ts` are `[CONFIRM]` demo defaults — replace with real market figures.
- **hello@bellaveremu.com**: no mailbox yet (no MX records on bellaveremu.com); the site keeps BellavereLtd@gmail.com until `HELLO_MAILBOX_LIVE` is switched on in `data/site.ts`.
- **Plausible**: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` and create the three goals to switch analytics on (the privacy policy updates itself).
- **Lawyer review** of the French legal pages along with the English ones.
