"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/buttonClasses";
import { Container } from "@/components/ui/Container";
import { LOGO_LINK_CLASSES, LogoMark } from "@/components/site/LogoMark";
import { company } from "@/data/company";
import { PUBLIC_EMAIL } from "@/data/site";
import type { AppLocale } from "@/i18n/routing";
import { localeHref } from "@/lib/i18n/paths";

const LINK =
  "inline-block py-1 font-medium text-navy-900 underline decoration-sand-300 underline-offset-4 transition-colors duration-150 hover:decoration-gold-500";

/**
 * Full-page error screen: anything a page throws lands here
 * (app/[locale]/error.tsx for the public site, in its language;
 * app/(portal)/error.tsx for the sign-in page, in English). It replaces the
 * site chrome, so like the 404 page it carries its own frame, and it always
 * offers a person to call. The error's message is never shown (it can carry
 * internal details); the digest lets us find it in the server logs.
 *
 * Its links are plain <a> elements (a full page load is the right way out of
 * an error anyway): every page loads its error boundary up front, so this
 * stays free of the client-side link machinery.
 */
export function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const home = localeHref(locale, "/");

  useEffect(() => {
    console.error(error);
  }, [error]);

  // reset() re-renders the segment; refresh() refetches its server
  // components too, so an error that came from the server is really retried.
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  // The whole screen is the page's main landmark: the error boundaries that
  // render it (app/[locale]/error.tsx, app/(portal)/error.tsx) replace the
  // layouts that hold the site's own <main>.
  return (
    <main className="relative flex min-h-svh flex-col justify-center bg-sand-50 py-24 text-center">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <a
          href={home}
          className={LOGO_LINK_CLASSES}
          aria-label={t("logo.label", { company: company.name })}
        >
          <LogoMark />
        </a>
      </div>

      <Container>
        <p className="eyebrow mb-4">{t("error.eyebrow")}</p>
        <h1 className="mx-auto max-w-2xl">{t("error.heading")}</h1>
        <p className="mx-auto mt-5 max-w-md text-lg text-ink-500">
          {t("error.body")}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button type="button" onClick={retry} className={buttonClasses()}>
            {t("error.tryAgain")}
          </button>
          <a href={home} className={buttonClasses({ variant: "outline" })}>
            {t("error.home")}
          </a>
          <a
            href={localeHref(locale, "/contact")}
            className={buttonClasses({ variant: "ghost" })}
          >
            {t("error.contact")}
          </a>
        </div>

        <div className="mt-12 text-sm text-ink-500">
          <p>
            {company.hours
              ? t("error.callUsHours", { hours: t("company.hoursInline") })
              : t("error.callUs")}
          </p>
          <ul className="mt-1">
            {company.contacts.map((person) => (
              <li key={person.name}>
                {person.name.split(" ")[0]}{" "}
                <a href={`tel:${person.phone.replace(/\s/g, "")}`} className={LINK}>
                  {person.phone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            {t.rich("error.writeTo", {
              email: PUBLIC_EMAIL,
              link: (chunks) => (
                <a href={`mailto:${PUBLIC_EMAIL}`} className={LINK}>
                  {chunks}
                </a>
              ),
            })}
          </p>
        </div>

        {error.digest ? (
          <p className="mt-10 text-xs text-ink-500">
            {t("error.reference", { digest: error.digest })}
          </p>
        ) : null}
      </Container>
    </main>
  );
}
