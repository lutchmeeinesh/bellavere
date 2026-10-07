import { getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/buttonClasses";
import { LOGO_LINK_CLASSES, LogoMark } from "@/components/site/LogoMark";
import { company } from "@/data/company";
import type { AppLocale } from "@/i18n/routing";
import { localeHref } from "@/lib/i18n/paths";

/**
 * The site's 404 page ("Lost at sea?"), shown without the site chrome, so
 * it carries its own frame. A server component with plain links and no
 * client JavaScript, so it is complete in the server HTML and its code is
 * not loaded with every page (each route carries its 404 boundaries).
 *
 * Used by app/[locale]/page-not-found (the localized 404 that
 * app/[locale]/[...rest]/route.ts serves for unknown public URLs),
 * app/[locale]/not-found.tsx and app/not-found.tsx (English). The language
 * is passed explicitly, so it never reads the request.
 */
export async function NotFoundScreen({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "common" });
  const home = localeHref(locale, "/");
  // The whole screen is the page's main landmark (there is no site chrome).
  // The big pale "404" is decoration, drawn as generated content (and
  // hidden from screen readers), so it is not page text that contrast
  // checks would hold to 4.5:1.
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-sand-50 px-5 py-24 text-center">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <a
          href={home}
          className={LOGO_LINK_CLASSES}
          aria-label={t("logo.label", { company: company.name })}
        >
          <LogoMark />
        </a>
      </div>

      <p
        aria-hidden
        className="font-serif text-[8rem] leading-none font-semibold text-gold-500/20 select-none before:content-['404'] sm:text-[11rem]"
      />
      <h1 className="-mt-8 sm:-mt-12">{t("notFound.heading")}</h1>
      <p className="mt-5 max-w-md text-lg text-ink-500">{t("notFound.body")}</p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <a href={home} className={buttonClasses()}>
          {t("notFound.home")}
        </a>
        <a
          href={localeHref(locale, "/contact")}
          className={buttonClasses({ variant: "outline" })}
        >
          {t("notFound.contact")}
        </a>
      </div>
    </main>
  );
}
