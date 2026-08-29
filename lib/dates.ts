/**
 * Date helpers for the mock-data layer. All mock data is generated relative to
 * "today" so the demo always shows current-looking bookings and statements.
 * TODAY is truncated to midnight so generation is deterministic within a day
 * (avoids SSR/client hydration mismatches).
 */

export const TODAY: Date = (() => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
})();

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function daysFromToday(days: number): Date {
  return addDays(TODAY, days);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
