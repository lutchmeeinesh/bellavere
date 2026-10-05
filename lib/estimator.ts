import {
  ESTIMATOR_CONFIG,
  FEATURES,
  PROPERTY_TYPES,
  REGIONS,
  type EstimatorConfig,
  type Feature,
  type PropertyType,
  type Region,
} from "@/data/estimator-config";

/**
 * Rental income estimator: the pure calculation behind /estimate, plus the
 * helpers that read and write its answers in URLs. No React, no Next.js, no
 * formatting: every amount is EUR, and the numbers come from
 * data/estimator-config.ts.
 *
 *   nightly rate = base(type) × region × bedrooms factor × features factor
 *   occupancy    = high-season share × high + low-season share × low
 *   nights/year  = weeks × 7 × occupancy
 *   gross/year   = nightly rate × nights/year, shown as ±rangeSpread
 *   net to owner = gross × (1 − maxFeeRate)  ("at least": the fee is a cap)
 */

export type { Feature, PropertyType, Region };

/** A complete set of answers. */
export interface EstimatorAnswers {
  type: PropertyType;
  region: Region;
  /** 1–6; the highest value means "6 or more". */
  bedrooms: number;
  features: readonly Feature[];
  /** Weeks a year available to guests; `yearRound` (52) = all year. */
  weeks: number;
}

/** A range around a central figure. */
export interface Range {
  low: number;
  mid: number;
  high: number;
}

export interface IncomeEstimate {
  /** Central nightly rate, EUR. */
  nightlyRate: number;
  /** Blended occupancy over the available weeks (0–1). */
  occupancy: number;
  /** The weeks used (normalised). */
  weeks: number;
  /** Nights booked a year at the blended occupancy. */
  nightsPerYear: number;
  /** Gross rental income a year, EUR. */
  annual: Range;
  /** Gross rental income a month (annual / 12), EUR. */
  monthly: Range;
  /** Bellavere's fee: at most `rate` of gross income. */
  fee: { rate: number; max: Range };
  /** What stays with the owner at the maximum fee, i.e. at least this. */
  netToOwner: Range;
}

// ------------------------------------------------------------- validation

export function isPropertyType(value: unknown): value is PropertyType {
  return (PROPERTY_TYPES as readonly unknown[]).includes(value);
}

export function isRegion(value: unknown): value is Region {
  return (REGIONS as readonly unknown[]).includes(value);
}

export function isFeature(value: unknown): value is Feature {
  return (FEATURES as readonly unknown[]).includes(value);
}

