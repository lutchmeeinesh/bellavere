import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { Property } from "@/lib/types";

/**
 * Portfolio grid card. The whole card is one link to the property detail
 * page; the cover image scales gently on hover while the card lifts.
 */
export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
    >
      <Card lift className="h-full overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <Badge tone={property.type === "villa" ? "gold" : "info"}>
              {property.type === "villa" ? "Villa" : "Apartment"}
            </Badge>
            <p className="text-sm font-semibold text-navy-900">
              {formatCurrency(property.nightlyRate)}
              <span className="font-normal text-ink-500"> / night</span>
            </p>
          </div>
          <h3 className="mt-3">{property.name}</h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin className="size-4 shrink-0 text-gold-600" aria-hidden />
            {property.location}
          </p>
          <div className="mt-4 flex items-center gap-5 border-t border-sand-300 pt-4 text-sm text-ink-500">
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-navy-900/60" aria-hidden />
              {property.bedrooms}{" "}
              {property.bedrooms === 1 ? "bedroom" : "bedrooms"}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-navy-900/60" aria-hidden />
              Sleeps {property.sleeps}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
