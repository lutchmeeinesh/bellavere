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

const PERCENT_TICKS = [0, 25, 50, 75, 100];

export interface OccupancyDatum {
  name: string;
  occupancy: number;
}

/** Average width of one 12px Inter character, for fitting labels to bars. */
const CHAR_WIDTH = 6.5;

/** Splits a name into at most `maxLines` lines of `perLine` characters. */
function wrapLabel(name: string, perLine: number, maxLines = 2): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of name.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= perLine) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, maxLines).map((l) =>
    l.length > perLine ? `${l.slice(0, perLine - 1)}…` : l
  );
  if (lines.length > maxLines) {
    const last = shown[maxLines - 1];
    shown[maxLines - 1] = `${last.slice(0, Math.max(1, perLine - 1))}…`;
  }
  return shown;
}

/**
 * Property names under the bars, wrapped onto two lines to fit each bar's
 * slot, so five properties on a narrow card don't run into each other. The
 * tooltip shows the full name.
 */
function PropertyTick({
  x,
  y,
  payload,
  width,
  visibleTicksCount,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  width?: number;
  visibleTicksCount?: number;
}) {
  const slot = (width ?? 0) / Math.max(1, visibleTicksCount ?? 1);
  const perLine = Math.max(4, Math.floor((slot - 6) / CHAR_WIDTH));
  const lines = wrapLabel(String(payload?.value ?? ""), perLine);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill={CHART_COLORS.axis}
      style={CHART_FONT}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={14}>
          {line}
        </tspan>
      ))}
    </text>
  );
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
      <h2 className="text-lg">Occupancy by property</h2>
      <p className="mt-0.5 text-xs text-ink-500">This month</p>

      <div className="mt-4 h-72 lining-nums tabular-nums">
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
              interval={0}
              height={44}
              tick={<PropertyTick />}
            />
            <YAxis
              width={44}
              domain={[0, 100]}
              ticks={PERCENT_TICKS}
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
