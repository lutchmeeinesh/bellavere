import type { Metadata } from "next";
import Image from "next/image";
import { Check, Eye, HeartHandshake, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamGrid } from "@/components/about/TeamGrid";
import { CtaBand } from "@/components/home/CtaBand";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

export const metadata: Metadata = {
  title: "About us — property care team in Mauritius",
  description:
    "Meet Bellavere: property management and syndic services across Mauritius — full transparency, no hidden fees, and always a human to answer you.",
};

// The three promises come straight from the client's mission statement.
const VALUES = [
  {
    icon: Eye,
    title: "Full transparency",
    copy: "Every rupee and euro in and out of your property is itemised on your dashboard and your monthly statement. You see exactly what we see.",
  },
  {
    icon: Receipt,
    title: "No hidden fees",
    copy: "One clearly stated management fee. No surprise charges and no invented extras — if something costs you money, it is on your statement with a line explaining why.",
  },
  {
    icon: HeartHandshake,
    title: "Always a human",
    copy: "Call or write any time: someone is reachable every day, 24/7, and every query is answered the same day. A real person who knows your property — never a chatbot.",
  },
];

const WHY_ITEMS = [
  "One reliable point of contact for everything",
  `A fee negotiated with you after our first meeting — never more than ${Math.round(company.pricing.maxFeeRate * 100)}%. No hidden fees.`,
  "A person answers every message — never a bot",
  "Work on your property supervised on site, in person",
  "A live owner dashboard, day and night, from anywhere",
  "Prices and statements in rupees or euros — your choice",
  "Preventive maintenance, inspections and owner reporting",
  "Syndic and common-area management for whole residences",
];

// Regions marked on the client's own coverage map (22 Sep 2026). Towns are
// deliberately not named: the map shows areas, not specific addresses.
const COVERAGE_REGIONS = [
  "North",
  "West",
  "Central plateau",
  "East",
  "South-east",
  "South-west",
];

export default function AboutPage() {
  return (
    <>
      {/* Page header */}
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-4">About Bellavere</p>
            <h1>Care you can see, from people you can reach</h1>
            <p className="mt-6 text-lg text-ink-500">
              {company.marketLong} Looked after in person and reported openly, with never a hidden fee.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Story */}
      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            {/* The largest element on first load: no reveal, loaded first */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <Image
                src={siteImages.about.story.src}
                alt={siteImages.about.story.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="Built around our mission"
              />
              <Reveal delay={0.1}>
                <p className="mt-6 leading-relaxed text-ink-900">
                  At {company.name}, {company.team[0].name} and{" "}
                  {company.team[1].name} work to the promises in our mission:
                  full transparency, no hidden fees, and a person who answers
                  whenever something goes wrong.
                </p>
                <p className="mt-5 leading-relaxed text-ink-900">
                  In practice, every cost is itemised and visible on your
                  dashboard. And whenever you message us, a person answers —
                  Krit on the ground, Ankit as your first point of contact.
                  From single villas to the common areas of whole residences,
                  that is how we look after every property.
                </p>
                <blockquote className="mt-8 border-l-2 border-gold-500 pl-5 font-serif text-xl leading-snug text-navy-900">
                  &ldquo;{company.mission}&rdquo;
                </blockquote>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Mission + values */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="Three promises we make to every owner"
            align="center"
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <RevealItem key={value.title}>
                <Card lift className="h-full p-8">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <value.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {value.copy}
                  </p>
                </Card>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </section>

      {/* Team */}
      <section className="py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="The team"
            title="The main people you will speak to"
            sub="Three people, one standard. Small enough that you always deal with someone who knows your property."
            align="center"
            className="mb-14"
          />
          <TeamGrid />
        </Container>
      </section>

      {/* Why owners choose us */}
      <section className="bg-sand-100 py-24 lg:py-32">
        <Container>
          <SectionHeading
            eyebrow="Why owners choose us"
            title="What you can count on"
          />
          <RevealStagger
            as="ul"
            className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2"
          >
            {WHY_ITEMS.map((item) => (
              <RevealItem as="li" key={item} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                  <Check className="size-4" aria-hidden />
                </span>
                <p className="pt-0.5 text-ink-900">{item}</p>
              </RevealItem>
            ))}
          </RevealStagger>
        </Container>
      </section>

      {/* Coverage */}
      <section className="bg-white py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                eyebrow="Where we work"
                title="All around the island"
                sub="We look after properties across the whole of Mauritius — north and south, coast and plateau — and Krit supervises work and inspections on site, in person."
              />
              <RevealStagger as="ul" className="mt-8 flex flex-wrap gap-2.5">
                {COVERAGE_REGIONS.map((area) => (
                  <RevealItem
                    as="li"
                    key={area}
                    className="rounded-full border border-sand-300 bg-sand-50 px-4 py-1.5 text-sm text-ink-900"
                  >
                    {area}
                  </RevealItem>
                ))}
              </RevealStagger>
            </div>
            <Reveal delay={0.15} y={32} className="mx-auto w-full max-w-md">
              <figure>
                <Image
                  src="/images/coverage-map.webp"
                  alt="Map of Mauritius marking the areas across the island where Bellavere looks after properties"
                  width={710}
                  height={790}
                  sizes="(min-width: 1024px) 448px, 100vw"
                  className="h-auto w-full rounded-2xl border border-sand-300"
                />
                <figcaption className="mt-3 text-xs text-ink-500">
                  Map data © OpenStreetMap contributors · rendered with
                  terraink.app
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand
        small
        title="Get to know us properly"
        sub="A short call, a look at your property, and an honest view of what it could do."
      />
    </>
  );
}
