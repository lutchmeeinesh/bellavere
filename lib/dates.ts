/**
 * Date helpers for the mock-data layer. All mock data is generated relative to
 * "today" so the demo always shows current-looking bookings and statements.
 *
 * "Today" is the calendar day in Mauritius, whatever timezone the code runs
 * in (Vercel servers run on UTC, visitors' browsers anywhere), so the server
 * and the browser agree on the date and the dashboard does not show
 * yesterday between midnight and 4 am Mauritius time. It is recomputed on
 * every call, so a long-running server never goes stale.
 */

/** Mauritius is UTC+4 all year (no daylight saving time). */
const MAURITIUS_UTC_OFFSET_MS = 4 * 60 * 60 * 1000;

/** Today's date in Mauritius, as a local-midnight Date. */
export function today(): Date {
  const mauritius = new Date(Date.now() + MAURITIUS_UTC_OFFSET_MS);
  return new Date(
    mauritius.getUTCFullYear(),
    mauritius.getUTCMonth(),
    mauritius.getUTCDate()
  );
}

/** Today's date in Mauritius as yyyy-mm-dd. */
export function todayIso(): string {
  return toISODate(today());
}

/**
 * Memoises mock data generated relative to today, per Mauritius calendar
 * day: it is built once a day and rebuilt after midnight.
 */
export function perDay<T>(build: () => T): () => T {
  let day = "";
  let value: T;
  return () => {
    const key = todayIso();
    if (key !== day) {
      value = build();
      day = key;
    }
    return value;
  };
}

/** Parses "yyyy-mm-dd" as a local calendar date (not UTC midnight). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole days from today until an ISO date (negative once it has passed). */
export function daysUntil(iso: string): number {
  return Math.round(
    (parseISODate(iso).getTime() - today().getTime()) / 86400000
  );
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysFromToday(days: number): Date {
  return addDays(today(), days);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** "2026-08" — stable key for grouping by month. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Nights of [checkIn, checkOut) that fall inside the given month. */
export function nightsInMonth(
  checkIn: Date,
  checkOut: Date,
  year: number,
  month: number
): number {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const start = checkIn > monthStart ? checkIn : monthStart;
  const end = checkOut < monthEnd ? checkOut : monthEnd;
  const diff = Math.round((end.getTime() - start.getTime()) / 86400000);
  return Math.max(0, diff);
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
}

/** ISO date (yyyy-mm-dd) for stable serialization. */
export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
