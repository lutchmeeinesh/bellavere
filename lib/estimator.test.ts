import { describe, expect, it } from "vitest";
import {
  ESTIMATOR_CONFIG,
  PROPERTY_TYPES,
  REGIONS,
  type EstimatorConfig,
} from "@/data/estimator-config";
import {
  blendedOccupancy,
  clampBedrooms,
  contactSearchParams,
  displayBreakdown,
  displayStep,
  estimateIncome,
  estimatorPageSearch,
  estimatorSearchParams,
  isCompleteAnswers,
  isResultStep,
  lowSeasonMonths,
  nightlyRate,
  normalizeWeeks,
  parseEstimatePrefill,
  parseEstimatorParams,
  roundForDisplay,
  seasonSpan,
  seasons,
  type EstimatorAnswers,
} from "@/lib/estimator";

/*
 * Every expected value below is worked out by hand from the demo config
 * (data/estimator-config.ts):
 *
 *   base nightly   villa 180 · apartment 95 · penthouse 150 (EUR)
 *   region         north 1.15 · west 1.10 · east 1.05 · south 1.00 · centre 0.80
 *   bedrooms       factor = 1 + 0.22 × max(0, bedrooms − 2), bedrooms 1–6
 *   features       factor = 1 + Σ uplifts (pool .12, sea view .10,
 *                  beachfront .25, air con .04, housekeeping .03)
 *   occupancy      6 high-season months of 12:
 *                  0.5 × 0.78 + 0.5 × 0.55 = 0.39 + 0.275 = 0.665
 *   nights         weeks × 7 × 0.665; year-round: 52 × 7 × 0.665 = 242.06
 *   range          ±15% · fee cap 15% · net = gross × 0.85
 */

const YEAR_ROUND_NIGHTS = 242.06; // 364 × 0.665

const base: EstimatorAnswers = {
  type: "villa",
  region: "south",
  bedrooms: 2,
  features: [],
  weeks: 52,
};

describe("config", () => {
  it("takes the fee cap from the company facts (15%)", () => {
    expect(ESTIMATOR_CONFIG.maxFeeRate).toBe(0.15);
  });

  it("blends occupancy from the seasons: 0.5 × 0.78 + 0.5 × 0.55 = 0.665", () => {
    expect(blendedOccupancy()).toBeCloseTo(0.665, 10);
  });

  it("derives the blend from the season months, not a fixed number", () => {
    // 3 high-season months: 0.25 × 0.78 + 0.75 × 0.55 = 0.195 + 0.4125 = 0.6075
    const config: EstimatorConfig = {
      ...ESTIMATOR_CONFIG,
      occupancy: { ...ESTIMATOR_CONFIG.occupancy, highSeasonMonths: [12, 1, 2] },
    };
    expect(blendedOccupancy(config)).toBeCloseTo(0.6075, 10);
  });
});

