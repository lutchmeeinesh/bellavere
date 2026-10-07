import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@/components/analytics/Analytics";
import { RootDocument } from "@/components/document/RootDocument";
import { company } from "@/data/company";
import { SITE_URL } from "@/data/site";
import { SITE_CLIENT_MESSAGES, pickMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";
import { OPEN_GRAPH_BASE, OPEN_GRAPH_LOCALE } from "@/lib/seo";

/** Both languages are prerendered at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Any other first segment is not a language: Next.js answers it with the
// static English 404 (app/not-found.tsx) before rendering anything. Only
// URLs that skip the middleware get here with one (paths with a dot, e.g.
// /x.y; the middleware maps every other unprefixed URL to English).
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const requested = (await params).locale;
  // Only en and fr get here (dynamicParams = false); the fallback keeps
  // the types honest.
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "common.meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("defaultTitle"),
      template: `%s · ${company.name}`, // i18n-ignore (title pattern, not text)
    },
    description: t("description"),
    // Canonical and hreflang URLs are set by each page
    // (localizedMetadata() in lib/i18n/metadata.ts).
    openGraph: { ...OPEN_GRAPH_BASE, locale: OPEN_GRAPH_LOCALE[locale] },
    twitter: { card: "summary_large_image" },
    // Keep the site out of search results until launch (see app/robots.ts).
    ...(process.env.SITE_INDEXABLE === "true"
      ? {}
      : { robots: { index: false, follow: false } }),
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

/**
 * Root document of the public site, in English (/...) or French (/fr/...).
 * middleware.ts maps unprefixed English URLs onto /en internally.
 * setRequestLocale() lets every server component below read the locale
 * without request headers, so both languages stay static.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <RootDocument locale={locale} messages={pickMessages(locale, SITE_CLIENT_MESSAGES)}>
      {children}
      <Analytics />
    </RootDocument>
  );
}
