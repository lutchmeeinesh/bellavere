import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionClient, requireClient } from "@/lib/auth";
import { getPropertyById } from "@/data/properties";
import { getBookingsForProperty } from "@/data/bookings";
import { getTicketsForClient } from "@/data/maintenance";
import { getDocumentsForClient } from "@/data/documents";
import {
  monthlyRevenueForProperty,
  occupancyForPropertyMonth,
  propertyStatusToday,
} from "@/lib/metrics";
import { TODAY, toISODate } from "@/lib/dates";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import {
  PropertyDetailTabs,
  type PropertyDocument,
  type PropertyMonthRow,
} from "@/components/dashboard/properties/PropertyDetailTabs";
import type { PropertyStatus } from "@/lib/types";

const STATUS_META: Record<PropertyStatus, { label: string; tone: BadgeTone }> = {
  occupied: { label: "Occupied", tone: "success" },
  vacant: { label: "Vacant", tone: "neutral" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

/**
 * The ownership check runs in generateMetadata as well as the page body:
 * metadata resolves before the response starts streaming (loading.tsx makes
 * this route stream), so a foreign or unknown id gets a genuine HTTP 404
 * status — not just the not-found UI.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getSessionClient();
  const property = getPropertyById(id);
  if (!client || !property || property.clientId !== client.id) notFound();
  return { title: `${property.name} · Dashboard` };
}

/**
 * Property detail. The ownership check below is the data-isolation 404: a
 * logged-in owner requesting any property outside their portfolio gets the
 * in-shell not-found page, never another client's data.
 */
export default async function DashboardPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await requireClient();
  const property = getPropertyById(id);
  if (!property || property.clientId !== client.id) notFound();

  const bookings = getBookingsForProperty(id);
  const months: PropertyMonthRow[] = monthlyRevenueForProperty(id, 12).map(
    (m) => ({
      key: m.key,
      label: m.label,
      labelLong: m.labelLong,
      revenue: m.revenue,
      occupancy: occupancyForPropertyMonth(id, m.year, m.month),
    })
  );
  const tickets = getTicketsForClient(client.id).filter(
    (t) => t.propertyId === id
  );
  const documents: PropertyDocument[] = getDocumentsForClient(client.id)
    .filter((doc) => doc.propertyId === id || doc.propertyId === null)
    .map((doc) => {
      const days = doc.expiresAt
        ? Math.round(
            (new Date(doc.expiresAt).getTime() - TODAY.getTime()) / 86400000
          )
        : null;
      return { ...doc, expiringSoon: days !== null && days > 0 && days <= 45 };
    });
  const status = STATUS_META[propertyStatusToday(id)];

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors duration-150 hover:text-navy-900"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Your properties
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <h1 className="text-3xl lg:text-4xl">{property.name}</h1>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-1.5 text-sm text-ink-500">
            {property.location} · Managed since {property.managedSince}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <PropertyDetailTabs
          property={property}
          bookings={bookings}
          months={months}
          tickets={tickets}
          documents={documents}
          todayIso={toISODate(TODAY)}
        />
      </Reveal>
    </div>
  );
}
