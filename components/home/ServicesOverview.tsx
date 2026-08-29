import Link from "next/link";
import {
  ArrowRight,
  ConciergeBell,
  HeartHandshake,
  KeyRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Service {
  icon: LucideIcon;
  title: string;
  copy: string;
  href: string;
}

const SERVICES: Service[] = [
  {
    icon: KeyRound,
    title: "Rental management",
    copy: "From listing and seasonal pricing to guest vetting and check-ins, we run your rental end to end. You approve the strategy; we deliver the occupancy.",
    href: "/services#rental",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    // TODO: confirm with client — inspection cadence
    copy: "Preventive care, prompt repairs and regular inspections keep your property flawless year-round. Every job is logged, photographed and visible on your dashboard.",
    href: "/services#maintenance",
  },
  {
    icon: HeartHandshake,
    title: "Client care",
    // TODO: confirm with client — dedicated-manager promise
    copy: "One dedicated manager knows your property, your preferences and your guests by name. Clear statements arrive monthly, and nothing is decided without you.",
    href: "/services#client-care",
  },
  {
    icon: ConciergeBell,
    title: "Concierge & services",
    copy: "Airport transfers, private chefs, boat days and in-villa spa — arranged before guests think to ask. The kind of service your nightly rate deserves.",
    href: "/services#concierge",
  },
];

/** Four lifted service cards linking to the anchored sections on /services. */
export function ServicesOverview() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="What we do"
          title="Everything your property needs, under one roof"
          sub="Four disciplines, one team, one monthly statement — so owning a home on the coast stays a pleasure."
        />
        <RevealStagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <RevealItem key={service.title}>
              <Link href={service.href} className="group block h-full">
                <Card lift className="flex h-full flex-col p-7">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                    <service.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {service.copy}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-navy-900 transition-colors duration-200 group-hover:text-gold-600">
                    Learn more
                    <ArrowRight
                      className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
      </Container>
    </section>
  );
}
