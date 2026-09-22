import type { Metadata } from "next";
import Image from "next/image";
import { Check, Eye, HeartHandshake, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { MauritiusMap } from "@/components/site/MauritiusMap";
import { TeamGrid } from "@/components/about/TeamGrid";
import { CtaBand } from "@/components/home/CtaBand";
import { company } from "@/data/company";
import { siteImages } from "@/data/siteImages";

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Bellavere: property management and syndic services on the north and west coasts of Mauritius — full transparency, no hidden fees, and always a human to answer you.",
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
    copy: "Call or write and a real person answers — never a chatbot, never a ticket queue. Someone who knows your property by name.",
  },
];

const WHY_ITEMS = [
  "One reliable point of contact for everything",
  `One clearly stated fee — ${company.pricing.model}. No hidden fees.`,
  "A person answers every call and message — never a bot",
  "Work on your property supervised on site, in person",
  "A live owner dashboard, day and night, from anywhere",
  "Prices and statements in rupees or euros — your choice",
  "Preventive maintenance, inspections and owner reporting as standard",
  "Syndic and common-area management for whole residences",
];

const COVERAGE_AREAS = [
  "Grand Gaube",
  "Cap Malheureux",
  "Pereybere",
  "Grand Baie",
  "Pointe aux Canonniers",
  "Mont Choisy",
  "Trou aux Biches",
  "Pointe aux Piments",
  "Albion",
  "Flic-en-Flac",
  "Tamarin",
  "Rivière Noire",
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
              {company.marketLong} Looked after in person, reported openly,
              and never a hidden fee.
            </p>
          </Reveal>
        </Container>
      </div>

      {/* Story */}
      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <Reveal y={32}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image
                  src={siteImages.about.story.src}
                  alt={siteImages.about.story.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
            <div>
              <SectionHeading
                eyebrow="Our story"
                title="Built around two promises"
              />
              <Reveal delay={0.1}>
                {/* TODO: confirm with client — story wording */}
                <p className="mt-6 leading-relaxed text-ink-900">
                  {company.name} was set up by {company.team[0].name} and{" "}
                  {company.team[1].name} to fix two things owners too often
                  put up with: fees that appear out of nowhere, and nobody
                  answering when something goes wrong.
                </p>
                <p className="mt-5 leading-relaxed text-ink-900">
                  So the promises are simple. Every cost is itemised and
                  visible on your dashboard. And whenever you call or write, a
                  person answers — Krit on the ground, Ankit at the other end
                  of the line. From single villas to the common areas of whole
                  residences, that is how we look after every property.
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
            title="The people you will actually speak to"
            sub="Two people, one standard. Small enough that you always deal with the people in charge."
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
            title="The reasons owners stay"
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
                title="The north & west coasts, and nowhere else"
                sub="We stay close to every property we look after, so inspections happen often and problems get fixed fast — from Grand Gaube in the north to Rivière Noire in the west."
              />
              <RevealStagger as="ul" className="mt-8 flex flex-wrap gap-2.5">
                {COVERAGE_AREAS.map((area) => (
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
              <MauritiusMap />
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
