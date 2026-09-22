import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Terms of use for the ${company.name} website and owner portal.`,
};

const PROSE =
  "max-w-3xl leading-relaxed text-ink-900 [&_h2]:mt-14 [&_h2]:mb-4 [&>h2:first-child]:mt-0 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-gold-700 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-navy-900";

export default function TermsPage() {
  return (
    <>
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">Legal</p>
            <h1>Terms of use</h1>
            <p className="mt-5 text-lg text-ink-500">
              The rules for using this website and the {company.name} owner
              portal.
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
            <h2>1. About these terms</h2>
            <p>
              This website and the owner portal are operated by{" "}
              {company.legalName}, trading as {company.tradingName}.
            </p>
            <ul>
              <li>
                {/* TODO: confirm with client — Business Registration Number (BRN) */}
                Business Registration Number (BRN): to be confirmed
              </li>
              <li>
                {/* TODO: confirm with client — registered address */}
                Registered address: {company.address.line1},{" "}
                {company.address.line2}, {company.address.country}
              </li>
              <li>
                Contact: <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
            </ul>
            <p>
              By using the website you agree to these terms. If you do not
              agree, please do not use the site. The management of your property
              is governed separately by your written management agreement with
              us; where that agreement and these terms differ, the management
              agreement prevails.
            </p>

            <h2>2. Information and listings</h2>
            <p>
              We take care to keep the information on this website accurate and
              up to date, but it is provided for general information only.
              Property descriptions, photographs, amenities, rates and
              availability are indicative, may change without notice, and do
              not form an offer or part of any contract.
            </p>

            <h2>3. The owner portal</h2>
            <ul>
              <li>
                The owner portal is for authorised property owners (and people
                they have authorised in writing) only. Access is granted by us.
              </li>
              <li>
                You are responsible for keeping your login details
                confidential and for activity under your account. Tell us
                immediately at{" "}
                <a href={`mailto:${company.email}`}>{company.email}</a> if you
                suspect unauthorised access.
              </li>
              <li>
                You must not attempt to access another owner&rsquo;s data, or
                to interfere with the security or operation of the portal.
              </li>
              <li>
                Figures shown in the portal are provided for convenience. Your
                formal monthly statement is the authoritative record.
              </li>
              <li>
                We may suspend or withdraw access if these terms are breached,
                or when the management agreement ends.
              </li>
            </ul>

            <h2>4. Currencies</h2>
            <p>
              Prices and figures may be displayed in Mauritian rupees (MUR) or
              euros (EUR). Conversions between the two are shown for
              information only, using indicative exchange rates that may differ
              from the rate applied by banks on the day of payment. The binding
              amounts and currency are those set out in your management
              agreement and statements.
            </p>

            <h2>5. Intellectual property</h2>
            <p>
              The content of this website — text, design, logos and images —
              belongs to {company.legalName} or its licensors. You may view and
              print it for personal use, but may not reproduce it for
              commercial purposes without our written permission.
            </p>

            <h2>6. Links to other sites</h2>
            <p>
              The website links to third-party sites, such as our social media
              pages. We are not responsible for their content or their privacy
              practices.
            </p>

            <h2>7. Limitation of liability</h2>
            <p>
              The website is provided &ldquo;as is&rdquo;. To the fullest
              extent permitted by law, {company.legalName} is not liable for
              any loss arising from reliance on information on the website,
              from the website being unavailable, or from viruses or other
              harmful material, and is not liable for any indirect or
              consequential loss. Nothing in these terms limits liability that
              cannot be limited by law, such as liability for fraud. Our
              liability for the management of your property is governed by your
              management agreement.
            </p>

            <h2>8. Privacy</h2>
            <p>
              How we handle personal data and cookies is explained in our{" "}
              <Link href="/privacy">privacy policy</Link>.
            </p>

            <h2>9. Changes</h2>
            <p>
              We may update these terms from time to time. The date at the top
              shows when they last changed; continuing to use the website after
              a change means you accept the updated terms.
            </p>

            <h2>10. Governing law</h2>
            <p>
              These terms are governed by the laws of the Republic of
              Mauritius, and the courts of Mauritius have exclusive
              jurisdiction over any dispute arising from them.
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
