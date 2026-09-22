import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { publishedSocialLinks } from "@/components/site/SocialIcons";
import { ContactForm } from "@/components/contact/ContactForm";
import { FaqAccordion } from "@/components/contact/FaqAccordion";
import { company } from "@/data/company";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to Bellavere about managing your villa or apartment anywhere in Mauritius — rentals, maintenance, client care and concierge under one roof.",
};

// Only details the client has confirmed are shown. Phone, hours and social
// links appear automatically once they are filled in data/company.ts.
const SOCIAL_LINKS = publishedSocialLinks(company.name, company.social);

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
              Tell us about your villa or apartment and a real person will
              reply with an honest view of what it could earn.
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
                    <p className="text-sm font-medium text-navy-900">Call us</p>
                    <a
                      href={`tel:${company.phone.replace(/\s/g, "")}`}
                      className="mt-1 inline-block text-sm text-ink-500 transition-colors duration-150 hover:text-gold-700"
                    >
                      {company.phone}
                    </a>
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
                    className="mt-1 inline-block text-sm text-ink-500 transition-colors duration-150 hover:text-gold-700"
                  >
                    {company.email}
                  </a>
                  <p className="mt-1 text-xs text-ink-500">
                    Answered by a person, never a bot.
                  </p>
                </div>
              </RevealItem>

              {company.hours ? (
                <RevealItem className="flex gap-4">
                  <DetailIcon>
                    <Clock className="size-5" aria-hidden />
                  </DetailIcon>
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      Office hours
                    </p>
                    <p className="mt-1 text-sm text-ink-500">{company.hours}</p>
                  </div>
                </RevealItem>
              ) : null}

              {SOCIAL_LINKS.length > 0 ? (
                <RevealItem className="flex items-center gap-3 pl-15">
                  {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex size-10 items-center justify-center rounded-full border border-sand-300 text-navy-900 transition-colors duration-150 hover:border-gold-500 hover:text-gold-700"
                    >
                      <Icon className="size-4" />
                    </a>
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
