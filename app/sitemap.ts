import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Every public page, with the date its content last really changed (not the
 * build time, which would tell search engines everything changes on every
 * deploy). Update a page's date when you change its content; the privacy
 * and terms dates match their "Last updated" line. Dashboard, login and API
 * routes are deliberately excluded.
 */
const PAGES: { path: string; lastModified: string }[] = [
  { path: "/", lastModified: "2026-09-22" },
  { path: "/services", lastModified: "2026-09-22" },
  { path: "/about", lastModified: "2026-09-22" },
  { path: "/contact", lastModified: "2026-09-22" },
  { path: "/privacy", lastModified: "2026-09-22" },
  { path: "/terms", lastModified: "2026-09-22" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, lastModified }) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified,
  }));
}
