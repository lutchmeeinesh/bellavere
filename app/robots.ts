import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Until SITE_INDEXABLE=true (set it at launch, once the demo content is
 * replaced), search engines are asked to stay out of the whole site. The
 * owner portal, admin area and API are never crawled. /login stays
 * crawlable on purpose: it carries a robots noindex tag, and a crawler
 * blocked here could never read it (a blocked URL can still be indexed from
 * links alone).
 */
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_INDEXABLE !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/api"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
