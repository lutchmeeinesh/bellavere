/**
 * Full-page screenshots of the public pages at 1440 and 390 px, with
 * reduced motion (no reveals, transitions or count-ups mid-animation), for
 * before/after visual comparison.
 *
 * Usage: node scripts/visual-snapshot.mjs <baseUrl> <outDir> [routes...]
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const [BASE = "http://localhost:3010", OUT = "screenshots/baseline", ...custom] = process.argv.slice(2);
const ROUTES = custom.length ? custom : ["/", "/services", "/about", "/contact", "/privacy", "/terms", "/login", "/definitely-not-a-page"];
fs.mkdirSync(OUT, { recursive: true });

const slug = (r) => (r === "/" ? "home" : r.replace(/^\//, "").replace(/[/[\]]/g, "-"));
const browser = await chromium.launch();
for (const [label, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport, reducedMotion: "reduce", timezoneId: "Indian/Mauritius" });
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: "load" });
    await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    // Lazy images below the fold must have finished loading (or failed).
    await page.evaluate(() =>
      Promise.all([...document.images].map((img) => (img.complete ? 0 : new Promise((done) => { img.onload = img.onerror = done; })))),
    );
    await page.waitForTimeout(600);
    const file = path.join(OUT, `${slug(route)}-${label}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log("saved", file);
  }
  await ctx.close();
}
await browser.close();
