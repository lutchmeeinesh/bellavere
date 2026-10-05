import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { NotFoundScreen } from "@/components/site/NotFoundScreen";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale: hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
    namespace: "common.notFound",
  });
  return { title: t("title") };
}

/**
 * 404 for unknown public URLs, in the URL's language: app/[locale]/[...rest]
 * catches them and calls notFound(), so the status is a real 404. Rendered
 * inside the public root document but without the site chrome.
 */
export default function LocaleNotFound() {
  return <NotFoundScreen />;
}
