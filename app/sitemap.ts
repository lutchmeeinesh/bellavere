import type { MetadataRoute } from "next";

const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

/** Every public page. Dashboard, login and API routes are deliberately excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "monthly", priority: 1 },
    { path: "/services", changeFrequency: "monthly", priority: 0.9 },
    { path: "/about", changeFrequency: "yearly", priority: 0.7 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.8 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  ];

  const staticPages: MetadataRoute.Sitemap = pages.map(
    ({ path, changeFrequency, priority }) => ({
      url: `${BASE_URL}${path === "/" ? "" : path}`,
      lastModified,
      changeFrequency,
      priority,
    })
  );

  return staticPages;
}
