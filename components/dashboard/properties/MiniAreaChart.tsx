"use client";

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
import { formatCurrency } from "@/lib/format";

/**
 * Compact revenue area chart for the property Financials tab. Renders the
 * exact series shown in the table above it, so the two can never disagree.
 */

export interface MiniAreaDatum {
  key: string;
  label: string;
  labelLong: string;
  revenue: number;
}

function compactEuro(value: number): string {
  return value >= 1000 ? `€${Math.round(value / 1000)}k` : `€${value}`;
}

function MiniAreaTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string; payload?: MiniAreaDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 shadow-(--shadow-soft)">
      <p className="text-xs text-ink-500">{point.payload?.labelLong}</p>
      <p className="text-sm font-medium text-navy-900">
        {formatCurrency(Number(point.value ?? 0))}
      </p>
    </div>
  );
}

export function MiniAreaChart({ data }: { data: MiniAreaDatum[] }) {
  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="miniRevenueGold" x1="0" y1="0" x2="0" y2="1">
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
            width={46}
            tickLine={false}
            axisLine={false}
            tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
            tickFormatter={(value: number) => compactEuro(value)}
          />
          <Tooltip
            content={<MiniAreaTooltip />}
            cursor={{ stroke: CHART_COLORS.grid }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#miniRevenueGold)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
