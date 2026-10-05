import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";
import { PUBLIC_EMAIL } from "@/data/site";
import { Link } from "@/i18n/navigation";
import { CURRENCY_COOKIE, formatDateLong } from "@/lib/format";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";
import { LOCALE_COOKIE } from "@/lib/i18n/localeCookie";
import { SESSION_COOKIE, VIEW_AS_COOKIE } from "@/lib/session";

/*
 * Why there is no cookie-consent banner:
 * the site sets only three cookies — `bv_session` (strictly necessary for the
 * owner login), `bv_view_as` (strictly necessary, staff only: which owner an
 * administrator is viewing) and `bv_currency` (a preference the visitor sets
 * themselves by choosing MUR or EUR). Strictly necessary and user-requested
 * preference cookies are exempt from prior consent under GDPR / ePrivacy
 * guidance and the Mauritius Data Protection Act 2017. As soon as analytics
 * (e.g. GA4) or marketing/advertising cookies are added, a consent banner
 * that blocks them until the visitor opts in becomes necessary — and this
 * page must be updated.
 *
 * Wording: messages `legal.privacy.*` (and `legal.shared.*`, shared with the
 * terms page). Facts — company details, the email address, cookie names,
 * dates — come from the data files and are interpolated.
 */

/** Shown as "Last updated", formatted in the page's language. */
const LAST_UPDATED = "2026-09-22";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "legal.privacy.meta" });
  return localizedMetadata({
    locale,
    path: "/privacy",
    title: t("title"),
    description: t("description", { legalName: company.legalName }),
  });
}

const PROSE =
  "max-w-3xl leading-relaxed text-ink-900 [&_h2]:mt-14 [&_h2]:mb-4 [&>h2:first-child]:mt-0 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-gold-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-navy-900 [&_code]:rounded [&_code]:bg-sand-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm";

// Order of the lists; their wording is in messages `legal.privacy.<section>.items`.
const PURPOSES = ["enquiry", "portal", "records", "security"] as const;
const RETENTION = ["enquiries", "ownerRecords", "consent"] as const;
const RIGHTS = [
  "access",
  "rectification",
  "erasure",
  "restriction",
  "portability",
  "withdrawConsent",
] as const;
const COOKIES = [
  { id: "session", name: SESSION_COOKIE },
  { id: "currency", name: CURRENCY_COOKIE },
  { id: "language", name: LOCALE_COOKIE },
  { id: "viewAs", name: VIEW_AS_COOKIE },
] as const;

// Markup used inside the messages' sentences (t.rich).
const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;
const code = (chunks: ReactNode) => <code>{chunks}</code>;
const emailLink = (chunks: ReactNode) => (
  <a href={`mailto:${PUBLIC_EMAIL}`}>{chunks}</a>
);

export default async function PrivacyPage({
  params,
}: {
  params: LocaleParams;
}) {
  const locale = await getPageLocale(params);
  const t = await getTranslations("legal.privacy");
  const tShared = await getTranslations("legal.shared");
  const tCommon = await getTranslations("common");
  return (
    <>
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">{tShared("eyebrow")}</p>
            <h1>{t("title")}</h1>
            <p className="mt-5 text-lg text-ink-500">{t("intro")}</p>
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
            <h2>{t("whoWeAre.heading")}</h2>
            <p>
              {t("whoWeAre.operator", {
                legalName: company.legalName,
                tradingName: company.tradingName,
                company: company.name,
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
                {t.rich("whoWeAre.contact", {
                  email: PUBLIC_EMAIL,
                  link: emailLink,
                })}
              </li>
            </ul>

            <h2>{t("laws.heading")}</h2>
            <p>{t.rich("laws.body", { strong })}</p>

            <h2>{t("collection.heading")}</h2>
            <h3>{t("collection.contactForm.heading")}</h3>
            <ul>
              <li>{t("collection.contactForm.items.details")}</li>
              <li>{t("collection.contactForm.items.consent")}</li>
            </ul>
            <h3>{t("collection.ownerPortal.heading")}</h3>
            <ul>
              <li>{t("collection.ownerPortal.items.account")}</li>
              <li>{t("collection.ownerPortal.items.property")}</li>
            </ul>
            <h3>{t("collection.technical.heading")}</h3>
            <ul>
              <li>{t("collection.technical.items.serverLogs")}</li>
            </ul>

            <h2>{t("purposes.heading")}</h2>
            <ul>
              {PURPOSES.map((id) => (
                <li key={id}>{t.rich(`purposes.items.${id}`, { strong })}</li>
              ))}
            </ul>

            <h2>{t("retention.heading")}</h2>
            {/* TODO: confirm with client — retention periods */}
            <ul>
              {RETENTION.map((id) => (
                <li key={id}>{t(`retention.items.${id}`)}</li>
              ))}
            </ul>

            <h2>{t("sharing.heading")}</h2>
            <p>{t.rich("sharing.processors", { strong })}</p>
            <p>{t("sharing.transfers")}</p>

            <h2>{t("rights.heading")}</h2>
            <p>{t("rights.intro")}</p>
            <ul>
              {RIGHTS.map((id) => (
                <li key={id}>{t(`rights.items.${id}`)}</li>
              ))}
            </ul>
            <p>
              {t.rich("rights.exercise", {
                email: PUBLIC_EMAIL,
                link: emailLink,
              })}
            </p>

            <h2>{t("cookies.heading")}</h2>
            <p>{t("cookies.intro")}</p>
            <ul>
              {COOKIES.map(({ id, name }) => (
                <li key={id}>
                  {t.rich(`cookies.items.${id}`, {
                    name,
                    company: company.name,
                    code,
                    strong,
                  })}
                </li>
              ))}
            </ul>
            <p>
              {t.rich("cookies.noTracking", {
                sessionCookie: SESSION_COOKIE,
                code,
                strong,
              })}
            </p>

            <h2>{t("security.heading")}</h2>
            <p>{t("security.body")}</p>

            <h2>{t("changes.heading")}</h2>
            <p>
              {t.rich("changes.body", {
                link: (chunks) => <Link href="/terms">{chunks}</Link>,
              })}
            </p>

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
