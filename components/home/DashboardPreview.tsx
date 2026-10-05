"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import type { ClientKpis, RevenuePoint } from "@/lib/metrics";
import { formatPercent } from "@/lib/format";
import { useMoney } from "@/components/currency/CurrencyProvider";

/**
 * Self-contained, non-interactive "screenshot" of the owner dashboard,
 * rendered with real numbers from lib/metrics (no recharts — the sparkline
 * is a hand-drawn SVG path to keep home-page JS light). Labels: messages
 * `home.dashboardPreview.*`; amounts and percentages are formatted in the
 * page's language, and the month labels arrive translated from the server.
 */

/** kpisForClient counts the arrivals of the next 7 days. */
const CHECK_IN_DAYS = 7;

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

function Delta({
  value,
  unit,
}: {
  value: number | null;
  unit: "percent" | "points";
}) {
  const t = useTranslations("home.dashboardPreview.delta");
  if (value === null) return null;
  return (
    <p
      className={
        value >= 0 ? "text-[9px] text-success-700" : "text-[9px] text-danger-700"
      }
    >
      {t(unit, { delta: `${value >= 0 ? "+" : ""}${value}` })}
    </p>
  );
}

export function DashboardPreview({
  kpis,
  revenue,
  owner,
}: {
  kpis: ClientKpis;
  /** Month labels already in the page's language. */
  revenue: RevenuePoint[];
  /** The demo owner greeted in the top bar. */
  owner: { firstName: string; initials: string };
}) {
  const t = useTranslations("home.dashboardPreview");
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
        aria-label={t("label")}
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
                {t("greeting", { name: owner.firstName })}
              </p>
              <span className="flex size-6 items-center justify-center rounded-full bg-navy-900 text-[9px] font-medium text-gold-500">
                {owner.initials}
              </span>
            </div>

            <div className="space-y-3 p-4">
              {/* KPI tiles */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    {t("revenue", { month: currentMonth.label })}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {money.format(kpis.revenueThisMonth)}
                  </p>
                  <Delta value={kpis.revenueDelta} unit="percent" />
                </div>
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    {t("occupancy")}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {formatPercent(kpis.occupancyThisMonth, 0, money.locale)}
                  </p>
                  <Delta value={kpis.occupancyDelta} unit="points" />
                </div>
                <div className="rounded-lg border border-sand-300 bg-white p-2.5">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    {t("checkIns", { days: CHECK_IN_DAYS })}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-navy-900">
                    {kpis.upcomingCheckIns}
                  </p>
                  <p className="text-[9px] text-ink-500">
                    {t("openTickets", { count: kpis.openTickets })}
                  </p>
                </div>
              </div>

              {/* Revenue sparkline */}
              <div className="rounded-lg border border-sand-300 bg-white p-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[9px] uppercase tracking-wider text-ink-500">
                    {t("revenueTrend", { months: revenue.length })}
                  </p>
                  <p className="text-[9px] text-ink-500">
                    {t("monthRange", {
                      from: revenue[0].label,
                      to: currentMonth.label,
                    })}
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