describe("estimateIncome", () => {
  it("1 bedroom, no features, year-round: bedrooms factor 1", () => {
    // nightly = 180 × 1.00 × (1 + 0.22 × max(0, 1 − 2) = 1) × 1 = 180
    // annual  = 180 × 242.06 = 43,570.80
    // low     = 43,570.80 × 0.85 = 37,035.18 · high = × 1.15 = 50,106.42
    const estimate = estimateIncome({ ...base, bedrooms: 1 });
    expect(estimate.nightlyRate).toBeCloseTo(180, 10);
    expect(estimate.occupancy).toBeCloseTo(0.665, 10);
    expect(estimate.weeks).toBe(52);
    expect(estimate.nightsPerYear).toBeCloseTo(YEAR_ROUND_NIGHTS, 10);
    expect(estimate.annual.mid).toBeCloseTo(43_570.8, 6);
    expect(estimate.annual.low).toBeCloseTo(37_035.18, 6);
    expect(estimate.annual.high).toBeCloseTo(50_106.42, 6);
  });

  it("1 bedroom costs the same as 2 (both covered by the base rate)", () => {
    expect(nightlyRate({ ...base, bedrooms: 1 })).toBeCloseTo(
      nightlyRate({ ...base, bedrooms: 2 }),
      10,
    );
  });

  it("6+ bedrooms: factor 1 + 0.22 × 4 = 1.88", () => {
    // apartment in the West: 95 × 1.10 × 1.88 = 104.5 × 1.88 = 196.46
    // annual = 196.46 × 242.06 = 47,555.1076
    const answers = { ...base, type: "apartment", region: "west", bedrooms: 6 } as const;
    const estimate = estimateIncome(answers);
    expect(estimate.nightlyRate).toBeCloseTo(196.46, 10);
    expect(estimate.annual.mid).toBeCloseTo(47_555.1076, 6);
    // More than 6 counts as 6+.
    expect(estimateIncome({ ...answers, bedrooms: 9 }).annual.mid).toBeCloseTo(
      47_555.1076,
      6,
    );
  });

  it("all features: uplifts add up to 1.54, then multiply once", () => {
    // penthouse in the East, 2 bedrooms:
    // 150 × 1.05 × 1 × (1 + .12 + .10 + .25 + .04 + .03 = 1.54) = 157.5 × 1.54 = 242.55
    // annual = 242.55 × 242.06 = 58,711.653
    const estimate = estimateIncome({
      ...base,
      type: "penthouse",
      region: "east",
      features: ["privatePool", "seaView", "beachfront", "airCon", "housekeeping"],
    });
    expect(estimate.nightlyRate).toBeCloseTo(242.55, 10);
    expect(estimate.annual.mid).toBeCloseTo(58_711.653, 6);
  });

  it("no features: features factor 1", () => {
    // villa, south, 2 bedrooms: 180 × 1 × 1 × 1 = 180; annual = 43,570.80
    const estimate = estimateIncome(base);
    expect(estimate.nightlyRate).toBeCloseTo(180, 10);
    expect(estimate.annual.mid).toBeCloseTo(43_570.8, 6);
  });

  it("ignores duplicate features", () => {
    // pool counted once: 180 × 1.12 = 201.6
    expect(
      nightlyRate({ ...base, features: ["privatePool", "privatePool"] }),
    ).toBeCloseTo(201.6, 10);
  });

  it("minimum weeks (4): 4 × 7 × 0.665 = 18.62 nights", () => {
    // villa, north, 3 bedrooms, pool + sea view:
    // 180 × 1.15 = 207 × (1 + 0.22 × 1 = 1.22) = 252.54 × (1 + .12 + .10 = 1.22) = 308.0988
    // annual = 308.0988 × 18.62 = 5,736.799656
    const estimate = estimateIncome({
      ...base,
      region: "north",
      bedrooms: 3,
      features: ["privatePool", "seaView"],
      weeks: 4,
    });
    expect(estimate.nightlyRate).toBeCloseTo(308.0988, 10);
    expect(estimate.nightsPerYear).toBeCloseTo(18.62, 10);
    expect(estimate.annual.mid).toBeCloseTo(5_736.799656, 6);
  });

  it("year-round (52 weeks): 242.06 nights", () => {
    // the same villa: 308.0988 × 242.06 = 74,578.395528
    // low = × 0.85 = 63,391.636199 · high = × 1.15 = 85,765.154857
    const estimate = estimateIncome({
      ...base,
      region: "north",
      bedrooms: 3,
      features: ["privatePool", "seaView"],
    });
    expect(estimate.nightsPerYear).toBeCloseTo(YEAR_ROUND_NIGHTS, 10);
    expect(estimate.annual.mid).toBeCloseTo(74_578.395528, 6);
    expect(estimate.annual.low).toBeCloseTo(63_391.636199, 5);
    expect(estimate.annual.high).toBeCloseTo(85_765.154857, 5);
  });

  it.each([
    // villa, 2 bedrooms, no features: 180 × region multiplier
    ["north", 207],
    ["west", 198],
    ["east", 189],
    ["south", 180],
    ["centre", 144],
  ] as const)("region %s: nightly 180 × multiplier = %d", (region, nightly) => {
    const estimate = estimateIncome({ ...base, region });
    expect(estimate.nightlyRate).toBeCloseTo(nightly, 10);
    // and the yearly figure follows: nightly × 242.06
    expect(estimate.annual.mid).toBeCloseTo(nightly * YEAR_ROUND_NIGHTS, 6);
  });

  it("covers every configured region", () => {
    expect([...REGIONS].sort()).toEqual(["centre", "east", "north", "south", "west"]);
  });

  it("shows a range of ±15% around the central figure", () => {
    const { annual, monthly } = estimateIncome({ ...base, region: "west", bedrooms: 4 });
    expect(annual.low).toBeCloseTo(annual.mid * 0.85, 8);
    expect(annual.high).toBeCloseTo(annual.mid * 1.15, 8);
    expect(monthly.low).toBeCloseTo(monthly.mid * 0.85, 8);
    expect(monthly.high).toBeCloseTo(monthly.mid * 1.15, 8);
  });

  it("monthly = annual / 12", () => {
    // 43,570.80 / 12 = 3,630.90; 37,035.18 / 12 = 3,086.265; 50,106.42 / 12 = 4,175.535
    const { annual, monthly } = estimateIncome(base);
    expect(monthly.mid).toBeCloseTo(3_630.9, 6);
    expect(monthly.low).toBeCloseTo(3_086.265, 6);
    expect(monthly.high).toBeCloseTo(4_175.535, 6);
    expect(monthly.mid * 12).toBeCloseTo(annual.mid, 6);
  });

  it("fee is at most 15% of gross, net to owner at least 85%", () => {
    // gross 37,035.18 / 43,570.80 / 50,106.42
    // fee   × 0.15 = 5,555.277 / 6,535.62 / 7,515.963
    // net   × 0.85 = 31,479.903 / 37,035.18 / 42,590.457
    const { fee, netToOwner, annual } = estimateIncome(base);
    expect(fee.rate).toBe(0.15);
    expect(fee.max.low).toBeCloseTo(5_555.277, 6);
    expect(fee.max.mid).toBeCloseTo(6_535.62, 6);
    expect(fee.max.high).toBeCloseTo(7_515.963, 6);
    expect(netToOwner.low).toBeCloseTo(31_479.903, 6);
    expect(netToOwner.mid).toBeCloseTo(37_035.18, 6);
    expect(netToOwner.high).toBeCloseTo(42_590.457, 6);
    expect(netToOwner.mid + fee.max.mid).toBeCloseTo(annual.mid, 6);
  });

  it("normalises out-of-range weeks before calculating", () => {
    // 2 weeks → 4 (minimum): 180 × 18.62 = 3,351.60
    expect(estimateIncome({ ...base, weeks: 2 }).annual.mid).toBeCloseTo(3_351.6, 6);
    // 60 weeks → 52 (year-round)
    expect(estimateIncome({ ...base, weeks: 60 }).weeks).toBe(52);
  });
});

