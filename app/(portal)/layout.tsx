import type { Metadata, Viewport } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RootDocument } from "@/components/document/RootDocument";
import { SITE_URL } from "@/data/site";
import { PORTAL_CLIENT_MESSAGES, pickMessages } from "@/i18n/messages";
import { openGraphImagePath } from "@/lib/i18n/metadata";
import { company } from "@/data/company";
import { OPEN_GRAPH_BASE } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "common" });
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("meta.defaultTitle"),
      template: `%s · ${company.name}`,
    },
    description: t("meta.description"),
    // "./" resolves against metadataBase and each page's own path, so every
    // page gets its own absolute canonical URL and og:url.
    alternates: { canonical: "./" },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      url: "./",
      images: [
        {
          url: openGraphImagePath("en"),
          width: 1200,
          height: 630,
          type: "image/png",
          alt: t("og.alt", { company: company.name, tagline: t("company.tagline") }),
        },
      ],
    },
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
 * Root document of the owner portal (/login, /dashboard, /admin), which is
 * English-only at its existing URLs. The URLs, middleware protection and
 * per-request rendering are unchanged; only the shared chrome (logo,
 * currency switch, error page) reads its English text from the messages.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Any next-intl server API used under the portal resolves to English
  // without looking at the request.
  setRequestLocale("en");
  return (
    <RootDocument
      locale="en"
      messages={pickMessages("en", PORTAL_CLIENT_MESSAGES)}
    >
      {children}
    </RootDocument>
  );
}
