import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

/**
 * The 404 page's title. After a notFound() thrown while rendering a page,
 * Next.js 15 sends an empty HTML shell with the 404 status and the browser
 * renders app/[locale]/not-found.tsx from the page data; that data carries
 * this page's metadata, so the tab says "Page not found" in both cases.
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

/**
 * Any public URL that matches no page (/no-such-page, /fr/no-such-page):
 * answers with the localized 404 page (app/[locale]/not-found.tsx) and a
 * real 404 status.
 */
export default function UnknownPage() {
  notFound();
}
