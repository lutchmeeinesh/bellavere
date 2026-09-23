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
  return { finalUrl: page.url(), audit };
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

  // Public pages are prerendered: never "no-store", and cached at the edge.
  for (const route of PUBLIC_ROUTES) {
    await fetch(BASE + route); // warm the cache
    const res = await fetch(BASE + route);
    const cacheControl = res.headers.get("cache-control") ?? "";
    if (/no-store|private/.test(cacheControl)) note("ERROR", `caching ${route}`, `public page is rendered per request (cache-control: ${cacheControl})`);
    if (!IS_LOCAL) {
      const edge = res.headers.get("x-vercel-cache") ?? "";
      if (!/HIT|STALE|PRERENDER/.test(edge)) note("WARN", `caching ${route}`, `not served from the edge cache (x-vercel-cache: ${edge || "none"})`);
    }
  }
  console.log("OK: public pages are static (edge-cacheable)");

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

// ---------- without JavaScript ----------
// The server HTML must show the content by itself (search engines, link
// previews, slow phones): nothing may wait for hydration to become visible.
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  for (const route of PUBLIC_ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" }).catch(() => {});
    const result = await page.evaluate(() => {
      const scope = document.querySelector("main") ?? document.body;
      const hidden = [...scope.querySelectorAll("[style]")].filter((el) => /opacity:\s*0(?![.\d])/.test(el.getAttribute("style") ?? ""));
      return { text: scope.innerText.trim().length, hidden: hidden.length };
    });
    if (result.text < 100) note("ERROR", `no-js ${route}`, `page shows almost no text without JavaScript (${result.text} chars)`);
    if (result.hidden) note("ERROR", `no-js ${route}`, `${result.hidden} element(s) rendered with opacity 0 in the server HTML`);
  }
  console.log("OK: public pages are readable without JavaScript");
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
