import type { Booking, BookingChannel, BookingStatus } from "@/lib/types";
import { properties } from "@/data/properties";
import { addDays, nightsBetween, perDay, toISODate, today } from "@/lib/dates";
import { hashSeed, mulberry32 } from "@/lib/rng";

/**
 * Deterministic booking history per property: ~13 months back, ~2.5 months
 * forward, no overlapping stays per property (cancelled bookings release
 * their dates, which then simply read as vacancy). Regenerated relative to
 * today (once per Mauritius day) so the demo always shows live-looking data.
 */

const GUEST_NAMES = [
  "Amélie Fournier",
  "James & Clara Whitfield",
  "The Okafor family",
  "Lukas Brandt",
  "Chloé Marchand",
  "Daniel & Priya Shah",
  "Henrik Johansson",
  "Valentina Ricci",
  "Thomas Oosthuizen",
  "Marie-Laure Dupont",
  "Oliver Bennett",
  "Sofia Almeida",
  "The Van der Merwe family",
  "Nina Kowalska",
  "Arjun Mehta",
  "Charlotte Leroy",
  "Sebastian Müller",
  "Isla & Rory MacLeod",
  "Camille Rousseau",
  "The Nakamura family",
  "Elena Petrova",
  "Marco Bianchi",
  "Aisha Patel",
  "Frederik Nielsen",
  "Lucie Grandjean",
  "The Andersson family",
  "Hugo Lefèvre",
  "Grace O'Sullivan",
  "Mathieu Baptiste",
  "Hannah Weiss",
];

const CHANNELS: BookingChannel[] = ["Direct", "Airbnb", "Booking.com"];

/** Seasonal pricing multiplier — Mauritius peaks Nov–Jan and in European summer. */
function seasonFactor(month: number): number {
  const factors = [1.25, 1.15, 1.1, 1.0, 0.95, 0.95, 1.1, 1.15, 1.0, 1.05, 1.15, 1.3];
  return factors[month];
}

/** Typical gap between stays, longer in the low season. */
function gapDays(month: number, r: number): number {
  const lowSeason = month >= 3 && month <= 5; // Apr–Jun
  return 1 + Math.floor(r * (lowSeason ? 8 : 4));
}

function statusFor(checkIn: Date, checkOut: Date, now: Date): BookingStatus {
  if (checkOut <= now) return "completed";
  if (checkIn <= now) return "checked_in";
  return "confirmed";
}

function generateBookings(): Booking[] {
  const all: Booking[] = [];
  const now = today();

  for (const property of properties) {
    if (!property.clientId) continue;

    const rand = mulberry32(hashSeed(property.id));
    const isVilla = property.type === "villa";
    let cursor = addDays(now, -400);
    const horizon = addDays(now, 75);
    let i = 0;

    while (cursor < horizon) {
      cursor = addDays(cursor, gapDays(cursor.getMonth(), rand()));

      const nights = isVilla
        ? 5 + Math.floor(rand() * 7)
        : 3 + Math.floor(rand() * 6);
      const checkIn = new Date(cursor);
      const checkOut = addDays(checkIn, nights);
      if (checkIn >= horizon) break;

      const cancelled = rand() < 0.05;
      const factor = seasonFactor(checkIn.getMonth());
      const amount =
        Math.round((nights * property.nightlyRate * factor) / 5) * 5;

      all.push({
        id: `bk-${property.id}-${String(i + 1).padStart(3, "0")}`,
        propertyId: property.id,
        clientId: property.clientId,
        guest: GUEST_NAMES[Math.floor(rand() * GUEST_NAMES.length)],
        guests: 2 + Math.floor(rand() * Math.max(1, property.sleeps - 1)),
        checkIn: toISODate(checkIn),
        checkOut: toISODate(checkOut),
        nights: nightsBetween(checkIn, checkOut),
        amount,
        channel: CHANNELS[Math.floor(rand() * CHANNELS.length)],
        status: cancelled ? "cancelled" : statusFor(checkIn, checkOut, now),
      });

      // Cancelled stays release their dates; the gap simply reads as vacancy.
      cursor = checkOut;
      i++;
    }
  }

  return all;
}

const allBookings = perDay(generateBookings);

export function getBookingsForClient(clientId: string): Booking[] {
  return allBookings().filter((b) => b.clientId === clientId);
}

export function getBookingsForProperty(propertyId: string): Booking[] {
  return allBookings().filter((b) => b.propertyId === propertyId);
}
