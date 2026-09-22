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
