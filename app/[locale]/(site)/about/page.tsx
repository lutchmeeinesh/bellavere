import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Check, Eye, HeartHandshake, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamGrid } from "@/components/about/TeamGrid";
import { CtaBand } from "@/components/home/CtaBand";
import { company } from "@/data/company";
import { getSiteImages } from "@/lib/i18n/images";
import { localizedMetadata } from "@/lib/i18n/metadata";
import { getPageLocale, type LocaleParams } from "@/lib/i18n/server";

export async function generateMetadata({
  params,
}: {
  params: LocaleParams;
}): Promise<Metadata> {
  const locale = await getPageLocale(params);
  const t = await getTranslations({ locale, namespace: "about.meta" });
  return localizedMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("description"),
  });
}

// The three promises come straight from the client's mission statement.
// Wording: messages `about.values.items.<id>`.
const VALUES = [
  { id: "transparency", icon: Eye },
  { id: "noHiddenFees", icon: Receipt },
  { id: "human", icon: HeartHandshake },
] as const;

// Wording: messages `about.why.items.<id>`.
const WHY_ITEMS = [
  "contact",
  "fee",
  "human",
  "supervision",
  "dashboard",
  "currencies",
  "maintenance",
  "syndic",
] as const;

// Regions marked on the client's own coverage map (22 Sep 2026). Towns are
// deliberately not named: the map shows areas, not specific addresses.
// Names: messages `about.coverage.regions.<id>`.
const COVERAGE_REGIONS = [
  "north",
  "west",
  "centralPlateau",
  "east",
  "southEast",
  "southWest",
] as const;

// The people named in the copy: Krit on site, Ankit as first contact.
const [krit, ankit] = company.team;
const firstName = (name: string) => name.split(" ")[0];

export default async function AboutPage({
  params,
}: {
  params: LocaleParams;
}) {
  await getPageLocale(params);
  const t = await getTranslations("about");
  const tCompany = await getTranslations("common.company");
  const images = await getSiteImages();
  return (
    <>
      {/* Page header */}
      <div className="pt-32 lg:pt-40">
        <Container>
          <Reveal className="max-w-3xl">
            <p className="eyebrow mb-4">{t("hero.eyebrow")}</p>
            <h1>{t("hero.title")}</h1>
            <p className="mt-6 text-lg text-ink-500">
              {t("hero.intro", { marketLong: tCompany("marketLong") })}
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
                src={images.about.story.src}
                alt={images.about.story.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1280px) 560px, (min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow={t("story.eyebrow")}
                title={t("story.title")}
              />
              <Reveal delay={0.1}>
                <p className="mt-6 leading-relaxed text-ink-900">
                  {t("story.paragraphs.first", {
                    company: company.name,
                    krit: krit.name,
                    ankit: ankit.name,
                  })}
                </p>
                <p className="mt-5 leading-relaxed text-ink-900">
                  {t("story.paragraphs.second", {
                    krit: firstName(krit.name),
                    ankit: firstName(ankit.name),
                  })}
                </p>
                <blockquote className="mt-8 border-l-2 border-gold-500 pl-5 font-serif text-xl leading-snug text-navy-900">
                  {t("story.quote", { mission: tCompany("mission") })}
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
            eyebrow={t("values.eyebrow")}
            title={t("values.title")}
            align="center"
          />
          <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <RevealItem key={value.id}>
                <Card lift className="h-full p-8">
                  <span className="flex size-12 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                    <value.icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-5">{t(`values.items.${value.id}.title`)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-500">
                    {t(`values.items.${value.id}.copy`)}
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
            eyebrow={t("team.eyebrow")}
            title={t("team.title")}
            sub={t("team.sub")}
            align="center"
            className="mb-14"
          />
          <TeamGrid />
        </Container>
      </section>

      {/* Why owners choose us */}
      <section className="bg-sand-100 py-24 lg:py-32">
        <Container>
          <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
          <RevealStagger
            as="ul"
            className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2"
          >
            {WHY_ITEMS.map((id) => (
              <RevealItem as="li" key={id} className="flex items-start gap-3.5">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700">
                  <Check className="size-4" aria-hidden />
                </span>
                <p className="pt-0.5 text-ink-900">
                  {t(`why.items.${id}`, { maxFee: company.pricing.maxFeeRate })}
                </p>
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
                eyebrow={t("coverage.eyebrow")}
                title={t("coverage.title")}
                sub={t("coverage.sub", { krit: firstName(krit.name) })}
              />
              <RevealStagger as="ul" className="mt-8 flex flex-wrap gap-2.5">
                {COVERAGE_REGIONS.map((id) => (
                  <RevealItem
                    as="li"
                    key={id}
                    className="rounded-full border border-sand-300 bg-sand-50 px-4 py-1.5 text-sm text-ink-900"
                  >
                    {t(`coverage.regions.${id}`)}
                  </RevealItem>
                ))}
              </RevealStagger>
            </div>
            <Reveal delay={0.15} y={32} className="mx-auto w-full max-w-md">
              <figure>
                <Image
                  src="/images/coverage-map.webp"
                  alt={t("coverage.mapAlt")}
                  width={710}
                  height={790}
                  sizes="(min-width: 1024px) 448px, 100vw"
                  className="h-auto w-full rounded-2xl border border-sand-300"
                />
                {/* The OpenStreetMap credit is required by the map data's licence */}
                <figcaption className="mt-3 text-xs text-ink-500">
                  {t("coverage.mapCaption", { renderer: "terraink.app" })}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      <CtaBand small title={t("cta.title")} sub={t("cta.sub")} />
    </>
  );
}
