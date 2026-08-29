import type { Metadata } from "next";
import Image from "next/image";
import { Check, Eye, Sparkles, TrendingUp } from "lucide-react";
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
    "BellaVere has managed villas and apartments on the north and west coasts of Mauritius since 2016 — hotel-grade care, full transparency and a live dashboard for every owner.",
};

// TODO: confirm with client — invented positioning for the three values
const VALUES = [
  {
    icon: Eye,
    title: "Transparency first",
    copy: "Every euro in and out of your property is itemised on your dashboard and your monthly statement. No hidden margins, no surprises.",
  },
  {
    icon: Sparkles,
    title: "Hotel-grade care",
    copy: "Our team comes from five-star hospitality, and it shows: crisp linen, spotless pools, guests welcomed by name. Your home is kept to the standard it deserves.",
  },
  {
    icon: TrendingUp,
    title: "Performance, proven",
    copy: "We measure everything — occupancy, rate, guest reviews — and report it plainly. When we say a strategy is working, the numbers are on screen to prove it.",
  },
];

const WHY_ITEMS = [
  "One dedicated point of contact who knows your home",
  `One transparent all-in fee — ${company.pricing.model}, nothing hidden`,
  // TODO: confirm with client — contractor vetting & insurance claim
  "Vetted, insured contractors at pre-agreed rates",
  "A live owner dashboard, day and night, from anywhere",
  // TODO: confirm with client — scope of licensing/compliance service
  "Tourism licensing and compliance handled for you",
  // TODO: confirm with client — notice period
  "No lock-in — leave with 30 days' notice",
];

const COVERAGE_AREAS = [
  "Grand Baie",
  "Pereybere",
  "Cap Malheureux",
  "Trou aux Biches",
  "Mont Choisy",
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
            <p className="eyebrow mb-4">About BellaVere</p>
            <h1>Care for the coast&rsquo;s finest homes</h1>
            <p className="mt-6 text-lg text-ink-500">
              {company.marketLong} Since {company.founded}, we have looked
              after them the way a great hotel looks after its guests — and
              shown our owners everything, openly.
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
                title="Founded on a simple promise"
              />
              <Reveal delay={0.1}>
                {/* TODO: confirm with client — founding story specifics */}
                <p className="mt-6 leading-relaxed text-ink-900">
                  BellaVere began in Grand Baie in {company.founded}, when
                  Isabelle Verlaine — after fifteen years running five-star
                  properties across the Indian Ocean — took on three villas
                  for owners she knew personally. The promise she made them
                  was simple: you will always know exactly how your home is
                  doing.
                </p>
                <p className="mt-5 leading-relaxed text-ink-900">
                  A decade later, that promise scales to{" "}
                  {company.stats.propertiesManaged} villas and apartments from
                  Cap Malheureux to Rivière Noire — kept by the same
                  disciplines, and now made visible through a dashboard every
                  owner can open from anywhere in the world.
                </p>
                <p className="mt-5 leading-relaxed text-ink-500">
                  {company.mission}
                </p>
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
            title="Three things we refuse to compromise on"
            align="center"
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <RevealItem key={value.title}>
                <Card lift className="h-full p-8">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
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
            title="The people behind the properties"
            sub="A small senior team, each with deep hospitality roots — and each one reachable when you need them."
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
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
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
                sub="We stay close to every property we manage. From our Grand Baie office, the whole coverage area is within easy reach — so inspections happen often and problems get fixed fast."
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