/** Whole number of bedrooms within the configured bounds (1–6). */
export function clampBedrooms(
  value: number,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  const { min, max } = config.bedrooms;
  if (!Number.isFinite(value)) return config.bedrooms.default;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Whole weeks a year: anything from `yearRound` (52) up means year-round;
 * below that, the part-year bounds (4–48) apply.
 */
export function normalizeWeeks(
  value: number,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  const { yearRound, min, max } = config.weeks;
  if (!Number.isFinite(value)) return config.weeks.default;
  const weeks = Math.round(value);
  if (weeks >= yearRound) return yearRound;
  return Math.min(max, Math.max(min, weeks));
}

/** Known features, each once, in the configured display order. */
export function normalizeFeatures(values: readonly unknown[]): Feature[] {
  return FEATURES.filter((feature) => values.includes(feature));
}

// ------------------------------------------------------------ calculation

/** Share of the year that is high season: 6 months of 12 → 0.5. */
export function highSeasonShare(
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  const months = new Set(
    config.occupancy.highSeasonMonths.filter((m) => m >= 1 && m <= 12),
  );
  return months.size / 12;
}

/** Occupancy over weeks spread across the year in proportion to the seasons. */
export function blendedOccupancy(
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  const share = highSeasonShare(config);
  return share * config.occupancy.high + (1 - share) * config.occupancy.low;
}

/** Bedrooms factor: 1 up to `included`, then +perBedroomAbove per bedroom. */
export function bedroomsFactor(
  bedrooms: number,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  const extra = Math.max(0, clampBedrooms(bedrooms, config) - config.bedrooms.included);
  return 1 + config.bedrooms.perBedroomAbove * extra;
}

/** Features factor: the uplifts add up, then apply once. */
export function featuresFactor(
  features: readonly Feature[],
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  return (
    1 +
    normalizeFeatures(features).reduce(
      (sum, feature) => sum + config.featureUplift[feature],
      0,
    )
  );
}

/** Central nightly rate, EUR. */
export function nightlyRate(
  answers: Pick<EstimatorAnswers, "type" | "region" | "bedrooms" | "features">,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number {
  return (
    config.baseNightly[answers.type] *
    config.regionMultiplier[answers.region] *
    bedroomsFactor(answers.bedrooms, config) *
    featuresFactor(answers.features, config)
  );
}

function range(mid: number, spread: number): Range {
  return { low: mid * (1 - spread), mid, high: mid * (1 + spread) };
}

function scale(r: Range, factor: number): Range {
  return { low: r.low * factor, mid: r.mid * factor, high: r.high * factor };
}

/** The estimate for a set of answers. All amounts EUR, unrounded. */
export function estimateIncome(
  answers: EstimatorAnswers,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): IncomeEstimate {
  const rate = nightlyRate(answers, config);
  const occupancy = blendedOccupancy(config);
  const weeks = normalizeWeeks(answers.weeks, config);
  const nightsPerYear = weeks * 7 * occupancy;
  const annual = range(rate * nightsPerYear, config.rangeSpread);
  const feeRate = config.maxFeeRate;

  return {
    nightlyRate: rate,
    occupancy,
    weeks,
    nightsPerYear,
    annual,
    monthly: scale(annual, 1 / 12),
    fee: { rate: feeRate, max: scale(annual, feeRate) },
    netToOwner: scale(annual, 1 - feeRate),
  };
}

// ---------------------------------------------------------------- seasons

/**
 * First and last month (1–12) of a run of months that may wrap the new
 * year: [11, 12, 1, 2, 3, 4] → { from: 11, to: 4 }. Null for none or all
 * twelve months.
 */
export function seasonSpan(
  months: readonly number[],
): { from: number; to: number } | null {
  const set = new Set(months.filter((m) => m >= 1 && m <= 12));
  if (set.size === 0 || set.size === 12) return null;
  const previous = (m: number) => (m === 1 ? 12 : m - 1);
  const next = (m: number) => (m === 12 ? 1 : m + 1);
  const from = [...set].find((m) => !set.has(previous(m)));
  const to = [...set].find((m) => !set.has(next(m)));
  return from !== undefined && to !== undefined ? { from, to } : null;
}

/** The months that are not high season, in calendar order. */
export function lowSeasonMonths(
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): number[] {
  const high = new Set(config.occupancy.highSeasonMonths);
  return Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => !high.has(m));
}

/** High and low season spans of the config, e.g. Nov–Apr and May–Oct. */
export function seasons(config: EstimatorConfig = ESTIMATOR_CONFIG) {
  return {
    high: seasonSpan(config.occupancy.highSeasonMonths),
    low: seasonSpan(lowSeasonMonths(config)),
  };
}

/**
 * A date in the middle of a month (1–12), for month names in messages
 * (`{from, date, ::MMM}`): mid-month at noon UTC falls in the same month in
 * every time zone.
 */
export function monthDate(month: number): Date {
  return new Date(Date.UTC(2000, month - 1, 15, 12));
}

/** First and last months of both seasons as dates, for the wording. */
export function seasonDates(config: EstimatorConfig = ESTIMATOR_CONFIG) {
  const { high, low } = seasons(config);
  return {
    highFrom: monthDate(high?.from ?? 1),
    highTo: monthDate(high?.to ?? 12),
    lowFrom: monthDate(low?.from ?? 1),
    lowTo: monthDate(low?.to ?? 12),
  };
}

// ---------------------------------------------------------------- display

/**
 * Rounds an amount (already in the display currency) to three significant
 * figures, in whole units: 39,327 → 39,300; 3,277 → 3,280; 2,045,004 →
 * 2,050,000. An estimate shouldn't look more precise than it is.
 */
export function roundForDisplay(value: number): number {
  return roundTo(value, displayStep(value));
}

/** The rounding step roundForDisplay uses for a value (at least 1). */
export function displayStep(value: number): number {
  const magnitude = Math.abs(value);
  if (!Number.isFinite(magnitude) || magnitude < 1) return 1;
  return Math.max(1, 10 ** (Math.floor(Math.log10(magnitude)) - 2));
}

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * The yearly breakdown as shown to the visitor, in the display currency:
 * gross rounded for display, the maximum fee rounded to the same step, and
 * the net as their difference, so the three lines always add up.
 * `convert` turns EUR into the display currency.
 */
export function displayBreakdown(
  estimate: Pick<IncomeEstimate, "annual" | "fee">,
  convert: (eur: number) => number = (eur) => eur,
) {
  const line = (eur: number) => {
    const gross = roundForDisplay(convert(eur));
    const fee = roundTo(gross * estimate.fee.rate, displayStep(gross));
    return { gross, fee, net: gross - fee };
  };
  const low = line(estimate.annual.low);
  const high = line(estimate.annual.high);
  return {
    gross: { low: low.gross, high: high.gross },
    fee: { low: low.fee, high: high.fee },
    net: { low: low.net, high: high.net },
  };
}

// ------------------------------------------------------------ URL params

/**
 * Answers found in a query string ("?type=villa&region=north&bedrooms=3
 * &features=privatePool,seaView&weeks=26"). Unknown or malformed values are
 * left out; bedrooms are clamped to 1–6 and weeks normalised (52+ =
 * year-round, otherwise 4–48). An empty `features=` means "none".
 */
export function parseEstimatorParams(
  search: string | URLSearchParams,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): Partial<EstimatorAnswers> {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const answers: Partial<EstimatorAnswers> = {};

  const type = params.get("type");
  if (isPropertyType(type)) answers.type = type;

  const region = params.get("region");
  if (isRegion(region)) answers.region = region;

  const bedrooms = parseWholeNumber(params.get("bedrooms"));
  if (bedrooms !== null) answers.bedrooms = clampBedrooms(bedrooms, config);

  const features = params.get("features");
  if (features !== null) {
    answers.features = normalizeFeatures(
      features.split(",").map((feature) => feature.trim()),
    );
  }

  const weeks = parseWholeNumber(params.get("weeks"));
  if (weeks !== null && weeks > 0) answers.weeks = normalizeWeeks(weeks, config);

  return answers;
}

/** "3" or "6+" → 3 / 6; anything else ("", "abc", "2.5", "3x") → null. */
function parseWholeNumber(value: string | null): number | null {
  if (value === null) return null;
  const match = /^\s*(-?\d+)\+?\s*$/.exec(value);
  return match ? Number(match[1]) : null;
}

/** True when every answer the estimate needs is present. */
export function isCompleteAnswers(
  answers: Partial<EstimatorAnswers>,
): answers is EstimatorAnswers {
  return (
    answers.type !== undefined &&
    answers.region !== undefined &&
    answers.bedrooms !== undefined &&
    answers.features !== undefined &&
    answers.weeks !== undefined
  );
}

/** Query parameters for the answers given (the inverse of parseEstimatorParams). */
export function estimatorSearchParams(
  answers: Partial<EstimatorAnswers>,
): URLSearchParams {
  const params = new URLSearchParams();
  if (answers.type) params.set("type", answers.type);
  if (answers.region) params.set("region", answers.region);
  if (answers.bedrooms !== undefined) params.set("bedrooms", String(answers.bedrooms));
  if (answers.features !== undefined) {
    params.set("features", normalizeFeatures(answers.features).join(","));
  }
  if (answers.weeks !== undefined) params.set("weeks", String(answers.weeks));
  return params;
}

/** Value of `source` that marks a contact enquiry started from the estimator. */
export const ESTIMATE_SOURCE = "estimate";

/**
 * Query string for the contact page after an estimate:
 * "source=estimate&type=villa&region=north&bedrooms=3&features=privatePool
 * &weeks=52&low=63391&high=85765" (low/high: gross a year, whole EUR).
 */
export function contactSearchParams(
  answers: EstimatorAnswers,
  estimate: Pick<IncomeEstimate, "annual">,
): URLSearchParams {
  const params = new URLSearchParams({ source: ESTIMATE_SOURCE });
  for (const [key, value] of estimatorSearchParams(answers)) {
    params.append(key, value);
  }
  params.set("low", String(Math.round(estimate.annual.low)));
  params.set("high", String(Math.round(estimate.annual.high)));
  return params;
}

/** What the contact form can pre-fill after an estimate. */
export interface EstimatePrefill {
  answers: Partial<EstimatorAnswers>;
  /**
   * Gross income a year, EUR: recalculated from the answers when they are
   * complete (so it matches the estimate shown), otherwise the URL's
   * low/high when they make sense; null when neither is available.
   */
  annual: { low: number; high: number } | null;
}

/** Upper bound for low/high read from a URL (EUR a year). */
const MAX_PLAUSIBLE_ANNUAL = 10_000_000;

/**
 * Reads a contact-page query string. Null unless `source=estimate`; invalid
 * values are ignored.
 */
export function parseEstimatePrefill(
  search: string | URLSearchParams,
  config: EstimatorConfig = ESTIMATOR_CONFIG,
): EstimatePrefill | null {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  if (params.get("source") !== ESTIMATE_SOURCE) return null;

  const answers = parseEstimatorParams(params, config);
  if (isCompleteAnswers(answers)) {
    const { annual } = estimateIncome(answers, config);
    return { answers, annual: { low: annual.low, high: annual.high } };
  }

  const low = Number(params.get("low"));
  const high = Number(params.get("high"));
  const valid =
    params.get("low") !== null &&
    params.get("high") !== null &&
    Number.isFinite(low) &&
    Number.isFinite(high) &&
    low > 0 &&
    low <= high &&
    high <= MAX_PLAUSIBLE_ANNUAL;
  return { answers, annual: valid ? { low, high } : null };
}