describe("bounds", () => {
  it("clamps bedrooms to 1–6 and rounds", () => {
    expect(clampBedrooms(0)).toBe(1);
    expect(clampBedrooms(-3)).toBe(1);
    expect(clampBedrooms(3.4)).toBe(3);
    expect(clampBedrooms(12)).toBe(6);
    expect(clampBedrooms(Number.NaN)).toBe(2); // the default
  });

  it("normalises weeks: 52+ is year-round, otherwise 4–48", () => {
    expect(normalizeWeeks(26)).toBe(26);
    expect(normalizeWeeks(2)).toBe(4);
    expect(normalizeWeeks(50)).toBe(48);
    expect(normalizeWeeks(52)).toBe(52);
    expect(normalizeWeeks(100)).toBe(52);
    expect(normalizeWeeks(Number.POSITIVE_INFINITY)).toBe(26); // the default
  });
});

describe("seasons", () => {
  it("finds a season that wraps the new year", () => {
    expect(seasonSpan([11, 12, 1, 2, 3, 4])).toEqual({ from: 11, to: 4 });
  });

  it("derives the low season from the high one", () => {
    expect(lowSeasonMonths()).toEqual([5, 6, 7, 8, 9, 10]);
    expect(seasons()).toEqual({
      high: { from: 11, to: 4 },
      low: { from: 5, to: 10 },
    });
  });

  it("has no span for no months or all twelve", () => {
    expect(seasonSpan([])).toBeNull();
    expect(seasonSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])).toBeNull();
  });
});

