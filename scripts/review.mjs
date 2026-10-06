/**
 * Automated review pass (Phase 3):
 *  - opens every route logged out and as each demo account
 *  - screenshots desktop (1440) and mobile (390) into /screenshots
 *  - collects console errors and failed requests
 *  - verifies auth redirects and cross-client data isolation (404s)
 *  - checks alt attributes, broken images and leftover lorem ipsum
 *  - checks the EUR/MUR switch, signed sessions (forged/tampered cookies are
 *    rejected) and the admin area. For the admin flow, set
 *    ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD.
 *  - checks brand fonts, content visible without JavaScript, cross-page
 *    section links, security headers, edge caching of public pages and the
 *    API's handling of hostile or malformed requests
 *  - scans the browser bundles for secrets (the local build, or the deployed
 *    chunks when a remote URL is given)
 *  - checks both languages: every public page in English and French answers
 *    200 with the right <html lang>, no console errors and correct canonical
 *    and hreflang links; the NEXT_LOCALE=fr redirect (unprefixed -> /fr, /fr
 *    never redirected), /en/... and upper-case prefixes (/FR/...) -> the
 *    canonical address; the localized 404 for every HTTP method; the sitemap;
 *    the estimator in both languages
 *
 * Usage: node scripts/review.mjs [baseUrl]  (default http://localhost:3010)
 * The app must already be running (npm run build && npx next start -p 3010).
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.argv[2] ?? "http://localhost:3010";
const OUT = path.join(process.cwd(), "screenshots");
fs.mkdirSync(OUT, { recursive: true });

const ACCOUNTS = {
  sophie: { email: "sophie@demo.bellavere.com", own: ["p-01", "p-02", "p-03"], foreign: "p-05", ownNames: ["Villa Azure", "Villa Frangipani", "Les Cerisiers 4B"], foreignNames: ["Cap Ouest Penthouse", "Les Salines Loft"] },
  hamilton: { email: "hamilton@demo.bellavere.com", own: ["p-05", "p-06", "p-07", "p-08", "p-09"], foreign: "p-02", ownNames: ["Cap Ouest Penthouse", "Les Salines Loft"], foreignNames: ["Villa Azure", "Villa Frangipani"] },
};

const PUBLIC_ROUTES = ["/", "/services", "/about", "/contact", "/privacy", "/terms", "/login"];

// The public site (app/[locale]/(site)): every page exists in English
// (unprefixed) and French (/fr/...). The portal (/login) is English only.
const SITE_PAGES = ["/", "/services", "/about", "/contact", "/privacy", "/terms", "/estimate"];
const LOCALES = ["en", "fr"];
/** A page's address in a language: ("fr", "/services") -> "/fr/services", ("fr", "/") -> "/fr". */
const localized = (locale, route) => (locale === "en" ? route : route === "/" ? `/${locale}` : `/${locale}${route}`);
const LOCALIZED_PAGES = LOCALES.flatMap((locale) => SITE_PAGES.map((route) => ({ locale, route, url: localized(locale, route) })));

/** A namespace of messages/<lang>.json (top-level keys are the namespaces). */
const messages = (lang, namespace) =>
  JSON.parse(fs.readFileSync(path.join("messages", `${lang}.json`), "utf8"))[namespace];
const squash = (text) => text.replace(/\s+/g, " ").trim();

// Fake filler that was deliberately removed — it must never come back.
const REMOVED_FILLER = [
  /728 4410/, /La Croisette Business/, /Suite 4/,
  // The old invented social handles (the real accounts are bellavere.ltd).
  /instagram\.com\/bellavere\.mu/, /facebook\.com\/bellavere\.mu/, /linkedin\.com\/company\/bellavere/,
  /within 4 hours/i, /under 2 hours/i, /9% to rental/i, /by the 5th/i,
  /Lyon to London/, /Ravi Naidoo/, /since 20\d\d/i, /Our portfolio/,
  /Ankit Zoodookhorun/,
];
const DASH_ROUTES = ["/dashboard", "/dashboard/properties", "/dashboard/bookings", "/dashboard/maintenance", "/dashboard/statements", "/dashboard/documents", "/dashboard/settings"];

const findings = [];
const note = (severity, where, message) => {
  findings.push({ severity, where, message });
  console.log(`[${severity}] ${where}: ${message}`);
};

const slug = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/[\/\[\]]/g, "-"));

// Opens a page and lets it settle. Not "networkidle": on a repeat visit the
// Next.js router can keep background prefetches open for ~30 s (navigation
// itself is instant), which would stall every check.
async function open(page, url, timeout = 45000) {
  const res = await page.goto(url, { waitUntil: "load", timeout });
  await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
  return res;
}

