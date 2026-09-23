import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SocialLink, publishedSocialLinks } from "@/components/site/SocialIcons";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { company } from "@/data/company";

export const metadata: Metadata = {
  // The root template adds " · Bellavere": 58 characters in all.
  title: "Contact us – property management in Mauritius",
  description:
    "Talk to Bellavere about managing your villa or apartment anywhere in Mauritius — rentals, maintenance, client care and concierge under one roof.",
};

// Only details the client has confirmed are shown. Phone, hours and social
// links appear automatically once they are filled in data/company.ts.
const SOCIAL_LINKS = publishedSocialLinks(company.name, company.social);

// Phone and email links: a 20px line plus 2px padding above and below gives
// every tap target the 24px minimum height, without changing the layout much.
const DETAIL_LINK =
  "block w-fit py-0.5 text-sm/5 text-ink-500 transition-colors duration-150 hover:text-gold-700";

function DetailIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sand-100 text-gold-700">
      {children}
    </span>
  );
}

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="eyebrow mb-4">Contact</p>
            <h1>Let’s talk about your property</h1>
            <p className="mt-5 text-lg text-ink-500">
              Tell us about your villa or apartment. A real person will reply{" "}
              {company.responseTime}, and we&rsquo;ll give you an honest view of
              what it could earn.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Details + form */}
      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
            {/* Contact details */}
            <RevealStagger className="space-y-8">
              {company.phone ? (
                <RevealItem className="flex gap-4">
                  <DetailIcon>
                    <Phone className="size-5" aria-hidden />
                  </DetailIcon>
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      Call us
                      {company.hours ? (
                        <span className="font-normal text-ink-500">
                          {" "}
                          — {company.hours.toLowerCase()}
                        </span>
                      ) : null}
                    </p>
                    <ul className="mt-2 space-y-3">
                      {company.contacts.map((person) => (
                        <li key={person.name}>
                          <p className="text-sm text-navy-900">
                            {person.name}
                            {person.role ? (
                              <span className="text-ink-500">
                                {" "}
                                · {person.role}
                              </span>
                            ) : null}
                          </p>
                          <a
                            href={`tel:${person.phone.replace(/\s/g, "")}`}
                            className={DETAIL_LINK}
                          >
                            {person.phone}
                          </a>
                          {person.email ? (
                            <a
                              href={`mailto:${person.email}`}
                              className={DETAIL_LINK}
                            >
                              {person.email}
                            </a>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealItem>
              ) : null}

              <RevealItem className="flex gap-4">
                <DetailIcon>
                  <Mail className="size-5" aria-hidden />
                </DetailIcon>
                <div>
                  <p className="text-sm font-medium text-navy-900">
                    Write to us
                  </p>
                  <a
                    href={`mailto:${company.email}`}
                    className={`mt-0.5 ${DETAIL_LINK}`}
                  >
                    {company.email}
                  </a>
                  <p className="mt-1 text-xs text-ink-500">
                    Every query answered {company.responseTime} — by a person,
                    never a bot.
                  </p>
                </div>
              </RevealItem>

              {SOCIAL_LINKS.length > 0 ? (
                <RevealItem className="flex items-center gap-3 pl-15">
                  {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                    <SocialLink
                      key={label}
                      href={href}
                      label={label}
                      className="flex size-10 items-center justify-center rounded-full border border-sand-300 text-navy-900 transition-colors duration-150 hover:border-gold-500 hover:text-gold-700"
                    >
                      <Icon className="size-4" />
                    </SocialLink>
                  ))}
                </RevealItem>
              ) : null}
            </RevealStagger>

            {/* Enquiry form */}
            <Reveal delay={0.1}>
              <Card className="p-6 sm:p-10">
                <h2 className="text-2xl">Send us a message</h2>
                <p className="mt-2 mb-8 text-sm text-ink-500">
                  A few details are all we need to get started.
                </p>
                <ContactForm />
              </Card>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 bg-sand-100 py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="FAQ"
            title="Questions owners ask"
            sub="The short answers first — for everything else, we’re one message away."
          />
          <Reveal className="mt-12 max-w-3xl" delay={0.1}>
            <FaqAccordion />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