describe("display rounding", () => {
  it("rounds to three significant figures, in whole units", () => {
    expect(roundForDisplay(39_327)).toBe(39_300);
    expect(roundForDisplay(3_277)).toBe(3_280);
    expect(roundForDisplay(2_045_004)).toBe(2_050_000);
    expect(roundForDisplay(999.6)).toBe(1_000);
    expect(roundForDisplay(118.4)).toBe(118);
    expect(roundForDisplay(17.7)).toBe(18);
  });

  it("builds a yearly breakdown that adds up (EUR)", () => {
    // The fee is rounded DOWN to the gross's step, so it never shows more
    // than 15% of the gross shown next to it.
    // gross low 37,035.18 → 37,000; fee 37,000 × 0.15 = 5,550 → 5,500 (step 100); net 31,500
    // gross high 50,106.42 → 50,100; fee 7,515 → 7,500; net 42,600
    const breakdown = displayBreakdown(estimateIncome(base));
    expect(breakdown).toEqual({
      gross: { low: 37_000, high: 50_100 },
      fee: { low: 5_500, high: 7_500 },
      net: { low: 31_500, high: 42_600 },
    });
  });

  it("rounds in the display currency (MUR at 52)", () => {
    // low 37,035.18 × 52 = 1,925,829.36 → 1,930,000; fee 289,500 → 280,000 (step 10,000); net 1,650,000
    // high 50,106.42 × 52 = 2,605,533.84 → 2,610,000; fee 391,500 → 390,000; net 2,220,000
    const breakdown = displayBreakdown(estimateIncome(base), (eur) => eur * 52);
    expect(breakdown).toEqual({
      gross: { low: 1_930_000, high: 2_610_000 },
      fee: { low: 280_000, high: 390_000 },
      net: { low: 1_650_000, high: 2_220_000 },
    });
  });

  it("never shows a fee above 15% of the gross shown (reported case)", () => {
    // villa, north, 3 bedrooms, pool + sea view, year-round:
    // EUR gross 63,391.64 → 63,400 · 85,765.16 → 85,800
    //     fee 9,510 → 9,500 · 12,870 → 12,800 (was 12,900 = 15.03%)
    // MUR gross 3,296,365 → 3,300,000 · 4,459,788 → 4,460,000
    //     fee 495,000 → 490,000 (was 500,000 = 15.15%) · 669,000 → 660,000 (was 670,000)
    const answers: EstimatorAnswers = {
      ...base,
      region: "north",
      bedrooms: 3,
      features: ["privatePool", "seaView"],
    };
    expect(displayBreakdown(estimateIncome(answers))).toEqual({
      gross: { low: 63_400, high: 85_800 },
      fee: { low: 9_500, high: 12_800 },
      net: { low: 53_900, high: 73_000 },
    });
    expect(displayBreakdown(estimateIncome(answers), (eur) => eur * 52)).toEqual({
      gross: { low: 3_300_000, high: 4_460_000 },
      fee: { low: 490_000, high: 660_000 },
      net: { low: 2_810_000, high: 3_800_000 },
    });
  });

  it("keeps the fee within 15% and the lines adding up for every answer", () => {
    const featureSets: EstimatorAnswers["features"][] = [
      [],
      ["privatePool"],
      ["privatePool", "seaView"],
      ["privatePool", "seaView", "beachfront", "airCon", "housekeeping"],
    ];
    let checked = 0;
    for (const type of PROPERTY_TYPES) {
      for (const region of REGIONS) {
        for (let bedrooms = 1; bedrooms <= 6; bedrooms++) {
          for (const features of featureSets) {
            for (const weeks of [4, 13, 26, 48, 52]) {
              const estimate = estimateIncome({ type, region, bedrooms, features, weeks });
              for (const convert of [(eur: number) => eur, (eur: number) => eur * 52]) {
                const { gross, fee, net } = displayBreakdown(estimate, convert);
                for (const end of ["low", "high"] as const) {
                  const step = displayStep(gross[end]);
                  expect(fee[end]).toBeLessThanOrEqual(gross[end] * 0.15);
                  expect(fee[end]).toBeGreaterThan(gross[end] * 0.15 - step);
                  expect(fee[end] % step).toBe(0);
                  expect(fee[end] + net[end]).toBe(gross[end]);
                  checked++;
                }
              }
            }
          }
        }
      }
    }
    expect(checked).toBe(3 * 5 * 6 * 4 * 5 * 2 * 2);
  });
});

