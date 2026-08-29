/** Shared chart styling so every recharts instance looks identical. */
export const CHART_COLORS = {
  primary: "#c9a45c", // gold-500 — main series
  secondary: "#3c8dad", // sea-500 — comparison series
  navy: "#0b1f33",
  grid: "rgba(11, 31, 51, 0.08)",
  axis: "#6b6b6b", // ink-500
} as const;

export const CHART_FONT = {
  fontSize: 12,
  fontFamily: "var(--font-sans)",
} as const;
