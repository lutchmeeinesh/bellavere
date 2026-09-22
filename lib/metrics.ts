import type {
  ActivityItem,
  Booking,
  MaintenanceTicket,
  Property,
  PropertyStatus,
  Statement,
} from "@/lib/types";
import { getBookingsForClient, getBookingsForProperty } from "@/data/bookings";
import { getPropertiesForClient, getPropertyById } from "@/data/properties";
import { getTicketsForClient } from "@/data/maintenance";
import { getDocumentsForClient } from "@/data/documents";
import { company } from "@/data/company";
import { getClientById } from "@/data/clients";
import {
  TODAY,
  addMonths,
  daysInMonth,
  monthKey,
  nightsInMonth,
  startOfMonth,
  toISODate,
} from "@/lib/dates";
import { hashSeed } from "@/lib/rng";
import { formatMoney } from "@/lib/format";

/**
 * Every number on the dashboard — KPI tiles, charts, statements — is derived
 * here from the same booking and maintenance data, so figures always agree
 * with each other.
 */

/** Monthly recurring upkeep billed per property (pool, garden, cleaning). */
function recurringUpkeep(property: Property): number {
  return property.type === "villa" ? 220 : 90;
}

/** Revenue is allocated to months by nights actually stayed (pro-rated). */
function revenueInMonth(booking: Booking, year: number, month: number): number {
  if (booking.status === "cancelled") return 0;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);
  const nights = nightsInMonth(checkIn, checkOut, year, month);
  if (nights === 0) return 0;
  return (booking.amount / booking.nights) * nights;
}

export interface MonthPoint {
  /** "2026-08" */
  key: string;
  /** "Aug" */
  label: string;
  /** "August 2026" */
  labelLong: string;
  year: number;
  month: number;
}

