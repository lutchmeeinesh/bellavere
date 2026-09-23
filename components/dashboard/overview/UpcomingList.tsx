import { formatDateWeekday } from "@/lib/format";
import { Money } from "@/components/currency/Money";

/**
 * "Next 7 days" arrivals list on the overview. Receives bookings already
 * joined with their property names by the server page.
 */

export interface UpcomingArrival {
  id: string;
  propertyName: string;
  guest: string;
  checkIn: string;
  nights: number;
  amount: number;
}

export function UpcomingList({ items }: { items: UpcomingArrival[] }) {
  return (
    <div>
      <h2 className="text-lg">Next 7 days</h2>
      <p className="mt-0.5 text-xs text-ink-500">Upcoming arrivals</p>

      {items.length === 0 ? (
        <p className="mt-6 rounded-xl bg-sand-50 px-4 py-6 text-center text-sm text-ink-500">
          No arrivals in the next 7 days
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-sand-300/60">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 py-3.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-navy-900">
                  {item.propertyName}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-500">
                  {item.guest} · {formatDateWeekday(item.checkIn)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium text-navy-900">
                  <Money eur={item.amount} />
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {item.nights} {item.nights === 1 ? "night" : "nights"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
