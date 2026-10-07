import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { company } from "@/data/company";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { OPEN_GRAPH_BASE, OPEN_GRAPH_LOCALE } from "@/lib/seo";

/**
 * The public URL of a page in a language: localizedPath("fr", "/services")
 * is "/fr/services", localizedPath("en", "/") is "/". Paths are written
 * without a locale.
 */
export function localizedPath(locale: AppLocale, path: string): string {
  return getPathname({ href: path, locale });
}

/** The site's social-preview image in a language (app/[locale]/opengraph-image.tsx). */
export function openGraphImagePath(locale: AppLocale): string {
  return localizedPath(locale, "/opengraph-image");
}

/**
 * Metadata for a public page in one language:
 *
 *   export async function generateMetadata({ params }) {
 *     const { locale } = await params;
 *     const t = await getTranslations({ locale, namespace: "services.meta" });
 *     return localizedMetadata({ locale, path: "/services", title: t("title"), description: t("description") });
 *   }
 *
 * - canonical: this language's own URL, spelled out (never "./", which
 *   would resolve against the internal /en/... route path);
 * - alternates.languages: hreflang links for English, French and
 *   x-default (English, the unprefixed URL);
 * - openGraph: the shared base, og:url, og:locale and og:locale:alternate,
 *   and the preview image in this language with a translated alt text.
 *
 * Omit `title` to keep the layout's default title (the home page).
 * Relative URLs resolve against metadataBase (NEXT_PUBLIC_SITE_URL).
 */
export async function localizedMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: AppLocale;
  path: string;
  title?: string;
  description?: string;
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common" });
  const url = localizedPath(locale, path);
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((code) => [code, localizedPath(code, path)]),
  );
  languages["x-default"] = localizedPath(routing.defaultLocale, path);

  return {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    alternates: { canonical: url, languages },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      locale: OPEN_GRAPH_LOCALE[locale],
      alternateLocale: routing.locales
        .filter((code) => code !== locale)
        .map((code) => OPEN_GRAPH_LOCALE[code]),
      url,
      images: [
        {
          url: openGraphImagePath(locale),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: t("og.alt", {
            company: company.name,
            tagline: t("company.tagline"),
          }),
        },
      ],
    },
  };
}
