import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedProperties } from "@/data/properties";
import { Money } from "@/components/currency/Money";

/** Three featured listings from the demo portfolio, linking to their pages. */
export function FeaturedProperties() {
  const featured = getFeaturedProperties();

  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <SectionHeading
          eyebrow="The portfolio"
          title="Homes we're proud to manage"
          sub="A glimpse of the villas and apartments we look after around the island."
        />
        <RevealStagger className="mt-14 grid gap-6 md:grid-cols-3">
          {featured.map((property) => (
            <RevealItem key={property.id}>
              <Link
                href={`/properties/${property.slug}`}
                className="group block h-full"
              >
                <Card lift className="flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={property.images[0].src}
                      alt={property.images[0].alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <Badge
                      tone={property.type === "villa" ? "gold" : "info"}
                      className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm"
                    >
                      {property.type === "villa" ? "Villa" : "Apartment"}
                    </Badge>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3>{property.name}</h3>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      {property.location}
                    </p>
                    <div className="mt-4 flex flex-1 items-end justify-between gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-ink-500">
                        <BedDouble className="size-4 shrink-0" aria-hidden />
                        {property.bedrooms} bedrooms
                      </span>
                      <span className="font-medium text-navy-900">
                        <Money eur={property.nightlyRate} />
                        <span className="font-normal text-ink-500"> / night</span>
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </RevealItem>
          ))}
        </RevealStagger>
        <Reveal className="mt-12 text-center" delay={0.1}>
          <Button href="/properties" variant="outline">
            View the full portfolio
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
