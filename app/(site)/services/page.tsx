import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Phone, ShieldCheck, Sparkles } from "lucide-react";
import { ComparisonTable } from "@/components/services/ComparisonTable";
import { ServiceSection } from "@/components/services/ServiceSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Rental management, maintenance, client care and concierge services for villas and apartments in Mauritius — one team, one all-in fee.",
};

const ANCHORS = [
  { href: "#rental", label: "Rental management" },
  { href: "#maintenance", label: "Maintenance" },
  { href: "#client-care", label: "Client care" },
  { href: "#concierge", label: "Concierge & services" },
];

export default function ServicesPage() {
  return (
    <>
      <header className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-4">Services</p>
            <h1>Everything your property needs</h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-500">
              Four disciplines, one team, one all-in fee. BellaVere looks after
              villas and apartments end to end for {company.pricing.model} —
              no onboarding fee, no fixed monthly charges, no mark-up on
              contractor invoices. Everything on this page is covered.
            </p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {ANCHORS.map((anchor) => (
                <li key={anchor.href}>
                  <Link
                    href={anchor.href}
                    className="inline-block rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium text-ink-900 transition-colors duration-200 hover:border-gold-500 hover:text-navy-900"
                  >
                    {anchor.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </header>

      <ServiceSection
        id="rental"
        eyebrow="01 — Rental management"
        title="Your home, earning while you sleep"
        image={siteImages.services.rental}
        imageSide="left"
        paragraphs={[
          "We list and market your villa or apartment across the right channels, then price it night by night to keep occupancy and rate in balance. Every enquiry is answered, every guest vetted, every check-in and check-out handled by our team.",
          "You watch it all happen from the owner dashboard: bookings as they land, occupancy against the season, revenue by month.",
        ]}
        included={[
          "Listing & professional photography coordination",
          "Channel & direct marketing",
          "Dynamic pricing reviews",
          "Guest vetting & communication",
          "Check-in, check-out & key handling",
          "Occupancy reporting",
        ]}
        detailIcon={Clock}
        detail={
          <>
            Enquiries answered in under 2 hours, 7 days a week
            {/* TODO: confirm with client */}
          </>
        }
      />

      <ServiceSection
        id="maintenance"
        eyebrow="02 — Maintenance"
        title="Kept immaculate, season after season"
        image={siteImages.services.maintenance}
        imageSide="right"
        tinted
        paragraphs={[
          "Salt air, cyclone season and back-to-back guests are hard on a coastal home. Our care team runs scheduled inspections, keeps pools and gardens immaculate, and coordinates repairs before small issues become expensive ones.",
          "Every job is photographed, logged against your property and billed at cost — contractors come from our vetted network and are never marked up.",
        ]}
        included={[
          "Scheduled inspections with photo reports",
          "Pool & garden care",
          "Housekeeping & linen",
          "24/7 emergency call-out",
          "Vetted contractor network, no invoice mark-up",
          "Cyclone-season preparation",
        ]}
        detailIcon={ShieldCheck}
        detail={
          <>
            Urgent issues attended within 4 hours
            {/* TODO: confirm with client */}
          </>
        }
      />

      <ServiceSection
        id="client-care"
        eyebrow="03 — Client care"
        title="One person who knows your property by name"
        image={siteImages.services.clientCare}
        imageSide="left"
        paragraphs={[
          "Your dedicated account manager is the single point of contact for everything that touches your property: statements, compliance, insurance, utility bills, tenant and guest matters.",
          "You receive one clear statement every month, a performance review every year, and straight answers in between — without chasing.",
        ]}
        included={[
          "Dedicated account manager",
          "Monthly owner statements",
          "Licence & compliance renewals",
          "Insurance & utilities administration",
          "Guest & tenant issue resolution",
          "Annual performance review",
        ]}
        detailIcon={Phone}
        detail={<>One contact. Every answer.</>}
      />

      <ServiceSection
        id="concierge"
        eyebrow="04 — Concierge & services"
        title="The extras guests remember — and pay for"
        image={siteImages.services.concierge}
        imageSide="right"
        tinted
        paragraphs={[
          "Airport transfers, provisioned kitchens, private chefs, island experiences — our concierge team arranges the details that turn a good stay into the one guests talk about.",
          "It is hospitality that earns: well-run extras lift review scores, repeat bookings and the rental yield of your property.",
        ]}
        included={[
          "Airport transfers & car hire",
          "Welcome packs & provisioning",
          "Private chefs & experiences",
          "Mid-stay housekeeping",
          "Babysitting & equipment hire",
          "Late check-out arrangement",
        ]}
        detailIcon={Sparkles}
        detail={
          <>
            Concierge extras add an average 9% to rental income
            {/* TODO: confirm with client */}
          </>
        }
      />

      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="Who does what"
            title="What owners handle vs. what BellaVere handles"
            sub="The honest division of labour. You keep the decisions that matter; we take everything else off your desk."
            align="center"
            className="max-w-3xl"
          />
          <Reveal delay={0.1} className="mt-14">
            <ComparisonTable />
          </Reveal>
        </Container>
      </section>

      <section className="bg-navy-900 py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="Get started"
            title="One fee. Every detail handled."
            sub={company.pricing.detail}
            align="center"
            dark
          />
          <Reveal delay={0.15} className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href="/contact" size="lg">
              List your property
            </Button>
            <Button href="/login" variant="light" size="lg">
              Owner login
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
