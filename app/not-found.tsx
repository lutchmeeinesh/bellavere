import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";
import { HtmlDocument } from "@/components/document/HtmlDocument";
import { NotFoundScreen } from "@/components/site/NotFoundScreen";
import { company } from "@/data/company";
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
 * Last-resort 404 for URLs outside both root documents (e.g. /x.y; unknown
 * public URLs get the localized page through app/[locale]/[...rest]). The
 * root layout passes children through, so this renders its own document,
 * in English. Only the bare document (no client providers): the screen has
 * no client components, so this boundary, which every route carries, adds
 * no JavaScript to them.
 */
export default function NotFound() {
  return (
    <HtmlDocument locale="en">
      <NotFoundScreen locale="en" />
    </HtmlDocument>
  );
}