async function inspectPage(page, route, label) {
  const errors = [];
  const pageErrors = [];
  const badRequests = [];
  const onConsole = (msg) => { if (msg.type() === "error") errors.push(msg.text()); };
  const onPageError = (err) => pageErrors.push(String(err));
  const onResponse = (res) => { if (res.status() >= 400 && !res.url().includes("favicon")) badRequests.push(`${res.status()} ${res.url()}`); };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("response", onResponse);

  const res = await open(page, BASE + route).catch((e) => {
    note("ERROR", label, `navigation failed: ${e.message}`);
    return null;
  });
  if (!res) return { finalUrl: null };
  await page.waitForTimeout(1200); // let reveals/charts settle

  for (const e of errors) note("ERROR", label, `console error: ${e.slice(0, 300)}`);
  for (const e of pageErrors) note("ERROR", label, `page error: ${e.slice(0, 300)}`);
  for (const r of badRequests) note("WARN", label, `failed request: ${r.slice(0, 200)}`);

  const audit = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll("img")];
    return {
      missingAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      brokenImgs: imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.src.startsWith("http")).map((i) => i.src.slice(0, 120)),
      lorem: /lorem ipsum/i.test(document.body.innerText),
      hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      title: document.title,
    };
  });
  if (audit.missingAlt) note("ERROR", label, `${audit.missingAlt} <img> without alt`);
  for (const src of audit.brokenImgs) note("ERROR", label, `broken image: ${src}`);
  if (audit.lorem) note("ERROR", label, "lorem ipsum found in page text");
  if (audit.hScroll) note("WARN", label, "horizontal page scroll detected");

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("response", onResponse);
  return { finalUrl: page.url(), audit, status: res.status(), consoleErrors: errors.length + pageErrors.length };
}

