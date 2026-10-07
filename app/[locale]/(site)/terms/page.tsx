import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";
import { LEGAL_LAST_UPDATED, PUBLIC_EMAIL } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { formatDateLong } from "@/lib/format";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

// Wording: messages `legal.terms.*` (and `legal.shared.*`, shared with the
// privacy policy). Facts — company details, the email address, dates — come
// from the data files and are interpolated.

/**
 * Shown as "Last updated", formatted in the page's language (data/site.ts;
 * app/sitemap.ts uses the same date).
 */
const LAST_UPDATED = LEGAL_LAST_UPDATED.terms;

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "legal.terms.meta" });
  return localizedMetadata({
    locale,
    path: "/terms",
    title: t("title"),
    description: t("description", { company: company.name }),
  });
}

const PROSE =
  "max-w-3xl leading-relaxed text-ink-900 [&_h2]:mt-14 [&_h2]:mb-4 [&>h2:first-child]:mt-0 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-gold-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-navy-900";

// Order of the owner-portal rules; wording in `legal.terms.portal.items`.
const PORTAL_RULES = [
  "access",
  "credentials",
  "otherOwners",
  "figures",
  "suspension",
] as const;

// The email address inside sentences (t.rich).
const emailLink = (chunks: ReactNode) => (
  <a href={`mailto:${PUBLIC_EMAIL}`}>{chunks}</a>
);

export default async function TermsPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await getPageLocale(params);
  const t = await getTranslations("legal.terms");
  const tShared = await getTranslations("legal.shared");
  const tCommon = await getTranslations("common");
  return (
    <>
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">{tShared("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="mt-5 text-lg text-ink-500">
              {t("intro", { company: company.name })}
            </p>
            <p className="mt-4 text-sm text-ink-500">
              {tShared("lastUpdated", {
                date: formatDateLong(LAST_UPDATED, locale),
              })}
            </p>
          </Reveal>
        </Container>
      </div>

      <section className="py-16 lg:py-24">
        <Container>
          <div className={PROSE}>
            <h2>{t("about.heading")}</h2>
            <p>
              {t("about.operator", {
                legalName: company.legalName,
                tradingName: company.tradingName,
              })}
            </p>
            <ul>
              <li>
                {tShared("registration", {
                  number: company.companyNumber,
                  date: formatDateLong(company.incorporated, locale),
                  companyType: tCommon("company.companyType"),
                })}
              </li>
              {/* TODO: confirm with client — registered address (appears once
                  set in data/company.ts) */}
              {company.registeredAddress ? (
                <li>
                  {tShared("registeredAddress", {
                    address: company.registeredAddress,
                  })}
                </li>
              ) : null}
              <li>
                {t.rich("about.contact", {
                  email: PUBLIC_EMAIL,
                  link: emailLink,
                })}
              </li>
            </ul>
            <p>{t("about.agreement")}</p>

            <h2>{t("information.heading")}</h2>
            <p>{t("information.body")}</p>

            <h2>{t("portal.heading")}</h2>
            <ul>
              {PORTAL_RULES.map((id) => (
                <li key={id}>
                  {t.rich(`portal.items.${id}`, {
                    email: PUBLIC_EMAIL,
                    link: emailLink,
                  })}
                </li>
              ))}
            </ul>

            <h2>{t("currencies.heading")}</h2>
            <p>{t("currencies.body")}</p>

            <h2>{t("intellectualProperty.heading")}</h2>
            <p>
              {t("intellectualProperty.body", {
                legalName: company.legalName,
              })}
            </p>

            <h2>{t("externalLinks.heading")}</h2>
            <p>{t("externalLinks.body")}</p>

            <h2>{t("liability.heading")}</h2>
            <p>{t("liability.body", { legalName: company.legalName })}</p>

            <h2>{t("privacy.heading")}</h2>
            <p>
              {t.rich("privacy.body", {
                link: (chunks) => <Link href="/privacy">{chunks}</Link>,
              })}
            </p>

            <h2>{t("changes.heading")}</h2>
            <p>{t("changes.body")}</p>

            <h2>{t("governingLaw.heading")}</h2>
            <p>{t("governingLaw.body")}</p>

            {/* TODO: confirm with client — legal review before launch */}
            <p className="mt-16! rounded-xl border border-sand-300 bg-sand-100 px-5 py-4 text-sm text-ink-500">
              {tShared("reviewNotice")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
