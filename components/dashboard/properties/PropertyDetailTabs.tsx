"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Bath, BedDouble, Check, Users } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import {
  BookingCalendar,
  type CalendarBooking,
} from "@/components/dashboard/properties/BookingCalendar";
import { MiniAreaChart } from "@/components/dashboard/properties/MiniAreaChart";
import type {
  Booking,
  DocumentCategory,
  MaintenanceTicket,
  OwnerDocument,
  Property,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";
import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatDateWeekday,
  formatPercent,
} from "@/lib/format";

/**
 * Tabbed body of the property detail page. Everything rendered here comes in
 * as plain props computed by the server page from the shared metrics layer.
 */

export interface PropertyMonthRow {
  key: string;
  label: string;
  labelLong: string;
  revenue: number;
  occupancy: number;
}

/** OwnerDocument with the expiry flag pre-computed on the server. */
export type PropertyDocument = OwnerDocument & { expiringSoon: boolean };

const TAB_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "financials", label: "Financials" },
  { id: "maintenance", label: "Maintenance" },
  { id: "documents", label: "Documents" },
];

const TICKET_STATUS: Record<TicketStatus, { label: string; tone: BadgeTone }> = {
  reported: { label: "Reported", tone: "warning" },
  in_progress: { label: "In progress", tone: "info" },
  resolved: { label: "Resolved", tone: "success" },
};

const TICKET_PRIORITY: Record<TicketPriority, { label: string; tone: BadgeTone }> =
  {
    low: { label: "Low", tone: "neutral" },
    medium: { label: "Medium", tone: "info" },
    high: { label: "High", tone: "warning" },
    urgent: { label: "Urgent", tone: "danger" },
  };

const DOC_CATEGORY: Record<DocumentCategory, { label: string; tone: BadgeTone }> =
  {
    contract: { label: "Contract", tone: "gold" },
    insurance: { label: "Insurance", tone: "info" },
    compliance: { label: "Compliance", tone: "success" },
    other: { label: "Other", tone: "neutral" },
  };

