import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  BedDouble,
  Building2,
  CalendarCheck,
  Users,
  Wrench,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { clients } from "@/data/clients";
import { getPropertyById } from "@/data/properties";
import { getTicketsForClient } from "@/data/maintenance";
import {
  documentsExpiringSoon,
  kpisForClient,
  propertySummariesForClient,
  upcomingBookings,
} from "@/lib/metrics";
import { TODAY } from "@/lib/dates";
import { formatDate, formatDateWeekday } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { KpiTile } from "@/components/dashboard/overview/KpiTile";
import { Money } from "@/components/currency/Money";
import { AdminTable, Td } from "@/components/admin/AdminTable";
import { ViewAsButton } from "@/components/admin/ViewAsButton";
import type { PropertyStatus, TicketPriority } from "@/lib/types";

export const metadata: Metadata = { title: "Admin" };

const STATUS: Record<PropertyStatus, { label: string; tone: BadgeTone }> = {
  occupied: { label: "Occupied", tone: "success" },
  vacant: { label: "Vacant", tone: "neutral" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

const PRIORITY: Record<TicketPriority, BadgeTone> = {
  urgent: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

/**
 * Admin overview: every owner, property, arrival and open issue across the
 * whole portfolio. Only reachable with an admin session (middleware +
 * requireAdmin).
 */
export default async function AdminOverviewPage() {
  const admin = await requireAdmin();

  const owners = clients.map((client) => ({
    client,
    kpis: kpisForClient(client.id),
    summaries: propertySummariesForClient(client.id),
  }));
  const summaries = owners.flatMap((o) =>
    o.summaries.map((s) => ({ ...s, owner: o.client }))
  );

  const totalRevenue = owners.reduce((sum, o) => sum + o.kpis.revenueThisMonth, 0);
  const totalCheckIns = owners.reduce((sum, o) => sum + o.kpis.upcomingCheckIns, 0);
  const totalOpenTickets = owners.reduce((sum, o) => sum + o.kpis.openTickets, 0);
  const averageOccupancy = summaries.length
    ? Math.round(
        summaries.reduce((sum, s) => sum + s.occupancyThisMonth, 0) /
          summaries.length
      )
    : 0;

  const arrivals = clients
    .flatMap((client) =>
      upcomingBookings(client.id, 7).map((b) => ({ ...b, owner: client }))
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const openTickets = clients
    .flatMap((client) =>
      getTicketsForClient(client.id)
        .filter((t) => t.status !== "resolved")
        .map((t) => ({ ...t, owner: client }))
    )
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

  const expiring = clients.flatMap((client) =>
    documentsExpiringSoon(client.id).map((d) => ({ ...d, owner: client }))
  );

  return (
    <div className="space-y-10">
      <Reveal>
        <p className="eyebrow mb-2">Admin</p>
        <h1 className="text-3xl lg:text-4xl">Hello, {admin.shortName}</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {formatDate(TODAY)} · Every owner and property across the portfolio
        </p>
      </Reveal>

      <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RevealItem>
          <KpiTile label="Owners" value={clients.length} icon={Users} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Properties managed" value={summaries.length} icon={Building2} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Revenue this month" value={totalRevenue} money icon={Banknote} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Average occupancy" value={averageOccupancy} suffix="%" icon={BedDouble} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Check-ins, next 7 days" value={totalCheckIns} icon={CalendarCheck} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Open maintenance tickets" value={totalOpenTickets} icon={Wrench} />
        </RevealItem>
      </RevealStagger>

      <Reveal>
        <section aria-labelledby="owners-heading">
          <h2 id="owners-heading" className="mb-4 text-2xl">
            Owners
          </h2>
          <AdminTable
            caption="All owners"
            head={["Owner", "Contact", "Properties", "Agreed fee", "Paid in", "Revenue this month", "Open tickets", ""]}
          >
            {owners.map(({ client, kpis, summaries: s }) => (
              <tr key={client.id}>
                <Td>
                  <Link
                    href={`/admin/clients/${client.id}`}
                    className="font-medium text-navy-900 underline decoration-sand-300 underline-offset-4 hover:decoration-gold-500"
                  >
                    {client.name}
                  </Link>
                </Td>
                <Td className="text-ink-500">
                  <a href={`mailto:${client.email}`} className="block hover:text-navy-900">
                    {client.email}
                  </a>
                  <span className="block text-xs">{client.phone}</span>
                </Td>
                <Td>{s.length}</Td>
                <Td>{Math.round(client.feeRate * 100)}%</Td>
                <Td>
                  <Badge tone="gold">{client.payoutCurrency}</Badge>
                </Td>
                <Td className="font-medium">
                  <Money eur={kpis.revenueThisMonth} />
                </Td>
                <Td>{kpis.openTickets}</Td>
                <Td>
                  <ViewAsButton clientId={client.id} />
                </Td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Arrivals, next 7 days</h2>
            {arrivals.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">No arrivals in the next 7 days.</p>
            ) : (
              <ul className="mt-4 divide-y divide-sand-300/70">
                {arrivals.map((b) => (
                  <li key={b.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">
                        {getPropertyById(b.propertyId)?.name}
                      </p>
                      <p className="truncate text-xs text-ink-500">
                        {b.guest} · {b.nights} nights · owner {b.owner.name}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <p className="text-navy-900">{formatDateWeekday(b.checkIn)}</p>
                      <p className="text-xs text-ink-500">
                        <Money eur={b.amount} />
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Open maintenance</h2>
            {openTickets.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">Nothing open — all clear.</p>
            ) : (
              <ul className="mt-4 divide-y divide-sand-300/70">
                {openTickets.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">{t.title}</p>
                      <p className="truncate text-xs text-ink-500">
                        {getPropertyById(t.propertyId)?.name} · {t.owner.name} ·{" "}
                        {t.status === "in_progress" ? "In progress" : "Reported"}{" "}
                        {formatDate(t.reportedAt)}
                      </p>
                    </div>
                    <Badge tone={PRIORITY[t.priority]} className="shrink-0 capitalize">
                      {t.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="properties-heading">
          <h2 id="properties-heading" className="mb-4 text-2xl">
            Properties
          </h2>
          <AdminTable
            caption="All managed properties"
            head={["Property", "Owner", "Location", "Status", "Occupancy (month)", "Revenue YTD", "Next check-in"]}
          >
            {summaries.map((s) => (
              <tr key={s.property.id}>
                <Td className="font-medium text-navy-900">{s.property.name}</Td>
                <Td>
                  <Link
                    href={`/admin/clients/${s.owner.id}`}
                    className="text-ink-900 hover:text-gold-700"
                  >
                    {s.owner.name}
                  </Link>
                </Td>
                <Td className="text-ink-500">{s.property.location}</Td>
                <Td>
                  <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                </Td>
                <Td>{s.occupancyThisMonth}%</Td>
                <Td>
                  <Money eur={s.revenueYtd} />
                </Td>
                <Td className="text-ink-500">
                  {s.nextBooking ? formatDate(s.nextBooking.checkIn) : "—"}
                </Td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </Reveal>

      <Reveal>
        <Card className="p-6">
          <h2 className="text-2xl">Documents expiring within 45 days</h2>
          {expiring.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">Nothing expiring soon.</p>
          ) : (
            <ul className="mt-4 divide-y divide-sand-300/70">
              {expiring.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{d.name}</p>
                    <p className="text-xs text-ink-500">{d.owner.name}</p>
                  </div>
                  <Badge tone="warning" className="shrink-0">
                    Expires {d.expiresAt ? formatDate(d.expiresAt) : ""}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </Reveal>
    </div>
  );
}
