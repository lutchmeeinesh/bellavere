import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotFoundScreen } from "@/components/site/NotFoundScreen";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

/**
 * The site's 404 page ("Lost at sea?") as a static page, in English
 * (/page-not-found) and French (/fr/page-not-found). Unknown public URLs
 * never redirect here: app/[locale]/[...rest]/route.ts serves this page's
 * HTML at the unknown URL itself, with a 404 status (see that file for why).
 * Not linked anywhere, kept out of search results and out of the sitemap.
 */
export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "common.notFound" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function PageNotFound({ params }: { params: LocaleParams }) {
  const locale = await getPageLocale(params);
  return <NotFoundScreen locale={locale} />;
}
