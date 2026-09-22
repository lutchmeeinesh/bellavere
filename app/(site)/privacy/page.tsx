import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";

/*
 * Why there is no cookie-consent banner:
 * the site sets only three cookies — `bv_session` (strictly necessary for the
 * owner login) and `bv_currency` (a preference the visitor sets themselves by
 * choosing MUR or EUR). Strictly necessary and user-requested preference
 * cookies are exempt from prior consent under GDPR / ePrivacy guidance and
 * the Mauritius Data Protection Act 2017. As soon as analytics (e.g. GA4) or
 * marketing/advertising cookies are added, a consent banner that blocks them
 * until the visitor opts in becomes necessary — and this page must be updated.
 */

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${company.legalName} collects, uses and protects personal data, and the cookies this website sets.`,
};

const PROSE =
  "max-w-3xl leading-relaxed text-ink-900 [&_h2]:mt-14 [&_h2]:mb-4 [&>h2:first-child]:mt-0 [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-gold-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-navy-900 [&_code]:rounded [&_code]:bg-sand-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm";

export default function PrivacyPage() {
  return (
    <>
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">Legal</p>
            <h1>Privacy policy</h1>
            <p className="mt-5 text-lg text-ink-500">
              How we collect, use and protect your personal data when you use
              this website and the owner portal.
            </p>
            <p className="mt-4 text-sm text-ink-500">
              Last updated: 22 September 2026
            </p>
          </Reveal>
        </Container>
      </div>

      <section className="py-16 lg:py-24">
        <Container>
          <div className={PROSE}>
            <h2>1. Who we are</h2>
            <p>
              This website is operated by {company.legalName}, trading as{" "}
              {company.tradingName} (&ldquo;{company.name}&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;). {company.legalName} is the
              data controller for the personal data described in this policy.
            </p>
            <ul>
              <li>
                Company number {company.companyNumber}, incorporated in Mauritius
                on 19 August 2026 as a {company.companyType}.
              </li>
              {/* TODO: confirm with client — registered address (appears once
                  set in data/company.ts) */}
              {company.registeredAddress ? (
                <li>Registered address: {company.registeredAddress}</li>
              ) : null}
              <li>
                Contact for privacy matters:{" "}
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
            </ul>

            <h2>2. The laws that apply</h2>
            <p>
              We process personal data in accordance with the Mauritius{" "}
              <strong>Data Protection Act 2017</strong>, which is overseen by
              the <strong>Data Protection Office</strong> of Mauritius. Where
              the EU General Data Protection Regulation (<strong>GDPR</strong>)
              applies to our processing of your data, we also comply with it.
            </p>

            <h2>3. What we collect</h2>
            <h3>Contact form</h3>
            <ul>
              <li>
                Your name, email address, optional phone number, property type,
                number of properties and your message.
              </li>
              <li>
                A consent record: that you ticked &ldquo;I agree to be
                contacted about my enquiry&rdquo;, the date and time, and a
                shortened, one-way hash of your IP address (not the address
                itself).
              </li>
            </ul>
            <h3>Owner portal</h3>
            <ul>
              <li>
                Account details: your name, email address, phone number and
                login credentials.
              </li>
              <li>
                Property and financial information needed to manage your
                property: bookings, maintenance records, documents, statements
                and payout details.
              </li>
            </ul>
            <h3>Technical data</h3>
            <ul>
              <li>
                Server logs kept by our hosting provider (such as IP address,
                browser type and pages requested), used for security and to
                keep the site running.
              </li>
            </ul>

            <h2>4. Why we use it, and our legal basis</h2>
            <ul>
              <li>
                <strong>Answering your enquiry</strong> — based on your consent
                and on steps taken at your request before entering into a
                contract.
              </li>
              <li>
                <strong>Running the owner portal and managing your property</strong>{" "}
                — necessary to perform our management agreement with you.
              </li>
              <li>
                <strong>Keeping accounting and tax records</strong> — to comply
                with our legal obligations in Mauritius.
              </li>
              <li>
                <strong>Protecting the site against abuse</strong> (for example
                rate limiting and spam filtering) — our legitimate interest in
                keeping the service secure.
              </li>
            </ul>

            <h2>5. How long we keep it</h2>
            {/* TODO: confirm with client — retention periods */}
            <ul>
              <li>
                Contact enquiries that do not lead to an agreement: up to 12
                months after our last exchange.
              </li>
              <li>
                Owner-account and property records: for the duration of the
                management agreement, then for as long as Mauritian accounting
                and tax law requires (typically 7 years).
              </li>
              <li>Consent records: for as long as the related data is kept.</li>
            </ul>

            <h2>6. Who we share it with</h2>
            <p>
              We <strong>never sell</strong> your personal data. We share it
              only with service providers (&ldquo;processors&rdquo;) that help
              us run the business, under contracts that require them to protect
              it — for example our website hosting provider and our email
              provider — and with professional advisers or authorities where
              the law requires it.
            </p>
            <p>
              Some of these providers may store data outside Mauritius or the
              EU. Where that happens we rely on appropriate safeguards, such as
              adequacy decisions or standard contractual clauses.
            </p>

            <h2>7. Your rights</h2>
            <p>
              Under the Data Protection Act 2017 and, where it applies, the
              GDPR, you have the right to:
            </p>
            <ul>
              <li>access the personal data we hold about you;</li>
              <li>have inaccurate data corrected;</li>
              <li>have your data erased where we no longer need it;</li>
              <li>restrict or object to certain processing;</li>
              <li>
                receive your data in a portable format (data portability);
              </li>
              <li>
                withdraw your consent at any time, without affecting processing
                carried out before you withdrew it.
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href={`mailto:${company.email}`}>{company.email}</a>. We may
              ask you to confirm your identity, and we will reply within one
              month. You also have the right to complain to the Data Protection
              Office of Mauritius or, if you live in the EU, to the data
              protection authority in your country.
            </p>

            <h2>8. Cookies</h2>
            <p>This website sets at most three cookies:</p>
            <ul>
              <li>
                <code>bv_session</code> — <strong>strictly necessary</strong>.
                Keeps you signed in to the owner portal. It is httpOnly (not
                readable by scripts) and is only set when you log in.
              </li>
              <li>
                <code>bv_currency</code> — <strong>preference</strong>.
                Remembers whether you chose to view prices in MUR or EUR. It is
                set only when you make that choice and lasts 1 year.
              </li>
              <li>
                <code>bv_view_as</code> — <strong>strictly necessary</strong>,
                Bellavere staff only. Remembers which owner&rsquo;s portal an
                administrator is viewing. It is httpOnly and ends with the
                browser session.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> use analytics, advertising or tracking
              cookies, and no third-party cookies are set. Because every cookie
              is either strictly necessary or set at your request, we do not
              show a cookie-consent banner. You can delete cookies at any time
              in your browser settings; deleting <code>bv_session</code> signs
              you out.
            </p>

            <h2>9. Security</h2>
            <p>
              We use encrypted connections (HTTPS) and restrict access to
              personal data to the people who need it to do their job. No
              method of transmission or storage is completely secure, but we
              take reasonable steps to protect your data.
            </p>

            <h2>10. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The date at the top
              shows when it last changed. See also our{" "}
              <Link href="/terms">terms of use</Link>.
            </p>

            {/* TODO: confirm with client — legal review before launch */}
            <p className="mt-16! rounded-xl border border-sand-300 bg-sand-100 px-5 py-4 text-sm text-ink-500">
              This page is a template and should be reviewed by a qualified
              legal adviser before launch.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