async function shoot(page, route, name) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page, BASE + route).catch(() => {});
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, `${name}-desktop.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, `${name}-mobile.png`), fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
}

// ---------- browser bundles must not carry secrets ----------
// Anything imported by client components ships to every visitor. Password
// hashes, admin details and Krit's personal email must never be in there.
const IS_LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(BASE);
const SECRET = [/scrypt:/, /passwordHash/, /ADMIN_[A-Z]+_PASSWORD_HASH/, /kritgoburdhan/i, /lutchmeeinesh/i, /SESSION_SECRET/];
if (!IS_LOCAL) {
  // Remote site: scan the chunks its pages actually load.
  const chunkUrls = new Set();
  for (const route of PUBLIC_ROUTES) {
    const html = await fetch(BASE + route).then((r) => r.text()).catch(() => "");
    for (const m of html.matchAll(/\/_next\/static\/[^"'\s)]+?\.js/g)) chunkUrls.add(m[0]);
  }
  let leaks = 0;
  for (const url of chunkUrls) {
    const code = await fetch(BASE + url).then((r) => r.text()).catch(() => "");
    for (const pattern of SECRET) if (pattern.test(code)) { leaks++; note("ERROR", "bundles", `${url} contains ${pattern}`); }
  }
  if (!chunkUrls.size) note("WARN", "bundles", "no JavaScript chunks found in the deployed pages");
  else if (!leaks) console.log(`OK: ${chunkUrls.size} deployed browser bundles contain no secrets or private emails`);
} else {
  const dir = path.join(process.cwd(), ".next", "static", "chunks");
  if (!fs.existsSync(dir)) note("WARN", "bundles", "no .next/static/chunks — run npm run build first");
  else {
    const files = fs.readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith(".js"));
    let leaks = 0;
    for (const file of files) {
      const code = fs.readFileSync(path.join(dir, String(file)), "utf8");
      for (const pattern of SECRET) if (pattern.test(code)) { leaks++; note("ERROR", "bundles", `${file} contains ${pattern}`); }
    }
    if (!leaks) console.log(`OK: ${files.length} browser bundles contain no secrets or private emails`);
  }
}

// ---------- HTTP: security headers, caching, API robustness ----------
{
  const REQUIRED_HEADERS = ["content-security-policy", "x-frame-options", "x-content-type-options", "referrer-policy", "permissions-policy"];
  for (const route of ["/", "/contact", "/login"]) {
    const res = await fetch(BASE + route);
    for (const h of REQUIRED_HEADERS) if (!res.headers.get(h)) note("ERROR", `headers ${route}`, `missing ${h}`);
    if (res.headers.get("x-powered-by")) note("ERROR", `headers ${route}`, "X-Powered-By is still sent");
  }
  console.log("OK: security headers checked");

  // Public pages are prerendered in both languages: never "no-store", and
  // cached at the edge.
  for (const route of new Set([...PUBLIC_ROUTES, ...LOCALIZED_PAGES.map((p) => p.url)])) {
    await fetch(BASE + route); // warm the cache
    const res = await fetch(BASE + route);
    const cacheControl = res.headers.get("cache-control") ?? "";
    if (/no-store|private/.test(cacheControl)) note("ERROR", `caching ${route}`, `public page is rendered per request (cache-control: ${cacheControl})`);
    if (!IS_LOCAL) {
      const edge = res.headers.get("x-vercel-cache") ?? "";
      if (!/HIT|STALE|PRERENDER/.test(edge)) note("WARN", `caching ${route}`, `not served from the edge cache (x-vercel-cache: ${edge || "none"})`);
    }
  }
  console.log("OK: public pages are static (edge-cacheable), in English and French");

  const api = (route, init = {}) =>
    fetch(BASE + route, { redirect: "manual", ...init }).then((r) => ({ status: r.status, allow: r.headers.get("allow"), type: r.headers.get("content-type") ?? "" }));
  const json = (body, extra = {}) => ({ method: "POST", headers: { "content-type": "application/json", ...extra }, body: typeof body === "string" ? body : JSON.stringify(body) });
  const expectStatus = async (label, promise, expected) => {
    const r = await promise;
    if (r.status !== expected) note("ERROR", "api", `${label}: expected ${expected}, got ${r.status}`);
    return r;
  };
  // Malformed or wrong-shape bodies are rejected cleanly (never a 500).
  for (const body of ["[]", '"text"', "null", { name: 5, email: [], message: {} }]) {
    await expectStatus(`contact with body ${JSON.stringify(body)}`, api("/api/contact", json(body)), 400);
    await expectStatus(`login with body ${JSON.stringify(body)}`, api("/api/auth/login", json(body)), 400);
  }
  await expectStatus("login with empty fields", api("/api/auth/login", json({ email: "", password: "" })), 400);
  // Cross-site requests are refused (login CSRF, forced logout).
  await expectStatus("login as text/plain", api("/api/auth/login", { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify({ email: ACCOUNTS.sophie.email, password: "demo1234" }) }), 415);
  await expectStatus("login from a foreign origin", api("/api/auth/login", json({ email: ACCOUNTS.sophie.email, password: "demo1234" }, { origin: "https://evil.example" })), 403);
  await expectStatus("logout from a foreign origin", api("/api/auth/logout", { method: "POST", headers: { origin: "https://evil.example" } }), 403);
  // Wrong methods and unknown endpoints answer in JSON, with an Allow header.
  const get = await expectStatus("GET /api/contact", api("/api/contact"), 405);
  if (!/POST/.test(get.allow ?? "")) note("ERROR", "api", "405 from /api/contact has no Allow: POST header");
  const unknown = await expectStatus("unknown API path", api("/api/definitely-not-here"), 404);
  if (!unknown.type.includes("application/json")) note("ERROR", "api", `unknown API path answered ${unknown.type}, not JSON`);
  console.log("OK: API robustness checked");
}

// ---------- HTTP: both languages ----------
// The server HTML of every public page in English and French: status,
// <html lang>, canonical and hreflang links. Then the language redirects
// (the NEXT_LOCALE cookie, /en/..., upper-case prefixes), the localized 404
// for every method, and the sitemap.
{
  /** Every <link> tag in an HTML document, as lower-cased attribute maps. */
  const linkTags = (html) =>
    [...html.matchAll(/<link\b[^>]*>/gi)].map(([tag]) =>
      Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [name.toLowerCase(), value.replace(/&amp;/g, "&")])),
    );
  /** The path of an absolute URL ("https://x.com" -> "/"), or null if it is not absolute. */
  const pathOf = (href) => {
    try {
      const url = new URL(href);
      return url.pathname;
    } catch {
      return null;
    }
  };

  let pagesOk = true;
  for (const { locale, route, url } of LOCALIZED_PAGES) {
    const label = `i18n ${url}`;
    const res = await fetch(BASE + url, { redirect: "manual" });
    const html = await res.text();
    const fail = (message) => { pagesOk = false; note("ERROR", label, message); };
    if (res.status !== 200) { fail(`expected 200, got ${res.status}`); continue; }
    const lang = html.match(/<html\b[^>]*\slang="([^"]*)"/i)?.[1];
    if (lang !== locale) fail(`<html lang="${lang}">, expected "${locale}"`);

    const links = linkTags(html);
    const canonical = links.filter((l) => l.rel === "canonical");
    if (canonical.length !== 1) fail(`expected 1 canonical link, found ${canonical.length}`);
    else if (pathOf(canonical[0].href) !== url) fail(`canonical is ${canonical[0].href}, expected the absolute URL of ${url}`);

    const alternates = links.filter((l) => l.rel === "alternate" && l.hreflang);
    const expected = { en: localized("en", route), fr: localized("fr", route), "x-default": localized("en", route) };
    const seen = Object.fromEntries(alternates.map((l) => [l.hreflang, l.href]));
    if (alternates.length !== Object.keys(expected).length) fail(`expected ${Object.keys(expected).length} hreflang links, found ${alternates.length} (${alternates.map((l) => l.hreflang).join(", ")})`);
    for (const [hreflang, target] of Object.entries(expected)) {
      if (!seen[hreflang]) fail(`no hreflang="${hreflang}" link`);
      else if (pathOf(seen[hreflang]) !== target) fail(`hreflang="${hreflang}" points to ${seen[hreflang]}, expected ${target}`);
    }
    // Canonical and alternates name the same site.
    const origins = new Set([...canonical, ...alternates].map((l) => { try { return new URL(l.href).origin; } catch { return l.href; } }));
    if (origins.size > 1) fail(`canonical and hreflang links use different origins: ${[...origins].join(", ")}`);
  }
  if (pagesOk) console.log(`OK: ${LOCALIZED_PAGES.length} public pages (English and French) answer 200 with the right lang, canonical and hreflang links`);

  // Language redirects. Each case is followed hop by hop (at most 5) with
  // the given cookie; `hops` is the exact number of redirects expected.
  const hop = async (route, cookie) => {
    const res = await fetch(BASE + route, { redirect: "manual", headers: cookie ? { cookie } : {} });
    const location = res.headers.get("location");
    if (!location || res.status < 300 || res.status > 399) return { status: res.status, to: null };
    const next = new URL(location, BASE);
    return { status: res.status, to: next.pathname + next.search };
  };
  const follow = async (route, cookie) => {
    let current = route;
    for (let hops = 0; hops <= 5; hops++) {
      const { status, to } = await hop(current, cookie);
      if (!to) return { status, final: current, hops };
      current = to;
    }
    return { status: "redirect loop", final: current, hops: 6 };
  };
  const FR = "NEXT_LOCALE=fr";
  const EN = "NEXT_LOCALE=en";
  const REDIRECTS = [
    // [route, cookie, final address, final status, redirects]
    ["/fr/services", null, "/fr/services", 200, 0],
    ["/en", null, "/", 200, 1],
    ["/en/services?ref=x", null, "/services?ref=x", 200, 1],
    ["/FR", null, "/fr", 200, 1],
    ["/Fr/services", null, "/fr/services", 200, 1],
    ["/EN/services", null, "/services", 200, 1],
    ["/fr/login", null, "/login", 200, 1],
    ["/FR/login", null, "/login", 200, 1],
    // The visitor chose French: unprefixed public URLs go to /fr (query kept).
    ["/", FR, "/fr", 200, 1],
    ["/services?ref=x", FR, "/fr/services?ref=x", 200, 1],
    ["/estimate", FR, "/fr/estimate", 200, 1],
    // ...but /fr URLs are never redirected, and the portal ignores the cookie.
    ["/fr", FR, "/fr", 200, 0],
    ["/fr/contact", FR, "/fr/contact", 200, 0],
    ["/login", FR, "/login", 200, 0],
    // Upper-case prefixes never become /fr/FR/... (a 404).
    ["/FR/services", FR, "/fr/services", 200, 1],
    ["/Fr", FR, "/fr", 200, 1],
    ["/EN/services", FR, "/fr/services", 200, 2],
    ["/en/services", FR, "/fr/services", 200, 2],
    ["/no-such-page", FR, "/fr/no-such-page", 404, 1],
    ["/services", EN, "/services", 200, 0],
  ];
  let redirectsOk = true;
  for (const [route, cookie, final, status, hops] of REDIRECTS) {
    const got = await follow(route, cookie);
    if (got.final !== final || got.status !== status || got.hops !== hops) {
      redirectsOk = false;
      note("ERROR", "i18n redirects", `${route}${cookie ? ` with ${cookie}` : ""}: expected ${final} (${status}) after ${hops} redirect(s), got ${got.final} (${got.status}) after ${got.hops}`);
    }
  }
  if (redirectsOk) console.log(`OK: language redirects (${REDIRECTS.length} cases: NEXT_LOCALE cookie, /en/..., upper-case prefixes, portal)`);

  // Unknown public URLs: 404 whatever the method, with the localized page
  // for the methods that carry a body.
  let methodsOk = true;
  for (const [route, lang] of [["/no-such-page", "en"], ["/services/no-such-section", "en"], ["/fr/no-such-page", "fr"]]) {
    const heading = squash(messages(lang, "common").notFound.heading);
    for (const method of ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
      const res = await fetch(BASE + route, { method, redirect: "manual" });
      const body = await res.text();
      const h1 = squash(body.match(/<h1\b[^>]*>([^<]*)</)?.[1] ?? "");
      const wantsPage = !["HEAD", "OPTIONS"].includes(method);
      if (res.status !== 404 || (wantsPage && h1 !== heading)) {
        methodsOk = false;
        note("ERROR", `404 ${method} ${route}`, `expected 404${wantsPage ? ` with "${heading}"` : ""}, got ${res.status}${wantsPage ? `, h1 "${h1}"` : ""}`);
      }
    }
  }
  if (methodsOk) console.log("OK: unknown URLs answer 404 to every method (localized page for GET, POST, PUT, PATCH, DELETE)");

  // The sitemap lists every public page in both languages, each with a date.
  const sitemap = await fetch(`${BASE}/sitemap.xml`).then((r) => r.text()).catch(() => "");
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, entry]) => ({
    path: pathOf(entry.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? ""),
    lastmod: entry.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null,
  }));
  let sitemapOk = entries.length === LOCALIZED_PAGES.length;
  if (!sitemapOk) note("ERROR", "sitemap", `expected ${LOCALIZED_PAGES.length} entries, found ${entries.length}`);
  for (const { url } of LOCALIZED_PAGES) {
    const entry = entries.find((e) => e.path === url);
    if (!entry) { sitemapOk = false; note("ERROR", "sitemap", `${url} is missing`); }
    else if (!/^\d{4}-\d{2}-\d{2}/.test(entry.lastmod ?? "")) { sitemapOk = false; note("ERROR", "sitemap", `${url} has no lastmod`); }
  }
  if (sitemapOk) console.log(`OK: the sitemap lists the ${LOCALIZED_PAGES.length} public pages (both languages) with their dates`);
}

const browser = await chromium.launch();

// ---------- logged-out pass ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const route of PUBLIC_ROUTES) {
    const label = `public ${route}`;
    await inspectPage(page, route, label);
    await shoot(page, route, slug(route));
  }

  // Brand fonts are applied (the font variables must resolve on :root).
  for (const route of PUBLIC_ROUTES.filter((r) => r !== "/login")) {
    await open(page, BASE + route).catch(() => {});
    const fonts = await page.evaluate(() => ({
      heading: getComputedStyle(document.querySelector("h1")).fontFamily,
      body: getComputedStyle(document.body).fontFamily,
    }));
    if (!/Cormorant/i.test(fonts.heading)) note("ERROR", `fonts ${route}`, `h1 is not in Cormorant Garamond (${fonts.heading})`);
    if (!/Inter/i.test(fonts.body)) note("ERROR", `fonts ${route}`, `body is not in Inter (${fonts.body})`);
  }
  console.log("OK: brand fonts checked on the public pages");

  // Links to a section of another page land on that section.
  for (const [target, id] of [["/services", "syndic"], ["/contact", "faq"]]) {
    await open(page, `${BASE}/`);
    const link = page.locator(`footer a[href="${target}#${id}"]`).first();
    if (!(await link.count())) { note("WARN", "anchors", `no footer link to ${target}#${id}`); continue; }
    await link.click();
    await page.waitForURL(`**${target}#${id}`, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const top = await page.evaluate((sectionId) => document.getElementById(sectionId)?.getBoundingClientRect().top ?? null, id);
    if (top === null || top < -5 || top > 250) note("ERROR", "anchors", `footer link ${target}#${id} did not scroll to the section (top ${top})`);
  }
  console.log("OK: cross-page section links land on their section");

  // Removed fake filler must not reappear on any public page.
  for (const route of PUBLIC_ROUTES) {
    await open(page, BASE + route).catch(() => {});
    // Full page source: visible text plus metadata and structured data.
    const text = await page.evaluate(() => document.documentElement.outerHTML);
    for (const pattern of REMOVED_FILLER) {
      if (pattern.test(text)) note("ERROR", `filler ${route}`, `removed fake content is back: ${pattern}`);
    }
  }
  console.log("OK: removed fake filler checked on every public page");

  // Confirmed contact details are published where they belong.
  await open(page, `${BASE}/contact`);
  const contactHtml = await page.evaluate(() => document.documentElement.outerHTML);
  for (const expected of ["Ankit Dookhorun", "+230 5531 0734", "zoodookhorun@gmail.com", "Nihal Lutchmee", "+230 5817 4529", "executive@wwwbellavere.com", "24/7", "the same day", "instagram.com/bellavere.ltd", "facebook.com/bellavere.ltd"]) {
    if (!contactHtml.includes(expected)) note("ERROR", "contact", `contact page is missing "${expected}"`);
  }
  console.log("OK: contact page shows Ankit, Nihal, 24/7, same-day replies and both social accounts");

  // Exactly two demo accounts are offered on the sign-in page.
  await open(page, `${BASE}/login`);
  const demoButtons = await page.getByRole("button", { name: /^Sign in as / }).count();
  if (demoButtons !== 2) note("ERROR", "login", `expected 2 demo accounts on the sign-in page, found ${demoButtons}`);
  else console.log("OK: sign-in page offers exactly 2 demo accounts");

  // The public portfolio is gone.
  const portfolio = await page.goto(`${BASE}/properties`, { waitUntil: "domcontentloaded" });
  if (portfolio.status() !== 404) note("ERROR", "portfolio", `/properties should be gone, got ${portfolio.status()}`);
  else console.log("OK: public portfolio removed (/properties is 404)");

  // 404 page (the 404 network status itself logs a console error — expected)
  await open(page, BASE + "/definitely-not-a-page").catch(() => {});
  const notFoundOk = await page.evaluate(() => /404|lost/i.test(document.body.innerText));
  if (!notFoundOk) note("ERROR", "404 page", "custom 404 content not detected");
  await shoot(page, "/definitely-not-a-page", "404");

  // unauthenticated dashboard must redirect to /login
  const { finalUrl } = await inspectPage(page, "/dashboard", "unauth /dashboard");
  if (finalUrl && !finalUrl.includes("/login")) note("ERROR", "auth", `unauthenticated /dashboard did not redirect to /login (got ${finalUrl})`);
  else console.log("OK: unauthenticated /dashboard -> /login");
  await ctx.close();
}

