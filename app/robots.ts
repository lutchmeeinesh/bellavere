import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/**
 * Until SITE_INDEXABLE=true (set it at launch, once the demo content is
 * replaced), search engines are asked to stay out of the whole site.
 * Indexable, every public page is open to crawlers in both languages
 * (English unprefixed, French under /fr), and the sitemap lists them all
 * with their hreflang alternates (app/sitemap.ts). The owner portal, admin
 * area and API are never crawled (their /fr/... forms only redirect to
 * them). /login stays crawlable on purpose: it carries a robots noindex
 * tag, and a crawler blocked here could never read it (a blocked URL can
 * still be indexed from links alone).
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