export function lastMonths(count: number, includeCurrent = true): MonthPoint[] {
  const result: MonthPoint[] = [];
  const current = startOfMonth(TODAY);
  const offset = includeCurrent ? 0 : 1;
  for (let i = count - 1 + offset; i >= offset; i--) {
    const d = addMonths(current, -i);
    result.push({
      key: monthKey(d),
      label: d.toLocaleDateString("en-GB", { month: "short" }),
      labelLong: d.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return result;
}

export interface RevenuePoint extends MonthPoint {
  revenue: number;
}

export function monthlyRevenueForClient(
  clientId: string,
  months = 12
): RevenuePoint[] {
  const clientBookings = getBookingsForClient(clientId);
  return lastMonths(months).map((m) => ({
    ...m,
    revenue: Math.round(
      clientBookings.reduce(
        (sum, b) => sum + revenueInMonth(b, m.year, m.month),
        0
      )
    ),
  }));
}

export function monthlyRevenueForProperty(
  propertyId: string,
  months = 12
): RevenuePoint[] {
  const propertyBookings = getBookingsForProperty(propertyId);
  return lastMonths(months).map((m) => ({
    ...m,
    revenue: Math.round(
      propertyBookings.reduce(
        (sum, b) => sum + revenueInMonth(b, m.year, m.month),
        0
      )
    ),
  }));
}

/** Percentage of nights booked (non-cancelled) in the given month. */
export function occupancyForPropertyMonth(
  propertyId: string,
  year: number,
  month: number
): number {
  const nights = getBookingsForProperty(propertyId)
    .filter((b) => b.status !== "cancelled")
    .reduce(
      (sum, b) =>
        sum +
        nightsInMonth(new Date(b.checkIn), new Date(b.checkOut), year, month),
      0
    );
  return Math.min(100, Math.round((nights / daysInMonth(year, month)) * 100));
}

export function occupancyForClientMonth(
  clientId: string,
  year: number,
  month: number
): number {
  const props = getPropertiesForClient(clientId);
  if (props.length === 0) return 0;
  const total = props.reduce(
    (sum, p) => sum + occupancyForPropertyMonth(p.id, year, month),
    0
  );
  return Math.round(total / props.length);
}

/** Live letting state used on dashboard property cards. */
export function propertyStatusToday(propertyId: string): PropertyStatus {
  const property = getPropertyById(propertyId);
  if (property?.clientId) {
    const blocking = getTicketsForClient(property.clientId).some(
      (t) =>
        t.propertyId === propertyId &&
        t.status === "in_progress" &&
        (t.priority === "high" || t.priority === "urgent")
    );
    if (blocking) return "maintenance";
  }
  const todayIso = toISODate(TODAY);
  const occupied = getBookingsForProperty(propertyId).some(
    (b) =>
      b.status !== "cancelled" && b.checkIn <= todayIso && b.checkOut > todayIso
  );
  return occupied ? "occupied" : "vacant";
}

export interface ClientKpis {
  revenueThisMonth: number;
  revenueDelta: number | null;
  occupancyThisMonth: number;
  occupancyDelta: number | null;
  upcomingCheckIns: number;
  openTickets: number;
}

export function kpisForClient(clientId: string): ClientKpis {
  const [prev, current] = lastMonths(2);
  const revenueSeries = monthlyRevenueForClient(clientId, 2);
  const revenueThisMonth = revenueSeries[1].revenue;
  const revenueLastMonth = revenueSeries[0].revenue;
  const occupancyThisMonth = occupancyForClientMonth(
    clientId,
    current.year,
    current.month
  );
  const occupancyLastMonth = occupancyForClientMonth(
    clientId,
    prev.year,
    prev.month
  );

  const todayIso = toISODate(TODAY);
  const weekAhead = new Date(TODAY);
  weekAhead.setDate(weekAhead.getDate() + 7);
  const weekAheadIso = toISODate(weekAhead);

  const upcomingCheckIns = getBookingsForClient(clientId).filter(
    (b) =>
      b.status === "confirmed" &&
      b.checkIn >= todayIso &&
      b.checkIn <= weekAheadIso
  ).length;

  const openTickets = getTicketsForClient(clientId).filter(
    (t) => t.status !== "resolved"
  ).length;

  return {
    revenueThisMonth,
    revenueDelta:
      revenueLastMonth > 0
        ? Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
          )
        : null,
    occupancyThisMonth,
    occupancyDelta:
      occupancyLastMonth > 0 ? occupancyThisMonth - occupancyLastMonth : null,
    upcomingCheckIns,
    openTickets,
  };
}

/** Check-ins and check-outs in the next `days` days, soonest first. */
export function upcomingBookings(clientId: string, days = 7): Booking[] {
  const todayIso = toISODate(TODAY);
  const end = new Date(TODAY);
  end.setDate(end.getDate() + days);
  const endIso = toISODate(end);
  return getBookingsForClient(clientId)
    .filter(
      (b) =>
        b.status !== "cancelled" && b.checkIn >= todayIso && b.checkIn <= endIso
    )
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
}

/**
 * Owner statements for the last 12 complete months. Gross comes from the
 * same revenue allocation as the charts; expenses are resolved maintenance
 * costs plus recurring upkeep per property.
 */
export function statementsForClient(clientId: string): Statement[] {
  // Each owner's negotiated rate, capped at the company maximum.
  const feeRate = Math.min(
    getClientById(clientId)?.feeRate ?? company.pricing.maxFeeRate,
    company.pricing.maxFeeRate
  );
  const props = getPropertiesForClient(clientId);
  const tickets = getTicketsForClient(clientId);
  const revenue = new Map(
    monthlyRevenueForClient(clientId, 13).map((p) => [p.key, p])
  );

  return lastMonths(12, false)
    .map((m) => {
      const gross = revenue.get(m.key)?.revenue ?? 0;
      const fee = Math.round(gross * feeRate);
      const ticketCosts = tickets
        .filter(
          (t) => t.resolvedAt && monthKey(new Date(t.resolvedAt)) === m.key
        )
        .reduce((sum, t) => sum + (t.cost ?? 0), 0);
      const upkeep = props.reduce((sum, p) => sum + recurringUpkeep(p), 0);
      const expenses = ticketCosts + upkeep;
      return {
        id: `st-${clientId}-${m.key}`,
        clientId,
        year: m.year,
        month: m.month,
        period: m.labelLong,
        gross,
        fee,
        expenses,
        net: gross - fee - expenses,
      };
    })
    .reverse(); // newest first
}

export interface PropertyDashboardSummary {
  property: Property;
  status: PropertyStatus;
  occupancyThisMonth: number;
  revenueYtd: number;
  nextBooking: Booking | null;
}

export function propertySummariesForClient(
  clientId: string
): PropertyDashboardSummary[] {
  const [current] = lastMonths(1);
  const todayIso = toISODate(TODAY);
  return getPropertiesForClient(clientId).map((property) => {
    const monthsIntoYear = TODAY.getMonth() + 1;
    const revenueYtd = monthlyRevenueForProperty(property.id, monthsIntoYear)
      .filter((p) => p.year === TODAY.getFullYear())
      .reduce((sum, p) => sum + p.revenue, 0);
    const nextBooking =
      getBookingsForProperty(property.id)
        .filter((b) => b.status === "confirmed" && b.checkIn >= todayIso)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0] ?? null;
    return {
      property,
      status: propertyStatusToday(property.id),
      occupancyThisMonth: occupancyForPropertyMonth(
        property.id,
        current.year,
        current.month
      ),
      revenueYtd,
      nextBooking,
    };
  });
}

/** Recent activity feed, derived from bookings, tickets and statements. */
/**
 * `formatAmount` renders money inside the activity sentences; pass one bound
 * to the visitor's currency (defaults to EUR).
 */
export function activityForClient(
  clientId: string,
  limit = 10,
  formatAmount: (eur: number) => string = (eur) => formatMoney(eur, "EUR")
): ActivityItem[] {
  const items: ActivityItem[] = [];
  const todayIso = toISODate(TODAY);
  const twoWeeksAgo = new Date(TODAY);
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  const twoWeeksAgoIso = toISODate(twoWeeksAgo);
  const propertyName = (id: string) => getPropertyById(id)?.name ?? "property";

  for (const b of getBookingsForClient(clientId)) {
    if (b.status === "cancelled") continue;
    if (b.checkOut >= twoWeeksAgoIso && b.checkOut <= todayIso) {
      items.push({
        id: `act-out-${b.id}`,
        clientId,
        date: b.checkOut,
        type: "checkout",
        message: `${b.guest} checked out of ${propertyName(b.propertyId)} after ${b.nights} nights`,
        propertyId: b.propertyId,
      });
    }
    if (b.checkIn >= twoWeeksAgoIso && b.checkIn <= todayIso) {
      items.push({
        id: `act-in-${b.id}`,
        clientId,
        date: b.checkIn,
        type: "booking",
        message: `${b.guest} checked in to ${propertyName(b.propertyId)} (${b.nights} nights, ${b.channel})`,
        propertyId: b.propertyId,
      });
    }
  }

  const monthAgo = new Date(TODAY);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthAgoIso = toISODate(monthAgo);
  for (const t of getTicketsForClient(clientId)) {
    if (t.status === "resolved" && t.resolvedAt && t.resolvedAt >= monthAgoIso) {
      items.push({
        id: `act-mr-${t.id}`,
        clientId,
        date: t.resolvedAt,
        type: "maintenance",
        message: `Resolved: ${t.title.toLowerCase()} at ${propertyName(t.propertyId)}${t.cost ? ` (${formatAmount(t.cost)})` : ""}`,
        propertyId: t.propertyId,
      });
    } else if (t.status !== "resolved" && t.reportedAt >= monthAgoIso) {
      items.push({
        id: `act-mo-${t.id}`,
        clientId,
        date: t.reportedAt,
        type: "maintenance",
        message: `New maintenance ticket: ${t.title.toLowerCase()} at ${propertyName(t.propertyId)}`,
        propertyId: t.propertyId,
      });
    }
  }

  const [latest] = statementsForClient(clientId);
  if (latest) {
    const payoutDate = new Date(TODAY.getFullYear(), TODAY.getMonth(), 5);
    if (payoutDate <= TODAY) {
      items.push({
        id: `act-pay-${latest.id}`,
        clientId,
        date: toISODate(payoutDate),
        type: "payout",
        message: `${latest.period} statement paid — net ${formatAmount(latest.net)}`,
      });
    }
  }

  for (const doc of getDocumentsForClient(clientId)) {
    if (!doc.expiresAt) continue;
    const days = Math.round(
      (new Date(doc.expiresAt).getTime() - TODAY.getTime()) / 86400000
    );
    if (days > 0 && days <= 45) {
      items.push({
        id: `act-doc-${doc.id}`,
        clientId,
        date: todayIso,
        type: "document",
        message: `${doc.name} expires in ${days} days — renewal in progress`,
      });
    }
  }

  // Deterministic quarterly inspection entries so the feed never feels empty.
  for (const p of getPropertiesForClient(clientId)) {
    const daysAgo = 3 + (hashSeed(p.id) % 18);
    const date = new Date(TODAY);
    date.setDate(date.getDate() - daysAgo);
    items.push({
      id: `act-insp-${p.id}`,
      clientId,
      date: toISODate(date),
      type: "inspection",
      message: `Routine inspection completed at ${p.name} — no issues found`,
      propertyId: p.id,
    });
  }

  return items
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

export function documentsExpiringSoon(clientId: string, withinDays = 45) {
  return getDocumentsForClient(clientId).filter((doc) => {
    if (!doc.expiresAt) return false;
    const days = Math.round(
      (new Date(doc.expiresAt).getTime() - TODAY.getTime()) / 86400000
    );
    return days > 0 && days <= withinDays;
  });
}

export function ticketsByStatus(clientId: string): {
  reported: MaintenanceTicket[];
  in_progress: MaintenanceTicket[];
  resolved: MaintenanceTicket[];
} {
  const tickets = getTicketsForClient(clientId);
  return {
    reported: tickets.filter((t) => t.status === "reported"),
    in_progress: tickets.filter((t) => t.status === "in_progress"),
    resolved: tickets.filter((t) => t.status === "resolved"),
  };
}
