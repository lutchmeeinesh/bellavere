import { useId } from "react";
import { REGIONS, type Region } from "@/data/estimator-config";
import { cn } from "@/lib/utils";

/**
 * Outline of Mauritius, traced from the client's coverage map
 * (public/images/coverage-map.webp) and smoothed. North is up.
 */
const ISLAND_PATH =
  "M177.5 8.5C181.6 7.3 187.5 5.3 192.5 5C197.5 4.7 202.9 5.4 207.5 6.5C212.1 7.6 216.7 9.3 220 11.5C223.3 13.8 225.4 16.5 227.5 20C229.6 23.5 230.8 28.3 232.5 32.5C234.2 36.7 235.4 41.3 237.5 45C239.6 48.8 242.5 51.7 245 55C247.5 58.3 250 61.4 252.5 65C255 68.6 257.1 72.9 260 76.5C262.9 80.1 267.2 83.5 270 86.5C272.8 89.5 275.5 91.4 277 94.5C278.5 97.6 279.1 101.6 279 105C278.9 108.4 276.7 111.7 276.5 115C276.3 118.3 276.8 121.7 278 125C279.3 128.3 281.6 131.4 284 135C286.4 138.6 289.4 142.8 292.5 146.5C295.6 150.3 300 154.4 302.5 157.5C305 160.6 307.3 162.3 307.5 165C307.8 167.7 305.6 170.4 304 173.5C302.4 176.6 299.7 179.9 298 183.5C296.3 187.1 295.2 191 294 195C292.8 199 292.1 203.3 291 207.5C289.9 211.7 288.2 216.4 287.5 220C286.8 223.6 286.5 226.5 287 229C287.5 231.5 291.3 233.3 290.5 235C289.7 236.8 285 237.8 282 239.5C279 241.3 275.8 242.9 272.5 245.5C269.3 248.1 265.6 251.8 262.5 255C259.4 258.3 256 261.8 254 265C252 268.2 250.7 270.7 250.5 274C250.3 277.3 251.8 281.8 253 285C254.3 288.3 256.6 290.6 258 293.5C259.4 296.4 262.3 300.2 261.5 302.5C260.8 304.8 256.4 306.3 253.5 307.5C250.6 308.8 247.3 308.9 244 310C240.8 311.1 237.3 312.2 234 314C230.7 315.8 227.3 318.3 224 321C220.7 323.7 217.5 327.2 214 330C210.5 332.8 207.2 335.6 203 338C198.8 340.4 193.8 342.8 189 344.5C184.2 346.2 179.3 347.1 174 348C168.7 348.9 162.8 349.7 157 350C151.2 350.3 144.8 350.3 139 350C133.2 349.8 127.7 349.1 122 348.5C116.3 347.9 110.8 346.8 105 346.5C99.3 346.2 93 346.4 87.5 346.5C82 346.6 76.8 347.3 72 347C67.3 346.7 63.2 345.8 59 344.5C54.8 343.3 50.7 341.4 47 339.5C43.3 337.6 40.3 335 37 333C33.7 331 30.7 329.3 27 327.5C23.3 325.7 18.4 323.9 15 322C11.6 320.1 8.2 318.3 6.5 316C4.8 313.8 4.3 310.6 5 308.5C5.7 306.4 7.9 304.6 10.5 303.5C13.1 302.4 17.4 303.3 20.5 302C23.6 300.8 26.8 298.5 29 296C31.2 293.5 32.3 290.1 33.5 287C34.7 283.9 35.1 280.8 36 277.5C36.9 274.3 38.3 270.8 39 267.5C39.8 264.2 40.5 260.8 40.5 257.5C40.5 254.2 39 250.8 39 247.5C39 244.2 40 240.8 40.5 237.5C41 234.2 42.1 230.8 42 227.5C41.9 224.2 40.2 220.8 40 217.5C39.8 214.2 40.3 210.8 41 207.5C41.7 204.2 42.6 200.8 44 197.5C45.4 194.3 47.9 191.3 49.5 188C51.1 184.8 52.2 181.3 53.5 178C54.8 174.7 56 171.2 57.5 168C59 164.8 60.4 161.8 62.5 159C64.6 156.3 67.3 154 70 151.5C72.8 149 76 146.3 79 144C82 141.7 84.9 139.8 88 137.5C91.1 135.3 94.7 132.8 97.5 130.5C100.3 128.2 102.6 125.8 105 123.5C107.4 121.3 109.8 119.3 112 117C114.3 114.8 116.6 112.6 118.5 110C120.4 107.4 122.4 104.6 123.5 101.5C124.6 98.4 124.9 94.7 125 91.5C125.1 88.3 123.8 85.7 124 82.5C124.2 79.3 125.2 75.8 126 72.5C126.8 69.2 128 65.8 129 62.5C130 59.2 130.9 55.8 132 52.5C133.1 49.2 133.9 45.8 135.5 42.5C137.1 39.3 139.1 35.9 141.5 33C143.9 30.1 147.1 27.4 150 25C152.9 22.6 156 20.6 159 18.5C162 16.4 164.9 14.2 168 12.5C171.1 10.8 173.4 9.8 177.5 8.5Z";

