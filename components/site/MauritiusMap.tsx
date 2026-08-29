import { cn } from "@/lib/utils";

interface Marker {
  /** Percent-ish coordinates in the 300x420 viewBox. */
  x: number;
  y: number;
  label: string;
}

const DEFAULT_MARKERS: Marker[] = [
  { x: 172, y: 52, label: "Cap Malheureux" },
  { x: 138, y: 74, label: "Grand Baie" },
  { x: 158, y: 62, label: "Pereybere" },
  { x: 108, y: 92, label: "Trou aux Biches" },
  { x: 118, y: 82, label: "Mont Choisy" },
  { x: 62, y: 196, label: "Albion" },
  { x: 58, y: 238, label: "Flic-en-Flac" },
  { x: 66, y: 292, label: "Tamarin" },
  { x: 74, y: 318, label: "Rivière Noire" },
];

/**
 * Stylised coverage map of Mauritius (static SVG placeholder).
 * TODO: confirm with client — replace with an embedded map once the exact
 * office address and coverage area are confirmed.
 */
export function MauritiusMap({
  className,
  markers = DEFAULT_MARKERS,
  showLabels = true,
}: {
  className?: string;
  markers?: Marker[];
  showLabels?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 300 420"
      role="img"
      aria-label="Map of Mauritius showing BellaVere's coverage on the north and west coasts"
      className={cn("h-auto w-full", className)}
    >
      {/* Island silhouette (simplified) */}
      <path
        d="M168 38
           C 196 30 224 52 232 84
           C 244 110 252 140 248 174
           C 258 202 254 238 240 266
           C 232 300 214 330 190 352
           C 168 372 138 380 112 368
           C 88 356 72 332 64 304
           C 52 276 46 246 52 216
           C 46 186 54 156 68 132
           C 80 106 98 82 122 64
           C 136 50 152 42 168 38 Z"
        fill="var(--sand-100)"
        stroke="var(--sand-300)"
        strokeWidth="2"
      />
      {/* Reef line */}
      <path
        d="M168 24
           C 202 16 236 42 246 80
           C 260 110 268 142 263 178
           C 273 206 268 244 253 274
           C 244 310 224 342 197 366
           C 172 389 137 397 107 383
           C 79 370 61 343 52 312
           C 39 282 33 250 39 218
           C 33 185 42 152 57 126
           C 70 98 90 71 116 52
           C 132 36 150 28 168 24 Z"
        fill="none"
        stroke="var(--sea-500)"
        strokeWidth="1.5"
        strokeDasharray="3 6"
        opacity="0.5"
      />
      {markers.map((m) => (
        <g key={m.label}>
          <circle cx={m.x} cy={m.y} r="5" fill="var(--gold-500)" />
          <circle
            cx={m.x}
            cy={m.y}
            r="9"
            fill="none"
            stroke="var(--gold-500)"
            strokeWidth="1"
            opacity="0.4"
          />
          {showLabels ? (
            <text
              x={m.x + 14}
              y={m.y + 4}
              fontSize="11"
              fill="var(--ink-500)"
              fontFamily="var(--font-sans)"
            >
              {m.label}
            </text>
          ) : null}
        </g>
      ))}
    </svg>
  );
}
