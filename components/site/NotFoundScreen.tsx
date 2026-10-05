"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/site/Logo";

/**
 * The site's 404 page ("Lost at sea?"), shown without the site chrome, so
 * it carries its own frame. Used by app/[locale]/not-found.tsx (unknown
 * public URLs, in the page's language) and app/not-found.tsx (anything
 * else, in English). A client component so it reads the language from the
 * provider of whichever document renders it.
 */
export function NotFoundScreen() {
  const t = useTranslations("common.notFound");
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-sand-50 px-5 py-24 text-center">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Logo />
      </div>

      <p
        aria-hidden
        className="font-serif text-[8rem] leading-none font-semibold text-gold-500/20 select-none sm:text-[11rem]"
      >
        404
      </p>
      <h1 className="-mt-8 sm:-mt-12">{t("heading")}</h1>
      <p className="mt-5 max-w-md text-lg text-ink-500">{t("body")}</p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">{t("home")}</Button>
        <Button href="/contact" variant="outline">
          {t("contact")}
        </Button>
      </div>
    </div>
  );
}
