import { requireClient } from "@/lib/auth";
import { propertySummariesForClient } from "@/lib/metrics";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { PropertyCard } from "@/components/dashboard/properties/PropertyCard";

/** The owner's managed properties, with live status and headline stats. */
export default async function DashboardPropertiesPage() {
  const client = await requireClient();
  const summaries = propertySummariesForClient(client.id);

  return (
    <div>
      <PageHeader
        title="Your properties"
        sub={`${summaries.length} ${
          summaries.length === 1 ? "property" : "properties"
        } managed by Bellavere`}
      />

      <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {summaries.map((summary) => (
          <RevealItem key={summary.property.id} className="h-full">
            <PropertyCard
              property={summary.property}
              status={summary.status}
              occupancyThisMonth={summary.occupancyThisMonth}
              revenueYtd={summary.revenueYtd}
              nextBooking={summary.nextBooking}
            />
          </RevealItem>
        ))}
      </RevealStagger>
    </div>
  );
}
