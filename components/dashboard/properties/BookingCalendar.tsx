"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonth } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Month grid showing booked ranges for one property. Navigable ±13 months
 * around today (matching the generated booking horizon), Monday-first.
 * Booked days are shaded gold; arrival and departure days are stronger with
 * rounded ends; today is ringed.
 */

export interface CalendarBooking {
  id: string;
  guest: string;
  /** ISO yyyy-mm-dd */
  checkIn: string;
  /** ISO yyyy-mm-dd */
  checkOut: string;
  nights: number;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_CLAMP = 13;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function BookingCalendar({
  bookings,
  todayIso,
}: {
  /** Non-cancelled bookings for this property. */
  bookings: CalendarBooking[];
  todayIso: string;
}) {
  const [offset, setOffset] = useState(0);

  const [ty, tm] = todayIso.split("-").map(Number);
  const view = new Date(ty, tm - 1 + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first

  const cells: Array<number | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: dayCount }, (_, i) => i + 1),
  ];

  const bookingFor = (iso: string) =>
    bookings.find((b) => b.checkIn <= iso && iso <= b.checkOut);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium text-navy-900">{formatMonth(view)}</p>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous month"
            disabled={offset <= -MONTH_CLAMP}
            onClick={() => setOffset((v) => Math.max(-MONTH_CLAMP, v - 1))}
            className="rounded-full p-1.5 text-navy-900 transition-colors duration-150 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-4.5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next month"
            disabled={offset >= MONTH_CLAMP}
            onClick={() => setOffset((v) => Math.min(MONTH_CLAMP, v + 1))}
            className="rounded-full p-1.5 text-navy-900 transition-colors duration-150 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-4.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="pb-2 text-xs font-medium text-ink-500">
            {day}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((day, index) => {
          if (day === null) {
            return <span key={`empty-${index}`} aria-hidden />;
          }
          const iso = `${year}-${pad2(month + 1)}-${pad2(day)}`;
          const booking = bookingFor(iso);
          const isStart = booking?.checkIn === iso;
          const isEnd = booking?.checkOut === iso;
          const isToday = iso === todayIso;
          return (
            <span
              key={iso}
              title={
                booking
                  ? `${booking.guest} · ${booking.nights} ${
                      booking.nights === 1 ? "night" : "nights"
                    }`
                  : undefined
              }
              className={cn(
                "flex h-10 items-center justify-center text-sm",
                booking && !isStart && !isEnd && "bg-gold-500/15 text-navy-900",
                (isStart || isEnd) && "bg-gold-500/30 text-navy-900",
                isStart && "rounded-l-full",
                isEnd && "rounded-r-full",
                !booking && "text-ink-500"
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center",
                  isToday && "rounded-full font-semibold ring-1 ring-gold-600"
                )}
              >
                {day}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded bg-gold-500/15" />
          Booked stay
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded bg-gold-500/30" />
          Arrival / departure day
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="size-3 rounded-full ring-1 ring-gold-600" />
          Today
        </span>
      </div>
    </div>
  );
}
