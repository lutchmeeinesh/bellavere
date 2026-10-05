import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { RootDocument } from "@/components/document/RootDocument";
import { NotFoundScreen } from "@/components/site/NotFoundScreen";
import { company } from "@/data/company";
import { PORTAL_CLIENT_NAMESPACES, pickMessages } from "@/i18n/messages";
import { SITE_URL } from "@/data/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "common.notFound" });
  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("title")} · ${company.name}`,
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#faf7f2",
};

/**
 * Last-resort 404 for URLs outside both root documents (unknown public
 * URLs normally get the localized app/[locale]/not-found.tsx). The root
 * layout passes children through, so this renders its own document, in
 * English.
 */
export default function NotFound() {
  return (
    <RootDocument
      locale="en"
      messages={pickMessages("en", PORTAL_CLIENT_NAMESPACES)}
    >
      <NotFoundScreen />
    </RootDocument>
  );
}
