"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_FONT } from "@/lib/constants";
import { useMoney } from "@/components/currency/CurrencyProvider";
import { cn } from "@/lib/utils";

/**
 * Revenue area chart with a working 3M / 6M / 12M range toggle. Receives the
 * full 12-month series from the server and slices it client-side, so the
 * figures always match the rest of the dashboard.
 */

export interface RevenueDatum {
  key: string;
  label: string;
  labelLong: string;
  revenue: number;
}

const RANGES = [
  { id: "3m", label: "3M", months: 3 },
  { id: "6m", label: "6M", months: 6 },
  { id: "12m", label: "12M", months: 12 },
] as const;

const NICE_MULTIPLES = [1, 2, 2.5, 5, 10];

/** "€0" / "€7.5k" / "Rs 400k" / "Rs 1.25M": exact, unlike a rounded label. */
function axisLabel(shown: number, symbol: string): string {
  const [divisor, unit] =
    shown >= 1_000_000 ? [1_000_000, "M"] : shown >= 1000 ? [1000, "k"] : [1, ""];
  return `${symbol}${Number((shown / divisor).toFixed(2))}${unit}`;
}

/**
 * Y-axis props for EUR amounts shown in the visitor's currency: evenly
 * spaced ticks on a "nice" step (1, 2, 2.5 or 5 x 10^n), worked out in the
 * displayed unit so the axis reads €5k / €10k / €15k or Rs 200k / Rs 400k
 * rather than converted odd values. Ticks and domain stay in EUR, the unit
 * the data is plotted in. Spread the result onto <YAxis>.
 */
export function useMoneyAxis(valuesEur: number[], intervals = 4) {
  const money = useMoney();
  const rate = money.convert(1);
  const maxShown = Math.max(0, ...valuesEur) * rate;
  // An all-zero series still gets a sensible scale (0 to 1k).
  const top = maxShown > 0 ? maxShown : 1000;
  const raw = top / intervals;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const multiple = NICE_MULTIPLES.find((m) => m * magnitude >= raw) ?? 10;
  const step = Math.max(1, multiple * magnitude); // never below one unit
  const count = Math.max(1, Math.ceil(top / step - 1e-9));
  const ticks = Array.from({ length: count + 1 }, (_, i) => (i * step) / rate);

  return {
    domain: [0, ticks[count]] as [number, number],
    ticks,
    tickFormatter: (eur: number) => axisLabel(money.convert(eur), money.symbol),
  };
}

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string; payload?: RevenueDatum }>;
}) {
  const money = useMoney();
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 shadow-(--shadow-soft)">
      <p className="text-xs text-ink-500">{point.payload?.labelLong}</p>
      <p className="text-sm font-medium text-navy-900">
        {money.format(Number(point.value ?? 0))}
      </p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenueDatum[] }) {
  const money = useMoney();
  const [rangeId, setRangeId] = useState<(typeof RANGES)[number]["id"]>("12m");
  const months = RANGES.find((r) => r.id === rangeId)?.months ?? 12;
  const visible = data.slice(-months);
  const yAxis = useMoneyAxis(visible.map((d) => d.revenue));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg">Revenue, last 12 months</h2>
        <div
          role="group"
          aria-label="Chart range"
          className="flex rounded-full border border-sand-300 p-0.5"
        >
          {RANGES.map((range) => (
            <button
              key={range.id}
              type="button"
              aria-pressed={rangeId === range.id}
              onClick={() => setRangeId(range.id)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150",
                rangeId === range.id
                  ? "bg-navy-900 text-white"
                  : "text-ink-500 hover:text-navy-900"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-72 lining-nums tabular-nums">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={visible}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          >
            <defs>
              <linearGradient id="revenueGold" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.28}
                />
                <stop
                  offset="100%"
                  stopColor={CHART_COLORS.primary}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              dy={8}
              tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
            />
            <YAxis
              {...yAxis}
              width={money.currency === "MUR" ? 64 : 46}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
            />
            <Tooltip
              content={<RevenueTooltip />}
              cursor={{ stroke: CHART_COLORS.grid }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_COLORS.primary}
              strokeWidth={2}
              fill="url(#revenueGold)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
