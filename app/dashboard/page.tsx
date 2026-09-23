import { Banknote, BedDouble, CalendarCheck, Wrench } from "lucide-react";
import { requireClient } from "@/lib/auth";
import {
  activityForClient,
  kpisForClient,
  monthlyRevenueForClient,
  propertySummariesForClient,
  upcomingBookings,
} from "@/lib/metrics";
import { getPropertyById } from "@/data/properties";
import { today } from "@/lib/dates";
import { formatDate, formatMoney } from "@/lib/format";
import { getCurrency } from "@/lib/currency";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { KpiTile } from "@/components/dashboard/overview/KpiTile";
import {
  RevenueChart,
  type RevenueDatum,
} from "@/components/dashboard/overview/RevenueChart";
import {
  OccupancyChart,
  type OccupancyDatum,
} from "@/components/dashboard/overview/OccupancyChart";
import {
  UpcomingList,
  type UpcomingArrival,
} from "@/components/dashboard/overview/UpcomingList";
import { ActivityList } from "@/components/dashboard/overview/ActivityList";

/** Owner overview: KPIs, revenue and occupancy charts, arrivals + activity. */
export default async function DashboardOverviewPage() {
  const client = await requireClient();

  const kpis = kpisForClient(client.id);
  const revenue12: RevenueDatum[] = monthlyRevenueForClient(client.id, 12).map(
    ({ key, label, labelLong, revenue }) => ({ key, label, labelLong, revenue })
  );
  const occupancyByProperty: OccupancyDatum[] = propertySummariesForClient(
    client.id
  ).map((summary) => ({
    name: summary.property.name,
    occupancy: summary.occupancyThisMonth,
  }));
  const next7: UpcomingArrival[] = upcomingBookings(client.id, 7).map((b) => ({
    id: b.id,
    propertyName: getPropertyById(b.propertyId)?.name ?? "Your property",
    guest: b.guest,
    checkIn: b.checkIn,
    nights: b.nights,
    amount: b.amount,
  }));
  const currency = await getCurrency();
  const activity = activityForClient(client.id, 10, (eur) =>
    formatMoney(eur, currency)
  );

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <h1 className="text-3xl lg:text-4xl">
            Welcome back, {client.shortName}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">{formatDate(today())}</p>
        </div>
      </Reveal>

      <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RevealItem>
          <KpiTile
            label="This month's revenue"
            value={kpis.revenueThisMonth}
            money
            icon={Banknote}
            delta={kpis.revenueDelta}
            deltaSuffix="%"
          />
        </RevealItem>
        <RevealItem>
          <KpiTile
            label="Occupancy"
            value={kpis.occupancyThisMonth}
            suffix="%"
            icon={BedDouble}
            delta={kpis.occupancyDelta}
            deltaSuffix=" pts"
          />
        </RevealItem>
        <RevealItem>
          <KpiTile
            label="Upcoming check-ins"
            value={kpis.upcomingCheckIns}
            icon={CalendarCheck}
          />
        </RevealItem>
        <RevealItem>
          <KpiTile
            label="Open maintenance tickets"
            value={kpis.openTickets}
            icon={Wrench}
          />
        </RevealItem>
      </RevealStagger>

      <div className="grid gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <Card className="h-full p-6">
            <RevenueChart data={revenue12} />
          </Card>
        </Reveal>
        <Reveal className="lg:col-span-2" delay={0.1}>
          <Card className="h-full p-6">
            <OccupancyChart data={occupancyByProperty} />
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full p-6">
            <UpcomingList items={next7} />
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card className="h-full p-6">
            <ActivityList items={activity} />
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
