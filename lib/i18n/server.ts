import "server-only";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, type AppLocale } from "@/i18n/routing";

/** The `params` every page and layout under app/[locale] receives. */
export type LocaleParams = Promise<{ locale: string }>;

/**
 * Reads the page's locale from the [locale] segment and registers it for
 * next-intl (setRequestLocale), so getTranslations / useTranslations below
 * work without reading request headers and the page stays static. Call it
 * first thing in every page, layout and generateMetadata under app/[locale]:
 *
 *   export default async function ServicesPage({ params }: { params: LocaleParams }) {
 *     const locale = await getPageLocale(params);
 *     const t = await getTranslations("services");
 *     …
 *
 * (An unknown locale never gets this far: app/[locale]/layout.tsx answers
 * it with a 404; the fallback only keeps the types honest.)
 */
export async function getPageLocale(params: LocaleParams): Promise<AppLocale> {
  const { locale } = await params;
  const resolved = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;
  setRequestLocale(resolved);
  return resolved;
}