describe("URL parameters", () => {
  it("reads a deep link", () => {
    expect(parseEstimatorParams("?region=north&bedrooms=3")).toEqual({
      region: "north",
      bedrooms: 3,
    });
  });

  it("reads every answer", () => {
    expect(
      parseEstimatorParams(
        "type=penthouse&region=west&bedrooms=4&features=seaView,privatePool&weeks=26",
      ),
    ).toEqual({
      type: "penthouse",
      region: "west",
      bedrooms: 4,
      // display order, whatever the URL's order
      features: ["privatePool", "seaView"],
      weeks: 26,
    });
  });

  it("ignores unknown values", () => {
    expect(
      parseEstimatorParams("type=castle&region=mars&bedrooms=abc&weeks=soon&colour=blue"),
    ).toEqual({});
  });

  it("clamps bedrooms to 1–6 and accepts 6+", () => {
    expect(parseEstimatorParams("bedrooms=0").bedrooms).toBe(1);
    expect(parseEstimatorParams("bedrooms=-2").bedrooms).toBe(1);
    expect(parseEstimatorParams("bedrooms=9").bedrooms).toBe(6);
    expect(parseEstimatorParams("bedrooms=6%2B").bedrooms).toBe(6); // "6+"
    expect(parseEstimatorParams("bedrooms=2.5").bedrooms).toBeUndefined();
    expect(parseEstimatorParams("bedrooms=").bedrooms).toBeUndefined();
  });

  it("keeps known features once, and reads an empty list as none", () => {
    expect(
      parseEstimatorParams("features=privatePool,jacuzzi,privatePool,%20airCon").features,
    ).toEqual(["privatePool", "airCon"]);
    expect(parseEstimatorParams("features=").features).toEqual([]);
    expect(parseEstimatorParams("region=north").features).toBeUndefined();
  });

  it("normalises weeks and ignores nonsense", () => {
    expect(parseEstimatorParams("weeks=52").weeks).toBe(52);
    expect(parseEstimatorParams("weeks=100").weeks).toBe(52);
    expect(parseEstimatorParams("weeks=50").weeks).toBe(48);
    expect(parseEstimatorParams("weeks=1").weeks).toBe(4);
    expect(parseEstimatorParams("weeks=0").weeks).toBeUndefined();
    expect(parseEstimatorParams("weeks=-5").weeks).toBeUndefined();
  });

  it("accepts URLSearchParams", () => {
    expect(parseEstimatorParams(new URLSearchParams({ type: "villa" }))).toEqual({
      type: "villa",
    });
  });

  it("round-trips answers through the query string", () => {
    const answers: EstimatorAnswers = {
      type: "apartment",
      region: "east",
      bedrooms: 6,
      features: ["beachfront", "airCon"],
      weeks: 30,
    };
    const query = estimatorSearchParams(answers).toString();
    expect(query).toBe(
      "type=apartment&region=east&bedrooms=6&features=beachfront%2CairCon&weeks=30",
    );
    const parsed = parseEstimatorParams(query);
    expect(isCompleteAnswers(parsed)).toBe(true);
    expect(parsed).toEqual(answers);
  });

  it("builds the contact link: source, answers, then gross a year in whole EUR", () => {
    // villa, north, 3 bedrooms, pool + sea view, year-round:
    // low 63,391.636 → 63392 · high 85,765.155 → 85765
    const answers: EstimatorAnswers = {
      ...base,
      region: "north",
      bedrooms: 3,
      features: ["privatePool", "seaView"],
    };
    expect(contactSearchParams(answers, estimateIncome(answers)).toString()).toBe(
      "source=estimate&type=villa&region=north&bedrooms=3&features=privatePool%2CseaView&weeks=52&low=63392&high=85765",
    );
  });
});

