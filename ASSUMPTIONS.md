# Assumptions

Decisions made where the brief was silent or placeholder-only. Everything here is easy to change once the client confirms the real facts.

## Project location & setup

- **Project folder**: the Claude session was started inside `C:\Users\user\QS ESTIMATOR\.git` (the internals of an unrelated git repository). Building there would have been wrong, so the project lives in its own fresh repository at `C:\Users\user\bellavere`.
- **Versions**: Next.js 15.5 (latest 15.x, as the brief fixed Next 15), Tailwind CSS 4.3, framer-motion 13, recharts 3, lucide-react 1.x. `lucide-react` v1 removed brand icons, so Instagram/Facebook/LinkedIn glyphs are small inline SVGs (`components/site/SocialIcons.tsx`).

## Company facts — original demo values (superseded by the 22 September 2026 update below)

- **Tagline**: "Your property, perfectly managed." (the brief's own example).
- **Market**: north & west coast of Mauritius (the brief's example), with specific areas: Grand Baie, Pereybere, Cap Malheureux, Trou aux Biches, Mont Choisy, Pointe aux Canonniers, Albion, Flic-en-Flac, Tamarin, Rivière Noire.
- **Founded**: 2016 (makes "10 years" a clean trust-bar stat in 2026).
- **Team**: three invented principals (Isabelle Verlaine, Marc Duval, Priya Ramgoolam) with hospitality-flavoured bios. No fake photos — initials avatars only, deliberately, to avoid implying real people.
- **Contact details**: Mauritian-formatted phone, `hello@bellavere.mu`, a Grand Baie business-centre address, Mon–Sat office hours, and demo social URLs.
- **Pricing model**: 18% of gross rental income, all-in, no fixed fees. The 18% rate is also what the mock statements deduct, so marketing copy and dashboard figures agree.
- **Trust-bar stats**: 68 properties, 81% average occupancy, 10 years, 4.9/5 owner rating.

## Currency & locale (currency superseded — see the 22 September 2026 update)

- **Currency: EUR** (the brief's stated default). Formatted with `Intl` (`€1,234`). One switch point: `lib/format.ts`.
- Dates are formatted British-style ("29 Aug 2026") — natural for Mauritius and unambiguous.

## Mock data design

- **Bookings are generated, not hand-written**: a deterministic seeded PRNG walks each managed property from ~13 months back to ~2.5 months forward, so stays never overlap per property, occupancy lands in a realistic 60–85% band with seasonal pricing (Mauritius peaks Nov–Jan, secondary European-summer bump), and the demo always shows current-looking data relative to "today". Cancelled bookings (~5%) release their dates.
- **Every dashboard number derives from the same source** (`lib/metrics.ts`): monthly revenue is bookings pro-rated by nights actually stayed in the month; statements take gross from that same series, deduct the 18% fee, and add expenses = resolved maintenance ticket costs + a recurring upkeep charge (villa €220/month, apartment €90/month for pool/garden/housekeeping). So charts, KPI tiles and statements always agree.
- **"Today" is frozen at midnight per day** (`lib/dates.ts`) so server and client render identical data (no hydration mismatches). Data shifts forward day by day — intentional for a live-feeling demo.
- **Statement payouts** are modelled as paid on the 5th of the following month.
- The portfolio has 12 public listings; 3 (`clientId: null`) exist only to fill the marketing grid and belong to no demo account.

## Product decisions

- **Session cookie holds the client id in plain text** (`bv_session`, httpOnly). Fine for a mock; the README describes the swap to real auth (Supabase suggested).
- **Login "Remember me"** = 30-day cookie; otherwise a session cookie.
- **The home-page dashboard teaser** is a self-contained mock component fed by real metrics for the Sophie account (the brief asked for a "real component"; importing the actual dashboard shell would have dragged chart bundles into the home page).
- **Topbar date-range selector** on the dashboard is visually real but decorative; the Overview revenue chart has its own working 3M/6M/12M range toggle. (A global range would need cross-page state for little demo value.)
- **"Download PDF"** on statements opens a print-ready branded window and triggers `window.print()` (client-side only, no PDF library). Document "Download" buttons are decorative with an explanatory note — there are no real files behind them.
- **Maintenance "Report an issue"** adds the ticket to local state only and says so under the board.
- **Placeholder marking**: JSX comments (`{/* TODO: confirm with client */}`) — the JSX equivalent of the requested HTML comments, since raw HTML comments don't survive React rendering. The README carries the full table.
- **Imagery**: Unsplash coastal/villa photography (every photo ID verified to return HTTP 200 at build time of this demo), served through `next/image`. Swap for the client's own photography before go-live.
- **Maps**: a stylised SVG of Mauritius (`components/site/MauritiusMap.tsx`) rather than an embedded map — no real office address exists yet, and the brief allowed a styled SVG placeholder.
- **404 and login pages** intentionally render without the marketing header/footer (standalone compositions), matching the brief's "centered card" login spec.

---

## Update — 22 September 2026 (real company facts)

The client supplied the company name, team, email, mission and dual-currency requirement, plus their own syndic prospect list. That list is a sales document: **none of its third-party contact details are used on the site**; only its description of Bellavere's services was used.

### Brand and positioning
- **Spelling "Bellavere"** (lowercase v), as the client and their own documents write it. The original brief's "BellaVere" wordmark was changed everywhere. Trading name "Bellavere Property Care" comes from the client's outreach copy. The legal name "Bellavere Ltd" is **inferred from the email address** and marked TODO.
- **Syndic & residence management added as a fifth service.** The prospect list shows syndic work for residences, estates and developers is a core offering. The services-page section, home card, footer link and structured data all use wording taken from the client's own outreach message.
- **Track-record claims removed.** The prospect list shows a company at the client-acquisition stage, so the demo's "68 properties / 81% occupancy / 10 years / 4.9 rating", the "founded 2016" story and the invented founder were removed rather than left as placeholders: publishing them would be false advertising. The trust bar now shows commitments that are true by definition (0 hidden fees, 1 point of contact, 2 currencies, 100% human answers). Swap in real track-record figures once they exist.
- Also removed as unconfirmed: "no mark-up on contractor invoices", "24/7 call-out", "vetted, insured contractors", "30 days' notice". They were replaced with claims grounded in the mission or the outreach copy (e.g. "every cost itemised", "emergency coordination").

### Team
- **Surnames inferred from the email addresses** (Krit Goburdhan, Ankit Zoodookhorun), marked TODO to confirm spelling.
- Bios are written only from the roles given, with no invented history. No gendered pronouns are used for team members anywhere.
- **Personal email addresses are stored but not published.** The public contact is the company email, because personal addresses on a website attract spam. Change `components/about/TeamGrid.tsx` if the client wants direct contact shown.

### Currency (MUR and EUR)
- **Stored in EUR, displayed in EUR or MUR** at the visitor's choice (header, dashboard top bar, Settings). Default EUR.
- **Conversion at a fixed €1 = Rs 52** (TODO). Deliberately a whole number so converted statements still reconcile to the rupee. The rate is disclosed next to rupee amounts, since transparency is the brand promise.
- **The choice persists in a `bv_currency` cookie read by the root layout**, so pages render in the right currency on the first paint. Trade-off: every page is now server-rendered per request instead of pre-rendered statically. The measured cost is negligible (Lighthouse performance 99–100 on public pages).
- The dashboard's decorative date-range selector was **replaced by the currency switch**; it never did anything.
- Each demo owner gained a **payout currency** (Sophie EUR, Ravi MUR, Hamilton EUR), separate from the display currency.

### Accessibility tokens
- Added **gold-700 `#7D6128`, sea-700 `#2C6F8A`, success-700, warning-700 and danger-700** for small text and icons. The brief's gold-600, sea-500 and semantic colours measured 2.4–4.2:1 on the light surfaces, below WCAG AA. Accent uses (buttons, fills, charts) keep the original palette.
- **ink-500 darkened from `#6B6B6B` to `#666666`.** The brief's value is 4.49:1 on sand-100 (AA needs 4.5); the visual difference is imperceptible.
- Footer small print raised from white/40 to white/60 (3.75:1 → 6.69:1).

### SEO, legal, forms
- **No cookie-consent banner.** Only a strictly necessary session cookie and a user-requested preference cookie are set. The privacy policy says so; a banner becomes required the moment analytics or marketing cookies are added.
- The legal pages are **templates** citing the Mauritius Data Protection Act 2017 and GDPR. They need a lawyer's review (marked TODO).
- `htmlLimitedBots: /.*/` forces metadata into `<head>` for every user agent (see REVIEW.md).
- Rate limiting is in-memory (per server instance), which is adequate for a demo. Use Upstash Redis on Vercel.

### Imagery
- Every photo was **visually checked** against its alt text. The first pass had only checked that the URLs loaded. 52 alt texts were rewritten to describe what each photo actually shows, and two off-brand photos (a forest dome tent and a scuba diver) were replaced.
- The demo listings still say "Managed by Bellavere since 2018–2024". They are fictional listings under a "Demo listings" disclaimer, but the years imply history the company may not have. Remove them when real listings arrive.
