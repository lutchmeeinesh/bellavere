import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Banknote, BedDouble, CalendarCheck, Wrench } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getClientById } from "@/data/clients";
import { getPropertyById } from "@/data/properties";
import { getTicketsForClient } from "@/data/maintenance";
import { getDocumentsForClient } from "@/data/documents";
import {
  kpisForClient,
  propertySummariesForClient,
  statementsForClient,
} from "@/lib/metrics";
import { TODAY } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Reveal, RevealItem, RevealStagger } from "@/components/ui/Reveal";
import { KpiTile } from "@/components/dashboard/overview/KpiTile";
import { Money } from "@/components/currency/Money";
import { AdminTable, Td } from "@/components/admin/AdminTable";
import { ViewAsButton } from "@/components/admin/ViewAsButton";
import type { PropertyStatus, TicketStatus } from "@/lib/types";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${getClientById(id)?.name ?? "Owner"} · Admin` };
}

const STATUS: Record<PropertyStatus, { label: string; tone: BadgeTone }> = {
  occupied: { label: "Occupied", tone: "success" },
  vacant: { label: "Vacant", tone: "neutral" },
  maintenance: { label: "Maintenance", tone: "warning" },
};

const TICKET_STATUS: Record<TicketStatus, string> = {
  reported: "Reported",
  in_progress: "In progress",
  resolved: "Resolved",
};

const DAY = 86_400_000;

/** Everything Bellavere holds about one owner. Admins only. */
export default async function AdminClientPage({
  params,
}: {
  params: Promise<Params>;
}) {
  await requireAdmin();
  const { id } = await params;
  const client = getClientById(id);
  if (!client) notFound();

  const kpis = kpisForClient(client.id);
  const summaries = propertySummariesForClient(client.id);
  const statements = statementsForClient(client.id).slice(0, 3);
  const tickets = getTicketsForClient(client.id).sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt)
  );
  const documents = getDocumentsForClient(client.id);

  const account: [string, React.ReactNode][] = [
    ["Email", <a key="e" href={`mailto:${client.email}`} className="hover:text-gold-700">{client.email}</a>],
    ["Phone", <a key="p" href={`tel:${client.phone.replace(/\s/g, "")}`} className="hover:text-gold-700">{client.phone}</a>],
    ["Agreed management fee", `${Math.round(client.feeRate * 100)}% of gross rental income`],
    ["Paid in", client.payoutCurrency],
    ["Payout account", <span key="a" className="font-mono">{client.payoutAccount}</span>],
  ];

  return (
    <div className="space-y-10">
      <Reveal>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-500 transition-colors duration-150 hover:text-navy-900"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All owners
        </Link>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow mb-2">Owner</p>
            <h1 className="text-3xl lg:text-4xl">{client.name}</h1>
            <p className="mt-1.5 text-sm text-ink-500">
              {summaries.length} {summaries.length === 1 ? "property" : "properties"} ·{" "}
              as of {formatDate(TODAY)}
            </p>
          </div>
          <ViewAsButton
            clientId={client.id}
            label={`Open ${client.shortName}'s portal`}
            variant="dark"
            size="md"
          />
        </div>
      </Reveal>

      <RevealStagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RevealItem>
          <KpiTile label="Revenue this month" value={kpis.revenueThisMonth} money icon={Banknote} delta={kpis.revenueDelta} deltaSuffix="%" />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Occupancy" value={kpis.occupancyThisMonth} suffix="%" icon={BedDouble} delta={kpis.occupancyDelta} deltaSuffix=" pts" />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Check-ins, next 7 days" value={kpis.upcomingCheckIns} icon={CalendarCheck} />
        </RevealItem>
        <RevealItem>
          <KpiTile label="Open maintenance tickets" value={kpis.openTickets} icon={Wrench} />
        </RevealItem>
      </RevealStagger>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Reveal>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Account</h2>
            <dl className="mt-4 divide-y divide-sand-300/70 text-sm">
              {account.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-ink-500">{label}</dt>
                  <dd className="text-right text-navy-900">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Latest statements</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <caption className="sr-only">Latest three monthly statements</caption>
                <thead>
                  <tr className="text-xs tracking-(--tracking-label) text-ink-500 uppercase">
                    <th scope="col" className="py-2 font-semibold">Period</th>
                    <th scope="col" className="py-2 text-right font-semibold">Gross</th>
                    <th scope="col" className="py-2 text-right font-semibold">Fee</th>
                    <th scope="col" className="py-2 text-right font-semibold">Expenses</th>
                    <th scope="col" className="py-2 text-right font-semibold">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-300/70">
                  {statements.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 text-navy-900">{s.period}</td>
                      <td className="py-2.5 text-right"><Money eur={s.gross} /></td>
                      <td className="py-2.5 text-right text-ink-500">−<Money eur={s.fee} /></td>
                      <td className="py-2.5 text-right text-ink-500">−<Money eur={s.expenses} /></td>
                      <td className="py-2.5 text-right font-medium text-navy-900"><Money eur={s.net} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="client-properties">
          <h2 id="client-properties" className="mb-4 text-2xl">Properties</h2>
          <AdminTable
            caption={`${client.name}'s properties`}
            head={["Property", "Location", "Status", "Occupancy (month)", "Revenue YTD", "Next check-in"]}
          >
            {summaries.map((s) => (
              <tr key={s.property.id}>
                <Td className="font-medium text-navy-900">{s.property.name}</Td>
                <Td className="text-ink-500">{s.property.location}</Td>
                <Td><Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge></Td>
                <Td>{s.occupancyThisMonth}%</Td>
                <Td><Money eur={s.revenueYtd} /></Td>
                <Td className="text-ink-500">{s.nextBooking ? formatDate(s.nextBooking.checkIn) : "—"}</Td>
              </tr>
            ))}
          </AdminTable>
        </section>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Maintenance</h2>
            <ul className="mt-4 divide-y divide-sand-300/70">
              {tickets.map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-navy-900">{t.title}</p>
                    <p className="truncate text-xs text-ink-500">
                      {getPropertyById(t.propertyId)?.name} · reported {formatDate(t.reportedAt)}
                      {t.contractor ? ` · ${t.contractor}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <Badge tone={t.status === "resolved" ? "success" : t.status === "in_progress" ? "info" : "neutral"}>
                      {TICKET_STATUS[t.status]}
                    </Badge>
                    {t.cost ? (
                      <p className="mt-1 text-ink-500"><Money eur={t.cost} /></p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.05}>
          <Card className="h-full p-6">
            <h2 className="text-2xl">Documents</h2>
            <ul className="mt-4 divide-y divide-sand-300/70">
              {documents.map((d) => {
                const days = d.expiresAt
                  ? Math.round((new Date(d.expiresAt).getTime() - TODAY.getTime()) / DAY)
                  : null;
                return (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">{d.name}</p>
                      <p className="text-xs text-ink-500">
                        {d.expiresAt ? `Expires ${formatDate(d.expiresAt)}` : "No expiry"}
                      </p>
                    </div>
                    {days !== null && days > 0 && days <= 45 ? (
                      <Badge tone="warning" className="shrink-0">Expiring soon</Badge>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
