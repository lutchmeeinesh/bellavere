/**
 * Automated review pass (Phase 3):
 *  - opens every route logged out and as each demo account
 *  - screenshots desktop (1440) and mobile (390) into /screenshots
 *  - collects console errors and failed requests
 *  - verifies auth redirects and cross-client data isolation (404s)
 *  - checks alt attributes, broken images and leftover lorem ipsum
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
  sophie: { email: "sophie@demo.bellavere.com", own: ["p-01", "p-02", "p-03"], foreign: "p-04", ownNames: ["Villa Azure", "Villa Frangipani", "Les Cerisiers 4B"], foreignNames: ["Villa Tamarin Bay", "Cap Ouest Penthouse"] },
  ravi: { email: "ravi@demo.bellavere.com", own: ["p-04"], foreign: "p-01", ownNames: ["Villa Tamarin Bay"], foreignNames: ["Villa Azure", "Les Salines Loft"] },
  hamilton: { email: "hamilton@demo.bellavere.com", own: ["p-05", "p-06", "p-07", "p-08", "p-09"], foreign: "p-02", ownNames: ["Cap Ouest Penthouse", "Les Salines Loft"], foreignNames: ["Villa Azure", "Villa Tamarin Bay"] },
};

const PUBLIC_ROUTES = ["/", "/services", "/properties", "/properties/villa-azure", "/about", "/contact", "/login"];
const DASH_ROUTES = ["/dashboard", "/dashboard/properties", "/dashboard/bookings", "/dashboard/maintenance", "/dashboard/statements", "/dashboard/documents", "/dashboard/settings"];

const findings = [];
const note = (severity, where, message) => {
  findings.push({ severity, where, message });
  console.log(`[${severity}] ${where}: ${message}`);
};

const slug = (route) => (route === "/" ? "home" : route.replace(/^\//, "").replace(/[\/\[\]]/g, "-"));

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

  const res = await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => {
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
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
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

  // 404 page
  await inspectPage(page, "/definitely-not-a-page", "404 page");
  const notFoundOk = await page.evaluate(() => /404|lost/i.test(document.body.innerText));
  if (!notFoundOk) note("ERROR", "404 page", "custom 404 content not detected");
  await shoot(page, "/definitely-not-a-page", "404");

  // unauthenticated dashboard must redirect to /login
  const { finalUrl } = await inspectPage(page, "/dashboard", "unauth /dashboard");
  if (finalUrl && !finalUrl.includes("/login")) note("ERROR", "auth", `unauthenticated /dashboard did not redirect to /login (got ${finalUrl})`);
  else console.log("OK: unauthenticated /dashboard -> /login");
  await ctx.close();
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
  await page.goto(`${BASE}/dashboard/properties`, { waitUntil: "networkidle" });
  const text = await page.evaluate(() => document.body.innerText);
  for (const n of acct.ownNames) if (!text.includes(n)) note("ERROR", `${name} isolation`, `own property "${n}" NOT visible on /dashboard/properties`);
  for (const n of acct.foreignNames) if (text.includes(n)) note("ERROR", `${name} isolation`, `foreign property "${n}" VISIBLE on /dashboard/properties`);

  // isolation: foreign property detail must 404
  const foreign = await page.goto(`${BASE}/dashboard/properties/${acct.foreign}`, { waitUntil: "domcontentloaded" });
  const notFound = foreign.status() === 404 || (await page.evaluate(() => /not.?in your portfolio|not found|404/i.test(document.body.innerText)));
  if (!notFound) note("ERROR", `${name} isolation`, `foreign property ${acct.foreign} did NOT return 404 (status ${foreign.status()})`);
  else console.log(`OK: ${name} -> ${acct.foreign} returns 404`);

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
