import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  KeyRound,
  MapPin,
  Moon,
  Users,
} from "lucide-react";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { company } from "@/data/company";
import { getPropertyBySlug, properties } from "@/data/properties";
import { formatMoney } from "@/lib/format";
import { getCurrency } from "@/lib/currency";
import { ConversionNote } from "@/components/currency/Money";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };
  return { title: property.name, description: property.headline };
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);
  if (!property) notFound();
  const currency = await getCurrency();

  const facts = [
    {
      icon: BedDouble,
      value: String(property.bedrooms),
      label: property.bedrooms === 1 ? "bedroom" : "bedrooms",
    },
    {
      icon: Bath,
      value: String(property.bathrooms),
      label: property.bathrooms === 1 ? "bathroom" : "bathrooms",
    },
    {
      icon: Users,
      value: String(property.sleeps),
      label: "guests",
    },
    {
      icon: Moon,
      value: `from ${formatMoney(property.nightlyRate, currency)}`,
      label: "per night",
    },
  ];

  return (
    <>
      <section className="pt-32 lg:pt-40">
        <Container>
          <Reveal>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-200 hover:text-navy-900"
            >
              <ArrowLeft className="size-4" aria-hidden />
              All properties
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="mt-8 max-w-3xl">
            <Badge tone={property.type === "villa" ? "gold" : "info"}>
              {property.type === "villa" ? "Villa" : "Apartment"}
            </Badge>
            <h1 className="mt-4">{property.name}</h1>
            <p className="mt-3 flex items-center gap-2 text-ink-500">
              <MapPin className="size-4 shrink-0 text-gold-700" aria-hidden />
              {property.location}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              {property.headline}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <PropertyGallery images={property.images} />
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <Card className="p-6 sm:p-8">
              <RevealStagger className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {facts.map((fact) => (
                  <RevealItem
                    key={fact.label + fact.value}
                    className="flex items-center gap-3"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sand-100 text-navy-900">
                      <fact.icon className="size-5" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-navy-900">
                        {fact.value}
                      </span>
                      <span className="block text-sm text-ink-500">
                        {fact.label}
                      </span>
                    </span>
                  </RevealItem>
                ))}
              </RevealStagger>
              <ConversionNote className="mt-5" />
            </Card>
          </Reveal>
        </Container>
      </section>

      <section className="py-24 lg:py-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <div>
              <Reveal>
                <p className="eyebrow mb-4">The home</p>
                <h2>About {property.name}</h2>
                <p className="mt-6 leading-relaxed text-ink-900">
                  {property.description}
                </p>
              </Reveal>

              <Reveal delay={0.08} className="mt-12">
                <p className="text-xs font-semibold tracking-(--tracking-label) text-navy-900 uppercase">
                  Amenities
                </p>
              </Reveal>
              <RevealStagger
                as="ul"
                className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2"
              >
                {property.amenities.map((amenity) => (
                  <RevealItem
                    as="li"
                    key={amenity}
                    className="flex items-start gap-3 text-sm leading-relaxed text-ink-900"
                  >
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-gold-700"
                      aria-hidden
                    />
                    {amenity}
                  </RevealItem>
                ))}
              </RevealStagger>
            </div>

            <Reveal delay={0.1} className="self-start lg:sticky lg:top-28">
              <div className="rounded-2xl border border-gold-500/40 bg-gold-500/5 p-8">
                <span className="grid size-11 place-items-center rounded-full bg-gold-500/15 text-gold-700">
                  <KeyRound className="size-5" aria-hidden />
                </span>
                <p className="mt-5 font-serif text-2xl text-navy-900">
                  Managed by Bellavere since {property.managedSince}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  Pricing, guest care, housekeeping, maintenance and monthly
                  owner statements are all handled by our team — for one
                  all-in fee of {company.pricing.model}.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-sand-100 py-24 lg:py-32">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-4">Own something similar?</p>
            <h2>List a property like this</h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-500">
              Bellavere looks after villas, apartments and residences across
              the north and west coasts of Mauritius. Tell us about your home
              and we&rsquo;ll show you what it could earn — with no hidden
              fees.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg">
                Start the conversation
              </Button>
              <Button href="/login" variant="outline" size="lg">
                Owner login
              </Button>
            </div>
            <p className="mt-10 text-sm text-ink-500 italic">
              Demo listing for illustration — details, rates and imagery are
              not a real property.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
