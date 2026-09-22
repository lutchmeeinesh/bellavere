"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import type { Booking, BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Reveal } from "@/components/ui/Reveal";
import { useMoney } from "@/components/currency/CurrencyProvider";

export type BookingRow = Booking & { propertyName: string };

type StatusFilter = "all" | BookingStatus;
type SortKey = "checkIn" | "amount";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 15;

const STATUS_META: Record<BookingStatus, { label: string; tone: BadgeTone }> = {
  confirmed: { label: "Confirmed", tone: "info" },
  checked_in: { label: "Checked in", tone: "gold" },
  completed: { label: "Completed", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
};

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked_in", label: "Checked in" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

/** Detail block shared by the desktop expanded row and the mobile card. */
function BookingDetail({ booking }: { booking: BookingRow }) {
  const money = useMoney();
  const nightly = booking.nights > 0 ? booking.amount / booking.nights : 0;
  const items: { label: string; value: string }[] = [
    { label: "Channel", value: booking.channel },
    {
      label: "Party size",
      value: `${booking.guests} guest${booking.guests === 1 ? "" : "s"}`,
    },
    { label: "Avg nightly rate", value: money.format(nightly) },
    { label: "Booking id", value: booking.id },
  ];
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-wide text-ink-500">
            {item.label}
          </dt>
          <dd className="mt-0.5 text-sm font-medium text-navy-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function BookingsTable({ rows }: { rows: BookingRow[] }) {
  const money = useMoney();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("checkIn");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (
        q &&
        !r.guest.toLowerCase().includes(q) &&
        !r.propertyName.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
    const dir = sortDir === "asc" ? 1 : -1;
    return [...matched].sort((a, b) =>
      sortKey === "checkIn"
        ? a.checkIn.localeCompare(b.checkIn) * dir
        : (a.amount - b.amount) * dir
    );
  }, [rows, query, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(1);
  };

  const toggleExpanded = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  const ariaSort = (key: SortKey) =>
    sortKey === key
      ? sortDir === "asc"
        ? ("ascending" as const)
        : ("descending" as const)
      : ("none" as const);

  const SortArrow = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="size-3.5 text-ink-500/50" aria-hidden />;
    }
    return sortDir === "asc" ? (
      <ArrowUp className="size-3.5 text-gold-700" aria-hidden />
    ) : (
      <ArrowDown className="size-3.5 text-gold-700" aria-hidden />
    );
  };

  return (
    <Reveal>
      {/* Toolbar: search + status filter */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search guest or property…"
            aria-label="Search bookings by guest or property name"
            className="pl-11"
          />
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter bookings by status"
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              aria-pressed={status === f.value}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500",
                status === f.value
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-sand-300 bg-white text-ink-500 hover:border-navy-900/40 hover:text-navy-900"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <CalendarDays className="size-8 text-ink-500/50" aria-hidden />
          <p className="font-medium text-navy-900">No bookings match</p>
          <p className="max-w-sm text-sm text-ink-500">
            Try a different guest or property name, or clear the status filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery("");
              setStatus("all");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-sand-300 text-xs uppercase tracking-wide text-ink-500">
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Property
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Guest
                  </th>
                  <th
                    scope="col"
                    aria-sort={ariaSort("checkIn")}
                    className="px-5 py-3.5 font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("checkIn")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                    >
                      Check-in
                      <SortArrow column="checkIn" />
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Check-out
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right font-medium">
                    Nights
                  </th>
                  <th
                    scope="col"
                    aria-sort={ariaSort("amount")}
                    className="px-5 py-3.5 text-right font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort("amount")}
                      className="inline-flex items-center gap-1.5 uppercase tracking-wide transition-colors hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                    >
                      Amount
                      <SortArrow column="amount" />
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3.5 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((b) => {
                  const meta = STATUS_META[b.status];
                  const isExpanded = expandedId === b.id;
                  return (
                    <BookingRowGroup
                      key={b.id}
                      booking={b}
                      meta={meta}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpanded(b.id)}
                    />
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile: stacked cards with the same data */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map((b) => {
              const meta = STATUS_META[b.status];
              const isExpanded = expandedId === b.id;
              return (
                <li key={b.id}>
                  <Card className="p-0">
                    <button
                      type="button"
                      onClick={() => toggleExpanded(b.id)}
                      aria-expanded={isExpanded}
                      className="w-full p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-navy-900">
                            {b.propertyName}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-500">{b.guest}</p>
                        </div>
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
                        <span>
                          {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                        </span>
                        <span>
                          {b.nights} night{b.nights === 1 ? "" : "s"}
                        </span>
                        <span className="font-medium text-navy-900">
                          {money.format(b.amount)}
                        </span>
                      </div>
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded ? (
                        <motion.div
                          key="detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-sand-300 p-5">
                            <BookingDetail booking={b} />
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </Card>
                </li>
              );
            })}
          </ul>

          {/* Pagination */}
          <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-ink-500" aria-live="polite">
              {rangeStart}–{rangeEnd} of {filtered.length} booking
              {filtered.length === 1 ? "" : "s"}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </>
      )}
    </Reveal>
  );
}

/** Data row + animated expandable detail row for the desktop table. */
function BookingRowGroup({
  booking,
  meta,
  isExpanded,
  onToggle,
}: {
  booking: BookingRow;
  meta: { label: string; tone: BadgeTone };
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const money = useMoney();
  return (
    <>
      <tr
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className={cn(
          "cursor-pointer border-b border-sand-300/60 transition-colors duration-150",
          "hover:bg-sand-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500",
          isExpanded && "bg-sand-50"
        )}
      >
        <td className="px-5 py-4 font-medium text-navy-900">
          {booking.propertyName}
        </td>
        <td className="px-5 py-4 text-ink-900">{booking.guest}</td>
        <td className="px-5 py-4 text-ink-900">{formatDate(booking.checkIn)}</td>
        <td className="px-5 py-4 text-ink-900">{formatDate(booking.checkOut)}</td>
        <td className="px-5 py-4 text-right text-ink-900">{booking.nights}</td>
        <td className="px-5 py-4 text-right font-medium text-navy-900">
          {money.format(booking.amount)}
        </td>
        <td className="px-5 py-4">
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.tr
            key="detail"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            className="border-b border-sand-300/60"
          >
            <td colSpan={7} className="p-0">
              <motion.div
                variants={{
                  open: { height: "auto", opacity: 1 },
                  collapsed: { height: 0, opacity: 0 },
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="bg-sand-50/60 px-5 py-4">
                  <BookingDetail booking={booking} />
                </div>
              </motion.div>
            </td>
          </motion.tr>
        ) : null}
      </AnimatePresence>
    </>
  );
}
