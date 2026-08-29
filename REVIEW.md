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
- The topbar date-range selector is decorative; the overview revenue chart has its own working 3M/6M/12M toggle.
- `prefers-reduced-motion` is handled globally (CSS kill-switch + `MotionConfig reducedMotion="user"` + per-component guards for Ken Burns, count-ups and the testimonial auto-advance).
