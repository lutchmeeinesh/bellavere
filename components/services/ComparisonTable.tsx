import { Check } from "lucide-react";

type Row = {
  area: string;
  note: string;
};

const ROWS: Row[] = [
  {
    area: "Guest enquiries & bookings",
    note: "Answered and confirmed for you",
  },
  {
    area: "Pricing & yield",
    note: "Pricing and occupancy managed for you",
  },
  {
    area: "Cleaning & housekeeping",
    note: "Cleaning and housekeeping between stays",
  },
  {
    area: "Repairs & contractors",
    note: "Supervised on site, every invoice itemised",
  },
  {
    area: "Statements & payouts",
    note: "One clear statement every month",
  },
  {
    area: "Compliance & insurance",
    note: "Compliance, insurance and utility bills handled for you",
  },
];

/**
 * "What Bellavere handles for you" — the whole services page in six rows.
 * Wide table scrolls inside its own container on small screens.
 */
export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-300 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="sr-only">
            The responsibilities Bellavere handles for you
          </caption>
          <thead>
            <tr className="border-b border-sand-300 bg-sand-100/70">
              <th
                scope="col"
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-navy-900 uppercase"
              >
                Responsibility
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-gold-700 uppercase"
              >
                Bellavere
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.area}
                className="border-b border-sand-300 transition-colors duration-150 last:border-b-0 hover:bg-sand-50"
              >
                <th
                  scope="row"
                  className="px-6 py-5 align-top text-sm font-medium text-navy-900"
                >
                  {row.area}
                </th>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-gold-700"
                      aria-hidden
                    />
                    <span className="sr-only">Handled.</span>
                    <span className="text-sm leading-relaxed text-ink-900">
                      {row.note}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
