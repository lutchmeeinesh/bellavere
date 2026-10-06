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
- **Surnames inferred from the email addresses** (Krit Goburdhan, Ankit Zoodookhorun), marked TODO to confirm spelling. *Correction (round 5): the client confirmed Ankit's family name is **Dookhorun**; only Krit's is still inferred.*
- Bios are written only from the roles given, with no invented history. No gendered pronouns are used for team members anywhere.
- **Personal email addresses are stored but not published.** *(Superseded in round 5: Ankit's email is published at the client's request; Krit's is not, and it no longer lives in browser-bundled data.)* The public contact is the company email, because personal addresses on a website attract spam. Change `components/about/TeamGrid.tsx` if the client wants direct contact shown.

### Currency (MUR and EUR)
- **Stored in EUR, displayed in EUR or MUR** at the visitor's choice (header, dashboard top bar, Settings). Default EUR.
- **Conversion at a fixed €1 = Rs 52** (TODO). Deliberately a whole number so converted statements still reconcile to the rupee. The rate is disclosed next to rupee amounts, since transparency is the brand promise.
- **The choice persists in a `bv_currency` cookie.** *(Superseded on 23 Sep 2026: the root layout no longer reads it, so public pages are static and cached; the browser applies the choice while the page loads, and the portals still read it on the server. See Update 6.)*
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

---

## Update 2 — 22 September 2026 (admins, fees, coverage)

- **Coverage is island-wide.** The client's map marks properties in the north, west, centre, east, south-east and south-west, so all "north & west coasts (and nowhere else)" wording was replaced, the map image (cropped to the island, OpenStreetMap attribution kept as a caption) replaced the stylised SVG, and area chips became regions rather than guessed town names.
- **Fees:** negotiable, set after the first meeting, never above 15%. The 15% is assumed to be *of gross rental income* (TODO) — syndic contracts are often priced per unit instead. Demo owners were given different agreed rates (14% / 15% / 12%) so the dashboard shows that fees are individual; statements use each owner's rate, capped at 15%.
- **"Visit us" removed** from the contact page, and the (still placeholder) street address removed from the footer and structured data too — showing an address where the client doesn't want visitors would be misleading. The legal pages still carry a registered-address placeholder, since legal notices usually require one.
- **Admin accounts** for Krit, Ankit and Inesh. Inesh's name and login email come from this repository's git identity (`Lutchmee Inesh`, `lutchmeeinesh@gmail.com`). Temporary passwords were generated randomly and **written only to git-ignored local files**, never into code or chat.
- **Admins open owner portals rather than a separate copy of every screen** ("view as"), so every owner-facing view is available to staff with no duplicated UI and the same isolation checks. A banner makes the mode unmistakable.
- **Session security was upgraded before adding admins:** a forgeable cookie was tolerable for demo owners but not for accounts that see everyone's data. Sessions are now HMAC-signed with expiry; passwords are scrypt hashes; failed logins are rate-limited.
- **Pre-launch safety switches:** `SITE_INDEXABLE` (default off → `noindex` + `robots.txt` disallow) so deploying the demo to the new domain doesn't get fake testimonials/listings indexed; `DEMO_MODE` (default on) to switch off the demo owners at launch.

---

## Update 3 — 22 September 2026 (fake filler stripped)

The client asked to strip everything fake, keep two demo accounts, and rename the testimonial authors.

- **What counted as fake filler:** anything presenting unconfirmed information as fact about Bellavere — placeholder phone/address/hours/social links, invented numbers (response times, "+9%"), service extras beyond the confirmed scope (private chefs, babysitting, photography, licensing, cyclone prep, annual reviews…), unconfirmed policies (payout "by the 5th", long lets, "no onboarding fee", "reply within one working day"), portal features that don't exist (date blocking, email notifications, partner offers), and a newsletter Bellavere doesn't send.
- **The public property portfolio was removed.** Its 12 homes were fictional, and a new company presenting them as "homes we manage" is the most misleading filler of all. The two demo owners keep their properties inside the owner-portal demo, which is labelled.
- **Which two demo accounts:** Sophie Laurent (private owner) and Hamilton Estates Ltd (company) — the two client types — whose phone numbers sit in ranges reserved for fiction. Ravi Naidoo's Mauritian number could have belonged to a real person, so that account was removed.
- **Testimonials kept at the client's request** but rewritten: initial-only names (Élise M., Deepak R., Nathalie C.) so no quote reads as a specific real person, no overlap with the demo owners, no invented performance claims, and one from a residence co-owner to reflect the syndic service. They remain illustrative (TODO) and should be replaced with real quotes before the site is public — publishing invented testimonials as real is risky under consumer-protection rules.
- **Contact details are `null` rather than deleted from the data model,** so the contact page, footer and structured data show them automatically once real values are set.
- Contractor names in the demo data became generic trades ("Pool specialist") — invented company names could collide with real Mauritian businesses.
- "Developers" was kept as a client group despite a critic's objection: the client's own prospect list names developers explicitly.

---

## Update 4 — 22 September 2026 (real contact details)

- **Contacts:** Ankit Dookhorun (+230 5531 0734, zoodookhorun@gmail.com) and Nihal Lutchmee (+230 5817 4529 — written in the Mauritian 4+4 format; the client typed "58174529"). Both reachable every day, 24/7; every query answered the same day. Instagram and Facebook: bellavere.ltd (URLs `instagram.com/bellavere.ltd/`, `facebook.com/bellavere.ltd` — not verified from here; open each once to confirm).
- **Nihal** was added to the About team ("The main people you will speak to") and the contact page, with **no role or bio invented** — only the confirmed availability and number. Nihal's email, given afterwards, is executive@wwwbellavere.com. The "www" in the domain looked like a typo, but DNS confirms `wwwbellavere.com` is a live domain with Google Workspace mail (while `bellavere.com` belongs to an unrelated mail server), so it is used exactly as given.
- **Footer** lists both people by first name with their numbers; the client didn't rank one contact above the other. The structured data's main `telephone` is Ankit's (Client Relations) because schema.org takes one; both appear as `contactPoint`s with 24/7 `hoursAvailable`.
- **Trust bar:** "1 point of contact" was replaced by "Same day — every query answered" (two people are now published), and "2 currencies" by "24/7 — always reachable". Both new tiles are fixed text, not count-ups.
- **24/7 is scoped to people, not an office or a call-out service:** the structured data carries no organisation-wide opening hours (there is no walk-in office), and no "24/7 emergency call-out" claim was reintroduced.
- **Same-day** applies to replying to queries only — the contact page keeps it separate from the earnings assessment (fees are set after a first meeting).

---

## Update 5 — 22 September 2026 (registration, confirmations, email delivery)

- **Registration** from the Certificate of Incorporation: Bellavere Ltd, Company No. 238321, incorporated 19 August 2026, private company limited by shares. The legal pages show the company number in place of the former "BRN: to be confirmed" placeholder; a separate BRN is not on the certificate and was not invented. The certificate carries no registered address, so the legal pages still omit it.
- **Confirmed as-is by the client:** Krit's surname (Goburdhan), the fee wording ("never more than 15% of gross rental income"), the €1 = Rs 52 rate, and keeping the three illustrative testimonials. The related TODO markers were resolved.
- **Enquiries go to BellavereLtd@gmail.com via Resend.** Resend was chosen because its free tier needs no DNS work to start: signing up with BellavereLtd@gmail.com lets the default test sender deliver to that address immediately. Verifying wwwbellavere.com later improves deliverability without touching the Google Workspace records.
- **No silent loss of enquiries:** without an API key in production, or if Resend fails, the visitor is told and given the direct email and phone numbers — the real safeguard. The enquiry is also written to the runtime log, but Vercel keeps those for only about 1 hour on Hobby (1 day on Pro), so it is a short-term net, not storage.
- **Production secrets:** a separate `SESSION_SECRET` was generated for Vercel (`.env.vercel.local`, git-ignored); the admin password hashes are the same as locally, so the temporary passwords in `ADMIN-CREDENTIALS.local.md` work on the live site too.
- **Hosting plan:** deploying on Vercel Hobby for now at the client's choice; the docs note that Hobby is for non-commercial use and Pro is needed once the site is used commercially.

---

## Update 6 — 23 September 2026 (post-deployment fixes)

- **Static public pages over first-paint currency.** Reading the currency cookie in the root layout made every page render per request in a distant region. Public pages are now prerendered; a visitor who chose rupees sees the home page's dashboard preview switch from euros as the page loads (it is below the fold). The owner and admin portals are unaffected.
- **Function region cpt1 (Cape Town)**, the closest Vercel region to Mauritius (~100 ms from Beau Bassin versus ~320 ms for the default Washington region). If most owners turn out to be in Europe, `cdg1` (Paris) is the alternative; Hobby allows one region.
- **Content Security Policy with `'unsafe-inline'` scripts.** A nonce-based policy would force every page to render per request; the static policy still blocks third-party scripts, framing, plugins and foreign form targets.
- **"Today" is the Mauritius calendar date** for all demo data, whoever is looking and wherever the server runs.
- **The social profiles are kept although they don't resolve yet**, because the client asked for them; they should be created or corrected before launch.

---

## Update 7 — 30 September 2026 (new domain)

- **The site moves to bellaveremu.com** (client's decision): the client registered it, prefers it to wwwbellavere.com, and is setting up a new Vercel account for it. **www.bellaveremu.com** is the main address (Vercel's recommended set-up, and what the client chose when first adding the domain); the bare domain redirects to it.
- **Nothing is rebuilt:** the GitHub repository, code, admin accounts and password hashes carry over. Only the hosting account, DNS and email services are set up again. A fresh `SESSION_SECRET` was generated for the new deployment (existing sign-ins simply end).
- **Nihal's address stays executive@wwwbellavere.com** — confirmed by the client the same day. So wwwbellavere.com is not abandoned after all: it stays registered for the Google Workspace mailbox, and its web address should redirect to the new site.


---

## Update 8 — Wave 1 (5 October 2026): French/English foundation

Phase 0 of the Wave 1 upgrade (estimator, WhatsApp, French). The full design is in `UPGRADE-PLAN.md`; these are the calls made where the brief left room.

- **next-intl 4.14.9** (latest 4.x; supports Next 15.5 and React 19). Its build plugin loads SWC's native addon, which on this Windows machine refused its default cache folder under `%LOCALAPPDATA%\swc` (permissions grant rights to an extra app-container account), so `i18n/swc-native-cache.cjs` moves that cache into `node_modules\.swc` of the main checkout on Windows only. Agent worktrees (`.claude\worktrees\<name>`) share that folder: SWC adds about 195 characters below it, and a worktree's own `node_modules` would take the path past Windows' 260-character limit (verified: a build in `.claude\worktrees\ie-swc-path-check-01` passes). Vercel (Linux) is unaffected.
- **The language cookie is written only by an explicit choice** (the EN | FR switch, later the banner), never by next-intl or by merely visiting a `/fr` URL (`localeCookie: false`). A French link shared with an English speaker therefore doesn't switch their later visits to French, and no cookie is set without an action. Like `bv_currency`, `NEXT_LOCALE` is a user-requested preference (1 year), so still no consent banner; the privacy policy should name it (phase 1C).
- **The cookie redirect is temporary (307)** and only for unprefixed public URLs; `/fr/...` is never redirected, `/en/...` always goes to the unprefixed URL, and the portal ignores the cookie.
- **hreflang lives in the page metadata only** (`alternates.languages` with en, fr and x-default → English); next-intl's `Link` response header is off so there is a single source.
- **Social images per language**: `/opengraph-image` (English, same URL as before) and `/fr/opengraph-image`, with a translated `og:image:alt`. Pages now always set `og:image` explicitly, which also fixes the home page, which had none (its own Open Graph block used to drop the file-based image). The portal points at the English image.
- **Header fit**: with the language switch and the "Estimate my income" link the desktop bar no longer fits between 1024 and 1279 px, so the "Owner login" button there appears from 1280 px (it stays in the footer, the home hero and the phone menu); nav links have 12 px side padding instead of 16 px below 1280 px. On phones the switch shows only the other language ("FR" / "EN"), and below 360 px it moves into the menu. At 1440 px and 390 px (the baseline widths) only the header band changed. Stream C designs the switch fully and must check the longer French labels.
- **Floating WhatsApp button** (stream B's final design): WhatsApp's brand green (`#25D366`) round button with a 2px ring of WhatsApp's teal green (`#128C7E`, 3:1 or more against sand, white and navy), bottom-right, label "Chat with us on WhatsApp" / "Écrivez-nous sur WhatsApp" on hover and focus. It opens Ankit's number (`23055310734`) with the default message of the page's language (`WHATSAPP_DEFAULT_MESSAGE` in `data/site.ts`); French: "Bonjour Bellavere, je souhaiterais en savoir plus sur vos services de gestion de propriétés." The estimator's result replaces it with a message carrying the estimate; the estimator's questions hide the button.
- **`PUBLIC_EMAIL`** replaces every public use of the company address (footer has none; contact page, error pages, legal pages, structured data, contact-form and API fallbacks); `company.email` is now an alias of it. Delivery defaults to it too (`CONTACT_TO_EMAIL || PUBLIC_EMAIL`).
- **Company wording vs facts**: the public site reads tagline, mission, pricing wording, team roles and bios, commitments, hours, response time, country and company type from `common.company.*`; `data/company.ts` keeps the facts and gained ids (`krit`, `ankit`, `nihal`; commitment ids). Its English prose stays for the English-only portal and is marked `@deprecated` until phase 2 removes what nothing reads. The 15% appears as `{maxFee, number, percent}` ("15%", French "15 %").
- **Image alt texts** moved to `common.images.*` (same paths as `data/siteImages.ts`); the login backdrop reads the English one.
- **French formatting**: euros "24 960 €", rupees keep the site's "Rs" prefix with French grouping ("Rs 24 960"), the rate "1 € = Rs 52", dates with the month in full ("22 septembre 2026"; English stays "22 Sept 2026"), percentages "81 %". English output is unchanged byte for byte.
- **404s** (revised at integration, 6 Oct 2026): unknown public URLs (`/no-such-page`, `/fr/no-such-page`, `/services/x`) answer a real 404 with the localized "Lost at sea?" page complete in the server HTML, so it works without JavaScript as the pre-Wave-1 static 404 did. `app/[locale]/[...rest]/route.ts` serves the HTML of a static page, `app/[locale]/page-not-found` (`/page-not-found`, `/fr/page-not-found`: noindex, linked nowhere, not in the sitemap), at the unknown URL with status 404. Why not `notFound()`: in Next.js 15.5 a `notFound()` thrown while rendering escapes the server render (React has no error boundaries on the server), so Next.js sends an empty `<html id="__next_error__">` shell with the 404 status and draws the not-found UI in the browser; and a middleware rewrite with a 404 status makes Vercel serve its own site-wide 404 (English). If the static page cannot be fetched (e.g. a preview behind Vercel Authentication), a plain localized 404 page is returned instead. URLs with a dot that aren't files (e.g. `/x.y`) and any first segment that is not a language get the English last-resort 404 (`app/not-found.tsx`, static).
- **`app/error.tsx` was removed**: with a pass-through root layout it would have rendered without `<html>`. Public errors use `app/[locale]/error.tsx` (localized), the sign-in page and portal layouts `app/(portal)/error.tsx` (English); both show the same screen as before. `global-error.tsx` stays English.
- **JSON-LD** keeps schema.org vocabulary in English (`contactType`, `dayOfWeek`, country name) and translates names, descriptions and the slogan; no `availableLanguage` claim was added (not confirmed by the client).
- **Messages sent to the browser** (revised at integration): only the keys client components read. Every public page gets `SITE_CLIENT_MESSAGES` (header, logo, currency and language switches, French suggestion, WhatsApp button, error page: about 1.4 kB); home, contact and estimate add their own `PAGE_CLIENT_MESSAGES` through `<ClientMessages>`; the portal gets `PORTAL_CLIENT_MESSAGES` (English). Everything else is server-rendered text. The messages are **precompiled** on the server (next-intl's icu-minify) and formatted with next-intl's small precompiled-message formatter, so the ICU parser is no longer shipped (−9 kB gzipped on every page); `t.raw()` is unavailable and named number styles must be listed in `MESSAGE_FORMATS` (`i18n/routing.ts`).
- **The language switch appears only in the public site's header**; the portal has none (English-only, a known limitation).

### Integration (6 October 2026)

Calls made while integrating the three streams. Accessibility fixes found by axe (WCAG 2.2 AA + best practices) and Lighthouse, each with the smallest visual change; axe now reports nothing on any public page in either language at 390 and 1280 px, the estimator's result and the 404 included.

- **Home "How it works" step numbers** ("01", "02", "03", 48–60 px serif) use a new token `gold-650` (`#a6843f`, gold-600 a fifth of the way to gold-700): 3.3:1 on sand-50, the minimum for large text, where gold-500 had 2.2:1. The numbers are a shade deeper; nothing else changed.
- **Testimonial dots**: each dot sits in a 24 px-high button with 8 px either side, so every tap target is at least 24×24 px (WCAG 2.5.8). The dots look the same; they are 16 px apart instead of 10 px, and a negative margin keeps the arrows in place.
- **Services comparison table**: its scroll container (it scrolls sideways below 480 px) is focusable (`tabIndex=0`), a `region` named after the table's caption ("The responsibilities Bellavere handles for you"), with the gold focus ring drawn inside its rounded frame.
- **Floating WhatsApp button** sits in its own landmark, an `<aside>` named like the button ("Chat with us on WhatsApp"), so it is not content outside every landmark. No visual change.
- **Currency switch**: the buttons' accessible names now start with their visible text ("EUR Euro (€)", "MUR Mauritian rupee (Rs)": the code is the visible text, the name follows in a visually hidden span) instead of the name alone (WCAG 2.5.3 label in name). The tooltip still shows the name.
- **`data-scroll-behavior="smooth"`** on `<html>` (Next.js 15.5 asks for it when the CSS scrolls smoothly): Next.js turns smooth scrolling off during route changes.
- **404 and error pages** are each one `<main>` landmark (they replace the layouts that hold the site's `<main>`); the 404's large pale "404" is drawn as generated content, as decoration, so it is not text held to 4.5:1. No visual change.
- **First paint of the estimator**: the question screens carry `data-whatsapp-hidden` in their server HTML and `app/globals.css` hides the floating button (and its strip below the footer) while that mark is on the page, so the button no longer flashes before hydration; the result screen drops the mark and the button appears with the estimate in its message. Other pages are unaffected.
- **Estimator result's WhatsApp button** uses the shared WhatsApp glyph (`WhatsAppIcon`) instead of lucide's generic speech bubble.
- **Owner-portal links on public pages are not prefetched** (`Link` in `i18n/navigation.ts`): the "Owner login" buttons are in view on most pages, and prefetching `/login` downloaded the portal's root layout, sign-in and error-page code (about 30 kB) for every visitor. The sign-in page loads on click (it is static); links inside the portal prefetch as before.
- **Contact form**: any error answer the form does not recognise (none is expected) now shows the localized "couldn't send" message with the direct contacts instead of the server's English text. Every label, validation message, server error code and the success state were checked in French; the enquiry email shows "Language: French/English".
- **French layout**: "Le jour même" (home trust bar) takes two lines from 1024 px, where "Same day" fits on one; French gets slightly more leading there so the "j" no longer touches the accent of "même". The home estimator teaser stacks the bedrooms stepper and the button between 1024 and 1279 px in both languages ("Estimate my income" / "Estimer mes revenus" wrapped onto two lines in the narrow card). Strings that are simply long for their place were reported for the copy owner rather than squeezed by CSS.

### Consolidation (6 October 2026)

- **One message file per language**: `messages/en.json` and `messages/fr.json`, top-level keys = namespaces, as the brief asked; the per-namespace files of phases 0–1 are gone (values and key order carried over unchanged, apart from the edits below).
- **Unused keys removed** (both languages), each checked against every way the code builds keys (literal keys, template keys, key names kept in data, translators passed to helpers): `common.actions.contactUs`, `common.company.market`, `common.company.hours`, `common.company.pricing.short`, `contact.details.call`, `contact.details.callWithHours`, `estimator.bedrooms.label`. The English prose fields in `data/company.ts` are untouched (the portal still reads some).
- **French copy**: "de A à Z" now keeps its words together with no-break spaces (estimator result, home services card, services intro). The home page's third step, "Vous le voyez prospérer", took two lines at 768 px where the other steps take one; it is now "Vous le voyez grandir", which fits from 768 px and stays closest to "You watch it grow" (the integration's suggestion, "Vous en profitez", would have changed the meaning). "Le jour même" in the trust bar is unchanged: the glossary requires it.
