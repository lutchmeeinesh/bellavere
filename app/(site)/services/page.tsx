import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ComparisonTable } from "@/components/services/ComparisonTable";
import { ServiceSection } from "@/components/services/ServiceSection";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

export const metadata: Metadata = {
  title: "Property management & syndic services",
  description:
    "Rental management, maintenance, client care, concierge and syndic services for villas, apartments and residences in Mauritius — one team, no hidden fees.",
};

const ANCHORS = [
  { href: "#rental", label: "Rental management" },
  { href: "#maintenance", label: "Maintenance" },
  { href: "#client-care", label: "Client care" },
  { href: "#concierge", label: "Concierge & services" },
  { href: "#syndic", label: "Syndic & residences" },
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
              Five services, one team, no hidden fees. Bellavere looks after
              villas, apartments and whole residences across Mauritius, end to
              end, for {company.pricing.model}. Every cost is itemised on your
              monthly statement.
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
        priority
        id="rental"
        eyebrow="01 — Rental management"
        title="Your home, earning while you sleep"
        image={siteImages.services.rental}
        imageSide="left"
        paragraphs={[
          "We list and market your villa or apartment, answer every enquiry, manage bookings, pricing and occupancy, and handle every guest check-in and check-out.",
          "You watch it all happen from the owner dashboard: bookings as they land, occupancy against the season, revenue by month.",
        ]}
        included={[
          "Listing & marketing",
          "Enquiries & bookings",
          "Pricing & occupancy management",
          "Guest communication",
          "Guest check-in & check-out",
          "Occupancy reporting",
        ]}
        detailIcon={MessageCircle}
        detail={<>Every query answered the same day, by a real person</>}
      />

      <ServiceSection
        id="maintenance"
        eyebrow="02 — Maintenance"
        title="Kept immaculate, season after season"
        image={siteImages.services.maintenance}
        imageSide="right"
        tinted
        paragraphs={[
          "Salt air, cyclone season and back-to-back guests are hard on an island home. We run regular inspections, look after pools and gardens, and coordinate repairs before small issues become expensive ones.",
          "Every job is logged against your property and itemised on your statement, with contractors coordinated and supervised on site — no hidden fees.",
        ]}
        included={[
          "Routine upkeep & repairs",
          "Regular property inspections",
          "Renovation follow-up",
          "Pool & garden care",
          "Cleaning & housekeeping",
          "Emergency coordination",
          "Supervised contractors, every invoice itemised",
        ]}
        detailIcon={ShieldCheck}
        detail={<>Work supervised on site, in person</>}
      />

      <ServiceSection
        id="client-care"
        eyebrow="03 — Client care"
        title="One person who knows your property by name"
        image={siteImages.services.clientCare}
        imageSide="left"
        paragraphs={[
          "Your client-relations contact is the single point of contact for everything that touches your property: statements, compliance, insurance, utility bills, tenant and guest matters — and a real person always answers.",
          "You receive one clear statement every month and straight answers in between — without chasing.",
        ]}
        included={[
          "Dedicated client-relations contact",
          "Monthly owner statements",
          "Compliance administration",
          "Insurance & utilities administration",
          "Guest & tenant issue resolution",
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
          "Airport transfers, welcome packs, housekeeping and guest services — we arrange the details that turn a good stay into the one guests talk about.",
          "It is hospitality that earns: well-run extras increase the rental yield of your property.",
        ]}
        included={[
          "Airport transfers",
          "Welcome packs",
          "Guest services",
          "Housekeeping",
        ]}
        detailIcon={Sparkles}
        detail={<>Extras that increase your rental yield</>}
      />

      <ServiceSection
        id="syndic"
        eyebrow="05 — Syndic & residences"
        title="Common areas cared for, co-owners kept informed"
        image={siteImages.services.syndic}
        imageSide="left"
        paragraphs={[
          "For residences, villa estates and apartment complexes, Bellavere acts as syndic and facilities coordinator. We look after the shared spaces — pools, gardens, common areas and security — so every co-owner can enjoy them without having to manage them.",
          "Preventive maintenance plans, supervised contractors and clear owner reporting keep the building in good order, with one reliable point of contact for day-to-day property care.",
        ]}
        included={[
          "Common-area management & cleaning coordination",
          "Preventive maintenance plans",
          "Pool & landscaping supervision",
          "Contractor coordination & on-site supervision",
          "Security & emergency coordination",
          "Owner reporting & renovation follow-up",
        ]}
        detailIcon={Building2}
        detail={<>One point of contact for every co-owner.</>}
      />

      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="At a glance"
            title="What Bellavere handles for you"
            sub="The day-to-day work we take off your desk."
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
