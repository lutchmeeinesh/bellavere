import type { MaintenanceTicket } from "@/lib/types";
import { daysFromToday, perDay, toISODate } from "@/lib/dates";

/** ISO date n days from today (negative = in the past). */
const d = (offset: number) => toISODate(daysFromToday(offset));

/**
 * Maintenance tickets for the two demo owner accounts. Resolved tickets carry a
 * cost, which flows into that month's owner statement via lib/metrics.ts.
 */
// Dates are relative to today, so the list is rebuilt once per day.
const allTickets = perDay((): MaintenanceTicket[] => [
  // — Sophie Laurent —
  {
    id: "mt-001",
    propertyId: "p-01",
    clientId: "c-sophie",
    title: "Pool pump running loud",
    description:
      "Guardian reports the pool pump at Villa Azure has developed a rattle. Pump is 6 years old; likely bearing wear.",
    category: "Pool",
    priority: "medium",
    status: "in_progress",
    reportedAt: d(-4),
    contractor: "Pool specialist",
  },
  {
    id: "mt-002",
    propertyId: "p-01",
    clientId: "c-sophie",
    title: "Repaint pergola woodwork",
    description:
      "Scheduled repaint of the dining pergola before high season; sea air has faded the lasure.",
    category: "Exterior",
    priority: "low",
    status: "reported",
    reportedAt: d(-1),
  },
  {
    id: "mt-003",
    propertyId: "p-02",
    clientId: "c-sophie",
    title: "A/C unit dripping in bedroom 2",
    description:
      "Guest reported condensation drip from the split unit in bedroom 2. Drain line flushed and re-gassed.",
    category: "Air conditioning",
    priority: "high",
    status: "resolved",
    reportedAt: d(-16),
    resolvedAt: d(-14),
    contractor: "Air-conditioning technician",
    cost: 145,
  },
  {
    id: "mt-004",
    propertyId: "p-03",
    clientId: "c-sophie",
    title: "Balcony door lock stiff",
    description:
      "Salt corrosion in the sliding-door lock at Les Cerisiers 4B. Replaced cylinder and serviced rollers.",
    category: "General",
    priority: "medium",
    status: "resolved",
    reportedAt: d(-42),
    resolvedAt: d(-39),
    contractor: "Locksmith",
    cost: 85,
  },
  {
    id: "mt-005",
    propertyId: "p-02",
    clientId: "c-sophie",
    title: "Garden irrigation timer replacement",
    description:
      "Irrigation controller failed after a power cut; garden watered manually meanwhile. Replacement ordered.",
    category: "Garden",
    priority: "medium",
    status: "in_progress",
    reportedAt: d(-7),
    contractor: "Garden contractor",
  },
  // — Hamilton Estates —
  {
    id: "mt-009",
    propertyId: "p-06",
    clientId: "c-hamilton",
    title: "Plunge pool chlorinator fault",
    description:
      "Salt chlorinator at Cap Ouest Penthouse showing cell error. Cell descaled; replacement quoted if fault returns.",
    category: "Pool",
    priority: "high",
    status: "resolved",
    reportedAt: d(-21),
    resolvedAt: d(-18),
    contractor: "Pool specialist",
    cost: 190,
  },
  {
    id: "mt-010",
    propertyId: "p-05",
    clientId: "c-hamilton",
    title: "Extractor fan noisy in loft bathroom",
    description:
      "Guest feedback: bathroom extractor rattles at speed. Motor mount re-seated.",
    category: "Electrical",
    priority: "low",
    status: "resolved",
    reportedAt: d(-55),
    resolvedAt: d(-52),
    contractor: "Electrician",
    cost: 60,
  },
  {
    id: "mt-011",
    propertyId: "p-07",
    clientId: "c-hamilton",
    title: "Repaint garden terrace pergola",
    description:
      "Cyclone-season prep: sand and repaint the pergola at Mont Choisy 2A, replace two warped slats.",
    category: "Exterior",
    priority: "medium",
    status: "in_progress",
    reportedAt: d(-6),
    contractor: "Carpenter",
  },
  {
    id: "mt-012",
    propertyId: "p-09",
    clientId: "c-hamilton",
    title: "Balcony awning motor unresponsive",
    description:
      "Electric awning at Bain Bœuf 5 stopped responding to the remote. Suspected control unit after storm.",
    category: "Electrical",
    priority: "medium",
    status: "reported",
    reportedAt: d(-3),
  },
  {
    id: "mt-013",
    propertyId: "p-08",
    clientId: "c-hamilton",
    title: "Deep-clean and descale water heater",
    description:
      "Scheduled annual service of the water heater at La Croisette Garden Apartment.",
    category: "Plumbing",
    priority: "low",
    status: "resolved",
    reportedAt: d(-70),
    resolvedAt: d(-68),
    contractor: "Plumber",
    cost: 95,
  },
  {
    id: "mt-014",
    propertyId: "p-06",
    clientId: "c-hamilton",
    title: "Terrace decking oil treatment",
    description:
      "Bi-annual oiling of the hardwood terrace decking before the humid season.",
    category: "Exterior",
    priority: "low",
    status: "reported",
    reportedAt: d(0),
  },
]);

export function getTicketsForClient(clientId: string): MaintenanceTicket[] {
  return allTickets().filter((t) => t.clientId === clientId);
}