// ---------- French pages and the estimator (browser) ----------
// Every French page at 1440 and 390 (the English ones are inspected above):
// 200, <html lang="fr">, no console errors, images, no horizontal scroll and
// no removed filler. The estimator, in both languages, shows its first
// question. No screenshots here (screenshots/ holds the English set).
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const pages = [...LOCALIZED_PAGES.filter((p) => p.locale === "fr"), ...LOCALIZED_PAGES.filter((p) => p.locale === "en" && p.route === "/estimate")];
  let frOk = true;
  for (const { locale, route, url } of pages) {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width > 1000 ? 900 : 844 });
      const label = `${locale} ${url} @${width}`;
      const { status, consoleErrors } = await inspectPage(page, url, label);
      if (status === undefined) { frOk = false; continue; }
      if (status !== 200) { frOk = false; note("ERROR", label, `expected 200, got ${status}`); }
      if (consoleErrors) frOk = false;
      const seen = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        html: document.documentElement.outerHTML,
        h1: document.querySelector("h1")?.textContent ?? "",
        choices: document.querySelectorAll('main [role="radiogroup"] [role="radio"]').length,
      }));
      if (seen.lang !== locale) { frOk = false; note("ERROR", label, `<html lang="${seen.lang}">, expected "${locale}"`); }
      if (width === 1440) {
        for (const pattern of REMOVED_FILLER) {
          if (pattern.test(seen.html)) { frOk = false; note("ERROR", `filler ${url}`, `removed fake content is back: ${pattern}`); }
        }
      }
      if (route === "/estimate") {
        const title = squash(messages(locale, "estimator").header.title);
        if (squash(seen.h1) !== title) { frOk = false; note("ERROR", label, `estimator heading is "${squash(seen.h1)}", expected "${title}"`); }
        if (seen.choices < 2) { frOk = false; note("ERROR", label, `estimator shows ${seen.choices} choices for its first question`); }
      }
    }
  }
  if (frOk) console.log(`OK: French pages and the estimator (both languages) load at 1440 and 390 with lang set and no console errors`);
  await ctx.close();
}