/** Where each region sits on the outline (viewBox units). */
const REGION_POINTS: Record<Region, { x: number; y: number }> = {
  north: { x: 180, y: 42.5 },
  west: { x: 66, y: 190 },
  east: { x: 274, y: 153.5 },
  south: { x: 107.5, y: 330 },
  centre: { x: 156, y: 185 },
};

/**
 * Stylised map of the island beside the region choice: the selected (or
 * hovered) region glows gold. Purely decorative — the radio list next to it
 * is the control — so it is hidden from assistive technology.
 */
export function IslandMap({
  selected,
  highlighted,
  className,
}: {
  selected?: Region;
  /** Region under the pointer or keyboard focus, previewed more softly. */
  highlighted?: Region | null;
  className?: string;
}) {
  const id = useId();
  const clipId = `${id}-island`;
  const glowId = `${id}-glow`;
  const active = highlighted ?? selected;
  const point = active ? REGION_POINTS[active] : null;

  return (
    <svg
      viewBox="0 0 313 355"
      className={cn("h-auto w-full", className)}
      aria-hidden
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={ISLAND_PATH} />
        </clipPath>
        <radialGradient id={glowId}>
          <stop offset="0%" style={{ stopColor: "var(--gold-500)", stopOpacity: 0.55 }} />
          <stop offset="100%" style={{ stopColor: "var(--gold-500)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <path d={ISLAND_PATH} className="fill-sand-100 stroke-sand-300" strokeWidth={1.5} />

      {/* The glow slides between regions (CSS transition; instant with reduced motion). */}
      <g clipPath={`url(#${clipId})`}>
        <circle
          r={85}
          fill={`url(#${glowId})`}
          className="transition-[transform,opacity] duration-500 ease-out"
          style={{
            transform: `translate(${point?.x ?? 156}px, ${point?.y ?? 185}px)`,
            opacity: point ? (highlighted && highlighted !== selected ? 0.6 : 1) : 0,
          }}
        />
      </g>

      {REGIONS.map((region) => {
        const { x, y } = REGION_POINTS[region];
        const isSelected = region === selected;
        const isActive = region === active;
        return (
          <g key={region}>
            {isSelected ? (
              <circle
                cx={x}
                cy={y}
                r={13}
                className="fill-none stroke-gold-500/50"
                strokeWidth={1.5}
              />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={isSelected ? 7 : 5}
              className={cn(
                "transition-colors duration-300",
                isSelected
                  ? "fill-gold-500"
                  : isActive
                    ? "fill-gold-700"
                    : "fill-navy-900/25",
              )}
            />
          </g>
        );
      })}
    </svg>
  );
}
