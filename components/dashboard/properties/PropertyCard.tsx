import Image from "next/image";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Booking, Property, PropertyStatus } from "@/lib/types";
import { formatCurrency, formatDateShort, formatPercent } from "@/lib/format";

/** Dashboard property card: image, live status, and this month's headline stats. */

const STATUS_META: Record<PropertyStatus, { label: string; tone: BadgeTone }> = {
  occupied: { label: "Occupied", tone: "success" },
  vacant: { label: "Vacant", tone: "neutral" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

export function PropertyCard({
  property,
  status,
  occupancyThisMonth,
  revenueYtd,
  nextBooking,
}: {
  property: Property;
  status: PropertyStatus;
  occupancyThisMonth: number;
  revenueYtd: number;
  nextBooking: Booking | null;
}) {
  const statusMeta = STATUS_META[status];
  const cover = property.images[0];

  return (
    <Link
      href={`/dashboard/properties/${property.id}`}
      className="group block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500"
    >
      <Card lift className="h-full overflow-hidden">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/85 shadow-(--shadow-soft) backdrop-blur-sm">
            <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
          </span>
        </div>

        <div className="p-5">
          <h3 className="truncate font-serif text-xl">{property.name}</h3>
          <p className="mt-0.5 truncate text-sm text-ink-500">
            {property.location}
          </p>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <dt className="w-28 shrink-0 text-xs text-ink-500">
                Occupancy this month
              </dt>
              <dd className="flex flex-1 items-center gap-2.5">
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-100"
                  aria-hidden
                >
                  <span
                    className="block h-full rounded-full bg-gold-500"
                    style={{ width: `${occupancyThisMonth}%` }}
                  />
                </span>
                <span className="w-9 shrink-0 text-right font-medium text-navy-900">
                  {formatPercent(occupancyThisMonth)}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-ink-500">Revenue YTD</dt>
              <dd className="font-medium text-navy-900">
                {formatCurrency(revenueYtd)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-xs text-ink-500">Next booking</dt>
              <dd className="font-medium text-navy-900">
                {nextBooking ? formatDateShort(nextBooking.checkIn) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </Card>
    </Link>
  );
}