// ---------- without JavaScript ----------
// The server HTML must show the content by itself (search engines, link
// previews, slow phones): nothing may wait for hydration to become visible.
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const route of new Set([...PUBLIC_ROUTES, ...LOCALIZED_PAGES.map((p) => p.url)])) {
    await page.goto(BASE + route, { waitUntil: "load" }).catch(() => {});
    const result = await page.evaluate(() => {
      const scope = document.querySelector("main") ?? document.body;
      const hidden = [...scope.querySelectorAll("[style]")].filter((el) => /opacity:\s*0(?![.\d])/.test(el.getAttribute("style") ?? ""));
      return { text: scope.innerText.trim().length, hidden: hidden.length };
    });
    if (result.text < 100) note("ERROR", `no-js ${route}`, `page shows almost no text without JavaScript (${result.text} chars)`);
    if (result.hidden) note("ERROR", `no-js ${route}`, `${result.hidden} element(s) rendered with opacity 0 in the server HTML`);
  }
  console.log("OK: public pages are readable without JavaScript, in English and French");

  // Unknown public URLs: a real 404 status with the localized "Lost at sea?"
  // page in the server HTML (app/[locale]/[...rest]/route.ts).
  const notFoundHeading = (lang) => squash(messages(lang, "common").notFound.heading);
  const NOT_FOUND = [
    ["/no-such-page", "en"],
    ["/services/no-such-section", "en"],
    ["/fr/no-such-page", "fr"],
    ["/fr/services/no-such-section", "fr"],
  ];
  let notFoundOk = true;
  for (const [route, lang] of NOT_FOUND) {
    const heading = notFoundHeading(lang);
    const res = await page.goto(BASE + route, { waitUntil: "load" }).catch(() => null);
    const seen = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    }));
    if (res?.status() !== 404 || seen.lang !== lang || seen.h1 !== heading) {
      notFoundOk = false;
      note("ERROR", `no-js ${route}`, `expected a ${lang} 404 page reading "${heading}" with status 404, got status ${res?.status()}, lang "${seen.lang}", h1 "${seen.h1}"`);
    }
  }
  if (notFoundOk) console.log("OK: unknown URLs answer 404 with the localized page, without JavaScript");
  await ctx.close();
}