describe("the estimator page's own URL", () => {
  const answers: EstimatorAnswers = {
    type: "penthouse",
    region: "west",
    bedrooms: 3,
    features: ["privatePool", "seaView"],
    weeks: 52,
  };

  it("adds step=result while the result is shown, with readable commas", () => {
    expect(estimatorPageSearch("", answers, true)).toBe(
      "?type=penthouse&region=west&bedrooms=3&features=privatePool,seaView&weeks=52&step=result",
    );
    expect(estimatorPageSearch("", answers, false)).toBe(
      "?type=penthouse&region=west&bedrooms=3&features=privatePool,seaView&weeks=52",
    );
  });

  it("round-trips: the answers and the marker come back from the URL", () => {
    const search = estimatorPageSearch("", answers, true);
    expect(parseEstimatorParams(search)).toEqual(answers);
    expect(isResultStep(search)).toBe(true);
    // Switching language keeps the query; it is read the same way.
    expect(isResultStep(new URLSearchParams(search.slice(1)))).toBe(true);
  });

  it("writes only the answers given so far, and no marker without all of them", () => {
    expect(estimatorPageSearch("", {}, false)).toBe("");
    expect(estimatorPageSearch("", { type: "villa" }, false)).toBe("?type=villa");
    expect(estimatorPageSearch("", { type: "villa", region: "north" }, true)).toBe(
      "?type=villa&region=north",
    );
    expect(estimatorPageSearch("", { ...answers, features: [] }, false)).toBe(
      "?type=penthouse&region=west&bedrooms=3&features=&weeks=52",
    );
  });

  it("replaces its own parameters and keeps any others", () => {
    expect(
      estimatorPageSearch(
        "?utm_source=newsletter&type=villa&step=result&bedrooms=6",
        { type: "apartment" },
        false,
      ),
    ).toBe("?utm_source=newsletter&type=apartment");
    // "Change my answers": the marker goes, the answers stay.
    const shown = estimatorPageSearch("", answers, true);
    const changing = estimatorPageSearch(shown, answers, false);
    expect(isResultStep(changing)).toBe(false);
    expect(parseEstimatorParams(changing)).toEqual(answers);
  });

  it("reads the marker only as step=result", () => {
    expect(isResultStep("?step=result")).toBe(true);
    expect(isResultStep("?step=2")).toBe(false);
    expect(isResultStep("?type=villa")).toBe(false);
    expect(isResultStep("")).toBe(false);
  });
});

describe("contact prefill", () => {
  it("needs source=estimate", () => {
    expect(parseEstimatePrefill("type=villa&region=north")).toBeNull();
    expect(parseEstimatePrefill("source=elsewhere&type=villa")).toBeNull();
  });

  it("recalculates the range from complete answers (ignoring low/high)", () => {
    // villa, south, 1 bedroom, year-round: 37,035.18–50,106.42
    const prefill = parseEstimatePrefill(
      "source=estimate&type=villa&region=south&bedrooms=1&features=&weeks=52&low=1&high=999999",
    );
    expect(prefill?.answers).toEqual({ ...base, bedrooms: 1 });
    expect(prefill?.annual?.low).toBeCloseTo(37_035.18, 6);
    expect(prefill?.annual?.high).toBeCloseTo(50_106.42, 6);
  });

  it("falls back to low/high when the answers are incomplete", () => {
    expect(
      parseEstimatePrefill("source=estimate&type=villa&low=40000&high=52000"),
    ).toEqual({ answers: { type: "villa" }, annual: { low: 40_000, high: 52_000 } });
  });

  it("ignores invalid low/high", () => {
    for (const query of [
      "low=52000&high=40000", // reversed
      "low=-5&high=100", // negative
      "low=abc&high=100", // not a number
      "low=100", // half a range
      "low=1&high=99999999999", // implausible
    ]) {
      expect(parseEstimatePrefill(`source=estimate&type=villa&${query}`)?.annual).toBeNull();
    }
  });
});
