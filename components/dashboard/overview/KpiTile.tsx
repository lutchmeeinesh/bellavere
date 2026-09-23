import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { MoneyCountUp } from "@/components/currency/Money";
import { cn } from "@/lib/utils";

/**
 * Single KPI tile: small label, big counted-up figure and an optional
 * delta-vs-last-month row. Pass `delta: null` to render the em-dash state;
 * omit `delta` entirely to hide the row.
 */
export function KpiTile({
  label,
  value,
  prefix,
  suffix,
  money = false,
  icon: Icon,
  delta,
  deltaSuffix = "%",
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  /** Treat `value` as an EUR amount shown in the visitor's currency. */
  money?: boolean;
  icon: LucideIcon;
  /** number = show trend; null = show "—"; undefined = no delta row. */
  delta?: number | null;
  deltaSuffix?: string;
}) {
  const showDeltaRow = delta !== undefined;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-(--tracking-label) text-ink-500">
          {label}
        </p>
        <span
          aria-hidden
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-700"
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 font-serif text-3xl font-semibold text-navy-900 lining-nums tabular-nums lg:text-4xl">
        {money ? (
          <MoneyCountUp eur={value} />
        ) : (
          <CountUp value={value} prefix={prefix} suffix={suffix} />
        )}
      </p>
      {showDeltaRow ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs tabular-nums">
          {delta === null ? (
            <span className="text-ink-500">—</span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                delta >= 0 ? "text-success-700" : "text-danger-700"
              )}
            >
              {delta >= 0 ? (
                <TrendingUp className="size-3.5" aria-hidden />
              ) : (
                <TrendingDown className="size-3.5" aria-hidden />
              )}
              {delta > 0 ? "+" : ""}
              {delta}
              {deltaSuffix}
            </span>
          )}
          <span className="text-ink-500">vs last month</span>
        </p>
      ) : null}
    </Card>
  );
}