// ---------- currency switch ----------
// Click MUR in the header, then confirm prices re-render in rupees and the
// choice persists across navigation (cookie) and into the dashboard.
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const RUPEE = /Rs\s\d{1,3}(,\d{3})+/;
  await open(page, `${BASE}/`);
  const before = await page.evaluate(() => document.body.innerText);
  if (!/€\d/.test(before)) note("ERROR", "currency", "home dashboard preview does not show euro amounts by default");
  await page.getByRole("radio", { name: /Mauritian rupee/ }).first().click();
  await page.waitForTimeout(1500);
  const after = await page.evaluate(() => document.body.innerText);
  if (!RUPEE.test(after)) note("ERROR", "currency", "clicking MUR did not switch the home preview to rupees");
  else console.log("OK: MUR switch re-renders amounts in rupees");
  await page.reload({ waitUntil: "load" }).then(() => page.waitForTimeout(1500));
  const reloaded = await page.evaluate(() => document.body.innerText);
  if (!RUPEE.test(reloaded)) note("ERROR", "currency", "MUR choice did not survive a full page reload (cookie)");
  else console.log("OK: MUR choice persists across a reload");
  await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: "sophie@demo.bellavere.com", password: "demo1234" } });
  await open(page, `${BASE}/dashboard/statements`);
  const stmt = await page.evaluate(() => document.body.innerText);
  if (!RUPEE.test(stmt)) note("ERROR", "currency", "dashboard statements not in rupees after choosing MUR");
  else console.log("OK: dashboard statements follow the MUR choice");
  await page.screenshot({ path: path.join(OUT, "dashboard-statements-mur-desktop.png"), fullPage: true });
  await ctx.close();
}