export function PropertyDetailTabs({
  property,
  bookings,
  months,
  tickets,
  documents,
  todayIso,
}: {
  property: Property;
  bookings: Booking[];
  months: PropertyMonthRow[];
  tickets: MaintenanceTicket[];
  documents: PropertyDocument[];
  todayIso: string;
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div>
      <Tabs
        items={TAB_ITEMS}
        activeId={tab}
        onChange={setTab}
        layoutId="property-detail-tabs"
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pt-6"
        >
          {tab === "overview" ? <OverviewPanel property={property} /> : null}
          {tab === "bookings" ? (
            <BookingsPanel bookings={bookings} todayIso={todayIso} />
          ) : null}
          {tab === "financials" ? <FinancialsPanel months={months} /> : null}
          {tab === "maintenance" ? <MaintenancePanel tickets={tickets} /> : null}
          {tab === "documents" ? <DocumentsPanel documents={documents} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewPanel({ property }: { property: Property }) {
  const hero = property.images[0];
  const facts = [
    { icon: BedDouble, label: "Bedrooms", value: String(property.bedrooms) },
    { icon: Bath, label: "Bathrooms", value: String(property.bathrooms) },
    { icon: Users, label: "Sleeps", value: String(property.sleeps) },
    {
      icon: Banknote,
      label: "Nightly rate",
      value: `${formatCurrency(property.nightlyRate)}/night`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl lg:aspect-[21/9]">
        <Image
          src={hero.src}
          alt={hero.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 960px"
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {facts.map((fact) => (
          <Card key={fact.label} className="p-4">
            <fact.icon className="size-4.5 text-gold-600" aria-hidden />
            <p className="mt-2 text-xs text-ink-500">{fact.label}</p>
            <p className="mt-0.5 text-sm font-medium text-navy-900">
              {fact.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl">
        <h3 className="text-xl">{property.headline}</h3>
        <p className="mt-3 text-sm leading-relaxed text-ink-900 lg:text-base">
          {property.description}
        </p>
      </div>

      <div>
        <h3 className="text-lg">Amenities</h3>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {property.amenities.map((amenity) => (
            <li
              key={amenity}
              className="flex items-center gap-2.5 text-sm text-ink-900"
            >
              <Check className="size-4 shrink-0 text-gold-600" aria-hidden />
              {amenity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BookingsPanel({
  bookings,
  todayIso,
}: {
  bookings: Booking[];
  todayIso: string;
}) {
  const active = bookings.filter((b) => b.status !== "cancelled");
  const calendarBookings: CalendarBooking[] = active.map((b) => ({
    id: b.id,
    guest: b.guest,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    nights: b.nights,
  }));
  const upcoming = active
    .filter((b) => b.checkIn >= todayIso)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <BookingCalendar bookings={calendarBookings} todayIso={todayIso} />
      </Card>

      <div>
        <h3 className="text-lg">Next stays</h3>
        {upcoming.length === 0 ? (
          <p className="mt-4 rounded-xl bg-sand-100/60 px-4 py-6 text-center text-sm text-ink-500">
            No upcoming stays on the calendar yet
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-sand-300/60">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-4 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {b.guest}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {formatDateWeekday(b.checkIn)} –{" "}
                    {formatDateWeekday(b.checkOut)} · {b.channel}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-navy-900">
                    {formatCurrency(b.amount)}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {b.nights} {b.nights === 1 ? "night" : "nights"}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FinancialsPanel({ months }: { months: PropertyMonthRow[] }) {
  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const averageOccupancy =
    months.length > 0
      ? Math.round(
          months.reduce((sum, m) => sum + m.occupancy, 0) / months.length
        )
      : 0;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg">Revenue, last 12 months</h3>
        <div className="mt-4">
          <MiniAreaChart
            data={months.map(({ key, label, labelLong, revenue }) => ({
              key,
              label,
              labelLong,
              revenue,
            }))}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="border-b border-sand-300 text-left text-xs font-semibold uppercase tracking-(--tracking-label) text-ink-500">
                <th scope="col" className="px-6 py-3.5 font-semibold">
                  Month
                </th>
                <th scope="col" className="px-6 py-3.5 text-right font-semibold">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3.5 text-right font-semibold">
                  Occupancy
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-300/60">
              {months.map((m) => (
                <tr key={m.key}>
                  <td className="px-6 py-3 text-ink-900">{m.labelLong}</td>
                  <td className="px-6 py-3 text-right font-medium text-navy-900">
                    {formatCurrency(m.revenue)}
                  </td>
                  <td className="px-6 py-3 text-right text-ink-900">
                    {formatPercent(m.occupancy)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-sand-300 bg-sand-50">
                <th scope="row" className="px-6 py-3.5 text-left font-medium">
                  Total
                </th>
                <td className="px-6 py-3.5 text-right font-semibold text-navy-900">
                  {formatCurrency(totalRevenue)}
                </td>
                <td className="px-6 py-3.5 text-right text-ink-900">
                  {formatPercent(averageOccupancy)} avg
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MaintenancePanel({ tickets }: { tickets: MaintenanceTicket[] }) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-xl bg-sand-100/60 px-4 py-10 text-center text-sm text-ink-500">
        No maintenance history for this property — nothing needs your
        attention.
      </p>
    );
  }

  const sorted = [...tickets].sort((a, b) =>
    b.reportedAt.localeCompare(a.reportedAt)
  );

  return (
    <ul className="space-y-4">
      {sorted.map((ticket) => {
        const status = TICKET_STATUS[ticket.status];
        const priority = TICKET_PRIORITY[ticket.priority];
        return (
          <li key={ticket.id}>
            <Card className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={status.tone}>{status.label}</Badge>
                <Badge tone={priority.tone}>{priority.label} priority</Badge>
                {ticket.cost !== undefined ? (
                  <span className="ml-auto text-sm font-medium text-navy-900">
                    {formatCurrency(ticket.cost)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-lg">{ticket.title}</h3>
              <p className="mt-1 text-sm text-ink-900">{ticket.description}</p>
              <p className="mt-3 text-xs text-ink-500">
                Reported {formatDate(ticket.reportedAt)}
                {ticket.resolvedAt
                  ? ` · Resolved ${formatDate(ticket.resolvedAt)}`
                  : ""}
                {ticket.contractor ? ` · ${ticket.contractor}` : ""}
              </p>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}

function DocumentsPanel({ documents }: { documents: PropertyDocument[] }) {
  return (
    <div>
      {documents.length === 0 ? (
        <p className="rounded-xl bg-sand-100/60 px-4 py-10 text-center text-sm text-ink-500">
          No documents filed for this property yet.
        </p>
      ) : (
        <ul className="divide-y divide-sand-300/60">
          {documents.map((doc) => {
            const category = DOC_CATEGORY[doc.category];
            return (
              <li
                key={doc.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy-900">
                    {doc.name}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {doc.propertyId === null ? "Portfolio-wide · " : ""}
                    Issued {formatDateShort(doc.issuedAt)} ·{" "}
                    {doc.fileSizeKb.toLocaleString("en-GB")} KB
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={category.tone}>{category.label}</Badge>
                  {doc.expiringSoon ? (
                    <Badge tone="warning">Expiring soon</Badge>
                  ) : null}
                  <span className="text-xs text-ink-500">
                    {doc.expiresAt
                      ? `Expires ${formatDate(doc.expiresAt)}`
                      : "No expiry"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-xs text-ink-500">
        &ldquo;Portfolio-wide&rdquo; applies to documents without a specific
        property.
      </p>
    </div>
  );
}
