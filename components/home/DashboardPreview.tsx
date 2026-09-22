"use client";

import { motion } from "framer-motion";
import type { ClientKpis, RevenuePoint } from "@/lib/metrics";
import { formatPercent } from "@/lib/format";
import { useMoney } from "@/components/currency/CurrencyProvider";

/**
 * Self-contained, non-interactive "screenshot" of the owner dashboard,
 * rendered with real numbers from lib/metrics (no recharts — the sparkline
 * is a hand-drawn SVG path to keep home-page JS light).
 */

/** Smooth quadratic path through the revenue points. */
function sparklinePaths(values: number[], width: number, height: number) {
  const pad = 4;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (width - pad * 2),
    y: height - pad - ((v - min) / range) * (height - pad * 2),
  }));

  let line = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    line += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  line += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

  const area = `${line} L ${last.x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;
  return { line, area };
}

function Delta({ value, unit }: { value: number | null; unit: string }) {
  if (value === null) return null;
  return (
    <p
      className={
        value >= 0 ? "text-[9px] text-success-700" : "text-[9px] text-danger-700"
      }
    >
      {value >= 0 ? "+" : ""}
      {value}
      {unit} vs last month
    </p>
  );
}

export function DashboardPreview({
  kpis,
  revenue,
}: {
  kpis: ClientKpis;
  revenue: RevenuePoint[];
}) {
  const money = useMoney();
  const { line, area } = sparklinePaths(
    revenue.map((p) => p.revenue),
    260,
    64
  );
  const currentMonth = revenue[revenue.length - 1];

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        role="img"
        aria-label="Preview of the Bellavere owner dashboard showing live revenue, occupancy and bookings"
        className="rounded-2xl border border-sand-300 bg-white shadow-(--shadow-soft) will-change-transform"
        whileHover={{ rotateX: 4, rotateY: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className="pointer-events-none flex select-none overflow-hidden rounded-2xl"
          aria-hidden
        >
          {/* Navy sidebar sliver */}
          <div className="flex w-11 shrink-0 flex-col items-center gap-4 bg-navy-900 py-5">
            <span className="size-2.5 rounded-full bg-gold-500" />
            <span className="mt-3 size-1.5 rounded-full bg-gold-500" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
            <span className="size-1.5 rounded-full bg-white/30" />
          </div>

          <div className="flex-1 bg-sand-50">
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-sand-300 bg-white px-4 py-2.5">
              <p className="text-[11px] font-medium text-ink-900">
                Good morning, Sophie
              </p>
              <span className="flex size-6 items-center justify-center rounded-full bg-navy-900 text-[9px] font-medium text-gold-500">
                SL
              </span>
            </div>

            <div className="space-y-3 p-4">
              {/* KPI tiles */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    Revenue · {currentMonth.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {money.format(kpis.revenueThisMonth)}
                  </p>
                  <Delta value={kpis.revenueDelta} unit="%" />
                </div>
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    Occupancy
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {formatPercent(kpis.occupancyThisMonth)}
                  </p>
                  <Delta value={kpis.occupancyDelta} unit=" pts" />
                </div>
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    Check-ins · 7d
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {kpis.upcomingCheckIns}
                  </p>
                  <p className="text-[9px] text-ink-500">
                    {kpis.openTickets} open ticket{kpis.openTickets === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Revenue sparkline */}
              <div className="rounded-lg border border-sand-300 bg-white p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    Revenue — last 12 months
                  </p>
                  <p className="text-[9px] text-ink-500">
                    {revenue[0].label} – {currentMonth.label}
                  </p>
                </div>
                <svg
                  viewBox="0 0 260 64"
                  preserveAspectRatio="none"
                  className="mt-2 h-16 w-full"
                >
                  <path d={area} fill="var(--gold-500)" opacity="0.12" />
                  <path
                    d={line}
                    fill="none"
                    stroke="var(--gold-500)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