// ---------- security & admin ----------
// Sessions are HMAC-signed: forged or tampered cookies must be rejected.
// Admin checks run when ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD are set.
{
  const sessionOf = async (ctx) =>
    (await ctx.cookies()).find((c) => c.name === "bv_session")?.value;

  // 1. The old plain-text cookie format must no longer grant access.
  {
    const ctx = await browser.newContext();
    await ctx.addCookies([{ name: "bv_session", value: "c-hamilton", url: BASE }]);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
    if (!page.url().includes("/login")) note("ERROR", "security", "forged plain-text session cookie was accepted");
    else console.log("OK: forged plain-text cookie rejected");
    await ctx.close();
  }

  // 2. A genuine token with its payload edited (Sophie -> Hamilton) must fail.
  {
    const ctx = await browser.newContext();
    await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: ACCOUNTS.sophie.email, password: "demo1234" } });
    const token = await sessionOf(ctx);
    if (!token) note("ERROR", "security", "could not obtain a signed session for the tamper test");
    else {
      const [body, sig] = token.split(".");
      const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
      payload.sub = "c-hamilton";
      const forged = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${sig}`;
      await ctx.clearCookies();
      await ctx.addCookies([{ name: "bv_session", value: forged, url: BASE }]);
      const page = await ctx.newPage();
      await page.goto(`${BASE}/dashboard/properties`, { waitUntil: "domcontentloaded" });
      const text = await page.evaluate(() => document.body.innerText);
      if (!page.url().includes("/login") || text.includes("Cap Ouest Penthouse")) note("ERROR", "security", "tampered session token was accepted");
      else console.log("OK: tampered signed token rejected");
    }
    await ctx.close();
  }

  // 3. Owners cannot reach the admin area.
  {
    const ctx = await browser.newContext();
    await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: ACCOUNTS.sophie.email, password: "demo1234" } });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/admin`, { waitUntil: "domcontentloaded" });
    if (page.url().includes("/admin")) note("ERROR", "security", "an owner reached /admin");
    else console.log("OK: owner is redirected away from /admin");
    const viewAs = await ctx.request.post(`${BASE}/api/admin/view-as`, { form: { clientId: "c-hamilton" }, maxRedirects: 0 });
    if (viewAs.status() !== 403) note("ERROR", "security", `owner could call view-as (status ${viewAs.status()})`);
    else console.log("OK: owner cannot use admin view-as (403)");
    await ctx.close();
  }

  // 4. Wrong admin password is refused.
  {
    const ctx = await browser.newContext();
    const res = await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: "kritgoburdhan@gmail.com", password: "definitely-wrong-password" } });
    if (res.status() !== 401) note("ERROR", "security", `wrong admin password returned ${res.status()}`);
    else console.log("OK: wrong admin password refused (401)");
    await ctx.close();
  }

  // 5. Full admin flow.
  const adminEmail = process.env.ADMIN_TEST_EMAIL;
  const adminPassword = process.env.ADMIN_TEST_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("SKIP: admin flow (set ADMIN_TEST_EMAIL and ADMIN_TEST_PASSWORD to run it)");
  } else {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const login = await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: adminEmail, password: adminPassword } });
    const json = await login.json().catch(() => ({}));
    if (login.status() !== 200 || json.redirect !== "/admin") note("ERROR", "admin", `admin login failed (${login.status()} ${JSON.stringify(json)})`);
    else {
      console.log("OK: admin signs in and is sent to /admin");
      const page = await ctx.newPage();
      await inspectPage(page, "/admin", "admin /admin");
      const overview = await page.evaluate(() => document.body.innerText);
      for (const name of ["Sophie Laurent", "Hamilton Estates Ltd"]) {
        if (!overview.includes(name)) note("ERROR", "admin", `admin overview is missing owner ${name}`);
      }
      console.log("OK: admin overview lists every owner");
      await shoot(page, "/admin", "admin");
      await inspectPage(page, "/admin/clients/c-sophie", "admin /admin/clients/c-sophie");
      const detail = await page.evaluate(() => document.body.innerText);
      if (!detail.includes("Villa Azure")) note("ERROR", "admin", "owner detail page is missing the owner's property");
      await shoot(page, "/admin/clients/c-sophie", "admin-clients-c-sophie");

      // Open Hamilton's portal: their data, the admin banner, and isolation kept.
      await ctx.request.post(`${BASE}/api/admin/view-as`, { form: { clientId: "c-hamilton" }, maxRedirects: 0 });
      await open(page, `${BASE}/dashboard/properties`);
      const portal = await page.evaluate(() => document.body.innerText);
      if (!portal.includes("Cap Ouest Penthouse") || !portal.includes("Admin view")) note("ERROR", "admin", "view-as did not open Hamilton's portal with the admin banner");
      else if (portal.includes("Villa Azure")) note("ERROR", "admin", "view-as leaked another owner's property");
      else console.log("OK: admin can open an owner's portal (banner shown, only that owner's data)");
      const foreign = await page.goto(`${BASE}/dashboard/properties/p-01`, { waitUntil: "domcontentloaded" });
      if (foreign.status() !== 404) note("ERROR", "admin", `while viewing Hamilton, Sophie's property returned ${foreign.status()}`);
      else console.log("OK: isolation holds inside admin view (foreign property 404)");

      // Back to admin: the dashboard no longer opens without choosing an owner.
      await ctx.request.post(`${BASE}/api/admin/view-as`, { form: { clientId: "" }, maxRedirects: 0 });
      await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
      if (!page.url().endsWith("/admin")) note("ERROR", "admin", `after leaving view-as, /dashboard went to ${page.url()}`);
      else console.log("OK: leaving view-as returns the admin to /admin");
    }
    await ctx.close();
  }
}

