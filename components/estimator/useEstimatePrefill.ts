"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useEstimatorText } from "@/components/estimator/useEstimatorText";
import type { PropertyType } from "@/data/estimator-config";
import {
  isCompleteAnswers,
  parseEstimatePrefill,
  type EstimatePrefill,
} from "@/lib/estimator";

/** Contact-form "Property type" options for each estimator type. */
const CONTACT_PROPERTY_TYPE: Record<PropertyType, "villa" | "apartment"> = {
  villa: "villa",
  apartment: "apartment",
  penthouse: "apartment",
};

/** What the contact form fills in for a visitor arriving from /estimate. */
export interface ContactPrefill {
  /** A value of the form's property-type select, or "" to leave it. */
  propertyType: "villa" | "apartment" | "";
  /** A value of the form's property-count select. */
  propertyCount: "1";
  /** Readable summary of the estimate, or null when there is too little to say. */
  message: string | null;
}

/**
 * For the contact form: when the page was opened from the estimator's
 * "free assessment" link (/contact?source=estimate&type=…&low=…&high=…),
 * the property details and a summary of the estimate in the page's
 * language and the visitor's current currency (it follows a currency
 * switch). Null otherwise. Reads window.location on mount, so the contact
 * page stays static (no useSearchParams).
 */
export function useEstimatePrefill(): ContactPrefill | null {
  const t = useTranslations("estimator");
  const text = useEstimatorText();
  const [prefill, setPrefill] = useState<EstimatePrefill | null>(null);

  useEffect(() => {
    setPrefill(parseEstimatePrefill(window.location.search));
  }, []);

  return useMemo(() => {
    if (!prefill) return null;
    const { answers, annual } = prefill;
    const range = annual
      ? {
          low: text.estimateAmount(annual.low),
          high: text.estimateAmount(annual.high),
        }
      : null;

    let message: string | null = null;
    if (isCompleteAnswers(answers) && range) {
      message = t("contactSummary.full", {
        type: answers.type,
        located: t(`regions.${answers.region}.located`),
        towns: t(`regions.${answers.region}.towns`),
        // "in the centre or elsewhere on the island" needs no "(… and the
        // rest of the island)" after it.
        hasTowns: answers.region === "centre" ? "no" : "yes",
        bedrooms: text.bedrooms(answers.bedrooms),
        hasFeatures: answers.features.length > 0 ? "yes" : "no",
        features: text.features(answers.features),
        yearRound: text.isYearRound(answers.weeks) ? "yes" : "no",
        weeks: answers.weeks,
        ...range,
      });
    } else if (range) {
      message = t("contactSummary.short", range);
    }

    return {
      propertyType: answers.type ? CONTACT_PROPERTY_TYPE[answers.type] : "",
      propertyCount: "1",
      message,
    };
  }, [prefill, t, text]);
}
