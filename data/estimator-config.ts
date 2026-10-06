import { company } from "@/data/company";

/**
 * Rental income estimator (/estimate): every number the calculation uses,
 * so the figures can be tuned here without touching lib/estimator.ts.
 *
 * Amounts are EUR (the site converts them for display, see lib/format.ts).
 * Wording (property types, region names and example towns, features) lives
 * in messages/<locale>.json (`estimator.*`) under the same ids.
 */

/** Property types, in the order the estimator shows them. */
export const PROPERTY_TYPES = ["villa", "apartment", "penthouse"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

/**
 * Regions, in display order. Example towns (messages
 * `estimator.regions.<id>.towns`): north Grand Baie, Pereybère; west Flic en
 * Flac, Tamarin, Black River; east Belle Mare, Trou d'Eau Douce; south Bel
 * Ombre; centre Moka, Curepipe and the rest of the island.
 */
export const REGIONS = ["north", "west", "east", "south", "centre"] as const;
export type Region = (typeof REGIONS)[number];

/** Features that lift the nightly rate, in display order. */
export const FEATURES = [
  "privatePool",
  "seaView",
  "beachfront",
  "airCon",
  "housekeeping",
] as const;
export type Feature = (typeof FEATURES)[number];

export interface EstimatorConfig {
  /** Typical nightly rate (EUR) of a 2-bedroom property in the South, by type. */
  baseNightly: Record<PropertyType, number>;
  /** Nightly-rate multiplier per region (South = 1). */
  regionMultiplier: Record<Region, number>;
  bedrooms: {
    min: number;
    /** The highest step, shown as "6+". */
    max: number;
    /** Starting value of the bedrooms stepper. */
    default: number;
    /** Bedrooms covered by the base rate. */
    included: number;
    /**
     * Each bedroom above `included` adds this share of the base rate:
     * factor = 1 + perBedroomAbove × max(0, bedrooms − included).
     */
    perBedroomAbove: number;
  };
  /**
   * Uplift per feature. Uplifts add up, then multiply the rate once:
   * factor = 1 + Σ uplifts.
   */
  featureUplift: Record<Feature, number>;
  occupancy: {
    /** Share of available nights booked in high season. */
    high: number;
    /** Share of available nights booked in low season. */
    low: number;
    /**
     * High-season months (1 = January), as one run that may wrap the new
     * year; every other month is low season. Available weeks are assumed to
     * spread over the year in proportion to the seasons.
     */
    highSeasonMonths: readonly number[];
  };
  weeks: {
    /** "Rent it out year-round". */
    yearRound: number;
    /** The part-year slider. */
    min: number;
    max: number;
    step: number;
    default: number;
  };
  /** The range shown around the central estimate: ±15%. */
  rangeSpread: number;
  /** Bellavere's maximum management fee, as a share of gross rental income. */
  maxFeeRate: number;
}

// [CONFIRM] demo defaults — replace with real market knowledge
export const ESTIMATOR_CONFIG: EstimatorConfig = {
  baseNightly: {
    villa: 180,
    apartment: 95,
    penthouse: 150,
  },
  regionMultiplier: {
    north: 1.15,
    west: 1.1,
    east: 1.05,
    south: 1.0,
    centre: 0.8,
  },
  bedrooms: {
    min: 1,
    max: 6,
    default: 2,
    included: 2,
    perBedroomAbove: 0.22,
  },
  featureUplift: {
    privatePool: 0.12,
    seaView: 0.1,
    beachfront: 0.25,
    airCon: 0.04,
    housekeeping: 0.03,
  },
  occupancy: {
    high: 0.78,
    low: 0.55,
    // November to April.
    highSeasonMonths: [11, 12, 1, 2, 3, 4],
  },
  weeks: {
    yearRound: 52,
    min: 4,
    max: 48,
    step: 1,
    default: 26,
  },
  rangeSpread: 0.15,
  // The company's fee cap (never more than 15% of gross rental income); one
  // source of truth with the rest of the site.
  maxFeeRate: company.pricing.maxFeeRate,
};