// ---------- per-account passes ----------
let shotDashboards = false;
for (const [name, acct] of Object.entries(ACCOUNTS)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const login = await ctx.request.post(`${BASE}/api/auth/login`, { data: { email: acct.email, password: "demo1234", remember: true } });
  if (login.status() !== 200) { note("ERROR", `login ${name}`, `login API returned ${login.status()}`); await ctx.close(); continue; }
  console.log(`OK: logged in as ${name}`);
  const page = await ctx.newPage();

  const routes = [...DASH_ROUTES, `/dashboard/properties/${acct.own[0]}`];
  for (const route of routes) {
    const label = `${name} ${route}`;
    const { finalUrl } = await inspectPage(page, route, label);
    if (finalUrl && finalUrl.includes("/login")) note("ERROR", label, "bounced to /login while authenticated");
    if (!shotDashboards) await shoot(page, route, slug(route));
  }
  shotDashboards = true; // screenshot dashboard routes once (sophie)

  // isolation: own property names visible, foreign names absent
  await open(page, `${BASE}/dashboard/properties`);
  const text = await page.evaluate(() => document.body.innerText);
  for (const n of acct.ownNames) if (!text.includes(n)) note("ERROR", `${name} isolation`, `own property "${n}" NOT visible on /dashboard/properties`);
  for (const n of acct.foreignNames) if (text.includes(n)) note("ERROR", `${name} isolation`, `foreign property "${n}" VISIBLE on /dashboard/properties`);

  // isolation: foreign property detail must 404
  const foreign = await page.goto(`${BASE}/dashboard/properties/${acct.foreign}`, { waitUntil: "domcontentloaded" });
  const foreignText = await page.evaluate(() => document.body.innerText);
  if (foreign.status() !== 404) note("ERROR", `${name} isolation`, `foreign property ${acct.foreign} did NOT return 404 (status ${foreign.status()})`);
  else if (acct.foreignNames.some((n) => foreignText.includes(n))) note("ERROR", `${name} isolation`, `the 404 for ${acct.foreign} shows the foreign property's name`);
  else console.log(`OK: ${name} -> ${acct.foreign} returns 404`);
  const unknown = await page.goto(`${BASE}/dashboard/definitely-not-a-page`, { waitUntil: "domcontentloaded" });
  if (unknown.status() !== 404) note("ERROR", `${name} 404`, `unknown dashboard path returned ${unknown.status()}`);
  else console.log(`OK: ${name} -> unknown dashboard path returns 404`);

  // logout clears session
  const logout = await ctx.request.post(`${BASE}/api/auth/logout`, { maxRedirects: 0 });
  if (![303, 302, 307].includes(logout.status())) note("WARN", `${name} logout`, `logout returned ${logout.status()}`);
  const after = await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded" });
  if (!page.url().includes("/login")) note("ERROR", `${name} logout`, `after logout /dashboard still reachable (${after.status()} ${page.url()})`);
  else console.log(`OK: ${name} logout -> /dashboard redirects to /login`);

  await ctx.close();
}

await browser.close();

const errors = findings.filter((f) => f.severity === "ERROR");
const warns = findings.filter((f) => f.severity === "WARN");
console.log(`\n==== REVIEW SUMMARY: ${errors.length} errors, ${warns.length} warnings ====`);
fs.writeFileSync("review-findings.json", JSON.stringify(findings, null, 2));
process.exit(errors.length ? 1 : 0);
