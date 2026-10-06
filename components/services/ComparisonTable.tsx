import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { company } from "@/data/company";

/** Row ids, in display order; each row's text is `services.comparison.rows.<id>`. */
const ROWS = [
  "bookings",
  "pricing",
  "cleaning",
  "repairs",
  "statements",
  "compliance",
] as const;

/**
 * "What Bellavere handles for you" — the whole services page in six rows.
 * Wide table scrolls inside its own container on small screens.
 */
export function ComparisonTable() {
  const t = useTranslations("services.comparison");
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-300 bg-white">
      {/* Focusable, so keyboard users can scroll it when it overflows; named
          after the table. The focus ring is drawn inside the rounded frame. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={t("caption")}
        className="overflow-x-auto rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold-500"
      >
        <table className="w-full min-w-[480px] border-collapse text-left">
          <caption className="sr-only">{t("caption")}</caption>
          <thead>
            <tr className="border-b border-sand-300 bg-sand-100/70">
              <th
                scope="col"
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-navy-900 uppercase"
              >
                {t("responsibility")}
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-xs font-semibold tracking-(--tracking-label) text-gold-700 uppercase"
              >
                {company.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((id) => (
              <tr
                key={id}
                className="border-b border-sand-300 transition-colors duration-150 last:border-b-0 hover:bg-sand-50"
              >
                <th
                  scope="row"
                  className="px-6 py-5 align-top text-sm font-medium text-navy-900"
                >
                  {t(`rows.${id}.area`)}
                </th>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-gold-700"
                      aria-hidden
                    />
                    <span className="sr-only">{t("handled")}</span>
                    <span className="text-sm leading-relaxed text-ink-900">
                      {t(`rows.${id}.note`)}
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
