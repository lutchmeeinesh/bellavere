# Assumptions

Decisions made where the brief was silent or placeholder-only. Everything here is easy to change once the client confirms the real facts.

## Project location & setup

- **Project folder**: the Claude session was started inside `C:\Users\user\QS ESTIMATOR\.git` (the internals of an unrelated git repository). Building there would have been wrong, so the project lives in its own fresh repository at `C:\Users\user\bellavere`.
- **Versions**: Next.js 15.5 (latest 15.x, as the brief fixed Next 15), Tailwind CSS 4.3, framer-motion 13, recharts 3, lucide-react 1.x. `lucide-react` v1 removed brand icons, so Instagram/Facebook/LinkedIn glyphs are small inline SVGs (`components/site/SocialIcons.tsx`).

## Company facts (all realistic demo copy, marked `TODO: confirm with client`)

- **Tagline**: "Your property, perfectly managed." (the brief's own example).
- **Market**: north & west coast of Mauritius (the brief's example), with specific areas: Grand Baie, Pereybere, Cap Malheureux, Trou aux Biches, Mont Choisy, Pointe aux Canonniers, Albion, Flic-en-Flac, Tamarin, Rivière Noire.
- **Founded**: 2016 (makes "10 years" a clean trust-bar stat in 2026).
- **Team**: three invented principals (Isabelle Verlaine, Marc Duval, Priya Ramgoolam) with hospitality-flavoured bios. No fake photos — initials avatars only, deliberately, to avoid implying real people.
- **Contact details**: Mauritian-formatted phone, `hello@bellavere.mu`, a Grand Baie business-centre address, Mon–Sat office hours, and demo social URLs.
- **Pricing model**: 18% of gross rental income, all-in, no fixed fees. The 18% rate is also what the mock statements deduct, so marketing copy and dashboard figures agree.
- **Trust-bar stats**: 68 properties, 81% average occupancy, 10 years, 4.9/5 owner rating.

## Currency & locale

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
