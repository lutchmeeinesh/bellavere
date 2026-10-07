import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
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
 * 404 boundary of the public site, in the page's language, for a page that
 * calls notFound() (none does today). Next.js 15 draws a boundary like this
 * in the browser (the server sends an empty shell, see UPGRADE-PLAN.md §8),
 * so unknown public URLs do not come here: app/[locale]/[...rest]/route.ts
 * answers them with the static app/[locale]/page-not-found page instead.
 *
 * The locale was registered by app/[locale]/layout.tsx (setRequestLocale),
 * so getLocale() reads no request headers.
 */
export default async function LocaleNotFound() {
  const locale = await getLocale();
  return (
    <NotFoundScreen
      locale={hasLocale(routing.locales, locale) ? locale : routing.defaultLocale}
    />
  );
}
