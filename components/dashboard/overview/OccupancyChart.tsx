"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS, CHART_FONT } from "@/lib/constants";
import { formatPercent } from "@/lib/format";

/** This month's occupancy per property, as calm sea-blue bars. */

export interface OccupancyDatum {
  name: string;
  occupancy: number;
}

function truncate(name: string, max = 12): string {
  return name.length > max ? `${name.slice(0, max - 1)}…` : name;
}

function OccupancyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: number | string; payload?: OccupancyDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  return (
    <div className="rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 shadow-(--shadow-soft)">
      <p className="text-xs text-ink-500">{point.payload?.name}</p>
      <p className="text-sm font-medium text-navy-900">
        {formatPercent(Number(point.value ?? 0))} occupied
      </p>
    </div>
  );
}

export function OccupancyChart({ data }: { data: OccupancyDatum[] }) {
  return (
    <div>
      <h3 className="text-lg">Occupancy by property</h3>
      <p className="mt-0.5 text-xs text-ink-500">This month</p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              dy={8}
              interval={0}
              tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
              tickFormatter={(value: string) => truncate(String(value))}
            />
            <YAxis
              width={38}
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: CHART_COLORS.axis, ...CHART_FONT }}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              content={<OccupancyTooltip />}
              cursor={{ fill: CHART_COLORS.grid }}
            />
            <Bar
              dataKey="occupancy"
              fill={CHART_COLORS.secondary}
              radius={[6, 6, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
