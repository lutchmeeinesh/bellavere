import type { OwnerDocument } from "@/lib/types";
import { daysFromToday, perDay, toISODate } from "@/lib/dates";

const d = (offset: number) => toISODate(daysFromToday(offset));

/**
 * Owner documents. Anything expiring within 45 days gets an "expiring soon"
 * badge on the dashboard.
 */
// Dates are relative to today, so the list is rebuilt once per day.
const allDocuments = perDay((): OwnerDocument[] => [
  // — Sophie Laurent —
  {
    id: "doc-001",
    clientId: "c-sophie",
    propertyId: null,
    name: "Management agreement 2024–2027",
    category: "contract",
    issuedAt: d(-590),
    expiresAt: d(505),
    fileSizeKb: 412,
  },
  {
    id: "doc-002",
    clientId: "c-sophie",
    propertyId: "p-01",
    name: "Building & contents insurance — Villa Azure",
    category: "insurance",
    issuedAt: d(-338),
    expiresAt: d(27),
    fileSizeKb: 856,
  },
  {
    id: "doc-003",
    clientId: "c-sophie",
    propertyId: "p-02",
    name: "Building & contents insurance — Villa Frangipani",
    category: "insurance",
    issuedAt: d(-210),
    expiresAt: d(155),
    fileSizeKb: 843,
  },
  {
    id: "doc-004",
    clientId: "c-sophie",
    propertyId: "p-01",
    name: "Tourist Accommodation Certificate — Villa Azure",
    category: "compliance",
    issuedAt: d(-400),
    expiresAt: d(330),
    fileSizeKb: 224,
  },
  {
    id: "doc-005",
    clientId: "c-sophie",
    propertyId: "p-03",
    name: "Syndic rules & residence bylaws — Les Cerisiers",
    category: "other",
    issuedAt: d(-720),
    expiresAt: null,
    fileSizeKb: 1290,
  },
  {
    id: "doc-006",
    clientId: "c-sophie",
    propertyId: "p-02",
    name: "Pool safety compliance report",
    category: "compliance",
    issuedAt: d(-95),
    expiresAt: d(270),
    fileSizeKb: 310,
  },
  // — Hamilton Estates —
  {
    id: "doc-011",
    clientId: "c-hamilton",
    propertyId: null,
    name: "Master management agreement 2025–2028",
    category: "contract",
    issuedAt: d(-240),
    expiresAt: d(855),
    fileSizeKb: 640,
  },
  {
    id: "doc-012",
    clientId: "c-hamilton",
    propertyId: null,
    name: "Portfolio insurance schedule (5 apartments)",
    category: "insurance",
    issuedAt: d(-300),
    expiresAt: d(65),
    fileSizeKb: 1740,
  },
  {
    id: "doc-013",
    clientId: "c-hamilton",
    propertyId: "p-06",
    name: "Tourist Accommodation Certificate — Cap Ouest Penthouse",
    category: "compliance",
    issuedAt: d(-350),
    expiresAt: d(15),
    fileSizeKb: 226,
  },
  {
    id: "doc-014",
    clientId: "c-hamilton",
    propertyId: "p-09",
    name: "Tourist Accommodation Certificate — Bain Bœuf 5",
    category: "compliance",
    issuedAt: d(-180),
    expiresAt: d(185),
    fileSizeKb: 229,
  },
  {
    id: "doc-015",
    clientId: "c-hamilton",
    propertyId: null,
    name: "Company registration extract",
    category: "other",
    issuedAt: d(-1100),
    expiresAt: null,
    fileSizeKb: 152,
  },
]);

export function getDocumentsForClient(clientId: string): OwnerDocument[] {
  return allDocuments().filter((doc) => doc.clientId === clientId);
}
