export type PropertyType = "villa" | "apartment";

/** Current letting state, shown on dashboard property cards. */
export type PropertyStatus = "occupied" | "vacant" | "maintenance";

export interface Client {
  id: string;
  /** Display name (person or company). */
  name: string;
  /** Short first-person greeting name ("Sophie", "Hamilton Estates"). */
  shortName: string;
  company?: string;
  email: string;
  /** scrypt hash (see lib/password.ts); never the plain password. */
  passwordHash: string;
  initials: string;
  phone: string;
  /** Masked payout account shown in settings. */
  payoutAccount: string;
  /** Currency the owner is paid in. */
  payoutCurrency: "EUR" | "MUR";
  /** Management fee agreed with this owner (never above company.pricing.maxFeeRate). */
  feeRate: number;
}

export interface PropertyImage {
  src: string;
  alt: string;
}

export interface Property {
  id: string;
  slug: string;
  name: string;
  type: PropertyType;
  /** e.g. "Grand Baie, north coast" */
  location: string;
  bedrooms: number;
  bathrooms: number;
  sleeps: number;
  /** Base nightly rate in EUR. */
  nightlyRate: number;
  /** Owning demo client, or null for portfolio-only demo listings. */
  clientId: string | null;
  /** Year Bellavere took over management. */
  managedSince: number;
  images: PropertyImage[];
  amenities: string[];
  headline: string;
  description: string;
}

export type BookingStatus =
  | "completed"
  | "checked_in"
  | "confirmed"
  | "cancelled";

export type BookingChannel = "Direct" | "Airbnb" | "Booking.com";

export interface Booking {
  id: string;
  propertyId: string;
  clientId: string;
  guest: string;
  guests: number;
  /** ISO yyyy-mm-dd */
  checkIn: string;
  /** ISO yyyy-mm-dd */
  checkOut: string;
  nights: number;
  /** Gross booking value in EUR. */
  amount: number;
  channel: BookingChannel;
  status: BookingStatus;
}

export type TicketStatus = "reported" | "in_progress" | "resolved";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  /** ISO yyyy-mm-dd */
  reportedAt: string;
  /** ISO yyyy-mm-dd */
  resolvedAt?: string;
  contractor?: string;
  /** EUR, billed to the owner statement of the month it was resolved. */
  cost?: number;
}

export type DocumentCategory = "contract" | "insurance" | "compliance" | "other";

export interface OwnerDocument {
  id: string;
  clientId: string;
  propertyId: string | null;
  name: string;
  category: DocumentCategory;
  /** ISO yyyy-mm-dd */
  issuedAt: string;
  /** ISO yyyy-mm-dd, or null for documents that do not expire. */
  expiresAt: string | null;
  fileSizeKb: number;
}

export interface Statement {
  id: string;
  clientId: string;
  year: number;
  /** 0-based month index. */
  month: number;
  /** e.g. "August 2026" */
  period: string;
  gross: number;
  fee: number;
  expenses: number;
  net: number;
}

export type ActivityType =
  | "booking"
  | "checkout"
  | "payout"
  | "maintenance"
  | "inspection"
  | "document";

export interface ActivityItem {
  id: string;
  clientId: string;
  /** ISO yyyy-mm-dd */
  date: string;
  type: ActivityType;
  message: string;
  propertyId?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}
