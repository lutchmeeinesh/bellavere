import { Check, Minus } from "lucide-react";

type Side = {
  included: boolean;
  note?: string;
};

type Row = {
  area: string;
  owner: Side;
  bellavere: Side;
};

const ROWS: Row[] = [
  {
    area: "Guest enquiries & bookings",
    owner: { included: false },
    bellavere: { included: true, note: "Answered, vetted and confirmed for you" },
  },
  {
    area: "Pricing & yield",
    owner: { included: false },
    bellavere: { included: true, note: "Rates tuned to season, demand and events" },
  },
  {
    area: "Housekeeping & linen",
    owner: { included: false },
    bellavere: { included: true, note: "Hotel-standard turnarounds between stays" },
  },
  {
    area: "Repairs & contractors",
    owner: { included: false },
    bellavere: { included: true, note: "Vetted trades, no invoice mark-up" },
  },
  {
    area: "Statements & payouts",
    owner: { included: false },
    bellavere: { included: true, note: "One clear statement every month" },
  },
  {
    area: "Licences & insurance",
    owner: { included: false },
    bellavere: { included: true, note: "Renewals tracked and filed on time" },
  },
  {
    area: "Strategic decisions",
    owner: {
      included: true,
      note: "Approve budgets, set house rules, enjoy the returns",
    },
    bellavere: { included: false, note: "We prepare and recommend — the final say is yours" },
  },
];

function ComparisonCell({ side, accent }: { side: Side; accent: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {side.included ? (
        <>
          <Check
            className={
              accent
                ? "mt-0.5 size-4 shrink-0 text-gold-600"
                : "mt-0.5 size-4 shrink-0 text-navy-900"
            }
            aria-hidden
          />
          <span className="sr-only">Handled.</span>
        </>
      ) : (
        <>
          <Minus className="mt-0.5 size-4 shrink-0 text-ink-500/40" aria-hidden />
          <span className="sr-only">Not on this side of the table.</span>
        </>
      )}
      {side.note ? (
        <span className="text-sm leading-relaxed text-ink-900">{side.note}</span>
      ) : null}
    </div>
  );
}

/**
 * "What owners handle vs. what BellaVere handles" — the whole services page
 * in seven rows. Wide table scrolls inside its own container on small screens.
 */
export function ComparisonTable() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-300 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">
            Which responsibilities the owner keeps and which BellaVere handles
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
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-ink-500 uppercase"
              >
                You, the owner
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-gold-600 uppercase"
              >
                BellaVere
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
                  <ComparisonCell side={row.owner} accent={false} />
                </td>
                <td className="px-6 py-5 align-top">
                  <ComparisonCell side={row.bellavere} accent />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
