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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg">Revenue, last 12 months</h3>
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

      <div className="mt-4 h-72">
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
              width={money.currency === "MUR" ? 64 : 46}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
              tickFormatter={(value: number) => money.formatCompact(value)}
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
